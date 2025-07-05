"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export function CreateRoomCard() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createRoom = api.game.createRoom.useMutation({
    onSuccess: (data) => {
      router.push(`/game/${data.code}`);
    },
    onError: (error: unknown) => {
      console.error("Failed to create room:", error);
      setIsCreating(false);
    },
  });

  const handleCreateRoom = async () => {
    setIsCreating(true);
    createRoom.mutate();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-lg">Create New Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground text-center text-sm">
          Create a new game room and share the code with a friend
        </div>

        <Button
          onClick={handleCreateRoom}
          disabled={isCreating || createRoom.isPending}
          className="w-full"
          size="lg"
        >
          {isCreating || createRoom.isPending ? "Creating..." : "Create Room"}
        </Button>

        {createRoom.error && (
          <div className="text-destructive text-center text-sm">
            {createRoom.error.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function JoinRoomCard() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const joinRoom = api.game.joinRoom.useMutation({
    onSuccess: () => {
      // Always go to the main game page, let it handle the state
      router.push(`/game/${roomCode}`);
    },
    onError: (error: unknown) => {
      console.error("Failed to join room:", error);
      setIsJoining(false);
    },
  });

  const handleJoinRoom = async () => {
    if (roomCode.length !== 4) return;

    setIsJoining(true);
    joinRoom.mutate({ code: roomCode });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (value.length <= 4) {
      setRoomCode(value);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-lg">Join Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground text-center text-sm">
          Enter a 4-letter room code to join or return to a game
        </div>

        <div className="space-y-2">
          <Input
            placeholder="ABCD"
            value={roomCode}
            onChange={handleInputChange}
            maxLength={4}
            className="text-center font-mono text-lg tracking-widest"
            disabled={isJoining || joinRoom.isPending}
          />
        </div>

        <Button
          onClick={handleJoinRoom}
          disabled={roomCode.length !== 4 || isJoining || joinRoom.isPending}
          className="w-full"
          size="lg"
        >
          {isJoining || joinRoom.isPending ? "Joining..." : "Enter Room"}
        </Button>

        {joinRoom.error && (
          <div className="text-destructive text-center text-sm">
            {joinRoom.error.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RoomInfoProps {
  code: string;
  status: string;
  createdBy: string;
  currentUserId: string;
  playerCount: number;
}

export function RoomInfo({
  code,
  status,
  createdBy,
  currentUserId,
  playerCount,
}: RoomInfoProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-center text-lg">
          Room {code}
          <Badge variant={status === "waiting" ? "secondary" : "default"}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-muted-foreground text-sm">
            {createdBy === currentUserId
              ? "You created this room"
              : "Created by host"}
          </div>
          <div className="text-lg font-semibold">{playerCount}/2 players</div>
        </div>

        {status === "waiting" && (
          <div className="text-muted-foreground text-center text-sm">
            {playerCount === 1
              ? "Waiting for another player..."
              : "Ready to start!"}
          </div>
        )}

        <div className="text-center">
          <div className="text-muted-foreground mb-2 text-xs">
            Share this code with a friend:
          </div>
          <div className="bg-muted inline-block rounded px-4 py-2 font-mono text-lg tracking-widest">
            {code}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
