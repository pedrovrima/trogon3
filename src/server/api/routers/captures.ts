import { string, z } from "zod";
import { eq, sql, and, inArray } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import db from "@/db";

import {
  bandStringRegister,
  bands,
  capture,
  effort,
  stationRegister,
  captureCategoricalValues,
  captureCategoricalOptions,
  captureContinuousValues,
  captureVariableRegister,
  netEffort,
  netRegister,
  sppRegister,
  banderRegister,
  netOc,
} from "drizzle/schema";

export const capturesRouter = createTRPCRouter({
  getTopCapturedSpeciesNumbers: publicProcedure.query(async () => {
    const spp = await db
      .select({
        id: sppRegister.sppId,
        total: sql<number>`count(${capture.captureId}) `,
        speciesName: sql`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species})`,
        speciesCode: sppRegister.sciCode,
      })
      .from(sppRegister)
      .orderBy(sql`count(${capture.captureId}) desc`)
      .rightJoin(capture, eq(sppRegister.sppId, capture.sppId))
      .groupBy(sppRegister.sppId)
      .limit(7);

    // const netEfforts = await db
    //   .select({
    //     effortId: netEffort.effortId,
    //     totalNets: sql`COUNT(${netEffort.netId})`,
    //     netHours: sql<number>`SUM(age(${netOc.closeTime},${netOc.openTime}))`,
    //     openTime: sql`MIN(${netOc.openTime})`,
    //     closeTime: sql`MAX(${netOc.closeTime})`,
    //   })
    //   .from(netEffort)
    //   .rightJoin(netOc, eq(netEffort.netEffId, netOc.netEffId))
    //   //@ts-expect-error
    //   .where(inArray(netEffort.effortId, effortIds))
    //   .groupBy(netEffort.effortId);

    const monthlyCapturesOfTopSpecies = await db
      .select({
        speciesId: sppRegister.sppId,
        speciesCode: sppRegister.sciCode,
        speciesName: sql`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species})`,

        // sql`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species})`,
        total: sql<number>`count(${capture.captureId})`,
        month: sql`to_char(${effort.dateEffort}, 'MM')`,
        year: sql`to_char(${effort.dateEffort}, 'YYYY')`,
      })
      .from(capture)
      .leftJoin(netEffort, eq(netEffort.netEffId, capture.netEffId))
      .leftJoin(effort, eq(netEffort.effortId, effort.effortId))
      .leftJoin(
        stationRegister,
        eq(stationRegister.stationId, effort.stationId)
      )
      .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId))
      .groupBy(
        sppRegister.sppId,
        sql`to_char(${effort.dateEffort}, 'MM')`,
        sql`to_char(${effort.dateEffort}, 'YYYY')`
      )
      .orderBy(sql`count(${capture.captureId}) desc`)
      .where(
        and(
          inArray(
            sppRegister.sppId,
            spp.map((s) => s.id).filter((id): id is bigint => id !== null)
          ),
          eq(stationRegister.stationCode, "BOA1")
        )
      );

    console.log(
      monthlyCapturesOfTopSpecies.filter((s) => s.speciesName === "HAPUNI")
    );
    return { data: monthlyCapturesOfTopSpecies, count: spp };
  }),
  getCaptures: publicProcedure
    .input(
      z
        .object({
          family: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { family } = input ?? {};

      let capturesQuery = db
        .select({
          captureId: capture.captureId,
          station: stationRegister.stationCode,
          data: sql`to_char(${effort.dateEffort}, 'yyyy-mm-dd')`,
          netNumber: netRegister.netNumber,
          captureTime: capture.captureTime,
          bander: banderRegister.code,
          captureCode: capture.captureCode,
          bandSize: bandStringRegister.size,
          bandNumber: bands.bandNumber,
          sppCode: sppRegister.sciCode,
          family: sppRegister.family,
          sppName: sql`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species}) `,
          notes: capture.notes,
        })
        .from(capture)
        .leftJoin(netEffort, eq(capture.netEffId, netEffort.netEffId))
        .leftJoin(effort, eq(netEffort.effortId, effort.effortId))
        .leftJoin(
          stationRegister,
          eq(effort.stationId, stationRegister.stationId)
        )
        .leftJoin(banderRegister, eq(capture.banderId, banderRegister.banderId))
        .leftJoin(netRegister, eq(netEffort.netId, netRegister.netId))
        .leftJoin(bands, eq(capture.bandId, bands.bandId))
        .leftJoin(
          bandStringRegister,
          eq(bands.stringId, bandStringRegister.stringId)
        )
        .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId));

      if (family) {
        capturesQuery = capturesQuery.where(eq(sppRegister.family, family));
      }

      const captures = await capturesQuery;

      const captureIds = captures.map((capture) => Number(capture.captureId));

      const categoricalValues = await db
        .select({
          captureId: captureCategoricalValues.captureId,
          value: captureCategoricalOptions.valueOama,
          variableName: captureVariableRegister.name,
          variableType: captureVariableRegister.type,
        })
        .from(captureCategoricalValues)
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
            captureCategoricalValues.captureVariableId,
            captureVariableRegister.captureVariableId
          )
        )
        .where(inArray(captureCategoricalValues.captureId, captureIds));

      type Vars = {
        [key: string]: number | string;
      };

      type Variable = {
        captureId: number;
        variables: Vars;
      }[];

      const normalizedCategoricalValue = categoricalValues.reduce(
        (acc: Variable, _value) => {
          const { captureId, variableName, value } = _value;
          if (variableName !== null && value !== null) {
            const captureIndex = acc.findIndex(
              (capture) => capture.captureId === captureId
            );
            if (captureIndex === -1) {
              acc.push({ captureId, variables: { [variableName]: value } });
            } else {
              const capture = acc[captureIndex];
              if (capture) {
                if (capture.variables[variableName] === undefined) {
                  capture.variables[variableName] = value;
                } else {
                  const sameVariableValues = Object.keys(
                    capture.variables
                  ).filter((key) => key.includes(variableName));
                  capture.variables[
                    `${variableName}_${sameVariableValues.length + 1}`
                  ] = value;
                }
                acc[captureIndex] = capture;
              }
            }
          }
          return acc;
        },
        []
      );

      const continuousValues = await db
        .select({
          captureId: captureContinuousValues.captureId,
          variableId: captureVariableRegister.captureVariableId,
          variableName: captureVariableRegister.name,
          variableType: captureVariableRegister.type,
          value: captureContinuousValues.value,
        })
        .from(captureContinuousValues)
        .leftJoin(
          captureVariableRegister,
          eq(
            captureContinuousValues.captureVariableId,
            captureVariableRegister.captureVariableId
          )
        )
        .where(inArray(captureContinuousValues.captureId, captureIds));

      const normalizedContinuousValue = continuousValues.reduce(
        (acc: Variable, _value) => {
          const { captureId, variableName, value } = _value;
          if (variableName !== null && value !== null) {
            const captureIndex = acc.findIndex(
              (capture) => capture.captureId === captureId
            );
            if (captureIndex === -1) {
              acc.push({ captureId, variables: { [variableName]: value } });
            } else {
              const capture = acc[captureIndex];
              if (capture) {
                if (capture.variables[variableName] === undefined) {
                  capture.variables[variableName] = value;
                } else {
                  const sameVariableValues = Object.keys(
                    capture.variables
                  ).filter((key) => key.includes(variableName));
                  capture.variables[
                    `${variableName}_${sameVariableValues.length + 1}`
                  ] = value;
                }
                acc[captureIndex] = capture;
              }
            }
          }
          return acc;
        },
        []
      );

      const capturesWithVariables = captures.map((capture) => {
        const categoricalVariables = normalizedCategoricalValue.find(
          (variable) => variable.captureId === Number(capture.captureId)
        );
        const continuousVariables = normalizedContinuousValue.find(
          (variable) => variable.captureId === Number(capture.captureId)
        );
        return {
          ...capture,
          ...categoricalVariables?.variables,
          ...continuousVariables?.variables,
        };
      });

      return capturesWithVariables;
    }),
  getCaptureById: publicProcedure
    .input(
      z.object({
        captureId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { captureId } = input;
      const captureData = await db
        .select({
          captureId: capture.captureId,
          station: stationRegister.stationCode,
          data: sql`to_char(${effort.dateEffort}, 'yyyy-mm-dd')`,
          netNumber: netRegister.netNumber,
          captureTime: capture.captureTime,
          bander: banderRegister.code,
          captureCode: capture.captureCode,
          bandSize: bandStringRegister.size,
          bandNumber: bands.bandNumber,
          sppCode: sppRegister.sciCode,
          sppName: sql`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species}) `,
          notes: capture.notes,
        })
        .from(capture)
        .leftJoin(netEffort, eq(capture.netEffId, netEffort.netEffId))
        .leftJoin(effort, eq(netEffort.effortId, effort.effortId))
        .leftJoin(
          stationRegister,
          eq(effort.stationId, stationRegister.stationId)
        )
        .leftJoin(banderRegister, eq(capture.banderId, banderRegister.banderId))
        .leftJoin(netRegister, eq(netEffort.netId, netRegister.netId))
        .leftJoin(bands, eq(capture.bandId, bands.bandId))
        .leftJoin(
          bandStringRegister,
          eq(bands.stringId, bandStringRegister.stringId)
        )
        .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId))
        //@ts-expect-error
        .where(eq(capture.captureId, captureId));

      const categoricalValues = await db
        .select({
          id: captureCategoricalValues.captureCategoricalValuesId,
          captureId: captureCategoricalValues.captureId,
          value: captureCategoricalOptions.valueOama,
          variableName: captureVariableRegister.name,
          variableType: captureVariableRegister.type,
          label: captureVariableRegister.portugueseLabel,
        })
        .from(captureCategoricalValues)
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
            captureCategoricalValues.captureVariableId,
            captureVariableRegister.captureVariableId
          )
        )
        .where(eq(captureCategoricalValues.captureId, captureId));

      const continuousValues = await db
        .select({
          id: captureContinuousValues.captureContinuousValuesId,
          captureId: captureContinuousValues.captureId,
          variableId: captureVariableRegister.captureVariableId,
          variableName: captureVariableRegister.name,
          variableType: captureVariableRegister.type,
          value: captureContinuousValues.value,
          label: captureVariableRegister.portugueseLabel,
        })
        .from(captureContinuousValues)
        .leftJoin(
          captureVariableRegister,
          eq(
            captureContinuousValues.captureVariableId,
            captureVariableRegister.captureVariableId
          )
        )
        .where(eq(captureContinuousValues.captureId, captureId));

      return {
        ...captureData[0],
        categoricalValues,
        continuousValues,
      };
    }),
});
