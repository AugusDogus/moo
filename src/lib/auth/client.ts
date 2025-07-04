import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const signIn = async () => {
  await authClient.signIn.social({
    provider: "discord",
  });
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
