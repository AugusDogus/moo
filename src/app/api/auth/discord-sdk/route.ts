import { env } from "~/env";

export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as {
      code: string;
    };

    if (!code) {
      return Response.json(
        { error: "Missing authorization code" },
        { status: 400 },
      );
    }

    // Redirect to the existing Discord callback with the authorization code
    // This leverages the existing Discord provider in Better Auth
    const callbackUrl = new URL(
      `${env.BETTER_AUTH_URL}/api/auth/callback/discord`,
    );
    callbackUrl.searchParams.set("code", code);

    return Response.json({
      redirectUrl: callbackUrl.toString(),
      success: true,
    });
  } catch (error) {
    console.error("Discord SDK auth error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
