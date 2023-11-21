export async function consume(r, signal) {
	const reader = r.body.getReader();
	if (!signal) {
		while (await reader.read().then(x => !x.done)) { /* noop */ }
	} else {
		const aborted = new Promise(res => signal.addEventListener('abort', res));
		while (await Promise.race([
			reader.read().then(x => !x.done),
			aborted.then(() => false),
		])) { /* noop */ }
	}
}

const init = {
	"headers": {
		"User-Agent": "req/0.4.5"
	}
};

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname === "/timeline") {
			const response = await fetch("https://ground.news/timeline/israel-palestine-war", init);

			const ctrl = new AbortController();
			const chunks = [];
			
			const rewriter = new HTMLRewriter()
				.on('script#__NEXT_DATA__', {
					text(text) {
						chunks.push(text.text);
					}
				})

			await consume(rewriter.transform(response), ctrl.signal);
			const src = JSON.parse(chunks.join('')).props.pageProps.timeline.stories;

			const out = src.map(event => ({eventId: event.storyId, date: event.createdAt, updatedAt: event.updatedAt})).slice(0, 40);

			const asd = await Promise.all(
				out.map(async event => {
					const response = await fetch(`https://web-api-cdn.ground.news/api/public/event/${event.eventId}`, init);
					const data = await response.json();
					return {title: data.event.title};
				}));
			return Response.json(asd.sort((a,b) => -a.date.localeCompare(b.date)));
		}

		return new Response("", {
			headers: {
				"content-type": "text/html",
			},
		});
	},
};
