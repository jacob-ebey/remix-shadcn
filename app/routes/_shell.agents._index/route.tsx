import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";

import {
	ConfirmationContent,
	useConfirmationDialog,
} from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { deleteAgentFormSchema } from "@/forms/agent";
import { Intents } from "@/intents";
import { deleteAgent, getAgents } from "@/lib/agents.server";
import { requireUser } from "@/lib/auth.server";
import { formIntent } from "@/lib/forms";
import { TrashIcon } from "@radix-ui/react-icons";

export async function loader({ context, request }: LoaderFunctionArgs) {
	const user = await requireUser(context, request);

	const agents = await getAgents(context, user.id);

	return { agents };
}

export async function action({ context, request }: ActionFunctionArgs) {
	const user = await requireUser(context, request);

	const formData = await request.formData();
	return formIntent(formData)
		.intent(Intents.DeleteAgent, deleteAgentFormSchema, async (data) => {
			await deleteAgent(context, user.id, data.agentId);
		})
		.run();
}

export default function Agents() {
	const { agents } = useLoaderData<typeof loader>();

	const confirmation = useConfirmationDialog();

	return (
		<ul className="space-y-4">
			{agents.map((agent) => (
				<li key={agent.id} className="flex space-x-2">
					<Button asChild variant="outline" className="flex-1 justify-start">
						<Link to={`/agents/edit/${agent.id}`}>
							<span>{agent.name}</span>
						</Link>
					</Button>
					<Form id={`delete-agent-form-${agent.id}`} method="POST">
						<input type="hidden" name="intent" value={Intents.DeleteAgent} />
						<input type="hidden" name="agentId" value={agent.id} />
					</Form>
					<confirmation.Provider>
						<Dialog
							open={confirmation.open}
							onOpenChange={confirmation.onOpenChange}
						>
							<DialogTrigger asChild>
								<Button
									form={`delete-agent-form-${agent.id}`}
									type="submit"
									name="intent"
									value={Intents.DeleteAgent}
									size="icon"
									variant="destructive"
									onClick={(event) => {
										confirmation.setOptions({
											title: "Delete agent?",
											description: `Are you sure you want to delete agent "${agent.name}"? This action cannot be undone.`,
											options: [
												{
													label: "Cancel",
												},
												{
													label: "Yes, delete agent",
													variant: "destructive",
													intent: Intents.DeleteAgent,
													form: `delete-agent-form-${agent.id}`,
												},
											],
										});
										event.preventDefault();
									}}
								>
									<TrashIcon
										className="min-w-4 min-h-6 w-6 h-6"
										width={6}
										height={6}
									/>
									<div className="flex sr-only flex-col min-w-0 @[150px]:not-sr-only">
										<span className="truncate">Clear chats</span>
									</div>
								</Button>
							</DialogTrigger>
							<ConfirmationContent />
						</Dialog>
					</confirmation.Provider>
				</li>
			))}
		</ul>
	);
}
