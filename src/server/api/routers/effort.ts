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
      .groupBy(effort.effortId, effortSummaries.effortSummaryId, stationRegister.stationCode, protocolRegister.protocolCode);

    const effortIds = efforts.map((effort) => effort.effortId) as bigint[];

    const netEfforts = await db
      .select({
        effortId: netEffort.effortId,
        totalNets: sql`COUNT(${netEffort.netId})`,
        netHours: sql<number>`SUM(age(${netOc.closeTime},${netOc.openTime}))`,
        openTime: sql`MIN(${netOc.openTime})`,
        closeTime: sql`MAX(${netOc.closeTime})`,
      })
      .from(netEffort)
      .rightJoin(netOc, eq(netEffort.netEffId, netOc.netEffId))
      //@ts-expect-error
      .where(inArray(netEffort.effortId, effortIds))
      .groupBy(netEffort.effortId);

    console.log(netEfforts);

    const categoricalValues = await db
      .select({
        effortId: effortCategoricalValues.effortId,
        value: effortCategoricalOptions.valueOama,
        variableName: effortVariableRegister.name,
        time: effortTime.portugueseLabel,
      })
      .from(effortCategoricalValues)
      //@ts-expect-error
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
      //@ts-expect-error
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
        //@ts-expect-error
        (netEffort) => netEffort.effortId === effort.effortId
      );
      const netEffort = netEfforts[effortIndex];

      const effortCategoricalValues = normalizedCategoricalValue.find(
        //@ts-expect-error
        (value) => value.effortId === effort.effortId
      );
      const effortContinuousValues = normalizedContinuousValue.find(
        //@ts-expect-error
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
});
