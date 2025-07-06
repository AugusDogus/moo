"use client";

import { DiscordSDK } from "@discord/embedded-app-sdk";
import { env } from "~/env";

let discordSdk: DiscordSDK | null = null;

export const getDiscordSDK = () => {
  if (!discordSdk) {
    // Initialize the Discord SDK only once
    discordSdk = new DiscordSDK(env.NEXT_PUBLIC_DISCORD_CLIENT_ID);
  }
  return discordSdk;
};

export const isInDiscordIframe = () => {
  if (typeof window === "undefined") return false;
  
  // Check if we're in Discord's iframe by checking the hostname
  return window.location.hostname.endsWith(".discordsays.com");
};

export const setupDiscordSDK = async () => {
  const sdk = getDiscordSDK();
  
  try {
    // Wait for READY payload from the discord client
    await sdk.ready();
    return sdk;
  } catch (error) {
    console.error("Failed to initialize Discord SDK:", error);
    throw error;
  }
};

export const authorizeWithDiscordSDK = async () => {
  const sdk = await setupDiscordSDK();
  
  try {
    // Pop open the OAuth permission modal and request for access to scopes
    const { code, state } = await sdk.commands.authorize({
      client_id: env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "email"],
    });
    
    return { code, state };
  } catch (error) {
    console.error("Discord SDK authorization failed:", error);
    throw error;
  }
};

