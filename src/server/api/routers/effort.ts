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
  bandStringRegister,
  sppRegister,
  changeLog,
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
      console.log(input);
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
          eq(effort.effortId, effortSummaries.effortId)
        )
        .groupBy(
          effort.effortId,
          stationRegister.stationCode,
          protocolRegister.protocolCode,
          effortSummaries.effortSummaryId,
          stationRegister.stationId
        );

      const effortCaptures = await db
        .select({
          captureId: capture.captureId,
          captureTime: sql<string>`CASE 
            WHEN ${capture.captureTime} IS NULL OR ${capture.captureTime} = 'NA' 
            THEN NULL 
            ELSE TO_CHAR(
              TO_TIMESTAMP(${capture.captureTime} || '0', 'HH24MI0')::TIME,
              'HH24:MI'
            ) 
          END`,
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
        .where(
          and(eq(netEffort.effortId, effortId), eq(capture.hasChanged, false))
        );

      return { ...effortData[0], captures: effortCaptures };
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

      // Get the original summary record
      const originalSummary = await db
        .select()
        .from(effortSummaries)
        .where(eq(effortSummaries.effortId, effortId));

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
        // Insert backup record
        await tx.insert(effortSummaries).values(backupSummary);

        // Update original record
        await tx
          .update(effortSummaries)
          .set({
            newBands: newSummary.newBands,
            recapture: newSummary.recapture,
            unbanded: newSummary.unbanded,
            updatedAt: sql`now()`,
          })
          .where(eq(effortSummaries.effortId, effortId));

        // Log the change
        await tx.insert(changeLog).values({
          table: "effort_summaries",
          oldRecordId: Number(originalSummary[0].effortSummaryId),
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
});
