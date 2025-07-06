import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  getTourStatus: protectedProcedure.query(async ({ ctx }) => {
    const userRecord = await ctx.db
      .select({
        tourStatus: user.tourStatus,
      })
      .from(user)
      .where(eq(user.id, ctx.authSession.user.id))
      .limit(1);

    return userRecord[0]?.tourStatus ?? "not_started";
  }),

  updateTourStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(["not_started", "completed", "skipped", "remind_later"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({
          tourStatus: input.status,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.authSession.user.id));

      return { success: true };
    }),
});