"use client";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { User, Loader2 } from "lucide-react";
import { signIn } from "~/lib/auth/client";
import { isInDiscordIframe } from "~/lib/discord-sdk";

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscordIframe, setIsDiscordIframe] = useState(false);

  useEffect(() => {
    // Check if we're in Discord's iframe
    setIsDiscordIframe(isInDiscordIframe());
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn();
    } catch (error) {
      console.error("Sign-in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSignIn} 
      className="w-full" 
      size="lg"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isDiscordIframe ? "Authenticating with Discord..." : "Signing in..."}
        </>
      ) : (
        <>
          <User className="h-4 w-4" />
          {isDiscordIframe ? "Sign in with Discord Activity" : "Sign in with Discord"}
        </>
      )}
    </Button>
  );
}
