import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import db from "@/db";
import {
  effort,
  effortSummaries,
  stationRegister,
  netEffort,
  capture,
} from "drizzle/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { effortCategoricalOptions } from "schema";

export const datacheckRouter = createTRPCRouter({
  checkEffortNumbers: publicProcedure.query(async ({ ctx }) => {
    const effortsCaptureCounts = await db
      .select({
        effortId: effort.effortId,
        station: stationRegister.stationCode,
        captures_total: sql`count(${capture.captureId})`,
        captures_new: sql`count(case when ${capture.captureCode} = 'N' then 1 else null end)`,
        captures_recaptures: sql`count(case when ${capture.captureCode} = 'R' or ${capture.captureCode} = 'C' or ${capture.captureCode} = 'E' then 1 else null end)`,
        captures_unbanded: sql`count(case when ${capture.captureCode} = 'U' then 1 else null end)`,
        date: effort.dateEffort,
      })
      .from(effort)
      .leftJoin(
        stationRegister,
        eq(effort.stationId, stationRegister.stationId)
      )
      .leftJoin(netEffort, eq(effort.effortId, netEffort.effortId))
      .leftJoin(capture, eq(netEffort.netEffId, capture.netEffId))
      .where(inArray(capture.captureCode, ["N", "R", "U", "C", "E"]))
      .groupBy(effort.effortId, stationRegister.stationCode);

    console.log(effortsCaptureCounts.filter((e) => e.effortId === 317));

    const effortSummariesCounts = await db
      .select({
        effortId: effortSummaries.effortId,
        summary_total: sql`${effortSummaries.newBands} + ${effortSummaries.recapture} + ${effortSummaries.unbanded}`,
        summary_new: effortSummaries.newBands,
        summary_recaptures: effortSummaries.recapture,
        summary_unbanded: effortSummaries.unbanded,
      })
      .from(effortSummaries)
      .where(
        inArray(
          effortSummaries.effortId,
          effortsCaptureCounts.map((e) => e.effortId)
        )
      );

    const effortWithSummaryCounts = effortsCaptureCounts.map((effort) => {
      const summary = effortSummariesCounts.find(
        (s) => s.effortId === effort.effortId
      );
      return { ...effort, ...summary };
    });

    console.log(effortWithSummaryCounts.filter((e) => e.effortId === 317));
    const effortIdsWithMismatch = effortWithSummaryCounts
      .filter(
        (e) =>
          Number(e.captures_new) !== Number(e.summary_new) ||
          Number(e.captures_recaptures) !== Number(e.summary_recaptures) ||
          Number(e.captures_unbanded) !== Number(e.summary_unbanded)
      )
      .map((e) => ({
        effortId: e.effortId,
        station: e.station,
        date: e.date,
      }));

    return {
      efforts: effortIdsWithMismatch,
      totalMismatch: effortIdsWithMismatch.length,
      totalEfforts: effortsCaptureCounts.length,
    };
  }),
});
