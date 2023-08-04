import { z } from "zod";
import { eq, sql, and, inArray } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import db from "@/db";
import { capture, sppRegister } from "drizzle/schema";

export const sppRouter = createTRPCRouter({
  getSppOptions: publicProcedure.query(async () => {
    const spp = await db
      .select({
        id: sppRegister.sppId,
        ptName: sppRegister.ptName,
        sciName: sql`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species})`,
        code: sppRegister.sciCode,
      })
      .from(sppRegister);

    return spp;
  }),

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
