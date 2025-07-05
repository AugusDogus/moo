import { and, eq, lt } from "drizzle-orm";
import { db } from "~/server/db";
import { gameRooms, games } from "~/server/db/schema";

// Clean up empty rooms that have been empty for more than 5 minutes
export async function cleanupEmptyRooms() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  try {
    // Find rooms that have been empty for more than 5 minutes
    const emptyRooms = await db.query.gameRooms.findMany({
      where: and(
        eq(gameRooms.status, "waiting"),
        lt(gameRooms.emptyAt, fiveMinutesAgo),
      ),
    });

    if (emptyRooms.length === 0) {
      return { cleaned: 0 };
    }

    console.log(`Found ${emptyRooms.length} empty rooms to clean up`);

    // Delete the empty rooms
    let actuallyDeleted = 0;
    for (const room of emptyRooms) {
      // Double-check there are no active games in this room before deletion
      const activeGame = await db.query.games.findFirst({
        where: and(eq(games.roomId, room.id), eq(games.status, "playing")),
      });

      if (!activeGame) {
        await db.delete(gameRooms).where(eq(gameRooms.id, room.id));
        console.log(`Cleaned up empty room: ${room.code}`);
        actuallyDeleted++;
      } else {
        console.log(`Skipping room ${room.code} - has active game`);
      }
    }

    return { cleaned: actuallyDeleted };
  } catch (error) {
    console.error("Error during room cleanup:", error);
    return { cleaned: 0, error };
  }
}

// Update room's emptyAt timestamp when it becomes empty
export async function markRoomAsEmpty(roomId: string) {
  try {
    await db
      .update(gameRooms)
      .set({
        emptyAt: new Date(),
        status: "waiting",
      })
      .where(eq(gameRooms.id, roomId));

    console.log(`Marked room ${roomId} as empty`);
  } catch (error) {
    console.error("Error marking room as empty:", error);
  }
}

// Reset room's emptyAt timestamp when someone joins
export async function markRoomAsActive(roomId: string) {
  try {
    await db
      .update(gameRooms)
      .set({
        emptyAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Set to future date so it won't be cleaned up
      })
      .where(eq(gameRooms.id, roomId));

    console.log(`Marked room ${roomId} as active`);
  } catch (error) {
    console.error("Error marking room as active:", error);
  }
}

// Start the periodic cleanup job
let cleanupInterval: NodeJS.Timeout | null = null;

export function startRoomCleanupService() {
  if (cleanupInterval) {
    console.log("Room cleanup service already running");
    return;
  }

  console.log("Starting room cleanup service - checking every 2 minutes");

  // Run cleanup every 2 minutes
  cleanupInterval = setInterval(
    () => {
      console.log("Running room cleanup check...");
      cleanupEmptyRooms()
        .then((result) => {
          if (result.cleaned > 0) {
            console.log(`Cleaned up ${result.cleaned} empty rooms`);
          }
        })
        .catch(console.error);
    },
    2 * 60 * 1000,
  ); // Check every 2 minutes

  // Also run an initial cleanup
  cleanupEmptyRooms().catch(console.error);
}

export function stopRoomCleanupService() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log("Stopped room cleanup service");
  }
}
