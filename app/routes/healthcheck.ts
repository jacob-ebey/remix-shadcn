export function loader() {
	return new Response("OK", {
		status: 200,
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
