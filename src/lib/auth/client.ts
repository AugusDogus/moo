import { createAuthClient } from "better-auth/react";
import { authorizeWithDiscordSDK, isInDiscordIframe } from "~/lib/discord-sdk";

export const authClient = createAuthClient();

export const signIn = async (): Promise<void> => {
  // Check if we're in Discord's iframe
  if (isInDiscordIframe()) {
    return await signInWithDiscordSDK();
  }

  // Use normal OAuth flow
  await authClient.signIn.social({
    provider: "discord",
  });
};

interface AuthResponse {
  redirectUrl: string;
  success: boolean;
}

interface ErrorResponse {
  error: string;
}

export const signInWithDiscordSDK = async (): Promise<void> => {
  try {
    // Step 1: Get authorization code from Discord SDK
    const { code } = await authorizeWithDiscordSDK();

    // Step 2: Get redirect URL from our endpoint
    const response = await fetch("/.proxy/api/auth/discord-sdk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(`Failed to process Discord SDK authorization: ${errorData.error}`);
    }

    const { redirectUrl } = (await response.json()) as AuthResponse;

    if (!redirectUrl || typeof redirectUrl !== "string") {
      throw new Error("Invalid redirect URL received from server");
    }

    // Step 3: Navigate to the Discord callback URL
    // This will trigger the normal Discord OAuth flow in Better Auth
    window.location.href = redirectUrl;
  } catch (error) {
    console.error("Discord SDK sign-in failed:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/";
      },
    },
  });
};

export const deleteUser = async (): Promise<void> => {
  await authClient.deleteUser({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/";
      },
    },
  });
};
