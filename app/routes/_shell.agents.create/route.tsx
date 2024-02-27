import {
	getFormProps,
	getInputProps,
	getTextareaProps,
} from "@conform-to/react";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea, useAutoHeightTextArea } from "@/components/ui/textarea";
import { createAgentFormSchema, useCreateAgentForm } from "@/forms/agent";
import { Intents } from "@/intents";
import { createAgent } from "@/lib/agents.server";
import { requireUser } from "@/lib/auth.server";
import { PublicError, formIntent } from "@/lib/forms";

export async function action({ context, request }: ActionFunctionArgs) {
	const user = await requireUser(context, request);

	const formData = await request.formData();
	return formIntent(formData)
		.intent(Intents.CreateAgent, createAgentFormSchema, async (data) => {
			const agentId = await createAgent(context, user.id, data);
			if (!agentId) {
				throw new PublicError("Could not create agent");
			}
			throw redirect(`/agents/edit/${agentId}`);
		})
		.run();
}

export default function CreateAgent() {
	const [createAgentForm, createAgentFields] = useCreateAgentForm(undefined, {
		// disabled: chain.length === 0,
	});

	const steps = createAgentFields.steps.getFieldList();
	const autoHeightTextArea = useAutoHeightTextArea();

	const submitFormWithButton = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.currentTarget.type = "submit";
		event.currentTarget.form?.requestSubmit(event.currentTarget);
		event.currentTarget.type = "button";
	};

	return (
		<Form
			{...getFormProps(createAgentForm)}
			method="POST"
			className="space-y-4"
		>
			<input type="hidden" name="intent" value={Intents.CreateAgent} />

			<p>
				Agents run a collection of steps. Each step, except the last, can be
				conditionally ran. The output of the previous steps are available in
				conditions as the name of the previous steps name.
			</p>

			<p>
				The System and Message prompts for each step can use the previous
				values, and the user chat prompt in the templates with the syntax{" "}
				<code>{"{var_name}"}</code>
			</p>

			<div className="space-y-2">
				<Label htmlFor={createAgentFields.name.id}>Agent Name</Label>
				<Input
					{...getInputProps(createAgentFields.name, { type: "text" })}
					key={createAgentFields.name.key}
					className="w-full"
				/>
				<div
					id={createAgentFields.name.descriptionId}
					className="text-sm text-destructive"
				>
					{createAgentFields.name.errors}
				</div>
			</div>

			<div className="space-y-4">
				{steps.map((step, stepIndex) => {
					const stepFields = step.getFieldset();
					const conditions = stepFields.conditions.getFieldList();

					return (
						<Card key={step.key}>
							<CardHeader className="space-y-2">
								<div className="flex flex-row gap-4">
									<div className="space-y-2 flex-1">
										<Label htmlFor={stepFields.name.id}>Step name</Label>
										<Input
											{...getInputProps(stepFields.name, { type: "text" })}
											key={stepFields.name.key}
											className="w-full"
										/>
									</div>
									<div className="flex items-end">
										<Button
											type="button"
											size="icon"
											variant="destructive"
											title="Delete step"
											{...createAgentForm.remove.getButtonProps({
												name: createAgentFields.steps.name,
												index: stepIndex,
											})}
											onClick={submitFormWithButton}
										>
											<span className="sr-only">Delete step</span>
											<TrashIcon />
										</Button>
									</div>
								</div>
								<div
									id={stepFields.name.descriptionId}
									className="text-sm text-destructive"
								>
									{stepFields.name.errors}
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-8 flex-1">
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor={stepFields.systemPrompt.id}>
												System prompt
											</Label>
											<Textarea
												{...getTextareaProps(stepFields.systemPrompt)}
												{...autoHeightTextArea}
												key={stepFields.systemPrompt.key}
												autoComplete="off"
												className="w-full"
												placeholder="You are a helpful AI assistant. Reply in a friendly manner."
											/>
											<div
												id={stepFields.systemPrompt.descriptionId}
												className="text-sm text-destructive"
											>
												{stepFields.systemPrompt.errors}
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor={stepFields.messagePrompt.id}>
												Message prompt
											</Label>
											<Textarea
												{...getInputProps(stepFields.messagePrompt, {
													type: "text",
												})}
												{...autoHeightTextArea}
												key={stepFields.messagePrompt.key}
												autoComplete="off"
												className="w-full"
												placeholder="{prompt}"
											/>
											<div
												id={stepFields.messagePrompt.descriptionId}
												className="text-sm text-destructive"
											>
												{stepFields.messagePrompt.errors}
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<Checkbox
												{...getInputProps(stepFields.includeChatHistory, {
													type: "checkbox",
												})}
												type="button"
												key={stepFields.includeChatHistory.key}
												defaultChecked
											/>
											<Label htmlFor={stepFields.includeChatHistory.id}>
												Include chat history in prompt?
											</Label>
										</div>
									</div>

									<div className="space-y-4">
										<h4 className="font-semibold leading-none tracking-tight">
											Conditions
										</h4>

										<div className="flex items-center space-x-2">
											<Checkbox
												{...getInputProps(stepFields.onlyIfPreviousMessages, {
													type: "checkbox",
												})}
												type="button"
												key={stepFields.onlyIfPreviousMessages.key}
											/>
											<Label htmlFor={stepFields.onlyIfPreviousMessages.id}>
												Only if previous messages
											</Label>
										</div>

										{conditions.map((condition, conditionIndex) => {
											const conditionFields = condition.getFieldset();

											return (
												<React.Fragment key={condition.key}>
													<p>and</p>
													<div className="space-y-4 border border-border p-4 rounded-md">
														<div className="gap-y-2">
															<div className="flex flex-row gap-4">
																<div className="space-y-2 flex-1">
																	<Label htmlFor={conditionFields.input.id}>
																		Variable
																	</Label>
																	<Input
																		{...getInputProps(conditionFields.input, {
																			type: "text",
																		})}
																		key={conditionFields.input.key}
																		className="w-full"
																		autoCorrect="off"
																	/>
																</div>
																<div className="flex items-end">
																	<Button
																		type="button"
																		size="icon"
																		variant="destructive"
																		title="Delete condition"
																		{...createAgentForm.remove.getButtonProps({
																			name: stepFields.conditions.name,
																			index: conditionIndex,
																		})}
																		onClick={submitFormWithButton}
																	>
																		<span className="sr-only">
																			Delete condition
																		</span>
																		<TrashIcon />
																	</Button>
																</div>
															</div>
															<div
																id={conditionFields.input.descriptionId}
																className="text-sm text-destructive"
															>
																{conditionFields.input.errors}
															</div>
														</div>
														<div className="space-y-2">
															<Label htmlFor={conditionFields.regex.id}>
																Matches regex
															</Label>
															<Input
																{...getInputProps(conditionFields.regex, {
																	type: "text",
																})}
																key={conditionFields.regex.key}
																className="w-full"
																autoCorrect="off"
															/>
															<div
																id={conditionFields.regex.descriptionId}
																className="text-sm text-destructive"
															>
																{conditionFields.regex.errors}
															</div>
														</div>
													</div>
												</React.Fragment>
											);
										})}

										<Button
											type="button"
											variant="secondary"
											title="Add condition"
											{...createAgentForm.insert.getButtonProps({
												name: stepFields.conditions.name,
												defaultValue: {
													input: "",
													regex: "",
												},
											})}
											onClick={submitFormWithButton}
										>
											<PlusIcon className="mr-2" /> Add condition
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<div className="space-y-2">
				<Button
					type="button"
					variant="secondary"
					title="Add step"
					{...createAgentForm.insert.getButtonProps({
						name: createAgentFields.steps.name,
						defaultValue: {
							name: "",
							messagePrompt: "",
							messages: [],
							systemPrompt: "",
							onlyIfPreviousMessages: false,
							conditions: [],
						},
					})}
					onClick={(event) => {
						event.currentTarget.type = "submit";
						event.currentTarget.form?.requestSubmit(event.currentTarget);
						event.currentTarget.type = "button";
					}}
				>
					<PlusIcon className="mr-2" /> Add step
				</Button>
				<div className="text-sm text-destructive">
					{createAgentFields.steps.errors}
				</div>
			</div>

			<hr />
			<Button type="submit" size="lg">
				Create agent
			</Button>
		</Form>
	);
}
