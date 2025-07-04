"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Loader2, Users, Copy, Check } from "lucide-react";

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;
  const [copied, setCopied] = useState(false);
  
  const { data: roomInfo, isLoading, error } = api.game.getRoomInfo.useQuery(
    { code: roomCode },
    { enabled: !!roomCode }
  );

  // Subscribe to room updates
  api.game.subscribeToGameUpdates.useSubscription(
    { roomId: roomInfo?.id ?? "" },
    {
      enabled: !!roomInfo?.id,
      onData: (event: unknown) => {
                 if (event && typeof event === "object" && "type" in event && event.type === "game_started" && "gameId" in event && typeof event.gameId === "string") {
           router.push(`/game/play/${event.gameId}`);
         }
      },
    }
  );

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy room code:", err);
    }
  };

  if (isLoading) {
    return (
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading room...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-8">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center text-lg text-destructive">
                  Room Not Found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">
                  The room code &quot;{roomCode}&quot; doesn&apos;t exist or has expired.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="space-y-4 text-center">
            <h1 className="text-foreground text-4xl font-bold tracking-tight">
              <span className="text-primary">moo</span>
            </h1>
            <div className="text-2xl">
              🐄 🥛 🍄 🌸 🌿 🧺
            </div>
          </div>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
                Room {roomCode}
                <Badge variant={roomInfo?.status === "waiting" ? "secondary" : "default"}>
                  {roomInfo?.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">
                    1/2 players
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Waiting for another player to join...
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Share this room code with a friend:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-muted px-4 py-2 rounded font-mono text-lg tracking-widest">
                    {roomCode}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyRoomCode}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Waiting for player...
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  The game will start automatically when another player joins.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}