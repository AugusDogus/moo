import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { type Metadata } from "next";

import { AuthRedirectHandler } from "~/components/auth/auth-redirect-handler";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import { Nunito, PT_Serif } from "next/font/google";
import { cn } from "~/lib/utils";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? env.BETTER_AUTH_URL),
  title: "moo",
  description:
    "a cozy cottage-core deduction game where you crack four-emoji codes with bulls and cows feedback",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
  openGraph: {
    title: "moo",
    description:
      "a cozy cottage-core deduction game where you crack four-emoji codes with bulls and cows feedback",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "moo - a cozy cottage-core deduction game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "moo",
    description:
      "a cozy cottage-core deduction game where you crack four-emoji codes with bulls and cows feedback",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={cn(nunito.variable, ptSerif.variable, "antialiased")}>
        <TRPCReactProvider>
          <AuthRedirectHandler />
          <div className="texture" />
          {children}
        </TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}
