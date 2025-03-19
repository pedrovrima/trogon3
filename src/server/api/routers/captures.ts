import { string, z } from "zod";
import { eq, sql, and, inArray, like } from "drizzle-orm";
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
  protocolRegister,
  changeLog,
} from "drizzle/schema";

export const capturesRouter = createTRPCRouter({
  getTopCapturedSpeciesNumbers: publicProcedure
    .input(
      z.object({
        stationCode: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { stationCode } = input ?? {};
      let sppQuery = db
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

      if (stationCode) {
        sppQuery = sppQuery.where(eq(stationRegister.stationCode, stationCode));
      }

      const spp = await sppQuery;

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
            eq(capture.hasChanged, false)
          )
        );

      return { data: monthlyCapturesOfTopSpecies, count: spp };
    }),
  getCaptures: publicProcedure
    .input(
      z
        .object({
          family: z.string().optional(),
          stationString: z.string().optional(),
          analysis: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const { family, stationString, analysis } = input ?? {};

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
          protocol: protocolRegister.protocolCode,
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
        .leftJoin(
          protocolRegister,
          eq(effort.protocolId, protocolRegister.protocolId)
        )
        .where(eq(capture.hasChanged, false));
      let conditions = [];
      if (family) {
        conditions.push(eq(sppRegister.family, family));
      }
      if (stationString) {
        conditions.push(
          like(stationRegister.stationCode, `%${stationString}%`)
        );
      }
      if (analysis) {
        conditions.push(
          inArray(capture.captureCode, ["N", "R", "C", "U", "E"])
        );
      }
      if (conditions.length > 0) {
        capturesQuery = capturesQuery.where(and(...conditions));
      }

      const captures = await capturesQuery;

      if (captures.length === 0) {
        return [];
      }

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
          if (!variableName || value === null) return acc;

          // Initialize capture object if it doesn't exist
          if (!acc.some((c) => c.captureId === captureId)) {
            acc.push({ captureId, variables: {} });
          }

          const capture = acc.find((c) => c.captureId === captureId)!;
          const varCount = Object.keys(capture.variables).filter(
            (key) => key === variableName || key.startsWith(`${variableName}_`)
          ).length;

          // Add the variable with a suffix if it already exists
          const key =
            varCount === 0 ? variableName : `${variableName}_${varCount + 1}`;
          capture.variables[key] = value;

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

      console.log(capturesWithVariables);
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
          hasChanged: capture.hasChanged,
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
  deleteCapture: protectedProcedure
    .input(
      z.object({
        recordId: z.number(),
        justification: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { recordId, justification } = input;

      const _capture = await db
        .select()
        .from(capture)
        //@ts-expect-error
        .where(eq(capture.captureId, recordId));
      if (!_capture) {
        throw new Error("Capture not found");
      }

      await db.transaction(async (tx) => {
        await tx.insert(changeLog).values({
          table: "capture",
          oldRecordId: recordId,
          newRecordId: null,
          isDeleted: true,
          justification,
          createdAt: sql`now()`,
        });

        await tx
          .update(capture)
          .set({
            hasChanged: true,
            updatedAt: sql`now()`,
          })
          //@ts-expect-error
          .where(eq(capture.captureId, recordId));
      });

      // Return a simple success response instead of the changeLog
      return { success: true };
    }),
  updateCaptureNetEffort: protectedProcedure
    .input(
      z.object({
        captureId: z.number(),
        newNetEffId: z.number(),
        justification: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { captureId, newNetEffId, justification } = input;

      // Get the original capture record
      const originalCapture = await db
        .select()
        .from(capture)
        .where(eq(capture.captureId, captureId));

      if (!originalCapture || originalCapture.length === 0) {
        throw new Error("Capture not found");
      }

      // Create backup copy with original data
      const backupCapture = {
        ...originalCapture[0],
        captureId: undefined, // Let the DB assign a new ID
        originalId: captureId, // Reference to the original record
        hasChanged: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return await db.transaction(async (tx) => {
        // Insert backup record
        await tx.insert(capture).values(backupCapture);

        // Update original record
        await tx
          .update(capture)
          .set({
            netEffId: newNetEffId,
            updatedAt: sql`now()`,
          })
          .where(eq(capture.captureId, captureId));

        // Log the change
        await tx.insert(changeLog).values({
          table: "capture",
          oldRecordId: captureId,
          newRecordId: captureId,
          isDeleted: false,
          justification,
          createdAt: sql`now()`,
        });
      });
    }),

  // Helper procedures to get data for the modal
  getStations: publicProcedure.query(async () => {
    return await db
      .select({
        stationId: stationRegister.stationId,
        stationCode: stationRegister.stationCode,
        stationName: stationRegister.stationName,
      })
      .from(stationRegister)
      .where(eq(stationRegister.hasChanged, false));
  }),

  getEffortsByStation: publicProcedure
    .input(
      z.object({
        stationId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await db
        .select({
          effortId: effort.effortId,
          dateEffort: effort.dateEffort,
          protocolCode: protocolRegister.protocolCode,
        })
        .from(effort)
        .leftJoin(
          protocolRegister,
          eq(effort.protocolId, protocolRegister.protocolId)
        )
        .where(and(eq(effort.stationId, input.stationId)))
        .orderBy(effort.dateEffort);
    }),

  getNetEffortsByEffort: publicProcedure
    .input(
      z.object({
        effortId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await db
        .select({
          netEffId: netEffort.netEffId,
          netNumber: netRegister.netNumber,
        })
        .from(netEffort)
        .leftJoin(netRegister, eq(netEffort.netId, netRegister.netId))
        .where(
          and(
            eq(netEffort.effortId, input.effortId),
            eq(netEffort.hasChanged, false)
          )
        )
        .orderBy(netRegister.netNumber);
    }),
});
