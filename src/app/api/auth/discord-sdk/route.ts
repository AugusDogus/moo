import { env } from "~/env";

interface AuthRequest {
  code: string;
}

interface AuthResponse {
  redirectUrl: string;
  success: boolean;
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as AuthRequest;
    
    if (!body.code || typeof body.code !== "string") {
      return Response.json(
        { error: "Missing or invalid authorization code" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    // Validate environment variables
    if (!env.BETTER_AUTH_URL) {
      throw new Error("BETTER_AUTH_URL is not configured");
    }

    // Redirect to the existing Discord callback with the authorization code
    // This leverages the existing Discord provider in Better Auth
    const callbackUrl = new URL(
      `${env.BETTER_AUTH_URL}/api/auth/callback/discord`,
    );
    callbackUrl.searchParams.set("code", body.code);

    const response: AuthResponse = {
      redirectUrl: callbackUrl.toString(),
      success: true,
    };

    return Response.json(response);
  } catch (error) {
    console.error("Discord SDK auth error:", error);
    return Response.json(
      { error: "Internal server error" } satisfies ErrorResponse, 
      { status: 500 }
    );
  }
}
