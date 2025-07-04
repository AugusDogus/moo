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
  playerName: string;
  isCurrentPlayer?: boolean;
  maxRounds?: number;
}

export function GameBoard({ 
  moves, 
  playerId, 
  playerName, 
  isCurrentPlayer = false,
  maxRounds = 10 
}: GameBoardProps) {
  // Filter moves for this player
  const playerMoves = moves.filter(move => move.playerId === playerId);
  
  // Sort by round
  const sortedMoves = playerMoves.sort((a, b) => a.round - b.round);

  // Create rows for display (fill empty rounds)
  const rows = [];
  for (let round = 1; round <= maxRounds; round++) {
    const move = sortedMoves.find(m => m.round === round);
    rows.push({
      round,
      move: move ?? null,
    });
  }

  return (
    <Card className={`w-full max-w-md ${isCurrentPlayer ? 'border-primary' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
          {playerName}
          {isCurrentPlayer && (
            <Badge variant="default" className="text-xs">
              You
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rows.map(({ round, move }) => (
            <div
              key={round}
              className={`flex items-center justify-between p-2 rounded border ${
                move ? 'bg-accent/50' : 'bg-muted/30'
              }`}
            >
              {/* Round number */}
              <div className="text-xs text-muted-foreground w-6">
                {round}
              </div>
              
              {/* Guess */}
              <div className="flex gap-1">
                {move ? (
                  codeToEmojis(move.guess).map((emoji, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 flex items-center justify-center text-lg bg-background border rounded"
                    >
                      {emoji}
                    </div>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 flex items-center justify-center text-lg bg-background border rounded opacity-50"
                    >
                      ?
                    </div>
                  ))
                )}
              </div>
              
              {/* Bulls and Cows */}
              <div className="flex gap-1">
                {move ? (
                  <>
                    <Badge variant="destructive" className="text-xs px-1">
                      🐂 {move.bulls}
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-1">
                      🐄 {move.cows}
                    </Badge>
                  </>
                ) : (
                  <div className="w-16 h-6 bg-muted rounded opacity-50"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}