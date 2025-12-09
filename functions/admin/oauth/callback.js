export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return new Response("Missing code param", { status: 400 });
    }

    const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "user-agent": "cloudflare-pages-functions",
            accept: "application/json",
        },
        body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
        }),
    });

    const result = await response.json();

    if (result.error) {
        return new Response(JSON.stringify(result), { status: 400 });
    }

    // Decap CMS expects exactly this script response to finish the login window
    const content = `
    <script>
      (function() {
        function receiveMessage(e) {
          console.log("receiveMessage %o", e);
          if (e.origin !== window.location.origin) {
             console.log("origins did not match", e.origin, window.location.origin);
          }
          // send message to main window with the app
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify({
        token: result.access_token,
        provider: "github",
    })}',
            e.origin
          );
        }
        window.addEventListener("message", receiveMessage, false);
        // Start hand-shake with parent
        console.log("Sending message: %o", "github");
        window.opener.postMessage("authorizing:github", "*");
      })()
    </script>
  `;

    return new Response(content, {
        headers: {
            "content-type": "text/html;charset=UTF-8",
        },
    });
}
