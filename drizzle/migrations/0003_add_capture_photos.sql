CREATE TABLE IF NOT EXISTS "capture_photos" (
  "photo_id" BIGSERIAL PRIMARY KEY,
  "capture_id" BIGINT NOT NULL REFERENCES "capture"("capture_id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  "file_name" VARCHAR(255) NOT NULL,
  "original_file_name" VARCHAR(255) NOT NULL,
  "position" VARCHAR(50) NOT NULL,
  "drive_file_id" VARCHAR(100) NOT NULL,
  "drive_folder_id" VARCHAR(100) NOT NULL,
  "mime_type" VARCHAR(50) NOT NULL,
  "file_size" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ,
  "has_changed" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX "capture_photos_capture_id" ON "capture_photos" ("capture_id");
CREATE UNIQUE INDEX "capture_photos_drive_file_id" ON "capture_photos" ("drive_file_id");
