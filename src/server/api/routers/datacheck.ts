import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import db from "@/db";
import {
  effort,
  effortSummaries,
  stationRegister,
  netEffort,
  capture,
} from "drizzle/schema";
import { eq, inArray, sql, desc } from "drizzle-orm";
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
      .where(eq(capture.hasChanged, false))
      .groupBy(effort.effortId, stationRegister.stationCode)
      .orderBy(desc(effort.dateEffort));

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

    const effortIdsWithMismatch = effortWithSummaryCounts.reduce(
      (acc, e) => {
        const capturesTotal =
          Number(e.captures_new) +
          Number(e.captures_recaptures) +
          Number(e.captures_unbanded);
        const summaryTotal =
          Number(e.summary_new) +
          Number(e.summary_recaptures) +
          Number(e.summary_unbanded);

        const hasMismatch =
          Number(e.captures_new) !== Number(e.summary_new) ||
          Number(e.captures_recaptures) !== Number(e.summary_recaptures) ||
          Number(e.captures_unbanded) !== Number(e.summary_unbanded);

        if (hasMismatch) {
          let errorType = "";

          if (capturesTotal > summaryTotal) {
            errorType = "more_captures";
          } else if (capturesTotal < summaryTotal) {
            errorType = "less_captures";
          } else {
            errorType = "different_distribution";
          }

          acc.push({
            effortId: e.effortId,
            station: e.station,
            date: e.date,
            errorType,
            differences: {
              new: Number(e.captures_new) - Number(e.summary_new),
              recaptures:
                Number(e.captures_recaptures) - Number(e.summary_recaptures),
              unbanded:
                Number(e.captures_unbanded) - Number(e.summary_unbanded),
            },
          });
        }

        return acc;
      },
      [] as Array<{
        effortId: number;
        station: string;
        date: Date;
        errorType: "more_captures" | "less_captures" | "different_distribution";
        differences: {
          new: number;
          recaptures: number;
          unbanded: number;
        };
      }>
    );

    return {
      efforts: effortIdsWithMismatch,
      totalMismatch: effortIdsWithMismatch.length,
      totalEfforts: effortsCaptureCounts.length,
    };
  }),
});
