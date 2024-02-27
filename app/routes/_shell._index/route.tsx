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
import { loginFormSchema, useLoginForm } from "@/forms/auth";
import { Intents } from "@/intents";
import { getAuthenticator } from "@/lib/auth.server";
import { PublicError, formIntent } from "@/lib/forms";
import { validateRedirect } from "@/lib/redirects";

export const meta: MetaFunction = () => {
	return [
		{ title: title() },
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
			Intents.Login,
			loginFormSchema,
			async (data) => {
				const url = new URL(request.url);
				const successRedirect = validateRedirect(
					url.searchParams.get("redirectTo"),
					DEFAULT_SUCCESS_REDIRECT,
				);

				const headers = new Headers(request.headers);
				headers.delete("content-type");
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
					if (
						reason &&
						(reason instanceof Response || reason instanceof PublicError)
					) {
						throw reason;
					}

					console.error(reason);
					throw new PublicError("Invalid email or password", 401);
				}
			},
			{
				hideFields: ["password"],
			},
		)
		.run();
}

export default function Index() {
	const { pathname } = useLocation();
	const [searchParams] = useSearchParams();
	const navigation = useNavigation();
	const { login } = useActionData<typeof action>() ?? {};

	const redirectTo = React.useMemo(
		() =>
			validateRedirect(
				searchParams.get("redirectTo"),
				DEFAULT_SUCCESS_REDIRECT,
			),
		[searchParams],
	);

	const loginAction = React.useMemo(() => {
		return `${pathname}?${new URLSearchParams({
			index: "",
			redirectTo,
		}).toString()}`;
	}, [pathname, redirectTo]);

	const successfulLogin =
		navigation.location?.state?._isRedirect &&
		navigation.location.pathname + navigation.location.search === redirectTo;

	const formDisabled =
		(navigation.state !== "idle" && !!navigation.formData) || successfulLogin;

	const [loginForm, loginFields] = useLoginForm(login?.lastResult, {
		disabled: formDisabled,
	});

	return (
		<main className="container py-8 md:py-16 lg:py-32">
			<Form
				{...getFormProps(loginForm)}
				method="POST"
				action={loginAction}
				replace
			>
				<input type="hidden" name="intent" value={Intents.Login} />

				<Card className="w-full max-w-screen-sm mx-auto">
					<CardHeader className="space-y-1">
						<CardTitle>Login</CardTitle>
						<CardDescription>
							Enter your email below to login to your account.
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor={loginFields.email.id}>Email</Label>
							<Input
								{...getInputProps(loginFields.email, {
									type: "email",
								})}
								autoComplete="current-email"
								placeholder="m@example.com"
								required
							/>
							<div
								id={loginFields.email.descriptionId}
								className="text-sm text-destructive"
							>
								{loginFields.email.errors}
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor={loginFields.password.id}>Password</Label>
							<Input
								{...getInputProps(loginFields.password, {
									type: "password",
								})}
								autoComplete="current-password"
								placeholder="Enter your password"
								required
								type="password"
							/>
							<div
								id={loginFields.password.descriptionId}
								className="text-sm text-destructive"
							>
								{loginFields.password.errors || loginFields.global.errors}
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
									"Login"
								)}
							</Button>

							<p className="text-sm text-center text-muted-foreground">
								Don't have an account?{" "}
								<Link to="/signup" className="text-primary underline">
									Sign up
								</Link>
							</p>
						</div>
					</CardFooter>
				</Card>
			</Form>
		</main>
	);
}
