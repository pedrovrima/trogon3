/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,code]` on the table `BANDER_REGISTER` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `BAND_STRING_REGISTER` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `CAPTURE` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `EFFORT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `PROTOCOL_REGISTER` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `STATION_REGISTER` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BANDER_REGISTER` ADD COLUMN `organization_id` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `BAND_STRING_REGISTER` ADD COLUMN `organization_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `CAPTURE` ADD COLUMN `organization_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `EFFORT` ADD COLUMN `organization_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `PROTOCOL_REGISTER` ADD COLUMN `organization_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `STATION_REGISTER` ADD COLUMN `organization_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `ORGANIZATION` (
    `organization_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`organization_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `BANDER_REGISTER_organization_id_code_key` ON `BANDER_REGISTER`(`organization_id`, `code`);

-- AddForeignKey
ALTER TABLE `BANDER_REGISTER` ADD CONSTRAINT `BANDER_REGISTER_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `ORGANIZATION`(`organization_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `BAND_STRING_REGISTER` ADD CONSTRAINT `BAND_STRING_REGISTER_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `ORGANIZATION`(`organization_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE` ADD CONSTRAINT `CAPTURE_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `ORGANIZATION`(`organization_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT` ADD CONSTRAINT `EFFORT_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `ORGANIZATION`(`organization_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `PROTOCOL_REGISTER` ADD CONSTRAINT `PROTOCOL_REGISTER_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `ORGANIZATION`(`organization_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `STATION_REGISTER` ADD CONSTRAINT `STATION_REGISTER_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `ORGANIZATION`(`organization_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
