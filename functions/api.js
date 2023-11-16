export async function onRequest(context) {
    const host = "https://web-api-cdn.ground.news/api/public";
    const url = host + "/place/IL/interest";

    return new Response(JSON.stringify(await fetch(url)));
}
