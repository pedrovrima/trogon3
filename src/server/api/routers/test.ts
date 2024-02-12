import { z } from "zod";
import { eq, sql, and, desc } from "drizzle-orm";

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
  captureCategoricalOptions,
  captureCategoricalValues,
  captureVariableRegister,
  effort,
  netEffort,
  netRegister,
  sppRegister,
  stationRegister,
} from "drizzle/schema";

export const testRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ bandNumber: z.string() }))
    .query(async ({ input }) => {
      console.log(input);
      const _bandNumber = input.bandNumber;
      const { bandSize, bandNumber } = splitBand(_bandNumber);

      const band_captures = await db
        .select({
          bandNumber: bands.bandNumber,
          speciesName: sql<
            string | null
          >`concat(${sppRegister.genus}," ",${sppRegister.species})`,
          date: effort.dateEffort,
          station: stationRegister.stationCode,
          age: captureCategoricalOptions.valueOama,
          netNumber: netRegister.netNumber,
        })
        .from(bands)
        .leftJoin(capture, eq(bands.bandId, capture.bandId))
        .rightJoin(
          bandStringRegister,
          eq(bands.stringId, bandStringRegister.stringId)
        )
        .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId))
        .leftJoin(netEffort, eq(capture.netEffId, netEffort.netEffId))
        .leftJoin(netRegister, eq(netEffort.netId, netRegister.netId))
        .leftJoin(effort, eq(netEffort.effortId, effort.effortId))
        .leftJoin(
          stationRegister,
          eq(effort.stationId, stationRegister.stationId)
        )
        .leftJoin(
          captureCategoricalValues,
          eq(capture.captureId, captureCategoricalValues.captureId)
        )
        .leftJoin(
          captureCategoricalOptions,
          eq(
            captureCategoricalValues.captureCategoricalOptionId,
            captureCategoricalOptions.captureCategoricalOptionId
          )
        )
        .leftJoin(
          captureVariableRegister,
          eq(
            captureCategoricalOptions.captureVariableId,
            captureVariableRegister.captureVariableId
          )
        )
        .where(
          and(
            eq(bands.bandNumber, bandNumber as string),
            eq(bandStringRegister.size, bandSize as string),
            eq(captureVariableRegister.name, "age_wrp")
          )
        )
        .orderBy(desc(effort.dateEffort));

      console.log(band_captures[0]);
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

interface SplitResult {
  bandSize: string | undefined;
  bandNumber: string | undefined;
}

function splitBand(input: string): SplitResult {
  const regex = /^([0-9]*[a-zA-Z])([0-9]+)$/;
  const match = input.match(regex);

  if (match) {
    return {
      bandSize: match[1],
      bandNumber: match[2],
    };
  } else {
    return {
      bandSize: undefined,
      bandNumber: undefined,
    };
  }
}
