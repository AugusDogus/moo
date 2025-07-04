import "~/styles/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthRedirectHandler } from "~/components/auth/auth-redirect-handler";

export const metadata: Metadata = {
  title: "moo",
  description:
    "a cozy cottage-core deduction game where you crack four-emoji codes with bulls and cows feedback",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <AuthRedirectHandler />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
