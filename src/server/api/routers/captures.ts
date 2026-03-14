import { z } from "zod";
import { eq, sql, and, inArray, like, desc } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import db from "@/db";

import {
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
  protocolRegister,
  protocolVars,
  changeLog,
} from "drizzle/schema";

const NA_VALUE_VARIABLE_ID = 41;
const UNIVERSAL_OPTION_VALUES = new Set(["NA", "U"]);

type CaptureOption = {
  optionId: number;
  value: string;
  description: string;
};

const normalizeOptionDescription = (_value: string, description: string) => {
  const cleanedDescription = description.replaceAll('"', "").trim();
  return cleanedDescription;
};

const getUniversalNaValueOptions = async (): Promise<CaptureOption[]> => {
  const options = await db
    .select({
      optionId: captureCategoricalOptions.captureCategoricalOptionId,
      value: captureCategoricalOptions.valueOama,
      description: captureCategoricalOptions.description,
    })
    .from(captureCategoricalOptions)
    .where(
      and(
        eq(captureCategoricalOptions.captureVariableId, NA_VALUE_VARIABLE_ID),
        eq(captureCategoricalOptions.hasChanged, false)
      )
    );

  return options
    .filter(
      (
        option
      ): option is { optionId: number; value: string; description: string } =>
        option.optionId !== null &&
        option.value !== null &&
        option.description !== null &&
        UNIVERSAL_OPTION_VALUES.has(option.value)
    )
    .map((option) => ({
      optionId: Number(option.optionId),
      value: option.value,
      description: normalizeOptionDescription(option.value, option.description),
    }));
};

const mergeWithUniversalOptions = async (
  baseOptions: CaptureOption[],
  onlySingleCharacterValues = false
): Promise<CaptureOption[]> => {
  const mergedByValue = new Map<string, CaptureOption>();

  for (const option of baseOptions) {
    mergedByValue.set(option.value, option);
  }

  const universalOptions = await getUniversalNaValueOptions();
  for (const option of universalOptions) {
    if (onlySingleCharacterValues && option.value.length !== 1) {
      continue;
    }
    if (!mergedByValue.has(option.value)) {
      mergedByValue.set(option.value, option);
    }
  }

  return [...mergedByValue.values()].sort((a, b) =>
    a.value.localeCompare(b.value)
  );
};

const getResolvedCaptureCodeOptions = async () => {
  const distinctCaptureCodeRows = await db
    .select({
      value: capture.captureCode,
    })
    .from(capture)
    .where(
      and(
        eq(capture.hasChanged, false),
        sql`${capture.captureCode} is not null`
      )
    )
    .groupBy(capture.captureCode);

  const distinctCaptureCodes = new Set(
    distinctCaptureCodeRows
      .map((item) => item.value)
      .filter((item): item is string => typeof item === "string")
  );

  const activeOptions = await db
    .select({
      optionId: captureCategoricalOptions.captureCategoricalOptionId,
      value: captureCategoricalOptions.valueOama,
      description: captureCategoricalOptions.description,
      variableId: captureVariableRegister.captureVariableId,
      variableName: captureVariableRegister.name,
      variableLabel: captureVariableRegister.portugueseLabel,
    })
    .from(captureCategoricalOptions)
    .leftJoin(
      captureVariableRegister,
      eq(
        captureCategoricalOptions.captureVariableId,
        captureVariableRegister.captureVariableId
      )
    )
    .where(
      and(
        eq(captureCategoricalOptions.hasChanged, false),
        eq(captureVariableRegister.hasChanged, false)
      )
    );

  const optionsByVariable = new Map<
    number,
    {
      matchedValues: number;
      options: Array<{
        optionId: number;
        value: string;
        description: string;
      }>;
      variableName: string;
      variableLabel: string;
    }
  >();

  for (const option of activeOptions) {
    if (
      option.variableId === null ||
      option.optionId === null ||
      option.value === null ||
      option.description === null ||
      option.variableName === null ||
      option.variableLabel === null
    ) {
      continue;
    }

    const variableId = Number(option.variableId);
    const current = optionsByVariable.get(variableId) ?? {
      matchedValues: 0,
      options: [],
      variableName: option.variableName,
      variableLabel: option.variableLabel,
    };

    if (distinctCaptureCodes.has(option.value)) {
      current.matchedValues += 1;
    }

    current.options.push({
      optionId: Number(option.optionId),
      value: option.value,
      description: option.description,
    });

    optionsByVariable.set(variableId, current);
  }

  let selectedVariableId: number | null = null;
  let maxMatchedValues = 0;

  for (const [variableId, candidate] of optionsByVariable.entries()) {
    if (candidate.matchedValues > maxMatchedValues) {
      maxMatchedValues = candidate.matchedValues;
      selectedVariableId = variableId;
    }
  }

  if (selectedVariableId === null) {
    const fallbackEntry = [...optionsByVariable.entries()].find(
      ([, candidate]) => {
        const normalizedName = candidate.variableName.toLowerCase();
        const normalizedLabel = candidate.variableLabel.toLowerCase();
        return (
          normalizedName.includes("status") ||
          normalizedName.includes("capture") ||
          normalizedLabel.includes("status") ||
          normalizedLabel.includes("captura")
        );
      }
    );

    selectedVariableId = fallbackEntry?.[0] ?? null;
  }

  if (selectedVariableId === null) {
    return [];
  }

  const selectedOptions =
    optionsByVariable.get(selectedVariableId)?.options ?? [];
  return await mergeWithUniversalOptions(selectedOptions, true);
};

const createCaptureSchema = z.object({
  captureTime: z
    .string()
    .length(3)
    .regex(/^\d{3}$/)
    .refine((val) => {
      const padded = val + "0";
      const hours = parseInt(padded.slice(0, 2), 10);
      const minutes = parseInt(padded.slice(2, 4), 10);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, "Invalid time"),
  captureCode: z.string().min(1).max(1),
  netEffId: z.number().int().positive(),
  banderId: z.number().int().positive(),
  bandId: z.number().int().positive(),
  sppId: z.number().int().positive(),
  notes: z.string().max(1500).default(""),
  categoricalValues: z
    .array(
      z.object({
        captureVariableId: z.number().int().positive(),
        captureCategoricalOptionId: z.number().int().positive(),
      })
    )
    .default([]),
  continuousValues: z
    .array(
      z.object({
        captureVariableId: z.number().int().positive(),
        value: z.string().max(50),
      })
    )
    .default([]),
  clientId: z.string().uuid().optional(),
});

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
          bandSize: bands.bandSize,
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
        .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId))
        .leftJoin(
          protocolRegister,
          eq(effort.protocolId, protocolRegister.protocolId)
        )
        .where(eq(capture.hasChanged, false));
      const conditions = [];
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
        .where(
          and(
            inArray(captureCategoricalValues.captureId, captureIds),
            eq(captureCategoricalValues.hasChanged, false)
          )
        );

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
        .where(
          and(
            inArray(captureContinuousValues.captureId, captureIds),
            eq(captureContinuousValues.hasChanged, false)
          )
        );

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
    .query(async ({ input }) => {
      const { captureId } = input;
      const captureData = await db
        .select({
          captureId: capture.captureId,
          sppId: capture.sppId,
          effortId: effort.effortId,
          station: stationRegister.stationCode,
          data: sql`to_char(${effort.dateEffort}, 'yyyy-mm-dd')`,
          netNumber: netRegister.netNumber,
          captureTime: capture.captureTime,
          bander: banderRegister.code,
          captureCode: capture.captureCode,
          bandSize: bands.bandSize,
          bandNumber: bands.bandNumber,
          sppCode: sppRegister.sciCode,
          sppName: sql<string>`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species}) `,
          notes: capture.notes,
          hasChanged: capture.hasChanged,
          protocolId: effort.protocolId,
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
        .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId))
        //@ts-expect-error drizzle bigint typing mismatch for captureId filter
        .where(eq(capture.captureId, captureId));

      const categoricalValues = await db
        .select({
          id: captureCategoricalValues.captureCategoricalValuesId,
          captureId: captureCategoricalValues.captureId,
          optionId: captureCategoricalValues.captureCategoricalOptionId,
          variableId: captureVariableRegister.captureVariableId,
          value: captureCategoricalOptions.valueOama,
          variableName: captureVariableRegister.name,
          variableType: captureVariableRegister.type,
          label: captureVariableRegister.portugueseLabel,
          unit: captureVariableRegister.unit,
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
        .where(
          and(
            eq(captureCategoricalValues.captureId, captureId),
            eq(captureCategoricalValues.hasChanged, false)
          )
        );

      const continuousValues = await db
        .select({
          id: captureContinuousValues.captureContinuousValuesId,
          captureId: captureContinuousValues.captureId,
          variableId: captureVariableRegister.captureVariableId,
          variableName: captureVariableRegister.name,
          variableType: captureVariableRegister.type,
          value: captureContinuousValues.value,
          label: captureVariableRegister.portugueseLabel,
          unit: captureVariableRegister.unit,
        })
        .from(captureContinuousValues)
        .leftJoin(
          captureVariableRegister,
          eq(
            captureContinuousValues.captureVariableId,
            captureVariableRegister.captureVariableId
          )
        )
        .where(
          and(
            eq(captureContinuousValues.captureId, captureId),
            eq(captureContinuousValues.hasChanged, false)
          )
        );

      // Fetch protocol variable order
      const protocolId = captureData[0]?.protocolId;
      let varOrderMap = new Map<number, number>();
      if (protocolId) {
        const pvRows = await db
          .select({
            captureVariableId: protocolVars.captureVariableId,
            order: protocolVars.order,
          })
          .from(protocolVars)
          .where(eq(protocolVars.protocolId, protocolId));
        varOrderMap = new Map(
          pvRows.map((r) => [r.captureVariableId, r.order])
        );
      }

      const addOrder = <T extends { variableId: number | null }>(items: T[]) =>
        items
          .map((item) => ({
            ...item,
            order:
              item.variableId !== null
                ? varOrderMap.get(item.variableId) ?? 999
                : 999,
          }))
          .sort((a, b) => a.order - b.order);

      return {
        ...captureData[0],
        categoricalValues: addOrder(categoricalValues),
        continuousValues: addOrder(continuousValues),
      };
    }),
  getCaptureCodeOptions: publicProcedure.query(async () => {
    return await getResolvedCaptureCodeOptions();
  }),
  updateCaptureCode: protectedProcedure
    .input(
      z.object({
        captureId: z.number(),
        newCaptureCode: z.string().min(1).max(1),
        justification: z.string().trim().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { captureId, newCaptureCode, justification } = input;

      const availableCaptureCodes = await getResolvedCaptureCodeOptions();

      const isValidCaptureCode = availableCaptureCodes.some(
        (option) => option.value === newCaptureCode
      );

      if (!isValidCaptureCode) {
        throw new Error("Invalid capture code option");
      }

      return await db.transaction(async (tx) => {
        const originalCapture = await tx
          .select()
          .from(capture)
          //@ts-expect-error drizzle bigint typing mismatch for captureId filter
          .where(eq(capture.captureId, captureId));

        if (!originalCapture || originalCapture.length === 0) {
          throw new Error("Capture not found");
        }

        const backupCapture = {
          ...originalCapture[0],
          captureId: undefined,
          originalId: captureId,
          hasChanged: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        //@ts-expect-error backup row can include nullable fields from legacy records
        const [backupRecord] = await tx
          .insert(capture)
          .values(backupCapture)
          .returning({ backupId: capture.captureId });

        if (!backupRecord?.backupId) {
          throw new Error("Failed to create capture backup record");
        }

        await tx
          .update(capture)
          .set({
            captureCode: newCaptureCode,
            updatedAt: sql`now()`,
          })
          //@ts-expect-error drizzle bigint typing mismatch for captureId filter
          .where(eq(capture.captureId, captureId));

        await tx.insert(changeLog).values({
          table: "capture",
          oldRecordId: captureId,
          newRecordId: Number(backupRecord.backupId),
          isDeleted: false,
          justification,
          createdAt: sql`now()`,
        });

        return { captureId, captureCode: newCaptureCode };
      });
    }),
  getCategoricalVariableOptions: publicProcedure
    .input(
      z.object({
        variableId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const variableOptions = await db
        .select({
          optionId: captureCategoricalOptions.captureCategoricalOptionId,
          value: captureCategoricalOptions.valueOama,
          description: captureCategoricalOptions.description,
        })
        .from(captureCategoricalOptions)
        .where(
          and(
            eq(captureCategoricalOptions.captureVariableId, input.variableId),
            eq(captureCategoricalOptions.hasChanged, false)
          )
        )
        .orderBy(captureCategoricalOptions.valueOama);

      const normalizedVariableOptions: CaptureOption[] = variableOptions
        .filter(
          (
            option
          ): option is {
            optionId: number;
            value: string;
            description: string;
          } =>
            option.optionId !== null &&
            option.value !== null &&
            option.description !== null
        )
        .map((option) => ({
          optionId: Number(option.optionId),
          value: option.value,
          description: normalizeOptionDescription(
            option.value,
            option.description
          ),
        }));

      return await mergeWithUniversalOptions(normalizedVariableOptions, false);
    }),
  updateCaptureVariableValue: protectedProcedure
    .input(
      z.object({
        captureId: z.number(),
        valueId: z.number(),
        variableKind: z.enum(["categorical", "continuous"]),
        newOptionId: z.number().optional(),
        newValue: z.string().optional(),
        justification: z.string().trim().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const {
        captureId,
        valueId,
        variableKind,
        newOptionId,
        newValue,
        justification,
      } = input;

      return await db.transaction(async (tx) => {
        if (variableKind === "categorical") {
          if (!newOptionId) {
            throw new Error("Missing categorical option");
          }

          const selectedOption = await tx
            .select({
              optionId: captureCategoricalOptions.captureCategoricalOptionId,
              variableId: captureCategoricalOptions.captureVariableId,
              value: captureCategoricalOptions.valueOama,
            })
            .from(captureCategoricalOptions)
            //@ts-expect-error drizzle bigint typing mismatch for option id filter
            .where(
              eq(
                captureCategoricalOptions.captureCategoricalOptionId,
                newOptionId
              )
            );

          if (!selectedOption || selectedOption.length === 0) {
            throw new Error("Invalid categorical option");
          }

          const originalValue = await tx
            .select()
            .from(captureCategoricalValues)
            .where(
              and(
                //@ts-expect-error drizzle bigint typing mismatch for value id filter
                eq(
                  captureCategoricalValues.captureCategoricalValuesId,
                  valueId
                ),
                //@ts-expect-error drizzle bigint typing mismatch for capture id filter
                eq(captureCategoricalValues.captureId, captureId)
              )
            );

          if (!originalValue || originalValue.length === 0) {
            throw new Error("Categorical value not found");
          }

          const originalVariableId = Number(
            originalValue[0]?.captureVariableId
          );
          const selectedOptionVariableId = Number(
            selectedOption[0]?.variableId
          );
          const selectedOptionValue = selectedOption[0]?.value;

          const isUniversalOption =
            selectedOptionVariableId === NA_VALUE_VARIABLE_ID &&
            typeof selectedOptionValue === "string" &&
            UNIVERSAL_OPTION_VALUES.has(selectedOptionValue);

          if (
            originalVariableId !== selectedOptionVariableId &&
            !isUniversalOption
          ) {
            throw new Error("Option does not belong to the selected variable");
          }

          const backupValue = {
            ...originalValue[0],
            captureCategoricalValuesId: undefined,
            originalId: valueId,
            hasChanged: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          //@ts-expect-error backup row can include nullable fields from legacy records
          const [backupValueRecord] = await tx
            .insert(captureCategoricalValues)
            .values(backupValue)
            .returning({
              backupValueId:
                captureCategoricalValues.captureCategoricalValuesId,
            });

          if (!backupValueRecord?.backupValueId) {
            throw new Error("Failed to create categorical backup record");
          }

          await tx
            .update(captureCategoricalValues)
            .set({
              captureCategoricalOptionId: newOptionId,
              updatedAt: sql`now()`,
            })
            .where(
              //@ts-expect-error drizzle bigint typing mismatch for value id filter
              eq(captureCategoricalValues.captureCategoricalValuesId, valueId)
            );

          await tx.insert(changeLog).values({
            table: "capture_categorical_values",
            oldRecordId: valueId,
            newRecordId: Number(backupValueRecord.backupValueId),
            isDeleted: false,
            justification,
            createdAt: sql`now()`,
          });

          return { captureId, valueId, variableKind };
        }

        if (newValue === undefined) {
          throw new Error("Missing continuous value");
        }

        const originalValue = await tx
          .select()
          .from(captureContinuousValues)
          .where(
            and(
              //@ts-expect-error drizzle bigint typing mismatch for value id filter
              eq(captureContinuousValues.captureContinuousValuesId, valueId),
              //@ts-expect-error drizzle bigint typing mismatch for capture id filter
              eq(captureContinuousValues.captureId, captureId)
            )
          );

        if (!originalValue || originalValue.length === 0) {
          throw new Error("Continuous value not found");
        }

        const backupValue = {
          ...originalValue[0],
          captureContinuousValuesId: undefined,
          originalId: valueId,
          hasChanged: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        //@ts-expect-error backup row can include nullable fields from legacy records
        const [backupValueRecord] = await tx
          .insert(captureContinuousValues)
          .values(backupValue)
          .returning({
            backupValueId: captureContinuousValues.captureContinuousValuesId,
          });

        if (!backupValueRecord?.backupValueId) {
          throw new Error("Failed to create continuous backup record");
        }

        await tx
          .update(captureContinuousValues)
          .set({
            value: newValue,
            updatedAt: sql`now()`,
          })
          .where(
            //@ts-expect-error drizzle bigint typing mismatch for value id filter
            eq(captureContinuousValues.captureContinuousValuesId, valueId)
          );

        await tx.insert(changeLog).values({
          table: "capture_continuous_values",
          oldRecordId: valueId,
          newRecordId: Number(backupValueRecord.backupValueId),
          isDeleted: false,
          justification,
          createdAt: sql`now()`,
        });

        return { captureId, valueId, variableKind };
      });
    }),
  getSpeciesOptions: publicProcedure.query(async () => {
    return await db
      .select({
        sppId: sppRegister.sppId,
        sppCode: sppRegister.sciCode,
        sppName: sql<string>`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species})`,
      })
      .from(sppRegister)
      .where(eq(sppRegister.hasChanged, false))
      .orderBy(sppRegister.sciCode);
  }),
  updateCaptureSpecies: protectedProcedure
    .input(
      z.object({
        captureId: z.number(),
        newSppId: z.number(),
        justification: z.string().trim().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { captureId, newSppId, justification } = input;

      const availableSpecies = await db
        .select({
          sppId: sppRegister.sppId,
        })
        .from(sppRegister)
        .where(eq(sppRegister.hasChanged, false));

      const isValidSpecies = availableSpecies.some(
        (species) => Number(species.sppId) === newSppId
      );

      if (!isValidSpecies) {
        throw new Error("Invalid species option");
      }

      return await db.transaction(async (tx) => {
        const originalCapture = await tx
          .select()
          .from(capture)
          //@ts-expect-error drizzle bigint typing mismatch for captureId filter
          .where(eq(capture.captureId, captureId));

        if (!originalCapture || originalCapture.length === 0) {
          throw new Error("Capture not found");
        }

        const backupCapture = {
          ...originalCapture[0],
          captureId: undefined,
          originalId: captureId,
          hasChanged: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        //@ts-expect-error backup row can include nullable fields from legacy records
        const [backupRecord] = await tx
          .insert(capture)
          .values(backupCapture)
          .returning({ backupId: capture.captureId });

        if (!backupRecord?.backupId) {
          throw new Error("Failed to create capture backup record");
        }

        await tx
          .update(capture)
          .set({
            sppId: newSppId,
            updatedAt: sql`now()`,
          })
          //@ts-expect-error drizzle bigint typing mismatch for captureId filter
          .where(eq(capture.captureId, captureId));

        await tx.insert(changeLog).values({
          table: "capture",
          oldRecordId: captureId,
          newRecordId: Number(backupRecord.backupId),
          isDeleted: false,
          justification,
          createdAt: sql`now()`,
        });

        return { captureId, sppId: newSppId };
      });
    }),
  deleteCapture: protectedProcedure
    .input(
      z.object({
        recordId: z.number(),
        justification: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { recordId, justification } = input;

      const _capture = await db
        .select()
        .from(capture)
        //@ts-expect-error drizzle bigint typing mismatch for recordId filter
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
          //@ts-expect-error drizzle bigint typing mismatch for recordId filter
          .where(eq(capture.captureId, recordId));
      });

      // Return a simple success response instead of the changeLog
      return { success: true };
    }),
  updateCaptureTime: protectedProcedure
    .input(
      z.object({
        captureId: z.number(),
        newCaptureTime: z
          .string()
          .length(3)
          .regex(/^\d{3}$/)
          .refine((val) => {
            const padded = val + "0";
            const hours = parseInt(padded.slice(0, 2), 10);
            const minutes = parseInt(padded.slice(2, 4), 10);
            return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
          }, "Invalid time"),
        justification: z.string().trim().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { captureId, newCaptureTime, justification } = input;

      return await db.transaction(async (tx) => {
        const originalCapture = await tx
          .select()
          .from(capture)
          //@ts-expect-error drizzle bigint typing mismatch for captureId filter
          .where(eq(capture.captureId, captureId));

        if (!originalCapture || originalCapture.length === 0) {
          throw new Error("Capture not found");
        }

        const backupCapture = {
          ...originalCapture[0],
          captureId: undefined,
          originalId: captureId,
          hasChanged: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        //@ts-expect-error backup row can include nullable fields from legacy records
        const [backupRecord] = await tx
          .insert(capture)
          .values(backupCapture)
          .returning({ backupId: capture.captureId });

        if (!backupRecord?.backupId) {
          throw new Error("Failed to create capture backup record");
        }

        await tx
          .update(capture)
          .set({
            captureTime: newCaptureTime,
            updatedAt: sql`now()`,
          })
          //@ts-expect-error drizzle bigint typing mismatch for captureId filter
          .where(eq(capture.captureId, captureId));

        await tx.insert(changeLog).values({
          table: "capture",
          oldRecordId: captureId,
          newRecordId: Number(backupRecord.backupId),
          isDeleted: false,
          justification,
          createdAt: sql`now()`,
        });

        return { captureId, captureTime: newCaptureTime };
      });
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
        // Insert backup record and capture its ID
        const [backupRecord] = await tx
          .insert(capture)
          .values(backupCapture)
          .returning({ backupId: capture.captureId });

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
          newRecordId: Number(backupRecord.backupId),
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
        .orderBy(desc(effort.dateEffort));
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

  // ── Lookup procedures for forms ──

  getProtocolVariables: publicProcedure
    .input(z.object({ protocolId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const pvRows = await db
        .select({
          captureVariableId: protocolVars.captureVariableId,
          order: protocolVars.order,
          mandatory: protocolVars.mandatory,
          name: captureVariableRegister.name,
          portugueseLabel: captureVariableRegister.portugueseLabel,
          type: captureVariableRegister.type,
          unit: captureVariableRegister.unit,
          precision: captureVariableRegister.precision,
          duplicable: captureVariableRegister.duplicable,
          special: captureVariableRegister.special,
        })
        .from(protocolVars)
        .leftJoin(
          captureVariableRegister,
          eq(
            protocolVars.captureVariableId,
            captureVariableRegister.captureVariableId
          )
        )
        .where(eq(protocolVars.protocolId, input.protocolId))
        .orderBy(protocolVars.order);

      // Fetch categorical options for all variables in this protocol
      const variableIds = pvRows
        .map((r) => r.captureVariableId)
        .filter((id): id is number => id !== null);

      let options: {
        captureCategoricalOptionId: number;
        captureVariableId: number;
        valueOama: string;
        description: string;
      }[] = [];

      // Fetch universal NA/U options
      const universalOpts = await getUniversalNaValueOptions();

      if (variableIds.length > 0) {
        options = (
          await db
            .select({
              captureCategoricalOptionId:
                captureCategoricalOptions.captureCategoricalOptionId,
              captureVariableId: captureCategoricalOptions.captureVariableId,
              valueOama: captureCategoricalOptions.valueOama,
              description: captureCategoricalOptions.description,
            })
            .from(captureCategoricalOptions)
            .where(
              and(
                inArray(
                  captureCategoricalOptions.captureVariableId,
                  variableIds
                ),
                eq(captureCategoricalOptions.hasChanged, false)
              )
            )
        ).map((o) => ({
          captureCategoricalOptionId: Number(o.captureCategoricalOptionId),
          captureVariableId: Number(o.captureVariableId),
          valueOama: o.valueOama,
          description: o.description,
        }));
      }

      const variables = pvRows.map((v) => {
        const varOpts = options.filter(
          (o) => o.captureVariableId === Number(v.captureVariableId)
        );
        // Add universal NA/U options to categorical variables
        const existingValues = new Set(varOpts.map((o) => o.valueOama));
        const mergedOpts = [
          ...varOpts,
          ...universalOpts
            .filter((u) => !existingValues.has(u.value))
            .map((u) => ({
              captureCategoricalOptionId: u.optionId,
              captureVariableId: Number(v.captureVariableId),
              valueOama: u.value,
              description: u.description,
            })),
        ];
        return {
          ...v,
          captureVariableId: Number(v.captureVariableId),
          duplicable: Number(v.duplicable),
          special: Number(v.special ?? 0),
          options: mergedOpts,
        };
      });

      const isMandatory = (v: (typeof variables)[number]) =>
        Number(v.mandatory) === 1;

      const FINALIZATION_NAMES = ["age_wrp", "age_criteria", "sex", "sex_criteria", "status"];
      const isFinalization = (v: (typeof variables)[number]) =>
        FINALIZATION_NAMES.includes(v.name ?? "");

      // Sort finalization variables in the defined order
      const finalizationVars = FINALIZATION_NAMES
        .map((name) => variables.find((v) => !isMandatory(v) && v.name === name))
        .filter((v): v is (typeof variables)[number] => v !== undefined);

      return {
        mandatory: variables.filter((v) => isMandatory(v)),
        finalization: finalizationVars,
        optional: variables.filter((v) => !isMandatory(v) && !isFinalization(v)),
      };
    }),

  getAvailableBands: publicProcedure
    .input(
      z.object({
        bandSize: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [eq(bands.used, 0)];
      if (input.bandSize) {
        conditions.push(eq(bands.bandSize, input.bandSize));
      }
      return await db
        .select({
          bandId: bands.bandId,
          bandNumber: bands.bandNumber,
          bandSize: bands.bandSize,
        })
        .from(bands)
        .where(and(...conditions))
        .orderBy(bands.bandNumber);
    }),

  getBandSizes: publicProcedure.query(async () => {
    const sizes = await db
      .select({
        bandSize: bands.bandSize,
      })
      .from(bands)
      .groupBy(bands.bandSize)
      .orderBy(bands.bandSize);
    return sizes.map((s) => s.bandSize);
  }),

  // ── Create mutation ──

  createCapture: protectedProcedure
    .input(createCaptureSchema)
    .mutation(async ({ input }) => {
      const {
        captureTime,
        captureCode,
        netEffId,
        banderId,
        bandId,
        sppId,
        notes,
        categoricalValues,
        continuousValues,
      } = input;

      return await db.transaction(async (tx) => {
        // 1. Insert capture
        const [newCapture] = await tx
          .insert(capture)
          .values({
            captureTime,
            captureCode,
            netEffId,
            banderId,
            bandId,
            sppId,
            notes,
            hasChanged: false,
            createdAt: sql`now()`,
          })
          .returning({ captureId: capture.captureId });

        if (!newCapture) {
          throw new Error("Failed to create capture");
        }

        const captureId = newCapture.captureId;

        // 2. Mark band as used for new captures
        if (captureCode === "N") {
          await tx
            .update(bands)
            .set({ used: 1, updatedAt: sql`now()` })
            .where(eq(bands.bandId, bandId));
        }

        // 3. Insert categorical values
        for (const cv of categoricalValues) {
          await tx.insert(captureCategoricalValues).values({
            captureId,
            captureVariableId: cv.captureVariableId,
            captureCategoricalOptionId: cv.captureCategoricalOptionId,
            hasChanged: false,
            createdAt: sql`now()`,
          });
        }

        // 4. Insert continuous values
        for (const cv of continuousValues) {
          await tx.insert(captureContinuousValues).values({
            captureId,
            captureVariableId: cv.captureVariableId,
            value: cv.value,
            hasChanged: false,
            createdAt: sql`now()`,
          });
        }

        return { captureId };
      });
    }),
});
