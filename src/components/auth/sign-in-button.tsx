"use client";

import { Button } from "~/components/ui/button";
import { User } from "lucide-react";
import { signIn } from "~/lib/auth/client";

export function SignInButton() {
  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  return (
    <Button onClick={handleSignIn} className="w-full" size="lg">
      <User className="h-4 w-4" />
      Sign in with Discord
    </Button>
  );
}
