import { stationRegister } from "drizzle/schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import db from "@/db";

export const stationRouter = createTRPCRouter({
  getStations: publicProcedure.query(async () => {
    const stations = await db
      .select({
        id: stationRegister.stationId,
        name: stationRegister.stationName,
        code: stationRegister.stationCode,
      })
      .from(stationRegister);
    return stations;
  }),
});
