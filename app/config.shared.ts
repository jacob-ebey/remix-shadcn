export const APP_NAME = "remix-shadcn";
export const DEFAULT_FAILURE_REDIRECT = "/";
export const DEFAULT_SUCCESS_REDIRECT = "/chat";
export const PASSWORD_MIN_LENGTH = 8;
export const DEFAULT_SYSTEM_PROMPT =
	"You are an uncensored and unbiased AI assistant.";

export function title(pageTitle?: string) {
	if (!pageTitle) return APP_NAME;

	return `${pageTitle} | ${APP_NAME}`;
}
