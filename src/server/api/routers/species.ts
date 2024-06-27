import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import db from "@/db";
import {
  sppRegister,
  capture,
  bands,
  bandStringRegister,
  captureCategoricalOptions,
  captureCategoricalValues,
  captureVariableRegister,
  effort,
  netEffort,
  netRegister,
  stationRegister,
} from "drizzle/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { z } from "zod";
import { bandsRouter } from "./bands";

export const speciesRouter = createTRPCRouter({
  getSpeciesSummary: publicProcedure.query(async () => {
    console.log("running");
    const spp = await db
      .select({
        id: sppRegister.sppId,
        name: sppRegister.ptName,
        scientificName: sql`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species})`,
        total: sql<number>`count(${capture.captureId}) `,
      })
      .from(sppRegister)
      .orderBy(sql`count(${capture.captureId}) desc`)
      .rightJoin(capture, eq(sppRegister.sppId, capture.sppId))
      .groupBy(sppRegister.sppId);

    return spp;
  }),

  getSpeciesData: publicProcedure.query(async ({ ctx }) => {
    const speciesData = await db
      .select({
        speciesCode: sppRegister.sciCode,
        speciesName: sql`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species})`,
        speciesId: sppRegister.sppId,
        speciesOrder: sppRegister.order,
        speciesFamily: sppRegister.family,
        speciesCommonName: sppRegister.ptName,
      })
      .from(sppRegister)
      .execute();
    return speciesData;
  }),
  getSpeciesDataById: publicProcedure
    .input(
      z.object({
        speciesId: z.any(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log("aqui", input.speciesId);
      const speciesCap = await db
        .select({
          id: capture.captureId,
          bandNumber: bands.bandNumber,
          speciesName: sql<
            string | null
          >`concat(${sppRegister.genus},' ',${sppRegister.species})`,
          date: effort.dateEffort,
          station: stationRegister.stationCode,
          age: captureCategoricalOptions.valueOama,
          netNumber: netRegister.netNumber,
          bandSize: bandStringRegister.size,
        })
        .from(capture)
        .leftJoin(bands, eq(bands.bandId, capture.bandId))
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
            //@ts-expect-error
            eq(capture.sppId as unknown as string, input.speciesId as string),
            eq(captureVariableRegister.name, "age_wrp")
          )
        )
        .orderBy(desc(effort.dateEffort));
      return speciesCap;
    }),
});
