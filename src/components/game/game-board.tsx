"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { codeToEmojis } from "~/lib/game-utils";

interface GameMove {
  id: string;
  gameId: string;
  playerId: string;
  round: number;
  guess: string;
  bulls: number;
  cows: number;
  createdAt: Date;
}

interface GameBoardProps {
  moves: GameMove[];
  playerId: string;
  isCurrentPlayer?: boolean;
  showTitle?: boolean;
}

export function GameBoard({
  moves,
  playerId,
  isCurrentPlayer = false,
  showTitle = true,
}: GameBoardProps) {
  // Filter moves for this player and sort by round
  const playerMoves = moves
    .filter((move) => move.playerId === playerId)
    .sort((a, b) => a.round - b.round);

  if (playerMoves.length === 0) {
    return (
      <Card className={`w-full ${isCurrentPlayer ? "border-primary" : ""}`}>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">Your Guesses</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-muted-foreground py-8 text-center">
            No guesses yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${isCurrentPlayer ? "border-primary" : ""}`}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg">Your Guesses</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {playerMoves.map((move) => (
            <div
              key={move.id}
              className="bg-accent/30 space-y-3 rounded border p-4"
            >
              {/* Round number and guess */}
              <div className="relative flex items-center gap-4">
                <div className="text-muted-foreground absolute hidden w-fit flex-shrink-0 text-sm font-medium md:block">
                  {move.round}
                </div>

                {/* Guess - same size as input */}
                <div className="flex flex-1 justify-center gap-2">
                  {codeToEmojis(move.guess).map((emoji, index) => (
                    <div
                      key={index}
                      className="bg-background flex h-16 w-16 items-center justify-center rounded-lg border-2 text-2xl font-medium"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulls and Cows - underneath the emoji row */}
              <div className="flex justify-center gap-2">
                <Badge variant="destructive" className="px-3 py-1 text-sm">
                  🐂 {move.bulls}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  🐄 {move.cows}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
