export async function onRequest(context) {
    const url = "https://web-api-cdn.ground.news/api/public";

    const init = {
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/116.0",
            "Accept": "text/json",
            "Accept-Language": "en-US,en;q=0.5",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        }};
    const response = await fetch(`${url}/interest/453a847a-ac24-45d3-a937-63fc9d6a1318/events`, init);
    const events = (await response.json()).eventIds;

    const results = [];

    for (const id of events) {
        const i = await (await fetch (`${url}/event/${id}/summary`, init)).json();
        console.log (i.summary.sources)
        results.push (i.summary.sources);
    }

    return new Response(results.join ("\n"));
}
