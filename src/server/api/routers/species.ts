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
  netOc,
} from "drizzle/schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { z } from "zod";
import { bandsRouter } from "./bands";
import { nodeHTTPRequestHandler } from "@trpc/server/dist/adapters/node-http";
import { groupBy } from "lodash";

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
  getSpeciesCountByMonthNH: publicProcedure
    .input(
      z.object({
        speciesId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const nh = await db
        .select({
          month: sql`extract(month from ${effort.dateEffort})`,
          year: sql`extract(year from ${effort.dateEffort})`,
          netHours: sql<number>`SUM(age(${netOc.closeTime},${netOc.openTime}))`,
        })
        .from(netOc)
        .leftJoin(netEffort, eq(netOc.netEffId, netEffort.netEffId))
        .leftJoin(effort, eq(netEffort.effortId, effort.effortId))
        .groupBy(
          sql`extract(month from ${effort.dateEffort})`,
          effort.dateEffort
        )
        .orderBy(sql`extract(month from ${effort.dateEffort})`)
        .where(eq(effort.stationId, 2));

      const transformedNH = nh.map((item) => {
        //@ts-expect-error
        const hours = item.netHours.split(":");
        const totalHours =
          parseInt(hours[0]) +
          parseInt(hours[1]) / 60 +
          parseInt(hours[2]) / 3600;
        return { ...item, netHours: totalHours };
      });

      const summedNH = transformedNH.reduce((acc, curr) => {
        //@ts-expect-error
        if (!acc[curr.month]) {
          //@ts-expect-error
          acc[curr.month] = 0;
        }
        //@ts-expect-error
        acc[curr.month] += curr.netHours;
        return acc;
      }, {} as Record<string, number>);

      const speciesCount = await db
        .select({
          month: sql`extract(month from ${effort.dateEffort})`,

          total: sql<number>`count(${capture.captureId})`,
        })
        .from(capture)
        .leftJoin(netEffort, eq(capture.netEffId, netEffort.netEffId))
        .leftJoin(effort, eq(netEffort.effortId, effort.effortId))
        //@ts-expect-error
        .where(and(eq(capture.sppId, input.speciesId), eq(effort.stationId, 2)))
        .groupBy(sql`extract(month from ${effort.dateEffort})`)
        .orderBy(sql`extract(month from ${effort.dateEffort})`);

      const countByNH = speciesCount.map((item) => {
        //@ts-expect-error
        const nh = summedNH[item.month];
        return {
          ...item,
          netHours: nh,
          capturePerHour: (1000 * item.total) / nh,
        };
      });

      return countByNH;
    }),
});
