import { eq, sql, inArray } from "drizzle-orm";
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
} from "drizzle/schema";

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
        date: sql`DATE_FORMAT(${effort.dateEffort}, '%Y-%m-%d')`,
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
      .groupBy(effort.effortId, effortSummaries.effortSummaryId);

    const effortIds = efforts.map((effort) => effort.effortId);

    const netEfforts = await db
      .select({
        effortId: netEffort.effortId,
        totalNets: sql`COUNT(${netEffort.netId})`,
        netHours: sql<number>`SUM(TO_SECONDS(${netOc.closeTime})- TO_SECONDS(${netOc.openTime}))/3600`,
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
        ...effortCategoricalValues?.variables,
        ...effortContinuousValues?.variables,
      };
    });

    return effortWithVariables;
  }),
});
