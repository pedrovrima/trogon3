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
} from "drizzle/schema";

export const capturesRouter = createTRPCRouter({
  getCaptures: publicProcedure.query(async ({ ctx }) => {
    const captures = await db
      .select({
        captureId: capture.captureId,
        station: stationRegister.stationCode,
        data: sql`DATE_FORMAT(${effort.dateEffort}, '%Y-%m-%d')`,
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
      .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId));

    const captureIds = captures.map((capture) => capture.captureId);

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
        (variable) => variable.captureId === capture.captureId
      );
      const continuousVariables = normalizedContinuousValue.find(
        (variable) => variable.captureId === capture.captureId
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
          data: sql`DATE_FORMAT(${effort.dateEffort}, '%Y-%m-%d')`,
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
