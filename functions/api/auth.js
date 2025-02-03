// functions/api/auth.js

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
  
    // If no code is provided, redirect to GitHub's OAuth authorize page.
    if (!code) {
      const clientId = env.GITHUB_CLIENT_ID;
      const redirectUri = `${url.origin}/api/auth`;
      const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      return Response.redirect(githubOAuthUrl, 302);
    }
  
    // If a code is provided, exchange it for an access token.
    const clientId = env.GITHUB_CLIENT_ID;
    const clientSecret = env.GITHUB_CLIENT_SECRET;
  
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });
  
    const tokenData = await tokenResponse.json();
  
    // You can customize this response as needed (e.g., set a cookie, redirect, etc.)
    return new Response(JSON.stringify(tokenData), {
      headers: { "Content-Type": "application/json" }
    });
  }
  