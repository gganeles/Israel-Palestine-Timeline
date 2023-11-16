export async function onRequest(context) {
    const host = "https://web-api-cdn.ground.news/api/public/place/IL/interest";
    return new Response(await fetch(url));
}
