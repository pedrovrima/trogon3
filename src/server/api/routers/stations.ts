import { eq, sql, desc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import db from "@/db";
import {
  effort,
  effortSummaries,
  netEffort,
  netOc,
  netRegister,
  protocolRegister,
  stationRegister,
} from "drizzle/schema";
import { z } from "zod";

export const stationsRouter = createTRPCRouter({
  getStations: publicProcedure.query(async () => {
    const stations = await db
      .select({
        stationId: sql<number>`${stationRegister.stationId}::integer`,
        stationCode: stationRegister.stationCode,
        stationName: stationRegister.stationName,
        city: stationRegister.city,
        state: stationRegister.state,
        centerLat: stationRegister.centerLat,
        centerLong: stationRegister.centerLong,
        totalEfforts: sql<number>`COUNT(DISTINCT ${effort.effortId})`,
      })
      .from(stationRegister)
      .leftJoin(effort, eq(stationRegister.stationId, effort.stationId))
      .where(eq(stationRegister.hasChanged, false))
      .groupBy(
        stationRegister.stationId,
        stationRegister.stationCode,
        stationRegister.stationName,
        stationRegister.city,
        stationRegister.state,
        stationRegister.centerLat,
        stationRegister.centerLong
      )
      .orderBy(stationRegister.stationName);

    return stations;
  }),

  getStationById: publicProcedure
    .input(z.object({ stationId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const { stationId } = input;

      const stationData = await db
        .select({
          stationId: sql<number>`${stationRegister.stationId}::integer`,
          stationCode: stationRegister.stationCode,
          stationName: stationRegister.stationName,
          city: stationRegister.city,
          state: stationRegister.state,
          centerLat: stationRegister.centerLat,
          centerLong: stationRegister.centerLong,
        })
        .from(stationRegister)
        .where(eq(stationRegister.stationId, BigInt(stationId)));

      if (!stationData[0]) {
        return null;
      }

      const stationNets = await db
        .select({
          netId: sql<number>`${netRegister.netId}::integer`,
          netNumber: netRegister.netNumber,
          netLat: netRegister.netLat,
          netLong: netRegister.netLong,
          meshSize: netRegister.meshSize,
          netLength: netRegister.netLength,
        })
        .from(netRegister)
        .where(eq(netRegister.stationId, stationId))
        .orderBy(sql`${netRegister.netNumber}::integer`);

      const stationEfforts = await db
        .select({
          effortId: effort.effortId,
          date: sql<string>`TO_CHAR(${effort.dateEffort}, 'DD/MM/YYYY')`,
          protocolCode: protocolRegister.protocolCode,
          totalNetHours: sql<number>`ROUND(EXTRACT(EPOCH FROM SUM(age(${netOc.closeTime},${netOc.openTime}))) / 3600.0, 2)`,
          newBands: effortSummaries.newBands,
          recapture: effortSummaries.recapture,
          unbanded: effortSummaries.unbanded,
          notes: effort.notes,
        })
        .from(effort)
        .leftJoin(
          protocolRegister,
          eq(effort.protocolId, protocolRegister.protocolId)
        )
        .leftJoin(netEffort, eq(effort.effortId, netEffort.effortId))
        .leftJoin(netOc, eq(netEffort.netEffId, netOc.netEffId))
        .leftJoin(effortSummaries, eq(effort.effortId, effortSummaries.effortId))
        .where(eq(effort.stationId, Number(stationId)))
        .groupBy(
          effort.effortId,
          protocolRegister.protocolCode,
          effortSummaries.effortSummaryId
        )
        .orderBy(desc(effort.dateEffort));

      return {
        ...stationData[0],
        nets: stationNets,
        efforts: stationEfforts,
      };
    }),

  createStation: publicProcedure
    .input(
      z.object({
        stationCode: z.string().min(1).max(6),
        stationName: z.string().min(1).max(45),
        city: z.string().min(1).max(45),
        state: z.string().min(1).max(45),
        centerLat: z.string(),
        centerLong: z.string(),
        nets: z.array(
          z.object({
            netNumber: z.string().min(1),
            netLat: z.string(),
            netLong: z.string(),
            meshSize: z.string().optional(),
            netLength: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { nets, ...stationData } = input;

      const [newStation] = await db
        .insert(stationRegister)
        .values({
          ...stationData,
          hasChanged: false,
          createdAt: new Date().toISOString(),
        })
        .returning({ stationId: stationRegister.stationId });

      if (nets.length > 0 && newStation) {
        const netsToInsert = nets.map((net) => ({
          netNumber: net.netNumber,
          netLat: net.netLat,
          netLong: net.netLong,
          meshSize: net.meshSize,
          netLength: net.netLength,
          stationId: Number(newStation.stationId),
          hasChanged: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        await db.insert(netRegister).values(netsToInsert);
      }

      return { stationId: newStation?.stationId };
    }),
});
