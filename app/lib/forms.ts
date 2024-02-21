import { useForm as useConformForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import type { ZodTypeAny, output } from "zod";

export function useForm<Schema extends ZodTypeAny>(
	schema: Schema,
	options: Parameters<typeof useConformForm<Schema>>[0],
) {
	return useConformForm<output<Schema> & { global?: never }>({
		...options,
		constraint: getZodConstraint(schema),
		onValidate({ formData }) {
			const parsed = parseWithZod(formData, { schema });
			return parsed;
		},
	});
}
