import { Intents } from "@/intents";

export async function sendMessage(
	chatId: string | undefined,
	formData: FormData,
) {
	formData.set("intent", Intents.SendMessage);
	const response = await fetch(`/api/chat/${chatId || ""}`, {
		method: "POST",
		body: formData,
	});

	const body = response.body;
	if (!body) {
		throw new Error("No response body");
	}

	const sentMessage = String(formData.get("message"));
	const aiMessageId = response.headers.get("X-Ai-Message-Id");
	const newChatId = response.headers.get("X-Chat-Id");
	const sentMessageId = response.headers.get("X-Sent-Message-Id");
	const redirectTo = response.headers.get("X-Redirect") || "";

	if (!aiMessageId || !newChatId || !sentMessageId || !sentMessage) {
		throw new Error("Could not send message");
	}

	const success = new Deferred<boolean>();

	const stream = body.pipeThrough(createResponseTransformer(success));

	return {
		aiMessageId,
		chatId: newChatId,
		sentMessage,
		sentMessageId,
		next: promiseStream(stream.getReader()),
		redirectTo,
		success: success.promise,
	};
}

function createResponseTransformer(success: Deferred<boolean>) {
	let buffer = "";
	let statusBuffer = "";
	let statusReceived = false;

	return new TransformStream<Uint8Array, string>({
		transform(chunk, controller) {
			const chunkStr = new TextDecoder().decode(chunk);

			if (!statusReceived) {
				buffer += chunkStr;

				const statusIndex = buffer.indexOf("\0\n");
				if (statusIndex !== -1) {
					statusBuffer = buffer.slice(statusIndex + 2);
					buffer = buffer.slice(0, statusIndex);
					statusReceived = true;
				}
			} else {
				statusBuffer += chunkStr;
			}

			if (
				statusReceived &&
				(statusBuffer === "success" || statusBuffer === "failure")
			) {
				controller.enqueue(buffer);
				success.resolve(statusBuffer === "success");
				buffer = "";
				statusBuffer = "";
				statusReceived = false;
			} else if (!statusReceived && buffer.length > 0) {
				controller.enqueue(buffer);
				buffer = "";
			}
		},

		flush(controller: TransformStreamDefaultController<string | boolean>) {
			if (buffer.length > 0) {
				controller.enqueue(buffer);
			}
			if (statusBuffer === "success" || statusBuffer === "failure") {
				controller.enqueue(statusBuffer === "success");
			}
		},
	});
}

export type RecursivePromise = {
	value?: string;
	next?: Promise<RecursivePromise>;
};

async function promiseStream(
	reader: ReadableStreamDefaultReader<string>,
	gotContent = false,
): Promise<RecursivePromise> {
	const { done, value } = await reader.read();

	if (done) return { value, next: undefined };

	if (!gotContent && !value) return promiseStream(reader, false);

	return {
		value,
		next: promiseStream(reader, true),
	};
}

class Deferred<T> {
	resolve!: (value: T | PromiseLike<T>) => void;
	reject!: (reason?: unknown) => void;
	promise = new Promise<T>((resolve, reject) => {
		this.resolve = resolve;
		this.reject = reject;
	});
}
