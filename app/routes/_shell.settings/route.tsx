import {
	getFormProps,
	getInputProps,
	getTextareaProps,
} from "@conform-to/react";
import { ArchiveIcon } from "@radix-ui/react-icons";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/cloudflare";
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from "@remix-run/react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea, useAutoHeightTextArea } from "@/components/ui/textarea";
import { DEFAULT_SYSTEM_PROMPT, title } from "@/config.shared";
import {
	updateAccountFormSchema,
	updateGlobalPromptFormSchema,
	useGlobalPromptForm,
	useUpdateAccountForm,
} from "@/forms/account";
import { Intents } from "@/intents";
import { requireUser } from "@/lib/auth.server";
import {
	getGlobalChatSettings,
	updateGlobalChatSettings,
} from "@/lib/chats.server";
import { formIntent } from "@/lib/forms";
import { getUserById, updateUser } from "@/lib/user.server";

export const meta: MetaFunction = () => {
	return [
		{ title: title("Account") },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
	const user = await requireUser(context, request);

	const [account, chatSettings] = await Promise.all([
		getUserById(context, user.id),
		getGlobalChatSettings(context, user.id),
	]);

	return {
		account,
		chatSettings,
	};
}

export async function action({ context, request }: ActionFunctionArgs) {
	const user = await requireUser(context, request);

	const formData = await request.formData();

	return formIntent(formData)
		.intent(Intents.UpdateAccount, updateAccountFormSchema, async (data) => {
			return await updateUser(context, user.id, data);
		})
		.intent(
			Intents.UpdateGlobalPrompt,
			updateGlobalPromptFormSchema,
			async (data) => {
				await updateGlobalChatSettings(context, user.id, data);
			},
		)
		.run();
}

export default function Account() {
	const navigation = useNavigation();
	const { account: loaderAccount, chatSettings } =
		useLoaderData<typeof loader>();
	const { updateAccount } = useActionData<typeof action>() ?? {};

	const account = updateAccount?.lastReturn ?? loaderAccount;

	const saving =
		navigation.state === "submitting" &&
		navigation.formData?.get("intent") === Intents.UpdateAccount;

	const formDisabled = saving;

	const [accountForm, accountFields] = useUpdateAccountForm(
		updateAccount?.lastResult,
		{
			disabled: formDisabled,
		},
	);

	const [globalPromptForm, globalPromptFields] = useGlobalPromptForm(
		updateAccount?.lastResult,
		{
			disabled: formDisabled,
		},
	);

	const autoHeightTextArea = useAutoHeightTextArea();

	return (
		<main className="container py-8 space-y-8">
			<Form {...getFormProps(globalPromptForm)} method="POST" replace>
				<input type="hidden" name="intent" value={Intents.UpdateGlobalPrompt} />

				<Card className="w-full max-w-screen-sm mx-auto">
					<CardHeader className="space-y-1">
						<CardTitle>System Prompt</CardTitle>
						<CardDescription>Edit your system prompt below.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Label htmlFor={globalPromptFields.prompt.id}>System Prompt</Label>
						<Textarea
							{...getTextareaProps(globalPromptFields.prompt)}
							{...autoHeightTextArea}
							defaultValue={chatSettings?.prompt || DEFAULT_SYSTEM_PROMPT}
						/>
						<div
							id={globalPromptFields.prompt.descriptionId}
							className="text-sm text-destructive"
						>
							{globalPromptFields.prompt.errors ||
								globalPromptFields.global.errors}
						</div>
					</CardContent>
					<CardFooter>
						<div className="space-y-2 flex-1">
							<Button
								className="w-full block"
								type="submit"
								disabled={formDisabled}
							>
								{saving ? (
									<span className="inline-flex items-center">
										Saving{" "}
										<ArchiveIcon className="text-primary-foreground ml-2 w-6 h-6" />
									</span>
								) : (
									"Save"
								)}
							</Button>
						</div>
					</CardFooter>
				</Card>
			</Form>

			<Form {...getFormProps(accountForm)} method="POST" replace>
				<input type="hidden" name="intent" value={Intents.UpdateAccount} />

				<Card className="w-full max-w-screen-sm mx-auto">
					<CardHeader className="space-y-1">
						<CardTitle>Account</CardTitle>
						<CardDescription>Edit your info below.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor={accountFields.displayName.id}>Display Name</Label>
							<Input
								{...getInputProps(accountFields.displayName, {
									type: "text",
								})}
								key={accountFields.displayName.key}
								placeholder="Anonymous"
								required
								defaultValue={account?.displayName}
							/>
							<div
								id={accountFields.displayName.descriptionId}
								className="text-sm text-destructive"
							>
								{accountFields.displayName.errors}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor={accountFields.fullName.id}>Full Name</Label>
							<Input
								{...getInputProps(accountFields.fullName, {
									type: "text",
								})}
								key={accountFields.fullName.key}
								placeholder="John Doe"
								required
								defaultValue={account?.fullName}
							/>
							<div
								id={accountFields.fullName.descriptionId}
								className="text-sm text-destructive"
							>
								{accountFields.fullName.errors}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="account-form-email">Email</Label>
							<Input
								id="account-form-email"
								defaultValue={account?.email}
								disabled
							/>
						</div>
					</CardContent>
					<CardFooter>
						<div className="space-y-2 flex-1">
							<Button
								className="w-full block"
								type="submit"
								disabled={formDisabled}
							>
								{saving ? (
									<span className="inline-flex items-center">
										Saving{" "}
										<ArchiveIcon className="text-primary-foreground ml-2 w-6 h-6" />
									</span>
								) : (
									"Save"
								)}
							</Button>
						</div>
					</CardFooter>
				</Card>
			</Form>
		</main>
	);
}
