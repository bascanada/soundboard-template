export async function onRequest(context) {
    const { env } = context;
    const clientId = env.GITHUB_CLIENT_ID;
    const redirectParams = new URLSearchParams({
        client_id: clientId,
        scope: 'repo user',
    });
    const url = `https://github.com/login/oauth/authorize?${redirectParams.toString()}`;
    return Response.redirect(url);
}
