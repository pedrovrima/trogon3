LTER TABLE `BANDS` MODIFY COLUMN `used` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `BANDS` MODIFY COLUMN `created_at` datetime NOT NULL DEFAULT 'current_timestamp()';--> statement-breakpoint
ALTER TABLE `BAND_STRING_REGISTER` MODIFY COLUMN `created_at` datetime NOT NULL DEFAULT 'current_timestamp()';--> statement-breakpoint
