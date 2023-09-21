import { z } from "zod";
import { eq, sql, and, inArray } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

import db from "@/db";
import { checklistDetectionTypes } from "drizzle/schema";

interface LastInsertIdResult {
  lastId: number;
}

export const checklistRouter = createTRPCRouter({
  getChecklistActivities: publicProcedure.query(async () => {
    const checklistActivities = await db
      .select({
        id: checklistDetectionTypes.checklistDetectionTypesId,
        code: checklistDetectionTypes.detectionTypeCode,
        name: checklistDetectionTypes.detectionTypeName,
      })
      .from(checklistDetectionTypes);

    return checklistActivities;
  }),
 
});
