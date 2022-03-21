-- CreateTable
CREATE TABLE `BANDER_REGISTER` (
    `bander_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `code` VARCHAR(3) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `phone` VARCHAR(14) NOT NULL,
    `notes` VARCHAR(250) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BINARY(1) NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`bander_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BANDS` (
    `band_id` INTEGER NOT NULL AUTO_INCREMENT,
    `string_id` INTEGER NOT NULL,
    `band_number` VARCHAR(45) NOT NULL,
    `used` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` TINYINT NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `string_id`(`string_id`),
    PRIMARY KEY (`band_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BAND_STRING_REGISTER` (
    `string_id` INTEGER NOT NULL AUTO_INCREMENT,
    `size` VARCHAR(2) NOT NULL,
    `first_band` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL DEFAULT false,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`string_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CAPTURE` (
    `capture_id` INTEGER NOT NULL AUTO_INCREMENT,
    `capture_time` VARCHAR(3) NULL,
    `capture_code` VARCHAR(1) NOT NULL,
    `notes` VARCHAR(250) NULL,
    `net_eff_id` INTEGER NOT NULL,
    `bander_id` INTEGER NOT NULL,
    `band_id` INTEGER NOT NULL,
    `spp_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `updated_at` DATETIME(0) NULL,
    `original_id` INTEGER NULL,

    INDEX `band_id`(`band_id`),
    INDEX `bander_id`(`bander_id`),
    INDEX `net_eff_id`(`net_eff_id`),
    INDEX `spp_id`(`spp_id`),
    PRIMARY KEY (`capture_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CAPTURE_CATEGORICAL_OPTIONS` (
    `capture_categorical_option_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NOT NULL,
    `value_oama` VARCHAR(45) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `capture_variable_id` INTEGER NOT NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `capture_variable_id`(`capture_variable_id`),
    PRIMARY KEY (`capture_categorical_option_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CAPTURE_CATEGORICAL_VALUES` (
    `capture_categorical_values_id` INTEGER NOT NULL AUTO_INCREMENT,
    `capture_id` INTEGER NOT NULL,
    `capture_categorical_option_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,
    `capture_variable_id` INTEGER NOT NULL,

    INDEX `CAPTURE_CATEGORICAL_VALUES_capture_variable_id_foreign_idx`(`capture_variable_id`),
    INDEX `capture_categorical_option_id`(`capture_categorical_option_id`),
    INDEX `capture_id`(`capture_id`),
    PRIMARY KEY (`capture_categorical_values_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CAPTURE_CONTINUOUS_VALUES` (
    `capture_continuous_values_id` INTEGER NOT NULL AUTO_INCREMENT,
    `capture_id` INTEGER NOT NULL,
    `value` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,
    `capture_variable_id` INTEGER NOT NULL,

    INDEX `CAPTURE_CONTINUOUS_VALUES_capture_variable_id_foreign_idx`(`capture_variable_id`),
    INDEX `capture_id`(`capture_id`),
    PRIMARY KEY (`capture_continuous_values_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CAPTURE_FLAG` (
    `flag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `capture_id` INTEGER NOT NULL,
    `note` TEXT NULL,

    INDEX `capture_id`(`capture_id`),
    PRIMARY KEY (`flag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CAPTURE_VARIABLE_REGISTER` (
    `capture_variable_id` INTEGER NOT NULL,
    `name` VARCHAR(45) NOT NULL,
    `description` TEXT NOT NULL,
    `portuguese_label` VARCHAR(45) NOT NULL,
    `field_size` VARCHAR(45) NOT NULL,
    `duplicable` BOOLEAN NOT NULL,
    `type` VARCHAR(45) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL DEFAULT false,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,
    `special` BOOLEAN NULL,
    `unit` VARCHAR(10) NULL,
    `precision` TINYINT NULL,

    PRIMARY KEY (`capture_variable_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EFFORT` (
    `effort_id` INTEGER NOT NULL AUTO_INCREMENT,
    `date_effort` DATETIME(0) NOT NULL,
    `notes` VARCHAR(250) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BINARY(1) NOT NULL,
    `original_id` INTEGER NULL,
    `station_id` INTEGER NOT NULL,
    `protocol_id` INTEGER NOT NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `protocol_id`(`protocol_id`),
    INDEX `station_id`(`station_id`),
    PRIMARY KEY (`effort_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EFFORT_CATEGORICAL_OPTIONS` (
    `effort_categorical_option_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NOT NULL,
    `value_oama` VARCHAR(45) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `effort_variable_id` INTEGER NOT NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `effort_variable_id`(`effort_variable_id`),
    PRIMARY KEY (`effort_categorical_option_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EFFORT_CATEGORICAL_VALUES` (
    `effort_categorical_value_id` INTEGER NOT NULL AUTO_INCREMENT,
    `effort_id` INTEGER NOT NULL,
    `effort_categorical_option_id` INTEGER NOT NULL,
    `effort_time_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,
    `effort_variable_id` INTEGER NOT NULL,

    INDEX `EFFORT_CATEGORICAL_VALUES_effort_variable_id_foreign_idx`(`effort_variable_id`),
    INDEX `effort_categorical_option_id`(`effort_categorical_option_id`),
    INDEX `effort_id`(`effort_id`),
    INDEX `effort_time_id`(`effort_time_id`),
    PRIMARY KEY (`effort_categorical_value_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EFFORT_CONTINUOUS_VALUES` (
    `effort_continuous_value_id` INTEGER NOT NULL AUTO_INCREMENT,
    `effort_id` INTEGER NOT NULL,
    `value` VARCHAR(6) NOT NULL,
    `effort_time_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,
    `effort_variable_id` INTEGER NOT NULL,

    INDEX `EFFORT_CONTINUOUS_VALUES_effort_variable_id_foreign_idx`(`effort_variable_id`),
    INDEX `effort_id`(`effort_id`),
    INDEX `effort_time_id`(`effort_time_id`),
    PRIMARY KEY (`effort_continuous_value_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EFFORT_SUMMARIES` (
    `effort_summary_id` INTEGER NOT NULL AUTO_INCREMENT,
    `effort_id` INTEGER NOT NULL,
    `new_bands` INTEGER NOT NULL,
    `recapture` INTEGER NOT NULL,
    `unbanded` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `effort_id`(`effort_id`),
    PRIMARY KEY (`effort_summary_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EFFORT_TIME` (
    `effort_time_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NOT NULL,
    `portuguese_label` VARCHAR(45) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`effort_time_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EFFORT_VARIABLE_REGISTER` (
    `effort_variable_id` INTEGER NOT NULL,
    `name` VARCHAR(45) NOT NULL,
    `description` TEXT NOT NULL,
    `portuguese_label` VARCHAR(45) NOT NULL,
    `field_size` VARCHAR(45) NOT NULL,
    `type` VARCHAR(45) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL DEFAULT false,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,
    `unit` VARCHAR(10) NULL,

    PRIMARY KEY (`effort_variable_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NET_EFFORT` (
    `net_eff_id` INTEGER NOT NULL AUTO_INCREMENT,
    `effort_id` INTEGER NOT NULL,
    `net_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,
    `REDE.ID` VARCHAR(2) NULL,

    INDEX `effort_id`(`effort_id`),
    INDEX `net_id`(`net_id`),
    PRIMARY KEY (`net_eff_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NET_OC` (
    `net_oc_id` INTEGER NOT NULL AUTO_INCREMENT,
    `open_time` DATETIME(0) NOT NULL,
    `close_time` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `net_eff_id` INTEGER NOT NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`net_oc_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NET_REGISTER` (
    `net_id` INTEGER NOT NULL AUTO_INCREMENT,
    `net_number` VARCHAR(45) NOT NULL,
    `net_lat` INTEGER NOT NULL,
    `net_long` INTEGER NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `station_id` INTEGER NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,

    INDEX `station_id`(`station_id`),
    PRIMARY KEY (`net_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PROTOCOL_REGISTER` (
    `protocol_id` INTEGER NOT NULL AUTO_INCREMENT,
    `protocol_code` VARCHAR(45) NOT NULL,
    `protocol_description` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`protocol_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PROTOCOL_VARS` (
    `protocol_param_id` INTEGER NOT NULL AUTO_INCREMENT,
    `protocol_id` INTEGER NOT NULL,
    `mandatory` BOOLEAN NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `has_changed` BOOLEAN NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `original_id` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,
    `capture_variable_id` INTEGER NOT NULL,

    INDEX `protocol_id`(`protocol_id`),
    INDEX `variable_id`(`capture_variable_id`),
    PRIMARY KEY (`protocol_param_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SPP_REGISTER` (
    `spp_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order` VARCHAR(45) NOT NULL,
    `family` VARCHAR(45) NOT NULL,
    `genus` VARCHAR(45) NOT NULL,
    `species` VARCHAR(45) NOT NULL,
    `pt_name` VARCHAR(45) NOT NULL,
    `en_name` VARCHAR(45) NOT NULL,
    `sci_code` VARCHAR(6) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`spp_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `STATION_REGISTER` (
    `station_id` INTEGER NOT NULL AUTO_INCREMENT,
    `station_code` VARCHAR(6) NOT NULL,
    `station_name` VARCHAR(45) NOT NULL,
    `city` VARCHAR(45) NOT NULL,
    `state` VARCHAR(45) NOT NULL,
    `center_lat` DECIMAL(10, 0) NOT NULL,
    `center_long` DECIMAL(10, 0) NOT NULL,
    `has_changed` BOOLEAN NOT NULL,
    `original_id` INTEGER NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`station_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SequelizeMeta` (
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BANDS` ADD CONSTRAINT `BANDS_ibfk_1` FOREIGN KEY (`string_id`) REFERENCES `BAND_STRING_REGISTER`(`string_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE` ADD CONSTRAINT `CAPTURE_ibfk_2` FOREIGN KEY (`bander_id`) REFERENCES `BANDER_REGISTER`(`bander_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE` ADD CONSTRAINT `CAPTURE_ibfk_3` FOREIGN KEY (`band_id`) REFERENCES `BANDS`(`band_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE` ADD CONSTRAINT `CAPTURE_ibfk_1` FOREIGN KEY (`net_eff_id`) REFERENCES `NET_EFFORT`(`net_eff_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE` ADD CONSTRAINT `CAPTURE_ibfk_4` FOREIGN KEY (`spp_id`) REFERENCES `SPP_REGISTER`(`spp_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE_CATEGORICAL_OPTIONS` ADD CONSTRAINT `CAPTURE_CATEGORICAL_OPTIONS_ibfk_1` FOREIGN KEY (`capture_variable_id`) REFERENCES `CAPTURE_VARIABLE_REGISTER`(`capture_variable_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE_CATEGORICAL_VALUES` ADD CONSTRAINT `CAPTURE_CATEGORICAL_VALUES_ibfk_1` FOREIGN KEY (`capture_id`) REFERENCES `CAPTURE`(`capture_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE_CATEGORICAL_VALUES` ADD CONSTRAINT `CAPTURE_CATEGORICAL_VALUES_ibfk_2` FOREIGN KEY (`capture_categorical_option_id`) REFERENCES `CAPTURE_CATEGORICAL_OPTIONS`(`capture_categorical_option_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE_CATEGORICAL_VALUES` ADD CONSTRAINT `CAPTURE_CATEGORICAL_VALUES_capture_variable_id_foreign_idx` FOREIGN KEY (`capture_variable_id`) REFERENCES `CAPTURE_VARIABLE_REGISTER`(`capture_variable_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE_CONTINUOUS_VALUES` ADD CONSTRAINT `CAPTURE_CONTINUOUS_VALUES_ibfk_1` FOREIGN KEY (`capture_id`) REFERENCES `CAPTURE`(`capture_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE_CONTINUOUS_VALUES` ADD CONSTRAINT `CAPTURE_CONTINUOUS_VALUES_capture_variable_id_foreign_idx` FOREIGN KEY (`capture_variable_id`) REFERENCES `CAPTURE_VARIABLE_REGISTER`(`capture_variable_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `CAPTURE_FLAG` ADD CONSTRAINT `CAPTURE_FLAG_ibfk_1` FOREIGN KEY (`capture_id`) REFERENCES `CAPTURE`(`capture_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT` ADD CONSTRAINT `EFFORT_ibfk_2` FOREIGN KEY (`protocol_id`) REFERENCES `PROTOCOL_REGISTER`(`protocol_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT` ADD CONSTRAINT `EFFORT_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `STATION_REGISTER`(`station_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT_CATEGORICAL_OPTIONS` ADD CONSTRAINT `EFFORT_CATEGORICAL_OPTIONS_ibfk_1` FOREIGN KEY (`effort_variable_id`) REFERENCES `EFFORT_VARIABLE_REGISTER`(`effort_variable_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT_CATEGORICAL_VALUES` ADD CONSTRAINT `EFFORT_CATEGORICAL_VALUES_ibfk_1` FOREIGN KEY (`effort_id`) REFERENCES `EFFORT`(`effort_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT_CATEGORICAL_VALUES` ADD CONSTRAINT `EFFORT_CATEGORICAL_VALUES_ibfk_2` FOREIGN KEY (`effort_categorical_option_id`) REFERENCES `EFFORT_CATEGORICAL_OPTIONS`(`effort_categorical_option_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT_CATEGORICAL_VALUES` ADD CONSTRAINT `EFFORT_CATEGORICAL_VALUES_ibfk_3` FOREIGN KEY (`effort_time_id`) REFERENCES `EFFORT_TIME`(`effort_time_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT_CATEGORICAL_VALUES` ADD CONSTRAINT `EFFORT_CATEGORICAL_VALUES_effort_variable_id_foreign_idx` FOREIGN KEY (`effort_variable_id`) REFERENCES `EFFORT_VARIABLE_REGISTER`(`effort_variable_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT_CONTINUOUS_VALUES` ADD CONSTRAINT `EFFORT_CONTINUOUS_VALUES_ibfk_1` FOREIGN KEY (`effort_id`) REFERENCES `EFFORT`(`effort_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT_CONTINUOUS_VALUES` ADD CONSTRAINT `EFFORT_CONTINUOUS_VALUES_ibfk_2` FOREIGN KEY (`effort_time_id`) REFERENCES `EFFORT_TIME`(`effort_time_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT_CONTINUOUS_VALUES` ADD CONSTRAINT `EFFORT_CONTINUOUS_VALUES_effort_variable_id_foreign_idx` FOREIGN KEY (`effort_variable_id`) REFERENCES `EFFORT_VARIABLE_REGISTER`(`effort_variable_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `EFFORT_SUMMARIES` ADD CONSTRAINT `EFFORT_SUMMARIES_ibfk_1` FOREIGN KEY (`effort_id`) REFERENCES `EFFORT`(`effort_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `NET_EFFORT` ADD CONSTRAINT `NET_EFFORT_ibfk_1` FOREIGN KEY (`effort_id`) REFERENCES `EFFORT`(`effort_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `NET_EFFORT` ADD CONSTRAINT `NET_EFFORT_ibfk_2` FOREIGN KEY (`net_id`) REFERENCES `NET_REGISTER`(`net_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `NET_REGISTER` ADD CONSTRAINT `NET_REGISTER_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `STATION_REGISTER`(`station_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `PROTOCOL_VARS` ADD CONSTRAINT `PROTOCOL_VARS_ibfk_2` FOREIGN KEY (`capture_variable_id`) REFERENCES `CAPTURE_VARIABLE_REGISTER`(`capture_variable_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `PROTOCOL_VARS` ADD CONSTRAINT `PROTOCOL_VARS_ibfk_1` FOREIGN KEY (`protocol_id`) REFERENCES `PROTOCOL_REGISTER`(`protocol_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
