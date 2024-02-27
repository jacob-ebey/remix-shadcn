import { AppLoadContext } from "@remix-run/cloudflare";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { infer as ZodInfer } from "zod";

import {
	agent,
	agentStep,
	agentStepCondition,
	agentStepMessage,
} from "@/db.server/schema";
import { createAgentFormSchema, editAgentFormSchema } from "@/forms/agent";

export function getAgents({ DB }: AppLoadContext, userId: string) {
	return DB.query.agent.findMany({
		where: eq(agent.createdBy, userId),
		orderBy: desc(agent.createdAt),
		columns: {
			id: true,
			name: true,
		},
	});
}

export function getAgent(
	{ DB }: AppLoadContext,
	userId: string,
	agentId: string,
) {
	return DB.query.agent.findFirst({
		where: or(
			and(eq(agent.id, agentId), eq(agent.createdBy, userId)),
			and(eq(agent.id, agentId), eq(agent.visibility, "public")),
		),
		columns: {
			id: true,
			name: true,
		},
		with: {
			steps: {
				orderBy: asc(agentStep.order),
				columns: {
					id: true,
					name: true,
					includeChatHistory: true,
					messageTemplate: true,
					onlyIfPreviousMessages: true,
					systemTemplate: true,
				},
				with: {
					conditions: {
						columns: {
							id: true,
							regex: true,
							variable: true,
						},
					},
					messages: {
						orderBy: asc(agentStepMessage.order),
						columns: {
							id: true,
							content: true,
							from: true,
						},
					},
				},
			},
		},
	});
}

export async function createAgent(
	context: AppLoadContext,
	userId: string,
	input: ZodInfer<typeof createAgentFormSchema>,
) {
	const { name, steps } = input;

	const newAgents = await context.DB.insert(agent)
		.values({
			createdBy: userId,
			name,
			visibility: "private",
		})
		.returning({ id: agent.id });
	const newAgent = newAgents[0];
	if (!newAgent) return null;

	try {
		await insertSteps(context, newAgent.id, input.steps);

		return newAgent.id;
	} catch (reason) {
		try {
			await context.DB.delete(agent).where(eq(agent.id, newAgent.id));
		} catch {}
		console.error(reason);
		return null;
	}
}

export async function editAgent(
	context: AppLoadContext,
	userId: string,
	agentId: string,
	input: ZodInfer<typeof editAgentFormSchema>,
) {
	const updatedAgent = await context.DB.update(agent)
		.set({
			name: input.name,
		})
		.where(and(eq(agent.id, agentId), eq(agent.createdBy, userId)))
		.returning({ id: agent.id });

	await context.DB.delete(agentStep)
		.where(eq(agentStep.agentId, agentId))
		.run();
	await insertSteps(context, agentId, input.steps);

	return updatedAgent;
}

async function insertSteps(
	{ DB }: AppLoadContext,
	agentId: string,
	steps: ZodInfer<typeof editAgentFormSchema>["steps"],
) {
	let stepIndex = -1;
	for (const step of steps) {
		stepIndex += 1;
		const newSteps = await DB.insert(agentStep)
			.values({
				agentId,
				name: step.name,
				order: stepIndex,
				includeChatHistory: step.includeChatHistory,
				onlyIfPreviousMessages: step.onlyIfPreviousMessages,
				messageTemplate: step.messagePrompt,
				systemTemplate: step.systemPrompt,
			})
			.returning({ id: agentStep.id });
		const newStep = newSteps[0];
		if (!newStep) throw new Error("Could not create step");

		let msgIndex = -1;
		for (const message of step.messages) {
			msgIndex += 1;
			const newMessages = await DB.insert(agentStepMessage)
				.values({
					agentStepId: newStep.id,
					content: message.content,
					from: message.from,
					order: msgIndex,
				})
				.returning({ id: agentStepMessage.id });
			const newMessage = newMessages[0];
			if (!newMessage) throw new Error("Could not create message");
		}

		for (const condition of step.conditions) {
			const newConditions = await DB.insert(agentStepCondition)
				.values({
					agentStepId: newStep.id,
					regex: condition.regex,
					variable: condition.input,
				})
				.returning({ id: agentStepCondition.id });
			const newCondition = newConditions[0];
			if (!newCondition) throw new Error("Could not create condition");
		}
	}
}

export async function deleteAgent(
	{ DB }: AppLoadContext,
	userId: string,
	agentId: string,
) {
	const result = await DB.delete(agent).where(
		and(eq(agent.id, agentId), eq(agent.createdBy, userId)),
	);
	return result.success;
}
