"use client";

import { Button } from "~/components/ui/button";
import { User } from "lucide-react";
import { authClient } from "~/lib/auth/client";

interface SignInWithRedirectProps {
  redirectUrl?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SignInWithRedirect({ 
  redirectUrl, 
  children,
  className = "w-full"
}: SignInWithRedirectProps) {
  const handleSignIn = async () => {
    try {
      // Store the redirect URL in sessionStorage
      if (redirectUrl) {
        sessionStorage.setItem("authRedirectUrl", redirectUrl);
      }
      
      await authClient.signIn.social({
        provider: "discord",
      });
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  return (
    <Button onClick={handleSignIn} className={className} size="lg">
      <User className="h-4 w-4" />
      {children ?? "Sign in with Discord"}
    </Button>
  );
}