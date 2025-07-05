import { createAuthClient } from "better-auth/react";
import { authorizeWithDiscordSDK, authenticateWithDiscordSDK, isInDiscordIframe } from "~/lib/discord-sdk";

export const authClient = createAuthClient();

export const signIn = async () => {
  // Check if we're in Discord's iframe
  if (isInDiscordIframe()) {
    return await signInWithDiscordSDK();
  }
  
  // Use normal OAuth flow
  await authClient.signIn.social({
    provider: "discord",
  });
};

export const signInWithDiscordSDK = async () => {
  try {
    // Step 1: Get authorization code from Discord SDK
    const code = await authorizeWithDiscordSDK();
    
    // Step 2: Exchange code for access token and create session
    const response = await fetch("/.proxy/api/auth/discord-sdk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate with Discord SDK");
    }

    const { access_token } = await response.json();
    
    // Step 3: Authenticate with Discord SDK
    await authenticateWithDiscordSDK(access_token);
    
    // Reload the page to reflect the new auth state
    window.location.reload();
  } catch (error) {
    console.error("Discord SDK sign-in failed:", error);
    throw error;
  }
};

export const signOut = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/";
      },
    },
  });
};

export const deleteUser = async () => {
  await authClient.deleteUser({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/";
      },
    },
  });
};
