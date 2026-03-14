import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import db from "@/db";
import { capturePhotos, changeLog } from "drizzle/schema";
import { deleteFile } from "@/server/services/googleDrive";

export const photosRouter = createTRPCRouter({
  getPhotosByCapture: publicProcedure
    .input(
      z.object({
        captureId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const photos = await db
        .select({
          photoId: capturePhotos.photoId,
          captureId: capturePhotos.captureId,
          fileName: capturePhotos.fileName,
          originalFileName: capturePhotos.originalFileName,
          position: capturePhotos.position,
          driveFileId: capturePhotos.driveFileId,
          mimeType: capturePhotos.mimeType,
          fileSize: capturePhotos.fileSize,
          createdAt: capturePhotos.createdAt,
        })
        .from(capturePhotos)
        .where(
          and(
            eq(capturePhotos.captureId, input.captureId),
            eq(capturePhotos.hasChanged, false)
          )
        );

      return photos.map((p) => ({
        ...p,
        photoId: Number(p.photoId),
      }));
    }),

  deletePhoto: protectedProcedure
    .input(
      z.object({
        photoId: z.number(),
        justification: z.string().trim().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { photoId, justification } = input;

      const photo = await db
        .select()
        .from(capturePhotos)
        //@ts-expect-error drizzle bigint typing mismatch
        .where(eq(capturePhotos.photoId, photoId));

      if (!photo[0]) {
        throw new Error("Photo not found");
      }

      // Delete from Google Drive
      try {
        await deleteFile(photo[0].driveFileId);
      } catch (e) {
        console.error("Failed to delete from Drive:", e);
      }

      // Soft-delete in database
      await db
        .update(capturePhotos)
        .set({
          hasChanged: true,
          updatedAt: sql`now()`,
        })
        //@ts-expect-error drizzle bigint typing mismatch
        .where(eq(capturePhotos.photoId, photoId));

      // Log the change
      await db.insert(changeLog).values({
        table: "capture_photos",
        oldRecordId: photoId,
        newRecordId: null,
        isDeleted: true,
        justification,
        createdAt: sql`now()`,
      });

      return { success: true };
    }),
});
