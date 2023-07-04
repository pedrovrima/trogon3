import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import db from "@/db";
import { banderRegister, capture } from "drizzle/schema";

export const bandersRouter = createTRPCRouter({
  getBanders: publicProcedure.query(async () => {
    const banders = await db
      .select({
        name: banderRegister.name,
        code: banderRegister.code,
        email: banderRegister.email,
        totalCaptures: sql<number>`count(${capture.banderId})`,
      })
      .from(banderRegister)
      .leftJoin(capture, eq(capture.banderId, banderRegister.banderId))
      .groupBy(banderRegister.code);

    return banders.filter((bander) => bander.code !== "NA");
  }),
  createBander: publicProcedure
    .input(
      z.object({
        name: z.string(),
        code: z.string().length(3, { message: "Código deve ter 3 caracteres" }),
        email: z.string().email({ message: "Email inválido" }),
        phone: z.string(),
        notes: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(banderRegister).values(input).execute();
    }),
});
