import type { BaseMessageChunk } from "@langchain/core/messages";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
	ChatPromptTemplate,
	MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
import type { AppLoadContext } from "@remix-run/cloudflare";

const CONDENSE_QUESTION_SYSTEM_TEMPLATE = `You are an experienced researcher, expert at interpreting and answering questions based on provided sources.
Your job is to remove references to chat history from incoming questions, rephrasing them as standalone questions.`;

const CONDENSE_QUESTION_HUMAN_TEMPLATE = `Using only previous conversation as context, rephrase the following question to be a standalone question.

Do not respond with anything other than a rephrased standalone question. Be concise, but complete and resolve all references to the chat history.

<question>
  {question}
</question>`;

const condenseQuestionPrompt = ChatPromptTemplate.fromMessages([
	["system", CONDENSE_QUESTION_SYSTEM_TEMPLATE],
	new MessagesPlaceholder("chat_history"),
	["human", CONDENSE_QUESTION_HUMAN_TEMPLATE],
]);

export function createConversationChain(
	context: AppLoadContext,
	systemPrompt: string,
	history: ["ai" | "human", string][],
) {
	const chat_history = formatChatHistory(history);

	const standaloneQuestionChain = RunnableSequence.from([
		{
			question: (input) => input.question,
			chat_history: (input) => chat_history,
		},
		condenseQuestionPrompt,
		context.AI,
		new StringOutputParser(),
	]).withConfig({ runName: "RephraseQuestionChain" });

	const answerPrompt = ChatPromptTemplate.fromMessages([
		["system", systemPrompt],
		// Adding chat history as part of the final answer generation is distracting for a small model like Llama 2-7B.
		// If using a more powerful model, you can re-enable to better support meta-questions about the conversation.
		new MessagesPlaceholder("chat_history"),
		["human", "{standalone_question}"],
	]);

	const answerChain = RunnableSequence.from([
		{
			standalone_question: (input) => input.standalone_question,
			chat_history: (input) => chat_history,
		},
		answerPrompt,
		context.AI,
	]).withConfig({ runName: "AnswerGenerationChain" });

	return RunnableSequence.from<{ question: string }, BaseMessageChunk>([
		{
			// standalone_question: RunnableBranch.from([
			// 	[(input) => chat_history.length > 0, standaloneQuestionChain],
			// 	(input) => input.question,
			// ]),
			standalone_question: (input) => input.question,
			chat_history: (input) => chat_history,
		},
		answerChain,
	]).withConfig({ runName: "ConversationalRetrievalChain" });
}

function formatChatHistory(chatHistory: ["ai" | "human", string][]) {
	return chatHistory.map((message) => {
		if (message[0] === "ai") {
			return new AIMessage({ content: message[1] });
		}
		return new HumanMessage({ content: message[1] });
	});
}
