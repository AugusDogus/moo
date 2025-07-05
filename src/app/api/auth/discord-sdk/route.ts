import { env } from "~/env";
import { auth } from "~/lib/auth/server";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return Response.json({ error: "Missing authorization code" }, { status: 400 });
    }

    // Exchange the authorization code for an access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${env.BETTER_AUTH_URL}/api/auth/callback/discord`,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Token exchange failed:", error);
      return Response.json({ error: "Token exchange failed" }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Get user info from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      const error = await userResponse.text();
      console.error("Failed to fetch user info:", error);
      return Response.json({ error: "Failed to fetch user info" }, { status: 400 });
    }

    const userData = await userResponse.json();

    // Create session by calling the auth endpoint with the user data
    const sessionResponse = await auth.api.signInSocial({
      body: {
        provider: "discord",
        providerId: userData.id,
        email: userData.email,
        name: userData.username,
        image: userData.avatar 
          ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
          : null,
        emailVerified: userData.verified,
      },
    });

    return Response.json({ 
      access_token,
      success: true,
      user: sessionResponse.user,
    });
  } catch (error) {
    console.error("Discord SDK auth error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}