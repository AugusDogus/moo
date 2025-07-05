"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { SignInWithRedirect } from "~/components/auth/sign-in-with-redirect";
import { Loader2, Users, Copy, Check, LogIn } from "lucide-react";
import { authClient } from "~/lib/auth/client";

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  // Get current session
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  
  const { data: roomInfo, isLoading, error } = api.game.getRoomInfo.useQuery(
    { code: roomCode },
    { enabled: !!roomCode }
  );

  // Get user's role in this room if authenticated
  const { data: userRole } = api.game.getUserRoomRole.useQuery(
    { code: roomCode },
    { enabled: !!roomCode && !!session?.user }
  );

  const joinRoom = api.game.joinRoom.useMutation({
    onSuccess: (data: { gameId: string; roomId: string }) => {
      router.push(`/game/play/${data.gameId}`);
    },
    onError: (error: unknown) => {
      console.error("Failed to join room:", error);
      setIsJoining(false);
    },
  });

  // Redirect if user already has an active game in this room
  useEffect(() => {
    if (userRole?.gameId && userRole.gameStatus !== "finished") {
      router.push(`/game/play/${userRole.gameId}`);
    }
  }, [userRole, router]);

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

  const handleJoinRoom = async () => {
    if (!session?.user || !userRole) return;
    
    // Double-check we're only allowing visitors to join
    if (userRole.role !== "visitor") {
      console.error("User is not a visitor to this room");
      return;
    }
    
    setIsJoining(true);
    joinRoom.mutate({ code: roomCode });
  };

  if (isLoading || sessionLoading || (session?.user && !userRole)) {
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
                {!session?.user ? (
                  <p className="text-muted-foreground text-sm">
                    Sign in to join this game room
                  </p>
                ) : !roomInfo || !userRole ? (
                  <p className="text-muted-foreground text-sm">
                    Loading...
                  </p>
                ) : userRole.role === "creator" ? (
                  <p className="text-muted-foreground text-sm">
                    You created this room - waiting for another player...
                  </p>
                ) : userRole.role === "player" ? (
                  <p className="text-muted-foreground text-sm">
                    You&apos;re already in this game!
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Ready to join this game!
                  </p>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Room code:
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

              {!session?.user ? (
                // Not authenticated - show sign in
                <div className="text-center space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <LogIn className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign in to join this moo game room and start playing!
                    </p>
                    <SignInWithRedirect 
                      redirectUrl={`/game/room/${roomCode}`}
                    >
                      Sign in to join game
                    </SignInWithRedirect>
                  </div>
                </div>
              ) : !roomInfo || !userRole ? (
                // Room info still loading - show loading state
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading room details...
                    </span>
                  </div>
                </div>
              ) : userRole.role === "creator" ? (
                // Room creator - show waiting state
                <div className="text-center">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Your Room
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mb-4">
                      You created this room. Share the code with a friend to start playing!
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mt-4 mb-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Waiting for another player to join...
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    The game will start automatically when another player joins.
                  </p>
                </div>
              ) : userRole.role === "player" ? (
                // User is already a player - show game in progress
                <div className="text-center">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        You&apos;re in this game!
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mb-4">
                      Redirecting you back to the game...
                    </p>
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                </div>
              ) : (
                // Visitor - show join option
                <div className="text-center">
                  <Button
                    onClick={handleJoinRoom}
                    disabled={isJoining || joinRoom.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {isJoining || joinRoom.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Joining Game...
                      </>
                    ) : (
                      "Join Game"
                    )}
                  </Button>
                  
                  {joinRoom.error && (
                    <p className="text-sm text-destructive mt-2">
                      Failed to join room. Please try again.
                    </p>
                  )}
                </div>
              )}

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