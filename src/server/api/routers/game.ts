import { z } from "zod";
import { eq, and, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { gameRooms, games, gameMoves } from "~/server/db/schema";
import { generateRoomCode, calculateBullsAndCows, isWinningGuess, isValidCode } from "~/lib/game-utils";
import { markRoomAsActive, markRoomAsEmpty, startRoomCleanupService, cleanupEmptyRooms } from "~/server/room-cleanup";

// Global type declaration
declare global {
  var roomCleanupStarted: boolean | undefined;
}

// Event emitter for real-time game updates
const gameEvents = new EventEmitter();

// Start the room cleanup service only once
if (process.env.NODE_ENV === "production" || !globalThis.roomCleanupStarted) {
  startRoomCleanupService();
  globalThis.roomCleanupStarted = true;
}

// Types for game events
interface GameUpdateEvent {
  roomId: string;
  gameId?: string;
  type: "room_updated" | "game_started" | "move_made" | "game_finished";
  data: Record<string, unknown>;
}

export const gameRouter = createTRPCRouter({
  // Create a new game room
  createRoom: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.authSession.user.id;
      
      // Generate unique room code
      let roomCode = generateRoomCode();
      let attempts = 0;
      
      while (attempts < 10) {
        const existingRoom = await ctx.db.query.gameRooms.findFirst({
          where: eq(gameRooms.code, roomCode),
        });
        
        if (!existingRoom) break;
        
        roomCode = generateRoomCode();
        attempts++;
      }
      
      if (attempts >= 10) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate unique room code",
        });
      }
      
      // Create the room
      const roomId = crypto.randomUUID();
      await ctx.db.insert(gameRooms).values({
        id: roomId,
        code: roomCode,
        createdBy: userId,
        status: "waiting",
        emptyAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set to future date so it won't be cleaned up immediately
      });
      
      // Emit room created event
      gameEvents.emit("game_update", {
        roomId,
        type: "room_updated",
        data: { status: "waiting", code: roomCode },
      } as GameUpdateEvent);
      
      return { roomId, code: roomCode };
    }),

  // Join a game room (or return to your own room)
  joinRoom: protectedProcedure
    .input(z.object({
      code: z.string().length(4),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.authSession.user.id;
      
      // Find the room
      const room = await ctx.db.query.gameRooms.findFirst({
        where: eq(gameRooms.code, input.code.toUpperCase()),
      });
      
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }
      
      // If user is the room creator, just return them to their room
      if (room.createdBy === userId) {
        // Mark room as active since creator is returning
        await markRoomAsActive(room.id);
        
        // Check if there's already a game in this room
        const existingGame = await ctx.db.query.games.findFirst({
          where: eq(games.roomId, room.id),
        });
        
        if (existingGame) {
          return { gameId: existingGame.id, roomId: room.id, isCreator: true };
        } else {
          return { gameId: null, roomId: room.id, isCreator: true };
        }
      }
      
      // For non-creators, proceed with normal join logic
      if (room.status !== "waiting") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Room is not accepting new players",
        });
      }
      
      // Check if there's already a game in this room
      const existingGame = await ctx.db.query.games.findFirst({
        where: eq(games.roomId, room.id),
      });
      
      if (existingGame) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Room already has a game in progress",
        });
      }
      
      // Create the game
      const gameId = crypto.randomUUID();
      await ctx.db.insert(games).values({
        id: gameId,
        roomId: room.id,
        player1Id: room.createdBy,
        player2Id: userId,
        status: "code_selection",
      });
      
      // Update room status and mark as active (2 players now)
      await ctx.db.update(gameRooms)
        .set({ status: "playing" })
        .where(eq(gameRooms.id, room.id));
      
      await markRoomAsActive(room.id);
      
      // Emit game started event
      gameEvents.emit("game_update", {
        roomId: room.id,
        gameId,
        type: "game_started",
        data: { player1Id: room.createdBy, player2Id: userId },
      } as GameUpdateEvent);
      
      return { gameId, roomId: room.id, isCreator: false };
    }),

  // Get game state by room code
  getGameStateByCode: protectedProcedure
    .input(z.object({
      code: z.string().length(4),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.authSession.user.id;
      
      // Find the room
      const room = await ctx.db.query.gameRooms.findFirst({
        where: eq(gameRooms.code, input.code.toUpperCase()),
      });
      
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }
      
      // Find the game in this room
      const game = await ctx.db.query.games.findFirst({
        where: eq(games.roomId, room.id),
      });
      
      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No game found in this room",
        });
      }
      
      // Check if user is a player in this game
      if (game.player1Id !== userId && game.player2Id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a player in this game",
        });
      }
      
      // Get game moves
      const moves = await ctx.db.query.gameMoves.findMany({
        where: eq(gameMoves.gameId, game.id),
        orderBy: (gameMoves, { asc }) => [asc(gameMoves.round), asc(gameMoves.createdAt)],
      });
      
      return {
        game,
        moves,
        isPlayer1: game.player1Id === userId,
        isPlayer2: game.player2Id === userId,
      };
    }),

  // Get game state (legacy endpoint for backward compatibility)
  getGameState: protectedProcedure
    .input(z.object({
      gameId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.authSession.user.id;
      
      const game = await ctx.db.query.games.findFirst({
        where: eq(games.id, input.gameId),
      });
      
      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }
      
      // Check if user is a player in this game
      if (game.player1Id !== userId && game.player2Id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a player in this game",
        });
      }
      
      // Get game moves
      const moves = await ctx.db.query.gameMoves.findMany({
        where: eq(gameMoves.gameId, input.gameId),
        orderBy: (gameMoves, { asc }) => [asc(gameMoves.round), asc(gameMoves.createdAt)],
      });
      
      return {
        game,
        moves,
        isPlayer1: game.player1Id === userId,
        isPlayer2: game.player2Id === userId,
      };
    }),

  // Set player's secret code by room code
  setPlayerCodeByCode: protectedProcedure
    .input(z.object({
      roomCode: z.string().length(4),
      code: z.string().length(4),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.authSession.user.id;
      
      if (!isValidCode(input.code)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid code format",
        });
      }
      
      // Find the room
      const room = await ctx.db.query.gameRooms.findFirst({
        where: eq(gameRooms.code, input.roomCode.toUpperCase()),
      });
      
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }
      
      // Find the game in this room
      const game = await ctx.db.query.games.findFirst({
        where: eq(games.roomId, room.id),
      });
      
      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No game found in this room",
        });
      }
      
      if (game.status !== "code_selection") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game is not in code selection phase",
        });
      }
      
      // Update the appropriate player's code
      if (game.player1Id === userId) {
        await ctx.db.update(games)
          .set({ player1Code: input.code })
          .where(eq(games.id, game.id));
      } else if (game.player2Id === userId) {
        await ctx.db.update(games)
          .set({ player2Code: input.code })
          .where(eq(games.id, game.id));
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a player in this game",
        });
      }
      
      // Check if both players have set their codes
      const updatedGame = await ctx.db.query.games.findFirst({
        where: eq(games.id, game.id),
      });
      
             if (updatedGame?.player1Code && updatedGame.player2Code) {
        // Both players have set codes, start the game
        await ctx.db.update(games)
          .set({ status: "playing" })
          .where(eq(games.id, game.id));
        
        // Emit game update
        gameEvents.emit("game_update", {
          roomId: game.roomId,
          gameId: game.id,
          type: "game_started",
          data: { status: "playing" },
        } as GameUpdateEvent);
      }
      
      return { success: true };
    }),

  // Set player's secret code (legacy endpoint for backward compatibility)
  setPlayerCode: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      code: z.string().length(4),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.authSession.user.id;
      
      if (!isValidCode(input.code)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid code format",
        });
      }
      
      const game = await ctx.db.query.games.findFirst({
        where: eq(games.id, input.gameId),
      });
      
      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }
      
      if (game.status !== "code_selection") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game is not in code selection phase",
        });
      }
      
      // Update the appropriate player's code
      if (game.player1Id === userId) {
        await ctx.db.update(games)
          .set({ player1Code: input.code })
          .where(eq(games.id, input.gameId));
      } else if (game.player2Id === userId) {
        await ctx.db.update(games)
          .set({ player2Code: input.code })
          .where(eq(games.id, input.gameId));
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a player in this game",
        });
      }
      
      // Check if both players have set their codes
      const updatedGame = await ctx.db.query.games.findFirst({
        where: eq(games.id, input.gameId),
      });
      
             if (updatedGame?.player1Code && updatedGame.player2Code) {
        // Both players have set codes, start the game
        await ctx.db.update(games)
          .set({ status: "playing" })
          .where(eq(games.id, input.gameId));
        
        // Emit game update
        gameEvents.emit("game_update", {
          roomId: game.roomId,
          gameId: input.gameId,
          type: "game_started",
          data: { status: "playing" },
        } as GameUpdateEvent);
      }
      
      return { success: true };
    }),

  // Make a guess by room code
  makeGuessByCode: protectedProcedure
    .input(z.object({
      roomCode: z.string().length(4),
      guess: z.string().length(4),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.authSession.user.id;
      
      if (!isValidCode(input.guess)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid guess format",
        });
      }
      
      // Find the room
      const room = await ctx.db.query.gameRooms.findFirst({
        where: eq(gameRooms.code, input.roomCode.toUpperCase()),
      });
      
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }
      
      // Find the game in this room
      const game = await ctx.db.query.games.findFirst({
        where: eq(games.roomId, room.id),
      });
      
      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No game found in this room",
        });
      }
      
      if (game.status !== "playing") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game is not in playing state",
        });
      }
      
      if (!game.player1Code || !game.player2Code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Players have not set their codes yet",
        });
      }
      
      // Determine which player is guessing and what their target code is
      let targetCode: string;
      if (game.player1Id === userId) {
        targetCode = game.player2Code;
      } else if (game.player2Id === userId) {
        targetCode = game.player1Code;
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a player in this game",
        });
      }
      
      // Check if player has already made a guess this round
      const existingMove = await ctx.db.query.gameMoves.findFirst({
        where: and(
          eq(gameMoves.gameId, game.id),
          eq(gameMoves.playerId, userId),
          eq(gameMoves.round, game.currentRound)
        ),
      });
      
      if (existingMove) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already made a guess this round",
        });
      }
      
      // Calculate bulls and cows
      const { bulls, cows } = calculateBullsAndCows(input.guess, targetCode);
      
      // Save the move
      const moveId = crypto.randomUUID();
      await ctx.db.insert(gameMoves).values({
        id: moveId,
        gameId: game.id,
        playerId: userId,
        round: game.currentRound,
        guess: input.guess,
        bulls,
        cows,
      });
      
      // Check if this is a winning guess
      if (isWinningGuess(bulls)) {
        // Player wins!
        await ctx.db.update(games)
          .set({ 
            winnerId: userId,
            status: "finished"
          })
          .where(eq(games.id, game.id));
        
        // Update room status and mark as empty (game finished)
        await ctx.db.update(gameRooms)
          .set({ status: "finished" })
          .where(eq(gameRooms.id, game.roomId));
        
        await markRoomAsEmpty(game.roomId);
        
        // Emit game finished event
        gameEvents.emit("game_update", {
          roomId: game.roomId,
          gameId: game.id,
          type: "game_finished",
          data: { winnerId: userId, bulls, cows },
        } as GameUpdateEvent);
      } else {
        // Check if both players have made their guesses for this round
        const roundMoves = await ctx.db.query.gameMoves.findMany({
          where: and(
            eq(gameMoves.gameId, game.id),
            eq(gameMoves.round, game.currentRound)
          ),
        });
        
        if (roundMoves.length >= 2) {
          // Both players have guessed, increment round
          await ctx.db.update(games)
            .set({ currentRound: game.currentRound + 1 })
            .where(eq(games.id, game.id));
        }
        
        // Emit move made event
        gameEvents.emit("game_update", {
          roomId: game.roomId,
          gameId: game.id,
          type: "move_made",
          data: { playerId: userId, round: game.currentRound, bulls, cows },
        } as GameUpdateEvent);
      }
      
      return { bulls, cows, isWin: isWinningGuess(bulls) };
    }),

  // Make a guess (legacy endpoint for backward compatibility)
  makeGuess: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      guess: z.string().length(4),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.authSession.user.id;
      
      if (!isValidCode(input.guess)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid guess format",
        });
      }
      
      const game = await ctx.db.query.games.findFirst({
        where: eq(games.id, input.gameId),
      });
      
      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }
      
      if (game.status !== "playing") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game is not in playing state",
        });
      }
      
      if (!game.player1Code || !game.player2Code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Players have not set their codes yet",
        });
      }
      
      // Determine which player is guessing and what their target code is
      let targetCode: string;
      if (game.player1Id === userId) {
        targetCode = game.player2Code;
      } else if (game.player2Id === userId) {
        targetCode = game.player1Code;
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a player in this game",
        });
      }
      
      // Check if player has already made a guess this round
      const existingMove = await ctx.db.query.gameMoves.findFirst({
        where: and(
          eq(gameMoves.gameId, input.gameId),
          eq(gameMoves.playerId, userId),
          eq(gameMoves.round, game.currentRound)
        ),
      });
      
      if (existingMove) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already made a guess this round",
        });
      }
      
      // Calculate bulls and cows
      const { bulls, cows } = calculateBullsAndCows(input.guess, targetCode);
      
      // Save the move
      const moveId = crypto.randomUUID();
      await ctx.db.insert(gameMoves).values({
        id: moveId,
        gameId: input.gameId,
        playerId: userId,
        round: game.currentRound,
        guess: input.guess,
        bulls,
        cows,
      });
      
      // Check if this is a winning guess
      if (isWinningGuess(bulls)) {
        // Player wins!
        await ctx.db.update(games)
          .set({ 
            winnerId: userId,
            status: "finished"
          })
          .where(eq(games.id, input.gameId));
        
        // Update room status and mark as empty (game finished)
        await ctx.db.update(gameRooms)
          .set({ status: "finished" })
          .where(eq(gameRooms.id, game.roomId));
        
        await markRoomAsEmpty(game.roomId);
        
        // Emit game finished event
        gameEvents.emit("game_update", {
          roomId: game.roomId,
          gameId: input.gameId,
          type: "game_finished",
          data: { winnerId: userId, bulls, cows },
        } as GameUpdateEvent);
      } else {
        // Check if both players have made their guesses for this round
        const roundMoves = await ctx.db.query.gameMoves.findMany({
          where: and(
            eq(gameMoves.gameId, input.gameId),
            eq(gameMoves.round, game.currentRound)
          ),
        });
        
        if (roundMoves.length >= 2) {
          // Both players have guessed, increment round
          await ctx.db.update(games)
            .set({ currentRound: game.currentRound + 1 })
            .where(eq(games.id, input.gameId));
        }
        
        // Emit move made event
        gameEvents.emit("game_update", {
          roomId: game.roomId,
          gameId: input.gameId,
          type: "move_made",
          data: { playerId: userId, round: game.currentRound, bulls, cows },
        } as GameUpdateEvent);
      }
      
      return { bulls, cows, isWin: isWinningGuess(bulls) };
    }),

  // Subscribe to game updates
  subscribeToGameUpdates: protectedProcedure
    .input(z.object({
      roomId: z.string(),
    }))
    .subscription(({ input }) => {
      return observable<GameUpdateEvent>((emit) => {
        const handleGameUpdate = (event: GameUpdateEvent) => {
          if (event.roomId === input.roomId) {
            emit.next(event);
          }
        };
        
        gameEvents.on("game_update", handleGameUpdate);
        
        return () => {
          gameEvents.off("game_update", handleGameUpdate);
        };
      });
    }),

  // Get room info (public so unauthenticated users can see room details)
  getRoomInfo: publicProcedure
    .input(z.object({
      code: z.string().length(4),
    }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.query.gameRooms.findFirst({
        where: eq(gameRooms.code, input.code.toUpperCase()),
      });
      
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }
      
      return room;
    }),

  // Get user's active games
  getMyGames: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.authSession.user.id;
      
      const myGames = await ctx.db.query.games.findMany({
        where: or(
          eq(games.player1Id, userId),
          eq(games.player2Id, userId)
        ),
        orderBy: (games, { desc }) => [desc(games.updatedAt)],
      });
      
      return myGames;
    }),

  // Get user's role in a room (creator, player, or visitor)
  getUserRoomRole: protectedProcedure
    .input(z.object({
      code: z.string().length(4),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.authSession.user.id;
      
      const room = await ctx.db.query.gameRooms.findFirst({
        where: eq(gameRooms.code, input.code.toUpperCase()),
      });
      
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }
      
      // Check if user is the room creator
      if (room.createdBy === userId) {
        // Check if there's an active game
        const game = await ctx.db.query.games.findFirst({
          where: eq(games.roomId, room.id),
        });
        
        return {
          role: "creator" as const,
          roomId: room.id,
          gameId: game?.id,
          gameStatus: game?.status,
        };
      }
      
      // Check if user is a player in any game in this room
      const game = await ctx.db.query.games.findFirst({
        where: and(
          eq(games.roomId, room.id),
          or(
            eq(games.player1Id, userId),
            eq(games.player2Id, userId)
          )
        ),
      });
      
      if (game) {
        return {
          role: "player" as const,
          roomId: room.id,
          gameId: game.id,
          gameStatus: game.status,
        };
      }
      
      return {
        role: "visitor" as const,
        roomId: room.id,
        gameId: null,
        gameStatus: null,
      };
    }),

  // Manual cleanup endpoint (for testing/debugging)
  cleanupRooms: protectedProcedure
    .mutation(async () => {
      const result = await cleanupEmptyRooms();
      return result;
    }),
});