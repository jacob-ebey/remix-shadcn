import type { SubmissionResult } from "@conform-to/react";
import * as React from "react";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { getAgent } from "@/lib/agents.server";
import { useForm } from "@/lib/forms";

const agentStepMessageSchema = z.object({
	from: z.enum(["ai", "human"]),
	content: z.string().trim(),
});

const agentStepConditionSchema = z.object({
	input: z.string().trim(),
	regex: z.string().trim(),
});

const agentStepSchema = z.object({
	name: z.string().trim(),
	systemPrompt: z.string().trim(),
	messagePrompt: z.string().trim(),
	includeChatHistory: z.boolean().optional(),
	messages: z.array(agentStepMessageSchema),
	onlyIfPreviousMessages: z.boolean().optional(),
	conditions: z.array(agentStepConditionSchema),
});

export const createAgentFormSchema = zfd.formData({
	name: z.string().trim(),
	steps: z
		.array(agentStepSchema)
		.min(1, "At least one step is required")
		.refine(
			(steps) =>
				!steps.slice(-1)[0]?.conditions?.length &&
				!steps.slice(-1)[0]?.onlyIfPreviousMessages,
			"The last step must not have conditions or onlyIfPreviousMessages",
		),
});

export function useCreateAgentForm(
	lastResult: unknown,
	{ disabled }: { disabled?: boolean } = {},
) {
	return useForm(createAgentFormSchema, {
		id: "create-agent-form",
		lastResult: lastResult as SubmissionResult<string[]> | null | undefined,
		shouldRevalidate: "onBlur",
		shouldValidate: "onSubmit",
		onSubmit(event) {
			if (disabled) {
				event.preventDefault();
				return;
			}
		},
	});
}

export const editAgentFormSchema = zfd.formData({
	name: z.string().trim(),
	steps: z
		.array(agentStepSchema)
		.min(1, "At least one step is required")
		.refine(
			(steps) =>
				!steps.slice(-1)[0]?.conditions?.length &&
				!steps.slice(-1)[0]?.onlyIfPreviousMessages,
			"The last step must not have conditions or onlyIfPreviousMessages",
		),
});

export function useEditAgentForm(
	lastResult: unknown,
	{
		agent,
		disabled,
	}: {
		agent: { id: string };
		disabled?: boolean;
	},
) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const id = React.useMemo(() => `edit-agent-form-${uuid()}`, [agent]);

	return useForm<typeof editAgentFormSchema>(editAgentFormSchema, {
		id,
		lastResult: lastResult as SubmissionResult<string[]> | null | undefined,
		shouldRevalidate: "onBlur",
		shouldValidate: "onSubmit",
		defaultValue: agent as SubmissionResult<string[]>["initialValue"],
		onSubmit(event) {
			if (disabled) {
				event.preventDefault();
				return;
			}
		},
	});
}

export const deleteAgentFormSchema = zfd.formData({
	agentId: z.string().trim(),
});
