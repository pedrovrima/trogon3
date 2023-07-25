import { z } from "zod";
import { eq, sql, and, inArray } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import db from "@/db";
import { bandStringRegister, bands, capture } from "drizzle/schema";
import { TRPCError } from "@trpc/server";

interface LastInsertIdResult {
  lastId: number;
}

export const bandsRouter = createTRPCRouter({
  getBandCount: publicProcedure.query(async () => {
    const totalBands = await db

      .select({
        totalBands: sql<number>`count(${bands.bandId})`,
      })
      .from(bands);

    console.log(totalBands);
    const _bandCount = await db
      .select({
        bandSize: bandStringRegister.size,
        totalCaptures: sql<number | string>`count(${capture.captureId})`,
      })
      .from(bandStringRegister)
      .leftJoin(bands, eq(bandStringRegister.stringId, bands.stringId))
      .leftJoin(capture, eq(bands.bandId, capture.bandId))
      .groupBy(bands.bandId, bandStringRegister.size);

    const bandCount = _bandCount.map((band) => {
      let size = band.bandSize;
      if (band.bandSize === "D" || band.bandSize === "2D") {
        size = "D/2D";
      }
      return { ...band, bandSize: size };
    });

    const bandsWithoutCaptures = bandCount.filter(
      (band) => band.totalCaptures === "0"
    );
    const totalBandsPerSize = bandCount.reduce(
      (acc: { bandSize: string; totalBands: number }[], band) => {
        const { bandSize } = band;
        const bandSizeIndex = acc.findIndex(
          (band) => band.bandSize === bandSize
        );
        if (bandSize !== "U") {
          if (bandSizeIndex === -1) {
            acc.push({ bandSize, totalBands: 1 });
          } else {
            const acd = acc[bandSizeIndex] as {
              bandSize: string;
              totalBands: number;
            };
            acd.totalBands += 1;
            acc[bandSizeIndex] = acd;
          }
        }
        return acc;
      },
      []
    );

    const bandsSummary = totalBandsPerSize.map((band) => {
      const { bandSize: _bandSize, totalBands } = band;
      const bandSize = _bandSize;

      const noCaptures = bandsWithoutCaptures.filter(
        (band) => band.bandSize === bandSize
      );
      return {
        bandSize,
        totalBands,
        noCaptures: noCaptures.length,
      };
    });

    const sorted = bandsSummary.sort((a, b) => {
      return a.bandSize.localeCompare(b.bandSize);
    });
    console.log(sorted);

    return sorted;
  }),
  createBands: publicProcedure
    .input(
      z.object({
        bandSize: z.string().min(1).max(2),
        initialBandNumber: z.string().regex(/^[0-9]*$/),
        finalBandNumber: z.string().regex(/^[0-9]*$/),
      })
    )
    .mutation(async ({ input }) => {
      const { initialBandNumber, finalBandNumber, bandSize } = input;

      const initial = parseInt(initialBandNumber);
      const final = parseInt(finalBandNumber);
      const bandNumberSize = initialBandNumber.length;

      if (!initial || !final) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Número Inicial e Final devem ser números inteiros",
        });
      }
      if (initial > final) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Número Inicial deve ser menor ou igual que o Número Final",
        });
      }
      if (final - initial >= 50) {
        throw new Error(
          "Número de anilhas inseridas deve ser menor que 50 por vez"
        );
      }

      const _bands = [] as string[];
      for (let i = initial; i <= final; i++) {
        const bandNumber = i.toString().padStart(bandNumberSize, "0");
        _bands.push(bandNumber);
      }

      const checkBands = await db
        .select()
        .from(bands)
        .leftJoin(
          bandStringRegister,
          eq(bands.stringId, bandStringRegister.stringId)
        )
        .where(
          and(
            inArray(bands.bandNumber, _bands),
            eq(bandStringRegister.size, bandSize)
          )
        )
        .execute();

      if (checkBands.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Anilhas já cadastradas no sistema",
        });
      }
      await db.transaction(async (trx) => {
        //eslint-disable-next-line
        const bandRegister = await trx.execute(
          sql`insert into ${bandStringRegister} (size, first_band) values (${bandSize}, ${initialBandNumber});`
        );

        const lastIdQuery = await trx.execute(
          sql`SELECT LAST_INSERT_ID() as lastId;`
        );

        const result = lastIdQuery.rows as LastInsertIdResult[];

        //eslint-disable-next-line
        let id: number;
        if (result[0]) {
          id = result[0].lastId;
        }

        const bandsArray = _bands.map((bandNumber) => {
          return {
            stringId: id,
            bandNumber,
            used: 0,
            hasChanged: 0,
          };
        });
        console.log(bandsArray);

        await trx.insert(bands).values(bandsArray);
      });
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
