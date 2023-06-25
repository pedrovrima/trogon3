-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `BANDER_REGISTER` (
	`bander_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`name` varchar(45) NOT NULL,
	`code` varchar(3) NOT NULL,
	`email` varchar(45) NOT NULL,
	`phone` varchar(14) NOT NULL,
	`notes` varchar(250) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`has_changed` tinyint NOT NULL DEFAULT 0);

CREATE TABLE `BANDS` (
	`band_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`string_id` int(11) NOT NULL,
	`band_number` varchar(45) NOT NULL,
	`used` int(1) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `BAND_STRING_REGISTER` (
	`string_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`size` varchar(2) NOT NULL,
	`first_band` varchar(10) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL DEFAULT 0,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `CAPTURE` (
	`capture_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`capture_time` varchar(3) DEFAULT 'NULL',
	`capture_code` varchar(1) NOT NULL,
	`notes` varchar(250) DEFAULT 'NULL',
	`net_eff_id` int(11) NOT NULL,
	`bander_id` int(11) NOT NULL,
	`band_id` int(11) NOT NULL,
	`spp_id` int(11) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`updated_at` datetime DEFAULT 'NULL',
	`original_id` int(11) DEFAULT 'NULL');

CREATE TABLE `CAPTURE_CATEGORICAL_OPTIONS` (
	`capture_categorical_option_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`value_oama` varchar(45) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`capture_variable_id` int(11) NOT NULL,
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `CAPTURE_CATEGORICAL_VALUES` (
	`capture_categorical_values_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`capture_id` int(11) NOT NULL,
	`capture_categorical_option_id` int(11) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`capture_variable_id` int(11) NOT NULL);

CREATE TABLE `CAPTURE_CONTINUOUS_VALUES` (
	`capture_continuous_values_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`capture_id` int(11) NOT NULL,
	`value` varchar(50) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`capture_variable_id` int(11) NOT NULL);

CREATE TABLE `CAPTURE_FLAG` (
	`flag_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`capture_id` int(11) NOT NULL,
	`note` text DEFAULT 'NULL');

CREATE TABLE `CAPTURE_VARIABLE_REGISTER` (
	`capture_variable_id` int(11) PRIMARY KEY NOT NULL,
	`name` varchar(45) NOT NULL,
	`description` text NOT NULL,
	`portuguese_label` varchar(45) NOT NULL,
	`field_size` varchar(45) NOT NULL,
	`duplicable` tinyint NOT NULL,
	`type` varchar(45) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL DEFAULT 0,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`special` tinyint DEFAULT 'NULL',
	`unit` varchar(10) DEFAULT 'NULL',
	`precision` tinyint DEFAULT 'NULL');

CREATE TABLE `EFFORT` (
	`effort_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`date_effort` datetime NOT NULL,
	`notes` varchar(250) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` binary(1) NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`station_id` int(11) NOT NULL,
	`protocol_id` int(11) NOT NULL,
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `EFFORT_CATEGORICAL_OPTIONS` (
	`effort_categorical_option_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`value_oama` varchar(45) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`effort_variable_id` int(11) NOT NULL,
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `EFFORT_CATEGORICAL_VALUES` (
	`effort_categorical_value_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`effort_id` int(11) NOT NULL,
	`effort_categorical_option_id` int(11) NOT NULL,
	`effort_time_id` int(11) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`effort_variable_id` int(11) NOT NULL);

CREATE TABLE `EFFORT_CONTINUOUS_VALUES` (
	`effort_continuous_value_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`effort_id` int(11) NOT NULL,
	`value` varchar(6) NOT NULL,
	`effort_time_id` int(11) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`effort_variable_id` int(11) NOT NULL);

CREATE TABLE `EFFORT_SUMMARIES` (
	`effort_summary_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`effort_id` int(11) NOT NULL,
	`new_bands` int(3) NOT NULL,
	`recapture` int(3) NOT NULL,
	`unbanded` int(3) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `EFFORT_TIME` (
	`effort_time_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`portuguese_label` varchar(45) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `EFFORT_VARIABLE_REGISTER` (
	`effort_variable_id` int(11) PRIMARY KEY NOT NULL,
	`name` varchar(45) NOT NULL,
	`description` text NOT NULL,
	`portuguese_label` varchar(45) NOT NULL,
	`field_size` varchar(45) NOT NULL,
	`type` varchar(45) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL DEFAULT 0,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`unit` varchar(10) DEFAULT 'NULL');

CREATE TABLE `NET_EFFORT` (
	`net_eff_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`effort_id` int(11) NOT NULL,
	`net_id` int(11) NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`REDE.ID` varchar(2) DEFAULT 'NULL');

CREATE TABLE `NET_OC` (
	`net_oc_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`open_time` datetime NOT NULL,
	`close_time` datetime NOT NULL,
	`created_at` datetime DEFAULT 'NULL',
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`net_eff_id` int(11) NOT NULL,
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `NET_REGISTER` (
	`net_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`net_number` varchar(45) NOT NULL,
	`net_lat` int(11) NOT NULL,
	`net_long` int(11) NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`station_id` int(11) NOT NULL,
	`updated_at` datetime NOT NULL,
	`created_at` datetime NOT NULL);

CREATE TABLE `PROTOCOL_REGISTER` (
	`protocol_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`protocol_code` varchar(45) NOT NULL,
	`protocol_description` text NOT NULL,
	`created_at` datetime NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `PROTOCOL_VARS` (
	`protocol_param_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`protocol_id` int(11) NOT NULL,
	`mandatory` tinyint NOT NULL,
	`order` int(2) NOT NULL DEFAULT 0,
	`has_changed` tinyint NOT NULL,
	`created_at` datetime NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`updated_at` datetime DEFAULT 'NULL',
	`capture_variable_id` int(11) NOT NULL);

CREATE TABLE `SequelizeMeta` (
	`name` varchar(255) PRIMARY KEY NOT NULL);

CREATE TABLE `SPP_REGISTER` (
	`spp_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`order` varchar(45) NOT NULL,
	`family` varchar(45) NOT NULL,
	`genus` varchar(45) NOT NULL,
	`species` varchar(45) NOT NULL,
	`pt_name` varchar(45) NOT NULL,
	`en_name` varchar(45) NOT NULL,
	`sci_code` varchar(6) NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime DEFAULT 'NULL');

CREATE TABLE `STATION_REGISTER` (
	`station_id` int(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`station_code` varchar(6) NOT NULL,
	`station_name` varchar(45) NOT NULL,
	`city` varchar(45) NOT NULL,
	`state` varchar(45) NOT NULL,
	`center_lat` decimal(10,0) NOT NULL,
	`center_long` decimal(10,0) NOT NULL,
	`has_changed` tinyint NOT NULL,
	`original_id` int(11) DEFAULT 'NULL',
	`created_at` datetime NOT NULL,
	`updated_at` datetime DEFAULT 'NULL');

CREATE INDEX `string_id` ON `BANDS` (`string_id`);
CREATE INDEX `net_eff_id` ON `CAPTURE` (`net_eff_id`);
CREATE INDEX `bander_id` ON `CAPTURE` (`bander_id`);
CREATE INDEX `band_id` ON `CAPTURE` (`band_id`);
CREATE INDEX `spp_id` ON `CAPTURE` (`spp_id`);
CREATE INDEX `capture_variable_id` ON `CAPTURE_CATEGORICAL_OPTIONS` (`capture_variable_id`);
CREATE INDEX `capture_id` ON `CAPTURE_CATEGORICAL_VALUES` (`capture_id`);
CREATE INDEX `capture_categorical_option_id` ON `CAPTURE_CATEGORICAL_VALUES` (`capture_categorical_option_id`);
CREATE INDEX `CAPTURE_CATEGORICAL_VALUES_capture_variable_id_foreign_idx` ON `CAPTURE_CATEGORICAL_VALUES` (`capture_variable_id`);
CREATE INDEX `capture_id` ON `CAPTURE_CONTINUOUS_VALUES` (`capture_id`);
CREATE INDEX `CAPTURE_CONTINUOUS_VALUES_capture_variable_id_foreign_idx` ON `CAPTURE_CONTINUOUS_VALUES` (`capture_variable_id`);
CREATE INDEX `capture_id` ON `CAPTURE_FLAG` (`capture_id`);
CREATE INDEX `station_id` ON `EFFORT` (`station_id`);
CREATE INDEX `protocol_id` ON `EFFORT` (`protocol_id`);
CREATE INDEX `effort_variable_id` ON `EFFORT_CATEGORICAL_OPTIONS` (`effort_variable_id`);
CREATE INDEX `effort_id` ON `EFFORT_CATEGORICAL_VALUES` (`effort_id`);
CREATE INDEX `effort_categorical_option_id` ON `EFFORT_CATEGORICAL_VALUES` (`effort_categorical_option_id`);
CREATE INDEX `effort_time_id` ON `EFFORT_CATEGORICAL_VALUES` (`effort_time_id`);
CREATE INDEX `EFFORT_CATEGORICAL_VALUES_effort_variable_id_foreign_idx` ON `EFFORT_CATEGORICAL_VALUES` (`effort_variable_id`);
CREATE INDEX `effort_id` ON `EFFORT_CONTINUOUS_VALUES` (`effort_id`);
CREATE INDEX `effort_time_id` ON `EFFORT_CONTINUOUS_VALUES` (`effort_time_id`);
CREATE INDEX `EFFORT_CONTINUOUS_VALUES_effort_variable_id_foreign_idx` ON `EFFORT_CONTINUOUS_VALUES` (`effort_variable_id`);
CREATE INDEX `effort_id` ON `EFFORT_SUMMARIES` (`effort_id`);
CREATE INDEX `effort_id` ON `NET_EFFORT` (`effort_id`);
CREATE INDEX `net_id` ON `NET_EFFORT` (`net_id`);
CREATE INDEX `station_id` ON `NET_REGISTER` (`station_id`);
CREATE INDEX `protocol_id` ON `PROTOCOL_VARS` (`protocol_id`);
CREATE INDEX `variable_id` ON `PROTOCOL_VARS` (`capture_variable_id`);
CREATE UNIQUE INDEX `name` ON `SequelizeMeta` (`name`);
ALTER TABLE `BANDS` ADD CONSTRAINT `BANDS_ibfk_1` FOREIGN KEY (`string_id`) REFERENCES `BAND_STRING_REGISTER`(`string_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE` ADD CONSTRAINT `CAPTURE_ibfk_1` FOREIGN KEY (`net_eff_id`) REFERENCES `NET_EFFORT`(`net_eff_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE` ADD CONSTRAINT `CAPTURE_ibfk_2` FOREIGN KEY (`bander_id`) REFERENCES `BANDER_REGISTER`(`bander_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE` ADD CONSTRAINT `CAPTURE_ibfk_3` FOREIGN KEY (`band_id`) REFERENCES `BANDS`(`band_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE` ADD CONSTRAINT `CAPTURE_ibfk_4` FOREIGN KEY (`spp_id`) REFERENCES `SPP_REGISTER`(`spp_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE_CATEGORICAL_OPTIONS` ADD CONSTRAINT `CAPTURE_CATEGORICAL_OPTIONS_ibfk_1` FOREIGN KEY (`capture_variable_id`) REFERENCES `CAPTURE_VARIABLE_REGISTER`(`capture_variable_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE_CATEGORICAL_VALUES` ADD CONSTRAINT `CAPTURE_CATEGORICAL_VALUES_capture_variable_id_foreign_idx` FOREIGN KEY (`capture_variable_id`) REFERENCES `CAPTURE_VARIABLE_REGISTER`(`capture_variable_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE_CATEGORICAL_VALUES` ADD CONSTRAINT `CAPTURE_CATEGORICAL_VALUES_ibfk_1` FOREIGN KEY (`capture_id`) REFERENCES `CAPTURE`(`capture_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE_CATEGORICAL_VALUES` ADD CONSTRAINT `CAPTURE_CATEGORICAL_VALUES_ibfk_2` FOREIGN KEY (`capture_categorical_option_id`) REFERENCES `CAPTURE_CATEGORICAL_OPTIONS`(`capture_categorical_option_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE_CONTINUOUS_VALUES` ADD CONSTRAINT `CAPTURE_CONTINUOUS_VALUES_capture_variable_id_foreign_idx` FOREIGN KEY (`capture_variable_id`) REFERENCES `CAPTURE_VARIABLE_REGISTER`(`capture_variable_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE_CONTINUOUS_VALUES` ADD CONSTRAINT `CAPTURE_CONTINUOUS_VALUES_ibfk_1` FOREIGN KEY (`capture_id`) REFERENCES `CAPTURE`(`capture_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `CAPTURE_FLAG` ADD CONSTRAINT `CAPTURE_FLAG_ibfk_1` FOREIGN KEY (`capture_id`) REFERENCES `CAPTURE`(`capture_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT` ADD CONSTRAINT `EFFORT_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `STATION_REGISTER`(`station_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT` ADD CONSTRAINT `EFFORT_ibfk_2` FOREIGN KEY (`protocol_id`) REFERENCES `PROTOCOL_REGISTER`(`protocol_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT_CATEGORICAL_OPTIONS` ADD CONSTRAINT `EFFORT_CATEGORICAL_OPTIONS_ibfk_1` FOREIGN KEY (`effort_variable_id`) REFERENCES `EFFORT_VARIABLE_REGISTER`(`effort_variable_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT_CATEGORICAL_VALUES` ADD CONSTRAINT `EFFORT_CATEGORICAL_VALUES_effort_variable_id_foreign_idx` FOREIGN KEY (`effort_variable_id`) REFERENCES `EFFORT_VARIABLE_REGISTER`(`effort_variable_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT_CATEGORICAL_VALUES` ADD CONSTRAINT `EFFORT_CATEGORICAL_VALUES_ibfk_1` FOREIGN KEY (`effort_id`) REFERENCES `EFFORT`(`effort_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT_CATEGORICAL_VALUES` ADD CONSTRAINT `EFFORT_CATEGORICAL_VALUES_ibfk_2` FOREIGN KEY (`effort_categorical_option_id`) REFERENCES `EFFORT_CATEGORICAL_OPTIONS`(`effort_categorical_option_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT_CATEGORICAL_VALUES` ADD CONSTRAINT `EFFORT_CATEGORICAL_VALUES_ibfk_3` FOREIGN KEY (`effort_time_id`) REFERENCES `EFFORT_TIME`(`effort_time_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT_CONTINUOUS_VALUES` ADD CONSTRAINT `EFFORT_CONTINUOUS_VALUES_effort_variable_id_foreign_idx` FOREIGN KEY (`effort_variable_id`) REFERENCES `EFFORT_VARIABLE_REGISTER`(`effort_variable_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT_CONTINUOUS_VALUES` ADD CONSTRAINT `EFFORT_CONTINUOUS_VALUES_ibfk_1` FOREIGN KEY (`effort_id`) REFERENCES `EFFORT`(`effort_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT_CONTINUOUS_VALUES` ADD CONSTRAINT `EFFORT_CONTINUOUS_VALUES_ibfk_2` FOREIGN KEY (`effort_time_id`) REFERENCES `EFFORT_TIME`(`effort_time_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `EFFORT_SUMMARIES` ADD CONSTRAINT `EFFORT_SUMMARIES_ibfk_1` FOREIGN KEY (`effort_id`) REFERENCES `EFFORT`(`effort_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `NET_EFFORT` ADD CONSTRAINT `NET_EFFORT_ibfk_1` FOREIGN KEY (`effort_id`) REFERENCES `EFFORT`(`effort_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `NET_EFFORT` ADD CONSTRAINT `NET_EFFORT_ibfk_2` FOREIGN KEY (`net_id`) REFERENCES `NET_REGISTER`(`net_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `NET_REGISTER` ADD CONSTRAINT `NET_REGISTER_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `STATION_REGISTER`(`station_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `PROTOCOL_VARS` ADD CONSTRAINT `PROTOCOL_VARS_ibfk_1` FOREIGN KEY (`protocol_id`) REFERENCES `PROTOCOL_REGISTER`(`protocol_id`) ON DELETE restrict ON UPDATE restrict;
ALTER TABLE `PROTOCOL_VARS` ADD CONSTRAINT `PROTOCOL_VARS_ibfk_2` FOREIGN KEY (`capture_variable_id`) REFERENCES `CAPTURE_VARIABLE_REGISTER`(`capture_variable_id`) ON DELETE restrict ON UPDATE restrict;
*/