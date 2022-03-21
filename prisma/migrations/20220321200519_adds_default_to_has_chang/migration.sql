/*
  Warnings:

  - You are about to alter the column `has_changed` on the `BANDER_REGISTER` table. The data in that column could be lost. The data in that column will be cast from `Binary(1)` to `TinyInt`.
  - You are about to alter the column `has_changed` on the `EFFORT` table. The data in that column could be lost. The data in that column will be cast from `Binary(1)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `BANDER_REGISTER` MODIFY `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `BANDS` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `EFFORT` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `EFFORT_CATEGORICAL_OPTIONS` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `EFFORT_CATEGORICAL_VALUES` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `EFFORT_CONTINUOUS_VALUES` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `EFFORT_SUMMARIES` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `EFFORT_TIME` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `NET_EFFORT` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `NET_OC` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `NET_REGISTER` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PROTOCOL_REGISTER` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PROTOCOL_VARS` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `SPP_REGISTER` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `STATION_REGISTER` MODIFY `has_changed` BOOLEAN NOT NULL DEFAULT false;
