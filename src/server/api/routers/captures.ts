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
} from "drizzle/schema";

export const capturesRouter = createTRPCRouter({
  getCaptures: publicProcedure.query(async ({ ctx }) => {
    const captures = await db
      .select({
        station: stationRegister.stationCode,
        date: effort.dateEffort,
        netNumber: netRegister.netNumber,
        captureTime: capture.captureTime,
        captureId: capture.captureId,
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
              capture.variables[variableName] = value;
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
              capture.variables[variableName] = value;
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
});
