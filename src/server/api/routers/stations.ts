import { eq, sql, desc, and, inArray } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import db from "@/db";
import {
  changeLog,
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
        .orderBy(
          sql<number>`CASE WHEN ${netRegister.netNumber} ~ '^[0-9]+$' THEN 0 ELSE 1 END`,
          sql<number>`CASE WHEN ${netRegister.netNumber} ~ '^[0-9]+$' THEN ${netRegister.netNumber}::integer END`,
          netRegister.netNumber
        );

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

      const normalizeDecimal = (value: string) =>
        value.trim().replace(/,/g, ".");
      const normalizeOptionalDecimal = (value?: string) => {
        const trimmed = value?.trim();
        if (!trimmed) {
          return null;
        }
        return normalizeDecimal(trimmed);
      };

      return db.transaction(async (tx) => {
        const now = new Date().toISOString();
        const [newStation] = await tx
          .insert(stationRegister)
          .values({
            ...stationData,
            centerLat: normalizeDecimal(stationData.centerLat),
            centerLong: normalizeDecimal(stationData.centerLong),
            hasChanged: false,
            createdAt: now,
          })
          .returning({ stationId: stationRegister.stationId });

        if (!newStation) {
          return { stationId: null };
        }

        if (nets.length > 0) {
          const netsToInsert = nets.map((net) => ({
            netNumber: net.netNumber.trim(),
            netLat: normalizeDecimal(net.netLat),
            netLong: normalizeDecimal(net.netLong),
            meshSize: normalizeOptionalDecimal(net.meshSize),
            netLength: normalizeOptionalDecimal(net.netLength),
            stationId: Number(newStation.stationId),
            hasChanged: false,
            createdAt: now,
            updatedAt: now,
          }));

          await tx.insert(netRegister).values(netsToInsert);
        }

        return { stationId: newStation.stationId };
      });
    }),

  updateStation: publicProcedure
    .input(
      z.object({
        stationId: z.number().int().positive(),
        stationCode: z.string().min(1).max(6),
        stationName: z.string().min(1).max(45),
        city: z.string().min(1).max(45),
        state: z.string().min(1).max(45),
        centerLat: z.string(),
        centerLong: z.string(),
        nets: z.array(
          z.object({
            netId: z.number().int().optional(),
            netNumber: z.string().min(1),
            netLat: z.string(),
            netLong: z.string(),
            meshSize: z.string().optional(),
            netLength: z.string().optional(),
          })
        ),
        removedNetIds: z.array(z.number().int()).optional(),
        justification: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const {
        stationId,
        nets,
        removedNetIds = [],
        justification,
        ...stationData
      } = input;

      const normalizeDecimal = (value: string) =>
        value.trim().replace(/,/g, ".");
      const normalizeOptionalDecimal = (value?: string) => {
        const trimmed = value?.trim();
        if (!trimmed) {
          return null;
        }
        return normalizeDecimal(trimmed);
      };

      const now = new Date().toISOString();

      if (removedNetIds.length > 0) {
        throw new Error("Removing nets is not allowed");
      }

      return db.transaction(async (tx) => {
        const originalStation = await tx
          .select()
          .from(stationRegister)
          .where(eq(stationRegister.stationId, BigInt(stationId)));

        if (!originalStation[0]) {
          throw new Error("Station not found");
        }

        const backupStation = {
          ...originalStation[0],
          stationId: undefined,
          originalId: Number(originalStation[0].stationId),
          hasChanged: true,
          createdAt: now,
          updatedAt: now,
        };

        await tx.insert(stationRegister).values(backupStation);

        await tx
          .update(stationRegister)
          .set({
            ...stationData,
            centerLat: normalizeDecimal(stationData.centerLat),
            centerLong: normalizeDecimal(stationData.centerLong),
            updatedAt: now,
          })
          .where(eq(stationRegister.stationId, BigInt(stationId)));

        await tx.insert(changeLog).values({
          table: "station_register",
          oldRecordId: stationId,
          newRecordId: stationId,
          isDeleted: false,
          justification,
          createdAt: sql`now()`,
        });

        const netsToUpdate = nets.filter((net) => net.netId);
        const netsToInsert = nets.filter((net) => !net.netId);

        if (netsToUpdate.length > 0) {
          const netIds = netsToUpdate.map((net) => BigInt(net.netId!));
          const existingNets = await tx
            .select()
            .from(netRegister)
            .where(
              and(
                eq(netRegister.stationId, stationId),
                inArray(netRegister.netId, netIds)
              )
            );

          const existingNetMap = new Map(
            existingNets.map((net) => [Number(net.netId), net])
          );

          const missingNetIds = netsToUpdate
            .map((net) => net.netId!)
            .filter((netId) => !existingNetMap.has(netId));

          if (missingNetIds.length > 0) {
            throw new Error(
              `Net(s) not found: ${missingNetIds.join(", ")}`
            );
          }

          for (const net of netsToUpdate) {
            const existingNet = existingNetMap.get(net.netId!);
            if (!existingNet) {
              continue;
            }

            const backupNet = {
              ...existingNet,
              netId: undefined,
              originalId: Number(existingNet.netId),
              hasChanged: true,
              createdAt: now,
              updatedAt: now,
            };

            await tx.insert(netRegister).values(backupNet);

            await tx
              .update(netRegister)
              .set({
                netNumber: net.netNumber.trim(),
                netLat: normalizeDecimal(net.netLat),
                netLong: normalizeDecimal(net.netLong),
                meshSize: normalizeOptionalDecimal(net.meshSize),
                netLength: normalizeOptionalDecimal(net.netLength),
                updatedAt: now,
              })
              .where(eq(netRegister.netId, BigInt(net.netId!)));

            await tx.insert(changeLog).values({
              table: "net_register",
              oldRecordId: Number(existingNet.netId),
              newRecordId: Number(existingNet.netId),
              isDeleted: false,
              justification,
              createdAt: sql`now()`,
            });
          }
        }

        if (netsToInsert.length > 0) {
          const netsToInsertValues = netsToInsert.map((net) => ({
            netNumber: net.netNumber.trim(),
            netLat: normalizeDecimal(net.netLat),
            netLong: normalizeDecimal(net.netLong),
            meshSize: normalizeOptionalDecimal(net.meshSize),
            netLength: normalizeOptionalDecimal(net.netLength),
            stationId,
            hasChanged: false,
            createdAt: now,
            updatedAt: now,
          }));

          await tx.insert(netRegister).values(netsToInsertValues);
        }

        return { stationId };
      });
    }),
});
