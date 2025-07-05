"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Loader2, Trophy, Copy, Check, LogIn } from "lucide-react";
import { EmojiPicker } from "~/components/game/emoji-picker";
import { GameBoard } from "~/components/game/game-board";
import { emojisToCode } from "~/lib/game-utils";
import { SignInWithRedirect } from "~/components/auth/sign-in-with-redirect";
import { authClient } from "~/lib/auth/client";

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
  const { data: roomInfo, isLoading: roomLoading, error: roomError } = api.game.getRoomInfo.useQuery(
    { code: roomCode },
    { 
      enabled: !!roomCode,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );

  // Get user's role in this room if authenticated
  const { data: userRole } = api.game.getUserRoomRole.useQuery(
    { code: roomCode },
    { 
      enabled: !!roomCode && !!session?.user,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );

  // Get game state if user is a player
  const { data: gameState, isLoading: gameLoading, error: gameError, refetch } = api.game.getGameStateByCode.useQuery(
    { code: roomCode },
    { 
      enabled: !!roomCode && !!session?.user && (userRole?.role === "creator" || userRole?.role === "player"),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
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

  // Subscribe to game updates - only if there's an active game
  api.game.subscribeToGameUpdates.useSubscription(
    { roomId: roomInfo?.id ?? "" },
    {
      enabled: !!roomInfo?.id && !!gameState?.game && !!session?.user && (userRole?.role === "creator" || userRole?.role === "player"),
      onData: () => {
        void refetch();
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
    
    if (userRole.role !== "visitor") {
      console.error("User is not a visitor to this room");
      return;
    }
    
    setIsJoining(true);
    joinRoom.mutate({ code: roomCode });
  };

  const handleSetCode = () => {
    if (selectedCode.every(emoji => emoji !== "")) {
      const code = emojisToCode(selectedCode);
      setPlayerCode.mutate({ roomCode, code });
    }
  };

  const handleMakeGuess = () => {
    if (guess.every(emoji => emoji !== "")) {
      const guessCode = emojisToCode(guess);
      makeGuess.mutate({ roomCode, guess: guessCode });
    }
  };

  const hasPlayerSetCode = () => {
    if (!gameState) return false;
    return gameState.isPlayer1 ? !!gameState.game.player1Code : !!gameState.game.player2Code;
  };

  const canMakeGuess = () => {
    if (!gameState || gameState.game.status !== "playing") return false;
    
    // Check if player has already made a guess this round
    const currentRound = gameState.game.currentRound;
    const playerMoves = gameState.moves.filter((move: { playerId: string }) => move.playerId === (gameState.isPlayer1 ? gameState.game.player1Id : gameState.game.player2Id));
    const currentRoundMove = playerMoves.find((move: { round: number }) => move.round === currentRound);
    
    return !currentRoundMove;
  };

  const isWinner = () => {
    if (!gameState?.game || gameState.game.status !== "finished") return null;
    const currentUserId = gameState.isPlayer1 ? gameState.game.player1Id : gameState.game.player2Id;
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
              <div className="text-2xl">
                🐮 🥛 🍄 🌸 🌿 🧺
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
                  <p className="text-muted-foreground text-sm">
                    Sign in to join this game room
                  </p>
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

                <div className="text-center space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <LogIn className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign in to join this moo game room and start playing!
                    </p>
                    <SignInWithRedirect 
                      redirectUrl={`/game/${roomCode}`}
                    >
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
              <div className="text-2xl">
                🐮 🥛 🍄 🌸 🌿 🧺
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
                    <span className="text-lg font-semibold">
                      1/2 players
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Ready to join this game!
                  </p>
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
                <div className="text-2xl">
                  🐮 🥛 🍄 🌸 🌿 🧺
                </div>
                <div className="text-sm text-muted-foreground">
                  Room: {roomCode}
                </div>
              </div>

              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
                    Room {roomCode}
                    <Badge variant="secondary">waiting</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg font-semibold">
                        1/2 players
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Created by {session.user.name}
                    </p>
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

                  <div className="text-center">
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-sm font-medium text-amber-900">
                          Your Game Room
                        </span>
                      </div>
                      <p className="text-sm text-amber-700 mb-4">
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
                  <CardTitle className="text-center text-lg text-destructive">
                    Game Not Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    This game doesn&apos;t exist or you don&apos;t have access to it.
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
            <h1 className="text-foreground text-4xl font-bold tracking-tight">
              <span className="text-primary">moo</span>
            </h1>
            <div className="text-2xl">
              🐮 🥛 🍄 🌸 🌿 🧺
            </div>
            <div className="text-sm text-muted-foreground">
              Room: {roomCode}
            </div>
          </div>

          {gameState.game.status === "code_selection" && (
            <div className="w-full max-w-md">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-lg">
                    {hasPlayerSetCode() ? "Waiting for opponent..." : "Set Your Secret Code"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasPlayerSetCode() ? (
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-4">
                        Code Set ✓
                      </Badge>
                      <p className="text-muted-foreground text-sm">
                        Waiting for your opponent to set their code...
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Game will start when both players are ready
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <EmojiPicker
                        selectedCode={selectedCode}
                        onCodeChange={setSelectedCode}
                        title="Choose your secret code"
                        disabled={setPlayerCode.isPending}
                      />
                      <Button
                        onClick={handleSetCode}
                        disabled={!selectedCode.every(emoji => emoji !== "") || setPlayerCode.isPending}
                        className="w-full"
                        size="lg"
                      >
                        {setPlayerCode.isPending ? "Setting Code..." : "Set Code"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {(gameState.game.status === "playing" || gameState.game.status === "finished") && (
            <div className="w-full max-w-6xl">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Your game board */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-center">Your Guesses</h2>
                  <GameBoard
                    moves={gameState.moves}
                    playerId={gameState.isPlayer1 ? gameState.game.player1Id : gameState.game.player2Id}
                    playerName="You"
                    isCurrentPlayer={true}
                  />

                  {/* Win/Lose display - right next to the game board */}
                  {gameState.game.status === "finished" && (
                    <Card className="w-full">
                      <CardHeader>
                        <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
                          <Trophy className="h-5 w-5" />
                          Game Over
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${isWinner() ? 'text-amber-700' : 'text-slate-600'}`}>
                            {isWinner() ? "You Won!" : "You Lost"}
                          </div>
                          <p className="text-muted-foreground text-sm mt-2">
                            {isWinner() ? "You cracked your opponent's code first!" : "Your opponent cracked your code first!"}
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
                  )}
                </div>

                {/* Guess input - only show if game is still playing */}
                {gameState.game.status === "playing" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center">Make Your Guess</h2>
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
                              disabled={!guess.every(emoji => emoji !== "") || makeGuess.isPending}
                              className="w-full"
                              size="lg"
                            >
                              {makeGuess.isPending ? "Making Guess..." : "Submit Guess"}
                            </Button>
                          </>
                        ) : (
                          <div className="text-center">
                            <Badge variant="secondary" className="mb-4">
                              Guess Made ✓
                            </Badge>
                            <p className="text-muted-foreground text-sm">
                              Waiting for opponent to make their guess...
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">
                                Round will advance when both players guess
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}