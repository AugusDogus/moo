import "~/styles/globals.css";

import { type Metadata } from "next";

import { AuthRedirectHandler } from "~/components/auth/auth-redirect-handler";
import { TRPCReactProvider } from "~/trpc/react";

import { Nunito, PT_Sans } from "next/font/google";
import { cn } from "~/lib/utils";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const ptSans = PT_Sans({
  variable: "--font-pt-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

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
      <body className={cn(nunito.variable, ptSans.variable, "antialiased")}>
        <TRPCReactProvider>
          <AuthRedirectHandler />
          <div className="texture" />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
