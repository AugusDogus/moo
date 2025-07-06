import { type Metadata } from "next";

interface GameLayoutProps {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const roomCode = code.toUpperCase();

  // Basic validation - room codes should be 4 characters
  if (!roomCode || roomCode.length !== 4) {
    return {
      title: "moo",
      description: "room code not found",
    };
  }

  const title = `moo`;
  const description = `join the moo game in room ${roomCode}! a cozy cottage-core deduction game.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/api/og?title=moo&subtitle=room code&code=${roomCode}`,
          width: 1200,
          height: 630,
          alt: `moo game room ${roomCode}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?title=moo&subtitle=room code&code=${roomCode}`],
    },
  };
}

export default function GameLayout({ children }: GameLayoutProps) {
  return <>{children}</>;
}
