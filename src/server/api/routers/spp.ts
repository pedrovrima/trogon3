import { z } from "zod";
import { eq, sql, and, inArray } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import db from "@/db";
import { capture, sppRegister } from "drizzle/schema";
import { TRPCError } from "@trpc/server";

export const sppRouter = createTRPCRouter({
  getSppSummary: publicProcedure.query(async () => {
    const spp = await db
      .select({
        id: sppRegister.sppId,
        name: sppRegister.ptName,
        total: sql<number>`count(${capture.captureId}) `,
      })
      .from(sppRegister)
      .orderBy(sql`count(${capture.captureId}) desc`)
      .rightJoin(capture, eq(sppRegister.sppId, capture.sppId))
      .groupBy(sppRegister.sppId);

    return spp;
  }),
});
