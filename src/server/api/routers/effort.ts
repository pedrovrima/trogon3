import { eq, sql, inArray, desc, like, and } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
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
  netRegister,
  protocolRegister,
  stationRegister,
  capture,
  bands,
  sppRegister,
  changeLog,
  banderRegister,
} from "drizzle/schema";
import { z } from "zod";

const createEffortSchema = z.object({
  dateEffort: z.string(), // ISO date string
  stationId: z.number().int().positive(),
  protocolId: z.number().int().positive(),
  notes: z.string().max(250).default(""),
  nets: z.array(
    z.object({
      netId: z.number().int().positive(),
      openCloseTimes: z.array(
        z.object({
          openTime: z.string(), // ISO datetime or HH:MM
          closeTime: z.string(),
        })
      ).min(1),
    })
  ).min(1),
  effortVariables: z.array(
    z.object({
      effortVariableId: z.number().int().positive(),
      effortTimeId: z.number().int().positive(),
      type: z.enum(["categorical", "continuous"]),
      // For categorical: the option ID
      optionId: z.number().int().positive().optional(),
      // For continuous: the raw value
      value: z.string().max(6).optional(),
    })
  ).default([]),
  summary: z.object({
    newBands: z.number().int().min(0),
    recapture: z.number().int().min(0),
    unbanded: z.number().int().min(0),
  }),
  clientId: z.string().uuid().optional(), // For mobile idempotency
});

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
      .leftJoin(
        effortSummaries,
        and(
          eq(effort.effortId, effortSummaries.effortId),
          eq(effortSummaries.hasChanged, false)
        )
      )
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
          and(
            eq(effort.effortId, effortSummaries.effortId),
            eq(effortSummaries.hasChanged, false)
          )
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
          protocolId: effort.protocolId,
          totalNetHours: sql<number>`ROUND(EXTRACT(EPOCH FROM SUM(age(${netOc.closeTime},${netOc.openTime}))) / 3600.0, 2)`,
          summary_new: effortSummaries.newBands,
          summary_recapture: effortSummaries.recapture,
          summary_unbanded: effortSummaries.unbanded,
          notes: effort.notes,
          openTime: sql<string>`CASE 
            WHEN MIN(${netOc.openTime}) IS NULL OR MIN(${netOc.openTime})::text = 'NA' 
            THEN NULL 
            ELSE TO_CHAR(MIN(${netOc.openTime}), 'HH24:MI') 
          END`,
          closeTime: sql<string>`CASE 
            WHEN MAX(${netOc.closeTime}) IS NULL OR MAX(${netOc.closeTime})::text = 'NA' 
            THEN NULL 
            ELSE TO_CHAR(MAX(${netOc.closeTime}), 'HH24:MI') 
          END`,
          stationId: stationRegister.stationId,
          hasNANet: sql<boolean>`BOOL_OR(${netRegister.netNumber} = 'NA')`,
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
        .leftJoin(netRegister, eq(netEffort.netId, netRegister.netId))
        .leftJoin(netOc, eq(netEffort.netEffId, netOc.netEffId))
        .leftJoin(
          effortSummaries,
          and(
            eq(effort.effortId, effortSummaries.effortId),
            eq(effortSummaries.hasChanged, false)
          )
        )
        .groupBy(
          effort.effortId,
          stationRegister.stationCode,
          protocolRegister.protocolCode,
          effort.protocolId,
          effortSummaries.effortSummaryId,
          stationRegister.stationId
        );

      const effortCaptures = await db
        .select({
          captureId: capture.captureId,
          captureTime: sql<string>`CASE
            WHEN ${capture.captureTime} IS NULL OR LENGTH(${capture.captureTime}) < 3 OR ${capture.captureTime} = 'NA'
            THEN NULL
            WHEN SUBSTRING(${capture.captureTime} || '0' FROM 1 FOR 2)::int > 23
              OR SUBSTRING(${capture.captureTime} || '0' FROM 3 FOR 2)::int > 59
            THEN NULL
            ELSE TO_CHAR(
              TO_TIMESTAMP(${capture.captureTime} || '0', 'HH24MI0')::TIME,
              'HH24:MI'
            )
          END`,
          bandNumber: bands.bandNumber,
          bandSize: bands.bandSize,
          captureCode: capture.captureCode,
          sppCode: sppRegister.sciCode,
          sppName: sql<string>`CONCAT(${sppRegister.genus}, ' ', ${sppRegister.species})`,
        })
        .from(capture)
        .leftJoin(netEffort, eq(capture.netEffId, netEffort.netEffId))
        .leftJoin(bands, eq(capture.bandId, bands.bandId))
        .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId))
        .where(
          and(eq(netEffort.effortId, effortId), eq(capture.hasChanged, false))
        );

      const ed = effortData[0];
      return { ...ed, protocolId: Number(ed?.protocolId), captures: effortCaptures };
    }),
  updateEffortSummary: protectedProcedure
    .input(
      z.object({
        effortId: z.number(),
        newSummary: z.object({
          newBands: z.number(),
          recapture: z.number(),
          unbanded: z.number(),
        }),
        justification: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { effortId, newSummary, justification } = input;

      // Get the original summary record (exclude backups)
      const originalSummary = await db
        .select()
        .from(effortSummaries)
        .where(
          and(
            eq(effortSummaries.effortId, effortId),
            eq(effortSummaries.hasChanged, false)
          )
        );

      if (!originalSummary || originalSummary.length === 0) {
        throw new Error("Effort summary not found");
      }

      // Create backup copy with original data
      const backupSummary = {
        ...originalSummary[0],
        effortSummaryId: undefined, // Let the DB assign a new ID
        originalId: originalSummary[0].effortSummaryId, // Reference to the original record
        hasChanged: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return await db.transaction(async (tx) => {
        // Insert backup record and capture its ID
        const [backupRecord] = await tx
          .insert(effortSummaries)
          .values(backupSummary)
          .returning({ backupId: effortSummaries.effortSummaryId });

        // Update original record
        await tx
          .update(effortSummaries)
          .set({
            newBands: newSummary.newBands,
            recapture: newSummary.recapture,
            unbanded: newSummary.unbanded,
            updatedAt: sql`now()`,
          })
          .where(eq(effortSummaries.effortSummaryId, originalSummary[0].effortSummaryId));

        // Log the change
        await tx.insert(changeLog).values({
          table: "effort_summaries",
          oldRecordId: Number(backupRecord.backupId),
          newRecordId: Number(originalSummary[0].effortSummaryId),
          isDeleted: false,
          justification,
          createdAt: sql`now()`,
        });
      });
    }),
  addNANet: protectedProcedure
    .input(z.object({ effortId: z.number(), stationId: z.bigint() }))
    .mutation(async ({ input }) => {
      const { effortId, stationId } = input;

      const stationNANet = await db
        .select({
          netId: netRegister.netId,
        })
        .from(netRegister)
        .where(
          and(
            eq(netRegister.stationId, stationId),
            eq(netRegister.netNumber, "NA")
          )
        );

      console.log(stationNANet);

      if (!stationNANet) {
        throw new Error("Net not found");
      }

      const stationNANetId = stationNANet[0].netId;

      console.log(stationNANetId);

      await db.insert(netEffort).values({
        effortId,
        netId: stationNANetId,
        createdAt: sql`now()`,
        hasChanged: false,
      });
    }),

  // ── Lookup procedures for forms ──

  getProtocols: publicProcedure.query(async () => {
    return await db
      .select({
        protocolId: protocolRegister.protocolId,
        protocolCode: protocolRegister.protocolCode,
        protocolDescription: protocolRegister.protocolDescription,
      })
      .from(protocolRegister)
      .where(eq(protocolRegister.hasChanged, false));
  }),

  getNetsByStation: publicProcedure
    .input(z.object({ stationId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return await db
        .select({
          netId: netRegister.netId,
          netNumber: netRegister.netNumber,
        })
        .from(netRegister)
        .where(
          and(
            eq(netRegister.stationId, input.stationId),
            eq(netRegister.hasChanged, false)
          )
        )
        .orderBy(netRegister.netNumber);
    }),

  getEffortVariables: publicProcedure.query(async () => {
    const variables = await db
      .select({
        effortVariableId: effortVariableRegister.effortVariableId,
        name: effortVariableRegister.name,
        portugueseLabel: effortVariableRegister.portugueseLabel,
        type: effortVariableRegister.type,
        unit: effortVariableRegister.unit,
      })
      .from(effortVariableRegister)
      .where(eq(effortVariableRegister.hasChanged, false));

    const categoricalOptions = await db
      .select({
        effortCategoricalOptionId:
          effortCategoricalOptions.effortCategoricalOptionId,
        effortVariableId: effortCategoricalOptions.effortVariableId,
        valueOama: effortCategoricalOptions.valueOama,
        description: effortCategoricalOptions.description,
      })
      .from(effortCategoricalOptions)
      .where(eq(effortCategoricalOptions.hasChanged, false));

    const timePeriods = await db
      .select({
        effortTimeId: effortTime.effortTimeId,
        description: effortTime.description,
        portugueseLabel: effortTime.portugueseLabel,
      })
      .from(effortTime)
      .where(eq(effortTime.hasChanged, false));

    return {
      variables: variables.map((v) => ({
        ...v,
        effortVariableId: Number(v.effortVariableId),
        options: categoricalOptions
          .filter(
            (o) => Number(o.effortVariableId) === Number(v.effortVariableId)
          )
          .map((o) => ({
            ...o,
            effortCategoricalOptionId: Number(o.effortCategoricalOptionId),
            effortVariableId: Number(o.effortVariableId),
          })),
      })),
      timePeriods: timePeriods.map((t) => ({
        ...t,
        effortTimeId: Number(t.effortTimeId),
      })),
    };
  }),

  getBanders: publicProcedure.query(async () => {
    return await db
      .select({
        banderId: banderRegister.banderId,
        name: banderRegister.name,
        code: banderRegister.code,
      })
      .from(banderRegister)
      .where(eq(banderRegister.hasChanged, false))
      .orderBy(banderRegister.code);
  }),

  // ── Create mutation ──

  createEffort: protectedProcedure
    .input(createEffortSchema)
    .mutation(async ({ input }) => {
      const {
        dateEffort,
        stationId,
        protocolId,
        notes,
        nets,
        effortVariables,
        summary,
      } = input;

      return await db.transaction(async (tx) => {
        // 1. Insert effort
        const [newEffort] = await tx
          .insert(effort)
          .values({
            dateEffort,
            stationId,
            protocolId,
            notes,
            hasChanged: false,
            createdAt: sql`now()`,
          })
          .returning({ effortId: effort.effortId });

        if (!newEffort) {
          throw new Error("Failed to create effort");
        }

        const effortId = newEffort.effortId;

        // 2. Insert net efforts and their open/close times
        for (const net of nets) {
          const [newNetEffort] = await tx
            .insert(netEffort)
            .values({
              effortId,
              netId: net.netId,
              hasChanged: false,
              createdAt: sql`now()`,
            })
            .returning({ netEffId: netEffort.netEffId });

          if (!newNetEffort) {
            throw new Error("Failed to create net effort");
          }

          for (const oc of net.openCloseTimes) {
            await tx.insert(netOc).values({
              netEffId: newNetEffort.netEffId,
              openTime: oc.openTime,
              closeTime: oc.closeTime,
              hasChanged: false,
              createdAt: sql`now()`,
            });
          }
        }

        // 3. Insert effort variables
        for (const variable of effortVariables) {
          if (variable.type === "categorical" && variable.optionId) {
            await tx.insert(effortCategoricalValues).values({
              effortId,
              effortVariableId: variable.effortVariableId,
              effortCategoricalOptionId: variable.optionId,
              effortTimeId: variable.effortTimeId,
              hasChanged: false,
              createdAt: sql`now()`,
            });
          } else if (variable.type === "continuous" && variable.value) {
            await tx.insert(effortContinuousValues).values({
              effortId,
              effortVariableId: variable.effortVariableId,
              value: variable.value,
              effortTimeId: variable.effortTimeId,
              hasChanged: false,
              createdAt: sql`now()`,
            });
          }
        }

        // 4. Insert effort summary
        await tx.insert(effortSummaries).values({
          effortId,
          newBands: summary.newBands,
          recapture: summary.recapture,
          unbanded: summary.unbanded,
          hasChanged: false,
          createdAt: sql`now()`,
        });

        return { effortId };
      });
    }),
});
