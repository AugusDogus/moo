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
      router.push(`/game/room/${data.code}`);
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
        <div className="text-center text-sm text-muted-foreground">
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
          <div className="text-sm text-destructive text-center">
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
    onSuccess: (data) => {
      router.push(`/game/play/${data.gameId}`);
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
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
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
        <div className="text-center text-sm text-muted-foreground">
          Enter a 4-letter room code to join an existing game
        </div>
        
        <div className="space-y-2">
          <Input
            placeholder="ABCD"
            value={roomCode}
            onChange={handleInputChange}
            maxLength={4}
            className="text-center text-lg font-mono tracking-widest"
            disabled={isJoining || joinRoom.isPending}
          />
        </div>
        
        <Button
          onClick={handleJoinRoom}
          disabled={roomCode.length !== 4 || isJoining || joinRoom.isPending}
          className="w-full"
          size="lg"
        >
          {isJoining || joinRoom.isPending ? "Joining..." : "Join Room"}
        </Button>
        
        {joinRoom.error && (
          <div className="text-sm text-destructive text-center">
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

export function RoomInfo({ code, status, createdBy, currentUserId, playerCount }: RoomInfoProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
          Room {code}
          <Badge variant={status === "waiting" ? "secondary" : "default"}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            {createdBy === currentUserId ? "You created this room" : "Created by host"}
          </div>
          <div className="text-lg font-semibold">
            {playerCount}/2 players
          </div>
        </div>
        
        {status === "waiting" && (
          <div className="text-center text-sm text-muted-foreground">
            {playerCount === 1 ? "Waiting for another player..." : "Ready to start!"}
          </div>
        )}
        
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-2">
            Share this code with a friend:
          </div>
          <div className="inline-block bg-muted px-4 py-2 rounded font-mono text-lg tracking-widest">
            {code}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}