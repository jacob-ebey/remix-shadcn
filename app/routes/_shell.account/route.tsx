import { getFormProps, getInputProps } from "@conform-to/react";
import { ArchiveIcon } from "@radix-ui/react-icons";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import {
	Form,
	useActionData,
	useLoaderData,
	useNavigation,
} from "@remix-run/react";

import { title } from "@/config.shared";
import { formIntent } from "@/lib/forms.server";

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
import { requireUser } from "@/lib/auth.server";
import { getUserById, updateUser } from "@/lib/user.server";
import { updateAccountFormSchema, useUpdateAccountForm } from "./form";

enum Intents {
	UpdateAccount = "updateAccount",
}

export const meta: MetaFunction = () => {
	return [
		{ title: title("Account") },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
	const user = await requireUser(context, request);

	const account = await getUserById(context, user.id);

	return { account };
}

export async function action({ context, request }: ActionFunctionArgs) {
	const user = await requireUser(context, request);

	const formData = await request.formData();

	return formIntent(formData)
		.intent(Intents.UpdateAccount, updateAccountFormSchema, async (data) => {
			return await updateUser(context, user.id, data);
		})
		.run();
}

export default function Account() {
	const navigation = useNavigation();
	const { account: loaderAccount } = useLoaderData<typeof loader>();
	const { updateAccount } = useActionData<typeof action>() ?? {};

	const account = updateAccount?.lastReturn ?? loaderAccount;

	const saving =
		navigation.state === "submitting" &&
		navigation.formData?.get("intent") === Intents.UpdateAccount;

	const formDisabled = saving;

	const [accountForm, accountFields] = useUpdateAccountForm(updateAccount, {
		disabled: formDisabled,
	});

	return (
		<main className="container py-8 md:py-16 lg:py-32">
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
										<ArchiveIcon className="text-primary-foreground ml-2" />
									</span>
								) : (
									"Save"
								)}
							</Button>
							{accountForm.dirty && (
								<div className="text-sm text-muted-foreground">
									Unsaved changes
								</div>
							)}
						</div>
					</CardFooter>
				</Card>
			</Form>
		</main>
	);
}
