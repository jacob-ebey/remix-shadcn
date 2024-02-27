import {
	AIMessage,
	BaseMessageChunk,
	HumanMessage,
} from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
	BaseMessagePromptTemplateLike,
	ChatPromptTemplate,
	MessagesPlaceholder,
} from "@langchain/core/prompts";
import type { RunnableBinding, RunnableLike } from "@langchain/core/runnables";
import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
import type { AppLoadContext } from "@remix-run/cloudflare";

import { getAgent } from "@/lib/agents.server";
import { PublicError } from "@/lib/forms";

export async function createConversationChain(
	context: AppLoadContext,
	userId: string,
	systemPrompt: string,
	agentId: string | undefined,
	history: ["ai" | "human", string][],
	signal: AbortSignal,
): Promise<RunnableBinding<{ prompt: string }, BaseMessageChunk>> {
	type RunnableInput = Record<string, string> & { prompt: string };
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	type RunnableOutput = any;

	const chat_history = history.map((message) => {
		if (message[0] === "ai") {
			return new AIMessage({ content: message[1] });
		}
		return new HumanMessage({ content: message[1] });
	});

	if (!agentId) {
		return RunnableSequence.from<RunnableInput>([
			{
				_empty: () => "",
				prompt: (input) => input.prompt,
				chat_history: () => chat_history,
			},
			ChatPromptTemplate.fromMessages([
				["system", systemPrompt],
				new MessagesPlaceholder("chat_history"),
				["human", "{prompt}"],
			]),
			context.AI.bind({ signal }),
		]).withConfig({ runName: "DefaultConversationChain" });
	}

	const agent = await getAgent(context, userId, agentId);
	if (!agent) {
		throw new PublicError("Agent not found");
	}

	const inputs = agent.steps.reduce(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(inputs: any, step) => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			inputs[step.name] = (input: any) => input[step.name] || "";
			return inputs;
		},
		{
			_empty: () => "",
			prompt: (input) => input.prompt,
			chat_history: (input) => chat_history,
		} as RunnableLike<RunnableInput, RunnableOutput>,
	) as RunnableLike<RunnableInput, RunnableOutput>;

	const sequences: RunnableLike<RunnableInput, RunnableOutput>[] = [];
	for (const step of agent.steps.slice(0, -1)) {
		const messages: // biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(ChatPromptTemplate<any, string> | BaseMessagePromptTemplateLike)[] = [
			["system", step.systemTemplate],
		];
		if (step.includeChatHistory) {
			messages.push(new MessagesPlaceholder("chat_history"));
		}
		messages.push(["human", step.messageTemplate]);
		const template = ChatPromptTemplate.fromMessages(messages);

		sequences.push({
			...inputs,
			[step.name]: RunnableBranch.from<RunnableInput, RunnableOutput>([
				[
					(inputs) => {
						if (step.onlyIfPreviousMessages && !history.length) {
							return false;
						}
						for (const condition of step.conditions || []) {
							if (!condition.variable || !inputs[condition.variable]) {
								return false;
							}
							if (condition.regex) {
								const regex = new RegExp(condition.regex, "i");
								if (!regex.test(inputs[condition.variable])) return false;
							}
						}
						return true;
					},
					RunnableSequence.from([
						inputs,
						template,
						context.AI.bind({ signal }),
						new StringOutputParser(),
					]).withConfig({
						runName: `Agent-${agent.name}-Step-${step.name}`,
					}),
				],
				(inputs) => inputs._empty,
			]),
		});
	}

	const lastStep = agent.steps.slice(-1)[0];
	const messages: // biome-ignore lint/suspicious/noExplicitAny: <explanation>
	(ChatPromptTemplate<any, string> | BaseMessagePromptTemplateLike)[] = [
		["system", lastStep.systemTemplate],
	];
	if (lastStep.includeChatHistory) {
		messages.push(new MessagesPlaceholder("chat_history"));
	}
	messages.push(["human", lastStep.messageTemplate]);
	const template = ChatPromptTemplate.fromMessages(messages);

	return RunnableSequence.from([
		inputs,
		...[...sequences.map((sequence) => [inputs, sequence])].flat(),
		inputs,
		template,
		context.AI.bind({ signal }),
	]).withConfig({
		runName: `Agent-${agent.name}-Step-${lastStep.name}`,
	});
}
