import { z } from "zod";
import { eq, sql, and } from "drizzle-orm";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import { TRPCError } from "@trpc/server";

import db from "@/db";
import {
  bandStringRegister,
  bands,
  capture,
  effort,
  netEffort,
  sppRegister,
  stationRegister,
} from "drizzle/schema";

export const testRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ bandNumber: z.string() }))
    .query(async ({ input }) => {
      const _bandNumber = input.bandNumber;
      const [bandSize, bandNumber] = _bandNumber.split(/(\d+)/);

      const band_captures = await db
        .select({
          bandNumber: bands.bandNumber,
          speciesName: sql<
            string | null
          >`concat(${sppRegister.genus}," ",${sppRegister.species})`,
          date: effort.dateEffort,
          station: stationRegister.stationCode,
        })
        .from(bands)
        .leftJoin(capture, eq(bands.bandId, capture.bandId))
        .rightJoin(
          bandStringRegister,
          eq(bands.stringId, bandStringRegister.stringId)
        )
        .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId))
        .leftJoin(netEffort, eq(capture.netEffId, netEffort.netEffId))
        .leftJoin(effort, eq(netEffort.effortId, effort.effortId))
        .leftJoin(
          stationRegister,
          eq(effort.stationId, stationRegister.stationId)
        )
        .where(
          and(
            eq(bands.bandNumber, bandNumber as string),
            eq(bandStringRegister.size, bandSize as string)
          )
        );

      if (band_captures.length === 0) {
        const bands_info = await db
          .select()
          .from(bands)
          .leftJoin(
            bandStringRegister,
            eq(bands.stringId, bandStringRegister.stringId)
          )
          .where(
            and(
              eq(bands.bandNumber, bandNumber as string),
              eq(bandStringRegister.size, bandSize as string)
            )
          );
        if (bands_info.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Anilha não encontrada",
          });
        } else {
          return [];
        }
      }

      return {
        band_captures,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
