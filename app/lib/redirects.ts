export function validateRedirect(
	toValidate: string | null | undefined,
	defaultRedirect: string,
) {
	if (
		!toValidate ||
		!toValidate.startsWith("/") ||
		toValidate.startsWith("//")
	) {
		return defaultRedirect;
	}
	return toValidate;
}
