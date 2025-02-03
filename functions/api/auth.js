export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
  
    // If no code, redirect user to GitHub for authorization.
    if (!code) {
      const clientId = env.GITHUB_CLIENT_ID;
      const redirectUri = `${url.origin}/api/auth`;
      const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      return Response.redirect(githubOAuthUrl, 302);
    }
  
    // Exchange the code for an access token.
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
  
    // Create headers to set a cookie with the access token.
    // Adjust cookie name if needed; Decap CMS does not automatically read this cookie,
    // but you can later customize the CMS to check it if desired.
    const headers = new Headers();
    headers.append("Set-Cookie", `CMS_ACCESS_TOKEN=${tokenData.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    // Redirect the window back to the admin interface.
    headers.append("Location", `${url.origin}/admin/`);
  
    return new Response(null, { status: 302, headers });
  }
  