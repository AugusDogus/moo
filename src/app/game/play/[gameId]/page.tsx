"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Loader2, Trophy, Target } from "lucide-react";
import { EmojiPicker } from "~/components/game/emoji-picker";
import { GameBoard } from "~/components/game/game-board";
import { emojisToCode } from "~/lib/game-utils";

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const [selectedCode, setSelectedCode] = useState<string[]>(["", "", "", ""]);
  const [guess, setGuess] = useState<string[]>(["", "", "", ""]);
  const [gamePhase, setGamePhase] = useState<"loading" | "code_selection" | "playing" | "finished">("loading");

  const { data: gameState, isLoading, error, refetch } = api.game.getGameState.useQuery(
    { gameId },
    { enabled: !!gameId }
  );

  const setPlayerCode = api.game.setPlayerCode.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const makeGuess = api.game.makeGuess.useMutation({
    onSuccess: (result: { isWin: boolean; bulls: number; cows: number }) => {
      if (result.isWin) {
        setGamePhase("finished");
      }
      setGuess(["", "", "", ""]);
      void refetch();
    },
  });

  // Subscribe to game updates
  api.game.subscribeToGameUpdates.useSubscription(
    { roomId: gameState?.game.roomId ?? "" },
    {
      enabled: !!gameState?.game.roomId,
             onData: (event: unknown) => {
         if (event && typeof event === "object") {
           void refetch();
         }
       },
    }
  );

  // Update game phase based on game state
  useEffect(() => {
    if (gameState?.game) {
      if (gameState.game.status === "finished") {
        setGamePhase("finished");
      } else if (gameState.game.status === "playing") {
        setGamePhase("playing");
      } else if (gameState.game.status === "code_selection") {
        setGamePhase("code_selection");
      }
    }
  }, [gameState]);

  const handleSetCode = () => {
    if (selectedCode.every(emoji => emoji !== "")) {
      const code = emojisToCode(selectedCode);
      setPlayerCode.mutate({ gameId, code });
    }
  };

  const handleMakeGuess = () => {
    if (guess.every(emoji => emoji !== "")) {
      const guessCode = emojisToCode(guess);
      makeGuess.mutate({ gameId, guess: guessCode });
    }
  };

  const hasPlayerSetCode = () => {
    if (!gameState) return false;
    return gameState.isPlayer1 ? !!gameState.game.player1Code : !!gameState.game.player2Code;
  };

  const canMakeGuess = () => {
    if (gamePhase !== "playing") return false;
    if (!gameState) return false;
    
    // Check if player has already made a guess this round
    const currentRound = gameState.game.currentRound;
    const playerMoves = gameState.moves.filter((move: { playerId: string }) => move.playerId === (gameState.isPlayer1 ? gameState.game.player1Id : gameState.game.player2Id));
    const currentRoundMove = playerMoves.find((move: { round: number }) => move.round === currentRound);
    
    return !currentRoundMove;
  };

  if (isLoading) {
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

  if (error || !gameState) {
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

  if (gamePhase === "finished") {
    const isWinner = gameState.game.winnerId === (gameState.isPlayer1 ? gameState.game.player1Id : gameState.game.player2Id);
    
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
                  <Trophy className="h-5 w-5" />
                  Game Over
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
                    {isWinner ? "You Won! 🎉" : "You Lost 😔"}
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    {isWinner ? "You cracked your opponent's code first!" : "Your opponent cracked your code first!"}
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

          {gamePhase === "code_selection" && (
            <div className="w-full max-w-md">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
                    <Target className="h-5 w-5" />
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

          {gamePhase === "playing" && (
            <div className="w-full max-w-6xl">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Game boards */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-center">Game History</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <GameBoard
                      moves={gameState.moves}
                      playerId={gameState.game.player1Id}
                      playerName="Player 1"
                      isCurrentPlayer={gameState.isPlayer1}
                    />
                    <GameBoard
                      moves={gameState.moves}
                      playerId={gameState.game.player2Id}
                      playerName="Player 2"
                      isCurrentPlayer={gameState.isPlayer2}
                    />
                  </div>
                </div>

                {/* Guess input */}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}