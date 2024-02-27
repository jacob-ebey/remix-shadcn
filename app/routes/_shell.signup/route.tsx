import { getFormProps, getInputProps } from "@conform-to/react";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/cloudflare";
import {
	Form,
	Link,
	useActionData,
	useLocation,
	useNavigation,
	useSearchParams,
} from "@remix-run/react";
import * as React from "react";

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
import { DEFAULT_SUCCESS_REDIRECT, title } from "@/config.shared";
import { signupFormSchema, useSignupForm } from "@/forms/auth";
import { Intents } from "@/intents";
import { getAuthenticator } from "@/lib/auth.server";
import { PublicError, formIntent } from "@/lib/forms";
import { validateRedirect } from "@/lib/redirects";
import { createUser } from "@/lib/user.server";

export const meta: MetaFunction = () => {
	return [
		{ title: title("Signup") },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const successRedirect = validateRedirect(
		url.searchParams.get("redirectTo"),
		DEFAULT_SUCCESS_REDIRECT,
	);

	const authenticator = getAuthenticator(context);
	await authenticator.isAuthenticated(request, {
		successRedirect,
	});
	return null;
}

export async function action({ context, request }: ActionFunctionArgs) {
	const formData = await request.formData();

	return formIntent(formData)
		.intent(
			Intents.Signup,
			signupFormSchema,
			async (data) => {
				const url = new URL(request.url);
				const successRedirect = validateRedirect(
					url.searchParams.get("redirectTo"),
					DEFAULT_SUCCESS_REDIRECT,
				);

				const createdUser = await createUser(context, data);
				if (!createdUser) {
					throw new PublicError("Invalid email or password", 401);
				}

				const headers = new Headers(request.headers);
				headers.delete("content-type");
				formData.delete("displayName");
				formData.delete("fullName");
				formData.delete("verifyPassword");
				try {
					const authenticator = getAuthenticator(context);
					await authenticator.authenticate(
						"form",
						new Request(url, {
							method: "POST",
							headers,
							body: formData,
						}),
						{
							throwOnError: true,
							successRedirect,
						},
					);
				} catch (reason) {
					if (reason && reason instanceof Response) {
						throw reason;
					}

					console.error(reason);
					throw new PublicError("Invalid email or password", 401);
				}
			},
			{
				hideFields: ["password", "verifyPassword"],
			},
		)
		.run();
}

export default function Signup() {
	const { pathname } = useLocation();
	const [searchParams] = useSearchParams();
	const navigation = useNavigation();
	const { signup } = useActionData<typeof action>() ?? {};

	const redirectTo = React.useMemo(
		() =>
			validateRedirect(
				searchParams.get("redirectTo"),
				DEFAULT_SUCCESS_REDIRECT,
			),
		[searchParams],
	);

	const signupAction = React.useMemo(() => {
		return `${pathname}?${new URLSearchParams({
			redirectTo,
		}).toString()}`;
	}, [pathname, redirectTo]);

	const successfulLogin =
		navigation.location?.state?._isRedirect &&
		navigation.location.pathname + navigation.location.search === redirectTo;

	const formDisabled =
		(navigation.state !== "idle" && !!navigation.formData) || successfulLogin;

	const [signupForm, signupFields] = useSignupForm(signup?.lastResult, {
		disabled: formDisabled,
	});

	return (
		<main className="container py-8 md:py-16 lg:py-32">
			<Form
				{...getFormProps(signupForm)}
				method="POST"
				action={signupAction}
				replace
			>
				<input type="hidden" name="intent" value={Intents.Signup} />

				<Card className="w-full max-w-screen-sm mx-auto">
					<CardHeader className="space-y-1">
						<CardTitle>Signup</CardTitle>
						<CardDescription>
							Enter your info below to create your account.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor={signupFields.email.id}>Email</Label>
							<Input
								{...getInputProps(signupFields.email, {
									type: "email",
								})}
								autoComplete="current-email"
								placeholder="m@example.com"
								required
							/>
							<div
								id={signupFields.email.descriptionId}
								className="text-sm text-destructive"
							>
								{signupFields.email.errors}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor={signupFields.displayName.id}>Display Name</Label>
							<Input
								{...getInputProps(signupFields.displayName, {
									type: "text",
								})}
								placeholder="Anonymous"
								required
							/>
							<div
								id={signupFields.displayName.descriptionId}
								className="text-sm text-destructive"
							>
								{signupFields.displayName.errors}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor={signupFields.fullName.id}>Full Name</Label>
							<Input
								{...getInputProps(signupFields.fullName, {
									type: "text",
								})}
								placeholder="John Doe"
								required
							/>
							<div
								id={signupFields.fullName.descriptionId}
								className="text-sm text-destructive"
							>
								{signupFields.fullName.errors}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor={signupFields.password.id}>Password</Label>
							<Input
								{...getInputProps(signupFields.password, {
									type: "password",
								})}
								autoComplete="new-password"
								placeholder="Enter your password"
								required
								type="password"
							/>
							<div
								id={signupFields.password.descriptionId}
								className="text-sm text-destructive"
							>
								{signupFields.password.errors}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor={signupFields.verifyPassword.id}>
								Verify Password
							</Label>
							<Input
								{...getInputProps(signupFields.verifyPassword, {
									type: "password",
								})}
								autoComplete="new-password"
								placeholder="Verify your password"
								required
								type="password"
							/>
							<div
								id={signupFields.verifyPassword.descriptionId}
								className="text-sm text-destructive"
							>
								{signupFields.verifyPassword.errors ||
									signupFields.global.errors}
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<div className="flex-1 space-y-4">
							<Button
								className="w-full block"
								type="submit"
								disabled={formDisabled}
							>
								{successfulLogin ? (
									<span className="inline-flex items-center">
										Logged In{" "}
										<CheckCircledIcon className="text-primary-foreground ml-2" />
									</span>
								) : (
									"Signup"
								)}
							</Button>

							<p className="text-sm text-center text-muted-foreground">
								Already have an account?{" "}
								<Link to="/" className="text-primary underline">
									Login
								</Link>
							</p>
						</div>
					</CardFooter>
				</Card>
			</Form>
		</main>
	);
}
