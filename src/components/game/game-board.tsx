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
  showTitle = true
}: GameBoardProps) {
  // Filter moves for this player and sort by round
  const playerMoves = moves
    .filter(move => move.playerId === playerId)
    .sort((a, b) => a.round - b.round);

  if (playerMoves.length === 0) {
    return (
      <Card className={`w-full ${isCurrentPlayer ? 'border-primary' : ''}`}>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">
              Your Guesses
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No guesses yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${isCurrentPlayer ? 'border-primary' : ''}`}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg">
            Your Guesses
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {playerMoves.map((move) => (
            <div
              key={move.id}
              className="flex items-center justify-between p-4 rounded border bg-accent/30"
            >
              {/* Round number */}
              <div className="text-sm font-medium text-muted-foreground w-12 flex-shrink-0">
                {move.round}
              </div>
              
              {/* Guess - same size as input */}
              <div className="flex gap-2 flex-1 justify-center">
                {codeToEmojis(move.guess).map((emoji, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 flex items-center justify-center text-2xl bg-background border-2 rounded-lg font-medium"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              
              {/* Bulls and Cows */}
              <div className="flex gap-2 flex-shrink-0">
                <Badge variant="destructive" className="text-sm px-3 py-1">
                  🐂 {move.bulls}
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
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