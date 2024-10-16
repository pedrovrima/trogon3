CREATE TABLE IF NOT EXISTS "change_log" (
	"change_log_id" bigserial PRIMARY KEY NOT NULL,
	"table" varchar(45) NOT NULL,
	"old_record_id" integer NOT NULL,
	"new_record_id" integer,
	"is_deleted" boolean NOT NULL,
	"justification" text NOT NULL,
	"created_at" timestamp NOT NULL
);
