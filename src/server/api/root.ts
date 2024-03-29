import { createTRPCRouter } from "@/server/api/trpc";
import { exampleRouter } from "@/server/api/routers/example";
import { testRouter } from "@/server/api/routers/test";
import { bandsRouter } from "@/server/api/routers/bands";
import { bandersRouter } from "@/server/api/routers/banders";
import { sppRouter } from "@/server/api/routers/spp";
import { capturesRouter } from "@/server/api/routers/captures";
import { effortRouter } from "./routers/effort";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  test: testRouter,
  bands: bandsRouter,
  banders: bandersRouter,
  spp: sppRouter,
  captures: capturesRouter,
  efforts: effortRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
