export const APP_NAME = "remix-shadcn";
export const DEFAULT_FAILURE_REDIRECT = "/";
export const DEFAULT_SUCCESS_REDIRECT = "/account";

export function title(pageTitle?: string) {
	if (!pageTitle) return APP_NAME;

	return `${pageTitle} | ${APP_NAME}`;
}
