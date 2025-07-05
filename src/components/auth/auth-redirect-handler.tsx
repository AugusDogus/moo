"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth/client";

export function AuthRedirectHandler() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    // Only redirect if the user just signed in and we have a stored redirect URL
    if (session?.user) {
      const redirectUrl = sessionStorage.getItem("authRedirectUrl");
      if (redirectUrl) {
        // Clear the stored URL
        sessionStorage.removeItem("authRedirectUrl");
        // Navigate to the stored URL
        router.push(redirectUrl);
      }
    }
  }, [session?.user, router]);

  // This component doesn't render anything
  return null;
}
