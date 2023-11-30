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

export const get = async ({ request }) => {
	const url = new URL(request.url);

	const response = await fetch("https://ground.news/timeline/israel-palestine-war", init);

	const ctrl = new AbortController();
	const chunks = [];

	const rewriter = new HTMLRewriter()
				.on('script#__NEXT_DATA__', {
					text(text) {
						chunks.push(text.text);
					}
				});

	await consume(rewriter.transform(response), ctrl.signal);
	const src = JSON.parse(chunks.join('')).props.pageProps.timeline.stories;

	const out = src.map(event => (`https://web-api-cdn.ground.news/api/public/event/${event.storyId}`));

  /*const asd = await Promise.all(
    out.map(async event => {
      const response = await fetch(`https://web-api-cdn.ground.news/api/public/event/${event.eventId}`, init);
      const srcResponses = await fetch(`https://web-api-cdn.ground.news/api/public/event/${event.eventId}/sources`, init);
      const event = await response.json();
      return {title: event.event.title, date: event.event.start, sources: data.event.};
	  }));*/
  //	return Response.json(asd.sort((a,b) => -a.date.localeCompare(b.date)));
	return Response.json(out);
};
