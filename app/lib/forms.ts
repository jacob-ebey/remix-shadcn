import type { SubmissionResult } from "@conform-to/react";
import { parse, useForm as useConformForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { json } from "@remix-run/react";

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

export class PublicError extends Error {
	constructor(
		public message: string,
		public status = 500,
		options?: ErrorOptions,
	) {
		super(message, options);
	}
}

export type IntentDefinition<
	Schema extends ZodTypeAny = ZodTypeAny,
	Action extends (parsed: output<Schema>) => unknown = (
		parsed: output<Schema>,
	) => unknown,
> = {
	action: Action;
	schema: Schema;
	replyOptions?: { hideFields?: string[] };
};

export type IntentResult<Intent extends IntentDefinition = IntentDefinition> = {
	lastResult: SubmissionResult<string[]>;
	lastReturn: Awaited<ReturnType<Intent["action"]>> | undefined;
};

export type IntentResults<
	Definitions extends Record<string, IntentDefinition> = Record<
		string,
		IntentDefinition
	>,
> = {
	[Intent in keyof Definitions]?: IntentResult<Definitions[Intent]>;
};

class FormIntent<
	Definitions extends Record<string, IntentDefinition> = Record<
		string,
		IntentDefinition
	>,
> {
	private intents = {} as Record<string, IntentDefinition>;

	constructor(private formData: FormData) {}

	intent<
		Intent extends string,
		Schema extends ZodTypeAny,
		Action extends (parsed: output<Schema>) => unknown,
	>(
		intent: Intent,
		schema: Schema,
		action: Action,
		replyOptions?: { hideFields?: string[] },
	) {
		this.intents[intent] = {
			action,
			schema,
			replyOptions,
		} satisfies IntentDefinition<Schema, Action>;

		return this as FormIntent<
			Definitions & Record<Intent, IntentDefinition<Schema, Action>>
		>;
	}

	async run(): Promise<IntentResults<Definitions>>;
	async run(
		doNotThrowIfNoIntent: true,
	): Promise<undefined | IntentResults<Definitions>>;
	async run(
		doNotThrowIfNoIntent?: true,
	): Promise<undefined | IntentResults<Definitions>> {
		const results = {} as IntentResults<Definitions>;

		const formIntent = this.formData
			.getAll("intent")
			.slice(-1)[0] as keyof Definitions;
		if (typeof formIntent !== "string") {
			throw new Error("Invalid intent");
		}
		const intent = this.intents[formIntent];
		if (!intent) {
			if (doNotThrowIfNoIntent) return undefined;
			throw new Error(
				formIntent ? `Unknown intent: ${formIntent}` : "No intent",
			);
		}

		this.formData.delete("intent");
		const lastResult = await parseWithZod(this.formData, {
			schema: intent.schema,
			async: true,
		});
		if (lastResult.status !== "success") {
			Object.assign(results, {
				[formIntent]: {
					lastResult: lastResult.reply(intent.replyOptions),
					lastReturn: undefined,
				} satisfies IntentResult<typeof intent>,
			});
			return json(results, 400) as unknown as IntentResults<Definitions>;
		}

		try {
			const lastReturn = await intent.action(lastResult.value);

			if (
				lastReturn &&
				typeof lastReturn === "object" &&
				lastReturn instanceof Response
			) {
				throw lastReturn;
			}

			Object.assign(results, {
				[formIntent]: {
					lastResult: lastResult.reply(intent.replyOptions),
					lastReturn,
				} satisfies IntentResult<typeof intent>,
			});
		} catch (reason) {
			const publicError =
				reason && reason instanceof PublicError ? reason : undefined;
			if (publicError) {
				Object.assign(results, {
					[formIntent]: {
						lastResult: parse(this.formData, {
							resolve() {
								return {
									error: {
										global: [publicError.message],
									},
								};
							},
						}).reply(intent.replyOptions),
						lastReturn: undefined,
					} satisfies IntentResult<typeof intent>,
				});

				return json(
					results,
					publicError.status,
				) as unknown as IntentResults<Definitions>;
			}

			throw reason;
		}

		return results;
	}
}

export function formIntent(formData: FormData) {
	return new FormIntent(formData);
}
