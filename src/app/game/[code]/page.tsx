"use client";

import { Check, Copy, Loader2, LogIn } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { SignInWithRedirect } from "~/components/auth/sign-in-with-redirect";
import { EmojiPicker } from "~/components/game/emoji-picker";
import { GameBoard } from "~/components/game/game-board";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { authClient } from "~/lib/auth/client";
import { emojisToCode } from "~/lib/game-utils";
import { api } from "~/trpc/react";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [selectedCode, setSelectedCode] = useState<string[]>(["", "", "", ""]);
  const [guess, setGuess] = useState<string[]>(["", "", "", ""]);

  // Get current session
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Get room info (public endpoint)
  const {
    data: roomInfo,
    isLoading: roomLoading,
    error: roomError,
  } = api.game.getRoomInfo.useQuery(
    { code: roomCode },
    {
      enabled: !!roomCode,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  // Get user's role in this room if authenticated
  const { data: userRole } = api.game.getUserRoomRole.useQuery(
    { code: roomCode },
    {
      enabled: !!roomCode && !!session?.user,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  // Get game state if user is a player or creator
  const {
    data: gameState,
    isLoading: gameLoading,
    error: gameError,
    refetch,
  } = api.game.getGameStateByCode.useQuery(
    { code: roomCode },
    {
      enabled:
        !!roomCode &&
        !!session?.user &&
        (userRole?.role === "creator" || userRole?.role === "player"),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
      staleTime: 0, // Always fetch fresh data when subscription triggers refetch
    },
  );

  const joinRoom = api.game.joinRoom.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
    onError: (error: unknown) => {
      console.error("Failed to join room:", error);
      setIsJoining(false);
    },
  });

  const setPlayerCode = api.game.setPlayerCodeByCode.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const makeGuess = api.game.makeGuessByCode.useMutation({
    onSuccess: () => {
      setGuess(["", "", "", ""]);
      void refetch();
    },
  });

  // Get tRPC utils for invalidation
  const utils = api.useUtils();

  // Subscribe to game updates - room creators need this to know when players join
  api.game.subscribeToGameUpdates.useSubscription(
    { roomId: roomInfo?.id ?? "" },
    {
      enabled:
        !!roomInfo?.id &&
        !!session?.user &&
        (userRole?.role === "creator" || userRole?.role === "player"),
      onData: (event: unknown) => {
        if (event && typeof event === "object" && "type" in event) {
          if (event.type === "game_started") {
            // Invalidate all related queries to force fresh data
            void utils.game.getGameStateByCode.invalidate({ code: roomCode });
            void utils.game.getUserRoomRole.invalidate({ code: roomCode });
            void utils.game.getRoomInfo.invalidate({ code: roomCode });
          } else if (
            event.type === "move_made" ||
            event.type === "game_finished"
          ) {
            void refetch();
          }
        }
      },
    },
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

    if (userRole.role !== "visitor") {
      console.error("User is not a visitor to this room");
      return;
    }

    setIsJoining(true);
    joinRoom.mutate({ code: roomCode });
  };

  const handleSetCode = () => {
    if (selectedCode.every((emoji) => emoji !== "")) {
      const code = emojisToCode(selectedCode);
      setPlayerCode.mutate({ roomCode, code });
    }
  };

  const handleMakeGuess = () => {
    if (guess.every((emoji) => emoji !== "")) {
      const guessCode = emojisToCode(guess);
      makeGuess.mutate({ roomCode, guess: guessCode });
    }
  };

  const hasPlayerSetCode = () => {
    if (!gameState) return false;
    return gameState.isPlayer1
      ? !!gameState.game.player1Code
      : !!gameState.game.player2Code;
  };

  const canMakeGuess = () => {
    if (!gameState || gameState.game.status !== "playing") return false;

    // Check if player has already made a guess this round
    const currentRound = gameState.game.currentRound;
    const playerMoves = gameState.moves.filter(
      (move: { playerId: string }) =>
        move.playerId ===
        (gameState.isPlayer1
          ? gameState.game.player1Id
          : gameState.game.player2Id),
    );
    const currentRoundMove = playerMoves.find(
      (move: { round: number }) => move.round === currentRound,
    );

    return !currentRoundMove;
  };

  const isWinner = () => {
    if (!gameState?.game || gameState.game.status !== "finished") return null;
    const currentUserId = gameState.isPlayer1
      ? gameState.game.player1Id
      : gameState.game.player2Id;
    return gameState.game.winnerId === currentUserId;
  };

  if (roomLoading || sessionLoading || (session?.user && !userRole)) {
    return (
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (roomError) {
    return (
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-8">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-destructive text-center text-lg">
                  Room Not Found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">
                  The room code &quot;{roomCode}&quot; doesn&apos;t exist or has
                  expired.
                </p>
                <Button onClick={() => router.push("/")} className="w-full">
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  // If user is not authenticated, show sign in
  if (!session?.user) {
    return (
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="space-y-4 text-center">
              <h1 className="text-foreground text-4xl font-bold tracking-tight">
                <span className="text-primary">moo</span>
              </h1>
              <div className="text-2xl">🐮 🥛 🍄 🌸 🌿 🧺</div>
            </div>

            <Card className="w-full max-w-md">
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    Sign in to join this game room
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-2 text-xs">
                    Room code:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-muted rounded px-4 py-2 font-mono text-lg tracking-widest">
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

                <div className="space-y-4 text-center">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <LogIn className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground mb-4 text-sm">
                      Sign in to join this moo game room and start playing!
                    </p>
                    <SignInWithRedirect redirectUrl={`/game/${roomCode}`}>
                      Sign in to join game
                    </SignInWithRedirect>
                  </div>
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

  // If user is a visitor, show join option
  if (userRole?.role === "visitor") {
    return (
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="space-y-4 text-center">
              <h1 className="text-foreground text-4xl font-bold tracking-tight">
                <span className="text-primary">moo</span>
              </h1>
              <div className="text-2xl">🐮 🥛 🍄 🌸 🌿 🧺</div>
            </div>

            <Card className="w-full max-w-md">
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <span className="text-lg font-semibold">1/2 players</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Ready to join this game!
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-2 text-xs">
                    Room code:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-muted rounded px-4 py-2 font-mono text-lg tracking-widest">
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
                  <Button
                    onClick={handleJoinRoom}
                    disabled={isJoining || joinRoom.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {isJoining || joinRoom.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining Game...
                      </>
                    ) : (
                      "Join Game"
                    )}
                  </Button>

                  {joinRoom.error && (
                    <p className="text-destructive mt-2 text-sm">
                      Failed to join room. Please try again.
                    </p>
                  )}
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

  // User is creator or player - show game interface
  if (gameLoading) {
    return (
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading game...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!gameState) {
    // If there's no game yet and user is creator, show waiting state
    if (userRole?.role === "creator") {
      return (
        <main className="bg-background min-h-screen">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="space-y-4 text-center">
                <h1 className="text-foreground text-4xl font-bold tracking-tight">
                  <span className="text-primary">moo</span>
                </h1>
                <div className="text-2xl">🐮 🥛 🍄 🌸 🌿 🧺</div>
                <div className="text-muted-foreground text-sm">
                  Room: {roomCode}
                </div>
              </div>

              <Card className="w-full max-w-md">
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <span className="text-lg font-semibold">1/2 players</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Created by {session.user.name}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-muted-foreground mb-2 text-xs">
                      Room code:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="bg-muted rounded px-4 py-2 font-mono text-lg tracking-widest">
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
                    <div className="border-primary-200 rounded-lg border bg-amber-50 p-4">
                      <div className="mb-2 flex items-center justify-center gap-2">
                        <span className="text-sm font-medium text-amber-900">
                          Your Game Room
                        </span>
                      </div>
                      <p className="mb-4 text-sm text-amber-700">
                        Share the code with a friend to start playing!
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-amber-700">
                          Waiting for another player...
                        </span>
                      </div>
                    </div>
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

    // If there's a game error and user is a player, show error
    if (gameError && userRole?.role === "player") {
      return (
        <main className="bg-background min-h-screen">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col items-center justify-center gap-8">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-destructive text-center text-lg">
                    Game Not Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    This game doesn&apos;t exist or you don&apos;t have access
                    to it.
                  </p>
                  <Button onClick={() => router.push("/")} className="w-full">
                    Back to Home
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      );
    }

    // If we get here, something unexpected happened - just show loading
    return (
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading game...</p>
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
            <h1 className="text-foreground font-serif text-4xl font-bold tracking-tight">
              <span className="text-primary">moo</span>
            </h1>
            <div className="text-2xl">🐮 🥛 🍄 🌸 🌿 🧺</div>
            <div className="text-muted-foreground text-sm">
              Room: {roomCode}
            </div>
          </div>

          {gameState.game.status === "code_selection" && (
            <div className="w-full max-w-md">
              {hasPlayerSetCode() ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-lg">
                      Waiting for opponent...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-4">
                        Code Set ✓
                      </Badge>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-muted-foreground text-sm">
                          Game will start when both players are ready
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <EmojiPicker
                    selectedCode={selectedCode}
                    onCodeChange={setSelectedCode}
                    title="Choose your secret code"
                    disabled={setPlayerCode.isPending}
                  />
                  <Button
                    onClick={handleSetCode}
                    disabled={
                      !selectedCode.every((emoji) => emoji !== "") ||
                      setPlayerCode.isPending
                    }
                    className="w-full"
                    size="lg"
                  >
                    {setPlayerCode.isPending ? "Setting Code..." : "Set Code"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {(gameState.game.status === "playing" ||
            gameState.game.status === "finished") && (
            <div className="w-full max-w-4xl">
              {gameState.game.status === "finished" ? (
                // Game finished - show results with game history
                <div className="space-y-6">
                  {/* Win/Lose status */}
                  <Card className="w-full">
                    <CardContent className="space-y-4 pt-6">
                      <div className="text-center">
                        <div
                          className={`text-3xl font-bold ${isWinner() ? "text-amber-700" : "text-slate-600"}`}
                        >
                          {isWinner() ? "You Won!" : "You Lost"}
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">
                          {isWinner()
                            ? "You cracked your opponent's code first!"
                            : "Your opponent cracked your code first!"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => router.push("/")}
                          className="flex-1"
                        >
                          New Game
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Game history */}
                  <GameBoard
                    moves={gameState.moves}
                    playerId={session.user.id}
                    isCurrentPlayer={true}
                    showTitle={false}
                  />
                </div>
              ) : (
                // Game in progress - show guessing interface
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Your guesses */}
                  <GameBoard
                    moves={gameState.moves}
                    playerId={session.user.id}
                    isCurrentPlayer={true}
                  />

                  {/* Guess input */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-center text-lg">
                          Round {gameState.game.currentRound}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {canMakeGuess() ? (
                          <>
                            <EmojiPicker
                              selectedCode={guess}
                              onCodeChange={setGuess}
                              title="What's your guess?"
                              disabled={makeGuess.isPending}
                            />
                            <Button
                              onClick={handleMakeGuess}
                              disabled={
                                !guess.every((emoji) => emoji !== "") ||
                                makeGuess.isPending
                              }
                              className="w-full"
                              size="lg"
                            >
                              {makeGuess.isPending
                                ? "Making Guess..."
                                : "Submit Guess"}
                            </Button>
                          </>
                        ) : (
                          <div className="text-center">
                            <Badge variant="secondary" className="mb-4">
                              Guess Made ✓
                            </Badge>
                            <div className="mt-4 flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-muted-foreground text-sm">
                                Round will advance when both players guess
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
