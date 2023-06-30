import { z } from "zod";
import { eq, sql, and, inArray } from "drizzle-orm";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import db from "@/db";
import { bandStringRegister, bands } from "drizzle/schema";
import { TRPCError } from "@trpc/server";

export const bandsRouter = createTRPCRouter({
  createBands: publicProcedure
    .input(
      z.object({
        bandSize: z.string().min(1).max(2),
        initialBandNumber: z.string().regex(/^[0-9]*$/),
        finalBandNumber: z.string().regex(/^[0-9]*$/),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { initialBandNumber, finalBandNumber, bandSize } = input;

        const initial = parseInt(initialBandNumber);
        const final = parseInt(finalBandNumber);
        const bandNumberSize = initialBandNumber.length;

        if (!initial || !final) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "initialBandNumber and finalBandNumber must be numbers",
          });
        }
        if (initial > final) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Numero inicial debe ser menor ou igual ao numero final",
          });
        }
        if (final - initial >= 50) {
          throw new Error("You can only create 50 bands at a time");
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
            message: "Some bands already exist",
          });
        }
        // await db.transaction(async (trx) => {
        //   //eslint-disable-next-line
        //   const bandRegister = await trx.execute(
        //     sql`insert into ${bandStringRegister} (size, first_band) values (${bandSize}, ${initialBandNumber});`
        //   );

        //   const lastId: { "LAST_INSERT_ID()": number }[][] = await trx.execute(
        //     sql`SELECT LAST_INSERT_ID();`
        //   );

        //   const bandsArray = _bands.map((bandNumber) => {
        //     return {
        //       stringId: lastId[0][0]["LAST_INSERT_ID()"],
        //       bandNumber,
        //       used: 0,
        //       hasChanged: 0,
        //     };
        //   });
        //   console.log(bandsArray);

        //   await trx.insert(bands).values(bandsArray);
        // });
      } catch (e) {
        throw new TRPCError(e);
      }
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
