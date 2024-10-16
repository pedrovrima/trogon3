DO $$ BEGIN
 CREATE TYPE "aal_level" AS ENUM('aal1', 'aal2', 'aal3');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "action" AS ENUM('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "code_challenge_method" AS ENUM('s256', 'plain');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "equality_op" AS ENUM('eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "factor_status" AS ENUM('unverified', 'verified');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "factor_type" AS ENUM('totp', 'webauthn');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "key_status" AS ENUM('default', 'valid', 'invalid', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "key_type" AS ENUM('aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "one_time_token_type" AS ENUM('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "band_string_register" (
	"string_id" bigserial PRIMARY KEY NOT NULL,
	"size" varchar(2) NOT NULL,
	"first_band" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean DEFAULT false NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bander_register" (
	"bander_id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(45) NOT NULL,
	"code" varchar(3) NOT NULL,
	"email" varchar(45) NOT NULL,
	"phone" varchar(14) NOT NULL,
	"notes" varchar(250) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone,
	"has_changed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bands" (
	"band_id" bigserial PRIMARY KEY NOT NULL,
	"string_id" bigint NOT NULL,
	"band_number" varchar(45) NOT NULL,
	"used" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" smallint NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capture" (
	"capture_id" bigserial PRIMARY KEY NOT NULL,
	"capture_time" varchar(3) DEFAULT NULL::character varying,
	"capture_code" varchar(1) NOT NULL,
	"notes" text DEFAULT NULL::character varying,
	"net_eff_id" bigint NOT NULL,
	"bander_id" bigint NOT NULL,
	"band_id" bigint NOT NULL,
	"spp_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"updated_at" timestamp with time zone,
	"original_id" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capture_categorical_options" (
	"capture_categorical_option_id" bigserial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"value_oama" varchar(45) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"capture_variable_id" bigint NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capture_categorical_values" (
	"capture_categorical_values_id" bigserial PRIMARY KEY NOT NULL,
	"capture_id" bigint NOT NULL,
	"capture_categorical_option_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone,
	"capture_variable_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capture_continuous_values" (
	"capture_continuous_values_id" bigserial PRIMARY KEY NOT NULL,
	"capture_id" bigint NOT NULL,
	"value" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone,
	"capture_variable_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capture_flag" (
	"flag_id" bigserial PRIMARY KEY NOT NULL,
	"capture_id" bigint NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "capture_variable_register" (
	"capture_variable_id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(45) NOT NULL,
	"description" text NOT NULL,
	"portuguese_label" varchar(45) NOT NULL,
	"field_size" varchar(45) NOT NULL,
	"duplicable" boolean NOT NULL,
	"type" varchar(45) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean DEFAULT false NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone,
	"special" boolean,
	"unit" varchar(10) DEFAULT NULL::character varying,
	"precision" smallint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "effort" (
	"effort_id" bigserial PRIMARY KEY NOT NULL,
	"date_effort" timestamp with time zone NOT NULL,
	"notes" varchar(250) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"station_id" bigint NOT NULL,
	"protocol_id" bigint NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "effort_categorical_options" (
	"effort_categorical_option_id" bigserial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"value_oama" varchar(45) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"effort_variable_id" bigint NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "effort_categorical_values" (
	"effort_categorical_value_id" bigserial PRIMARY KEY NOT NULL,
	"effort_id" bigint NOT NULL,
	"effort_categorical_option_id" bigint NOT NULL,
	"effort_time_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone,
	"effort_variable_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "effort_continuous_values" (
	"effort_continuous_value_id" bigserial PRIMARY KEY NOT NULL,
	"effort_id" bigint NOT NULL,
	"value" varchar(6) NOT NULL,
	"effort_time_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone,
	"effort_variable_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "effort_flag" (
	"effort_flag_id" serial PRIMARY KEY NOT NULL,
	"notes" text NOT NULL,
	"has_changed" boolean DEFAULT false,
	"original_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "effort_summaries" (
	"effort_summary_id" bigserial PRIMARY KEY NOT NULL,
	"effort_id" bigint NOT NULL,
	"new_bands" integer NOT NULL,
	"recapture" integer NOT NULL,
	"unbanded" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "effort_time" (
	"effort_time_id" bigserial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"portuguese_label" varchar(45) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "effort_variable_register" (
	"effort_variable_id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(45) NOT NULL,
	"description" text NOT NULL,
	"portuguese_label" varchar(45) NOT NULL,
	"field_size" varchar(45) NOT NULL,
	"type" varchar(45) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean DEFAULT false NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone,
	"unit" varchar(10) DEFAULT NULL::character varying
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "net_effort" (
	"net_eff_id" bigserial PRIMARY KEY NOT NULL,
	"effort_id" bigint NOT NULL,
	"net_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone,
	"REDE.ID" varchar(2) DEFAULT NULL::character varying
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "net_oc" (
	"net_oc_id" bigserial PRIMARY KEY NOT NULL,
	"open_time" timestamp with time zone NOT NULL,
	"close_time" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"net_eff_id" bigint NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "net_register" (
	"net_id" bigserial PRIMARY KEY NOT NULL,
	"net_number" varchar(45) NOT NULL,
	"net_lat" bigint NOT NULL,
	"net_long" bigint NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"station_id" bigint NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"mesh_size" numeric,
	"net_length" numeric
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "protocol_register" (
	"protocol_id" bigserial PRIMARY KEY NOT NULL,
	"protocol_code" varchar(45) NOT NULL,
	"protocol_description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "protocol_vars" (
	"protocol_param_id" bigserial PRIMARY KEY NOT NULL,
	"protocol_id" bigint NOT NULL,
	"mandatory" boolean NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"has_changed" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"original_id" bigint,
	"updated_at" timestamp with time zone,
	"capture_variable_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sequelizemeta" (
	"name" varchar(255) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spp_register" (
	"spp_id" bigserial PRIMARY KEY NOT NULL,
	"order" varchar(45) NOT NULL,
	"family" varchar(45) NOT NULL,
	"genus" varchar(45) NOT NULL,
	"species" varchar(45) NOT NULL,
	"pt_name" varchar(45) NOT NULL,
	"en_name" varchar(45) NOT NULL,
	"sci_code" varchar(6) NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "station_register" (
	"station_id" bigserial PRIMARY KEY NOT NULL,
	"station_code" varchar(6) NOT NULL,
	"station_name" varchar(45) NOT NULL,
	"city" varchar(45) NOT NULL,
	"state" varchar(45) NOT NULL,
	"center_lat" numeric(10, 0) NOT NULL,
	"center_long" numeric(10, 0) NOT NULL,
	"has_changed" boolean NOT NULL,
	"original_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18171_string_id" ON "bands" ("string_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18182_band_id" ON "capture" ("band_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18182_bander_id" ON "capture" ("bander_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18182_net_eff_id" ON "capture" ("net_eff_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18182_spp_id" ON "capture" ("spp_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18189_capture_variable_id" ON "capture_categorical_options" ("capture_variable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18196_capture_categorical_option_id" ON "capture_categorical_values" ("capture_categorical_option_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18196_capture_categorical_values_capture_variable_id_foreig" ON "capture_categorical_values" ("capture_variable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18196_capture_id" ON "capture_categorical_values" ("capture_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18201_capture_continuous_values_capture_variable_id_foreign" ON "capture_continuous_values" ("capture_variable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18201_capture_id" ON "capture_continuous_values" ("capture_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18206_capture_id" ON "capture_flag" ("capture_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18220_protocol_id" ON "effort" ("protocol_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18220_station_id" ON "effort" ("station_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18227_effort_variable_id" ON "effort_categorical_options" ("effort_variable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18234_effort_categorical_option_id" ON "effort_categorical_values" ("effort_categorical_option_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18234_effort_categorical_values_effort_variable_id_foreign_" ON "effort_categorical_values" ("effort_variable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18234_effort_id" ON "effort_categorical_values" ("effort_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18234_effort_time_id" ON "effort_categorical_values" ("effort_time_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18239_effort_continuous_values_effort_variable_id_foreign_i" ON "effort_continuous_values" ("effort_variable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18239_effort_id" ON "effort_continuous_values" ("effort_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18239_effort_time_id" ON "effort_continuous_values" ("effort_time_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18244_effort_id" ON "effort_summaries" ("effort_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18263_effort_id" ON "net_effort" ("effort_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18263_net_id" ON "net_effort" ("net_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18274_station_id" ON "net_register" ("station_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18286_protocol_id" ON "protocol_vars" ("protocol_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_18286_variable_id" ON "protocol_vars" ("capture_variable_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_18291_name" ON "sequelizemeta" ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bands" ADD CONSTRAINT "bands_string_id_band_string_register_string_id_fk" FOREIGN KEY ("string_id") REFERENCES "band_string_register"("string_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture" ADD CONSTRAINT "capture_net_eff_id_net_effort_net_eff_id_fk" FOREIGN KEY ("net_eff_id") REFERENCES "net_effort"("net_eff_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture" ADD CONSTRAINT "capture_bander_id_bander_register_bander_id_fk" FOREIGN KEY ("bander_id") REFERENCES "bander_register"("bander_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture" ADD CONSTRAINT "capture_band_id_bands_band_id_fk" FOREIGN KEY ("band_id") REFERENCES "bands"("band_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture" ADD CONSTRAINT "capture_spp_id_spp_register_spp_id_fk" FOREIGN KEY ("spp_id") REFERENCES "spp_register"("spp_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture_categorical_options" ADD CONSTRAINT "capture_categorical_options_capture_variable_id_capture_variable_register_capture_variable_id_fk" FOREIGN KEY ("capture_variable_id") REFERENCES "capture_variable_register"("capture_variable_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture_categorical_values" ADD CONSTRAINT "capture_categorical_values_capture_id_capture_capture_id_fk" FOREIGN KEY ("capture_id") REFERENCES "capture"("capture_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture_categorical_values" ADD CONSTRAINT "capture_categorical_values_capture_categorical_option_id_capture_categorical_options_capture_categorical_option_id_fk" FOREIGN KEY ("capture_categorical_option_id") REFERENCES "capture_categorical_options"("capture_categorical_option_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture_categorical_values" ADD CONSTRAINT "capture_categorical_values_capture_variable_id_capture_variable_register_capture_variable_id_fk" FOREIGN KEY ("capture_variable_id") REFERENCES "capture_variable_register"("capture_variable_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture_continuous_values" ADD CONSTRAINT "capture_continuous_values_capture_id_capture_capture_id_fk" FOREIGN KEY ("capture_id") REFERENCES "capture"("capture_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture_continuous_values" ADD CONSTRAINT "capture_continuous_values_capture_variable_id_capture_variable_register_capture_variable_id_fk" FOREIGN KEY ("capture_variable_id") REFERENCES "capture_variable_register"("capture_variable_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "capture_flag" ADD CONSTRAINT "capture_flag_capture_id_capture_capture_id_fk" FOREIGN KEY ("capture_id") REFERENCES "capture"("capture_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort" ADD CONSTRAINT "effort_station_id_station_register_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "station_register"("station_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort" ADD CONSTRAINT "effort_protocol_id_protocol_register_protocol_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "protocol_register"("protocol_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort_categorical_options" ADD CONSTRAINT "effort_categorical_options_effort_variable_id_effort_variable_register_effort_variable_id_fk" FOREIGN KEY ("effort_variable_id") REFERENCES "effort_variable_register"("effort_variable_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort_categorical_values" ADD CONSTRAINT "effort_categorical_values_effort_id_effort_effort_id_fk" FOREIGN KEY ("effort_id") REFERENCES "effort"("effort_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort_categorical_values" ADD CONSTRAINT "effort_categorical_values_effort_categorical_option_id_effort_categorical_options_effort_categorical_option_id_fk" FOREIGN KEY ("effort_categorical_option_id") REFERENCES "effort_categorical_options"("effort_categorical_option_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort_categorical_values" ADD CONSTRAINT "effort_categorical_values_effort_time_id_effort_time_effort_time_id_fk" FOREIGN KEY ("effort_time_id") REFERENCES "effort_time"("effort_time_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort_categorical_values" ADD CONSTRAINT "effort_categorical_values_effort_variable_id_effort_variable_register_effort_variable_id_fk" FOREIGN KEY ("effort_variable_id") REFERENCES "effort_variable_register"("effort_variable_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort_continuous_values" ADD CONSTRAINT "effort_continuous_values_effort_id_effort_effort_id_fk" FOREIGN KEY ("effort_id") REFERENCES "effort"("effort_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort_continuous_values" ADD CONSTRAINT "effort_continuous_values_effort_time_id_effort_time_effort_time_id_fk" FOREIGN KEY ("effort_time_id") REFERENCES "effort_time"("effort_time_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort_continuous_values" ADD CONSTRAINT "effort_continuous_values_effort_variable_id_effort_variable_register_effort_variable_id_fk" FOREIGN KEY ("effort_variable_id") REFERENCES "effort_variable_register"("effort_variable_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "effort_summaries" ADD CONSTRAINT "effort_summaries_effort_id_effort_effort_id_fk" FOREIGN KEY ("effort_id") REFERENCES "effort"("effort_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "net_effort" ADD CONSTRAINT "net_effort_effort_id_effort_effort_id_fk" FOREIGN KEY ("effort_id") REFERENCES "effort"("effort_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "net_effort" ADD CONSTRAINT "net_effort_net_id_net_register_net_id_fk" FOREIGN KEY ("net_id") REFERENCES "net_register"("net_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "net_register" ADD CONSTRAINT "net_register_station_id_station_register_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "station_register"("station_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "protocol_vars" ADD CONSTRAINT "protocol_vars_protocol_id_protocol_register_protocol_id_fk" FOREIGN KEY ("protocol_id") REFERENCES "protocol_register"("protocol_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "protocol_vars" ADD CONSTRAINT "protocol_vars_capture_variable_id_capture_variable_register_capture_variable_id_fk" FOREIGN KEY ("capture_variable_id") REFERENCES "capture_variable_register"("capture_variable_id") ON DELETE restrict ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
