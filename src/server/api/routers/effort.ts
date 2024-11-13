import { eq, sql, inArray, desc, like } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import db from "@/db";
import {
  effort,
  effortCategoricalOptions,
  effortCategoricalValues,
  effortContinuousValues,
  effortSummaries,
  effortTime,
  effortVariableRegister,
  netEffort,
  netOc,
  protocolRegister,
  stationRegister,
  capture,
  bands,
  bandStringRegister,
  sppRegister,
} from "drizzle/schema";
import { z } from "zod";

type Vars = {
  [key: string]: number | string;
};

type Variable = {
  effortId: number;
  variables: Vars;
}[];

export const effortRouter = createTRPCRouter({
  getEfforts: publicProcedure.query(async ({ ctx }) => {
    const efforts = await db
      .select({
        effortId: effort.effortId,
        station: stationRegister.stationCode,
        notes: effort.notes,
        date: sql`to_char(${effort.dateEffort}, 'yyyy-mm-dd')`,
        protocol: protocolRegister.protocolCode,
        newCaptures: effortSummaries.newBands,
        recaptures: effortSummaries.recapture,
        unbanded: effortSummaries.unbanded,
      })
      .from(effort)
      .leftJoin(
        stationRegister,
        eq(effort.stationId, stationRegister.stationId)
      )
      .leftJoin(
        protocolRegister,
        eq(effort.protocolId, protocolRegister.protocolId)
      )

      .leftJoin(netEffort, eq(effort.effortId, netEffort.effortId))
      .leftJoin(effortSummaries, eq(effort.effortId, effortSummaries.effortId))
      .groupBy(
        effort.effortId,
        effortSummaries.effortSummaryId,
        stationRegister.stationCode,
        protocolRegister.protocolCode
      );

    const effortIds = efforts.map((effort) => effort.effortId as number);

    const netEfforts = await db
      .select({
        effortId: netEffort.effortId,
        totalNets: sql`COUNT(${netEffort.netId})`,
        netHours: sql<number>`extract(epoch from SUM(age(${netOc.closeTime},${netOc.openTime})))::integer/3600`,
        openTime: sql`MIN(${netOc.openTime})`,
        closeTime: sql`MAX(${netOc.closeTime})`,
      })
      .from(netEffort)
      .rightJoin(netOc, eq(netEffort.netEffId, netOc.netEffId))

      .where(inArray(netEffort.effortId, effortIds))
      .groupBy(netEffort.effortId);

    const categoricalValues = await db
      .select({
        effortId: effortCategoricalValues.effortId,
        value: effortCategoricalOptions.valueOama,
        variableName: effortVariableRegister.name,
        time: effortTime.portugueseLabel,
      })
      .from(effortCategoricalValues)

      .where(inArray(effortCategoricalValues.effortId, effortIds))
      .leftJoin(
        effortCategoricalOptions,
        eq(
          effortCategoricalValues.effortCategoricalOptionId,
          effortCategoricalOptions.effortCategoricalOptionId
        )
      )
      .leftJoin(
        effortVariableRegister,
        eq(
          effortCategoricalOptions.effortVariableId,
          effortVariableRegister.effortVariableId
        )
      )
      .leftJoin(
        effortTime,
        eq(effortCategoricalValues.effortTimeId, effortTime.effortTimeId)
      );

    const continuousValues = await db
      .select({
        effortId: effortContinuousValues.effortId,
        value: effortContinuousValues.value,
        variableName: effortVariableRegister.name,
        time: effortTime.portugueseLabel,
      })
      .from(effortContinuousValues)

      .where(inArray(effortContinuousValues.effortId, effortIds))
      .leftJoin(
        effortVariableRegister,
        eq(
          effortContinuousValues.effortVariableId,
          effortVariableRegister.effortVariableId
        )
      )
      .leftJoin(
        effortTime,
        eq(effortContinuousValues.effortTimeId, effortTime.effortTimeId)
      );

    const normalizedContinuousValue = continuousValues.reduce(
      (acc: Variable, _value) => {
        const { effortId, variableName, value, time } = _value;
        if (variableName !== null && value !== null && time !== null) {
          const effortIndex = acc.findIndex(
            (effort) => effort.effortId === effortId
          );
          if (effortIndex === -1) {
            acc.push({
              effortId,
              variables: { [`${variableName}_${time}`]: value },
            });
          } else {
            const effort = acc[effortIndex];
            if (effort) {
              effort.variables[`${variableName}_${time}`] = value;
              acc[effortIndex] = effort;
            }
          }
        }
        return acc;
      },
      []
    );

    const normalizedCategoricalValue = categoricalValues.reduce(
      (acc: Variable, _value) => {
        const { effortId, variableName, value, time } = _value;
        if (variableName !== null && value !== null && time !== null) {
          const effortIndex = acc.findIndex(
            (effort) => effort.effortId === effortId
          );
          if (effortIndex === -1) {
            acc.push({
              effortId,
              variables: { [`${variableName}_${time}`]: value },
            });
          } else {
            const effort = acc[effortIndex];
            if (effort) {
              effort.variables[`${variableName}_${time}`] = value;
              acc[effortIndex] = effort;
            }
          }
        }
        return acc;
      },
      []
    );

    const effortWithVariables = efforts.map((effort) => {
      const effortIndex = netEfforts.findIndex(
        (netEffort) => netEffort.effortId === effort.effortId
      );

      const netEffort = netEfforts[effortIndex];

      const effortCategoricalValues = normalizedCategoricalValue.find(
        (value) => value.effortId === effort.effortId
      );
      const effortContinuousValues = normalizedContinuousValue.find(
        (value) => value.effortId === effort.effortId
      );

      return {
        ...effort,

        ...netEffort,
        openTime: new Date(netEffort?.openTime as string).toLocaleTimeString(
          "pt-BR"
        ),
        closeTime: new Date(netEffort?.closeTime as string).toLocaleTimeString(
          "pt-BR"
        ),

        ...effortCategoricalValues?.variables,
        ...effortContinuousValues?.variables,
      };
    });

    return effortWithVariables;
  }),

  getEffortsPaginated: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive(),
        searchTerm: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, searchTerm } = input;
      const pageSize = 10;
      const offset = (page - 1) * pageSize;

      const baseQuery = db
        .select({
          effortId: effort.effortId,
          date: sql<string>`TO_CHAR(${effort.dateEffort}, 'DD/MM/YYYY')`,
          stationCode: stationRegister.stationCode,
          totalNetHours: sql<number>`ROUND(EXTRACT(EPOCH FROM SUM(age(${netOc.closeTime},${netOc.openTime}))) / 3600.0, 2)`,
          newBands: effortSummaries.newBands,
          recapture: effortSummaries.recapture,
          unbanded: effortSummaries.unbanded,
        })
        .from(effort)
        .leftJoin(
          stationRegister,
          eq(effort.stationId, stationRegister.stationId)
        )
        .leftJoin(netEffort, eq(effort.effortId, netEffort.effortId))
        .leftJoin(netOc, eq(netEffort.netEffId, netOc.netEffId))
        .leftJoin(
          effortSummaries,
          eq(effort.effortId, effortSummaries.effortId)
        )
        .groupBy(
          effort.effortId,
          stationRegister.stationCode,
          effortSummaries.effortSummaryId
        );

      if (searchTerm) {
        baseQuery.where(like(stationRegister.stationName, `%${searchTerm}%`));
      }

      const totalEfforts = await baseQuery.execute();
      const totalCount = totalEfforts.length;

      const efforts = await baseQuery
        .orderBy(desc(effort.dateEffort))
        .limit(pageSize)
        .offset(offset)
        .execute();

      return {
        efforts,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      };
    }),
  getEffortById: publicProcedure
    .input(z.object({ effortId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const { effortId } = input;

      const effortData = await db
        .select({
          effortId: effort.effortId,
          date: sql<string>`TO_CHAR(${effort.dateEffort}, 'DD/MM/YYYY')`,
          stationCode: stationRegister.stationCode,
          protocolCode: protocolRegister.protocolCode,
          totalNetHours: sql<number>`ROUND(EXTRACT(EPOCH FROM SUM(age(${netOc.closeTime},${netOc.openTime}))) / 3600.0, 2)`,
          summary_new: effortSummaries.newBands,
          summary_recapture: effortSummaries.recapture,
          summary_unbanded: effortSummaries.unbanded,
          notes: effort.notes,
        })
        .from(effort)
        .where(eq(effort.effortId, effortId))
        .leftJoin(
          stationRegister,
          eq(effort.stationId, stationRegister.stationId)
        )
        .leftJoin(
          protocolRegister,
          eq(effort.protocolId, protocolRegister.protocolId)
        )
        .leftJoin(netEffort, eq(effort.effortId, netEffort.effortId))
        .leftJoin(netOc, eq(netEffort.netEffId, netOc.netEffId))
        .leftJoin(
          effortSummaries,
          eq(effort.effortId, effortSummaries.effortId)
        )
        .groupBy(
          effort.effortId,
          stationRegister.stationCode,
          protocolRegister.protocolCode,
          effortSummaries.effortSummaryId
        );

      const effortCaptures = await db
        .select({
          captureId: capture.captureId,
          captureTime: capture.captureTime,
          bandNumber: bands.bandNumber,
          bandSize: bandStringRegister.size,
          captureCode: capture.captureCode,
          sppCode: sppRegister.sciCode,
        })
        .from(capture)
        .leftJoin(netEffort, eq(capture.netEffId, netEffort.netEffId))
        .leftJoin(bands, eq(capture.bandId, bands.bandId))
        .leftJoin(
          bandStringRegister,
          eq(bands.stringId, bandStringRegister.stringId)
        )
        .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId))
        .where(eq(netEffort.effortId, effortId));

      return { ...effortData[0], captures: effortCaptures };
    }),
});
