import { pgTable, pgEnum, serial, text, boolean, integer, timestamp, bigserial, varchar, bigint, index, foreignKey, smallint, numeric, uniqueIndex } from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"
export const keyStatus = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const keyType = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const factorType = pgEnum("factor_type", ['totp', 'webauthn'])
export const action = pgEnum("action", ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR'])
export const equalityOp = pgEnum("equality_op", ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'])
export const oneTimeTokenType = pgEnum("one_time_token_type", ['confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token'])


export const effortFlag = pgTable("effort_flag", {
	effortFlagId: serial("effort_flag_id").primaryKey().notNull(),
	notes: text("notes").notNull(),
	hasChanged: boolean("has_changed").default(false),
	originalId: integer("original_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
});

export const bandStringRegister = pgTable("band_string_register", {
	stringId: bigserial("string_id", { mode: "bigint" }).primaryKey().notNull(),
	size: varchar("size", { length: 2 }).notNull(),
	firstBand: varchar("first_band", { length: 10 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").default(false).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const banderRegister = pgTable("bander_register", {
	banderId: bigserial("bander_id", { mode: "bigint" }).primaryKey().notNull(),
	name: varchar("name", { length: 45 }).notNull(),
	code: varchar("code", { length: 3 }).notNull(),
	email: varchar("email", { length: 45 }).notNull(),
	phone: varchar("phone", { length: 14 }).notNull(),
	notes: varchar("notes", { length: 250 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull().defaultNow(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	hasChanged: boolean("has_changed").default(false).notNull(),
});

export const bands = pgTable("bands", {
	bandId: bigserial("band_id", { mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	stringId: bigint("string_id", { mode: "number" }).notNull().references(() => bandStringRegister.stringId, { onDelete: "restrict", onUpdate: "restrict" } ),
	bandNumber: varchar("band_number", { length: 45 }).notNull(),
	used: integer("used").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: smallint("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		idx18171StringId: index("idx_18171_string_id").on(table.stringId),
	}
});

export const captureCategoricalValues = pgTable("capture_categorical_values", {
	captureCategoricalValuesId: bigserial("capture_categorical_values_id", { mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	captureId: bigint("capture_id", { mode: "number" }).notNull().references(() => capture.captureId, { onDelete: "restrict", onUpdate: "restrict" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	captureCategoricalOptionId: bigint("capture_categorical_option_id", { mode: "number" }).notNull().references(() => captureCategoricalOptions.captureCategoricalOptionId, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	captureVariableId: bigint("capture_variable_id", { mode: "number" }).notNull().references(() => captureVariableRegister.captureVariableId, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => {
	return {
		idx18196CaptureCategoricalOptionId: index("idx_18196_capture_categorical_option_id").on(table.captureCategoricalOptionId),
		idx18196CaptureCategoricalValuesCaptureVariableIdForeig: index("idx_18196_capture_categorical_values_capture_variable_id_foreig").on(table.captureVariableId),
		idx18196CaptureId: index("idx_18196_capture_id").on(table.captureId),
	}
});

export const captureCategoricalOptions = pgTable("capture_categorical_options", {
	captureCategoricalOptionId: bigserial("capture_categorical_option_id", { mode: "bigint" }).primaryKey().notNull(),
	description: text("description").notNull(),
	valueOama: varchar("value_oama", { length: 45 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	captureVariableId: bigint("capture_variable_id", { mode: "number" }).notNull().references(() => captureVariableRegister.captureVariableId, { onDelete: "restrict", onUpdate: "restrict" } ),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		idx18189CaptureVariableId: index("idx_18189_capture_variable_id").on(table.captureVariableId),
	}
});

export const capture = pgTable("capture", {
	captureId: bigserial("capture_id", { mode: "bigint" }).primaryKey().notNull(),
	captureTime: varchar("capture_time", { length: 3 }).default(sql`NULL::character varying`),
	captureCode: varchar("capture_code", { length: 1 }).notNull(),
	notes: text("notes").default(sql`NULL::character varying`),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	netEffId: bigint("net_eff_id", { mode: "number" }).notNull().references(() => netEffort.netEffId, { onDelete: "restrict", onUpdate: "restrict" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	banderId: bigint("bander_id", { mode: "number" }).notNull().references(() => banderRegister.banderId, { onDelete: "restrict", onUpdate: "restrict" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	bandId: bigint("band_id", { mode: "number" }).notNull().references(() => bands.bandId, { onDelete: "restrict", onUpdate: "restrict" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	sppId: bigint("spp_id", { mode: "number" }).notNull().references(() => sppRegister.sppId, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
},
(table) => {
	return {
		idx18182BandId: index("idx_18182_band_id").on(table.bandId),
		idx18182BanderId: index("idx_18182_bander_id").on(table.banderId),
		idx18182NetEffId: index("idx_18182_net_eff_id").on(table.netEffId),
		idx18182SppId: index("idx_18182_spp_id").on(table.sppId),
	}
});

export const captureVariableRegister = pgTable("capture_variable_register", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	captureVariableId: bigint("capture_variable_id", { mode: "number" }).primaryKey().notNull(),
	name: varchar("name", { length: 45 }).notNull(),
	description: text("description").notNull(),
	portugueseLabel: varchar("portuguese_label", { length: 45 }).notNull(),
	fieldSize: varchar("field_size", { length: 45 }).notNull(),
	duplicable: boolean("duplicable").notNull(),
	type: varchar("type", { length: 45 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").default(false).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	special: boolean("special"),
	unit: varchar("unit", { length: 10 }).default(sql`NULL::character varying`),
	precision: smallint("precision"),
});

export const effortTime = pgTable("effort_time", {
	effortTimeId: bigserial("effort_time_id", { mode: "bigint" }).primaryKey().notNull(),
	description: text("description").notNull(),
	portugueseLabel: varchar("portuguese_label", { length: 45 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const netEffort = pgTable("net_effort", {
	netEffId: bigserial("net_eff_id", { mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortId: bigint("effort_id", { mode: "number" }).notNull().references(() => effort.effortId),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	netId: bigint("net_id", { mode: "number" }).notNull().references(() => netRegister.netId, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	redeId: varchar("REDE.ID", { length: 2 }).default(sql`NULL::character varying`),
},
(table) => {
	return {
		idx18263EffortId: index("idx_18263_effort_id").on(table.effortId),
		idx18263NetId: index("idx_18263_net_id").on(table.netId),
	}
});

export const captureFlag = pgTable("capture_flag", {
	flagId: bigserial("flag_id", { mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	captureId: bigint("capture_id", { mode: "number" }).notNull().references(() => capture.captureId, { onDelete: "restrict", onUpdate: "restrict" } ),
	note: text("note"),
},
(table) => {
	return {
		idx18206CaptureId: index("idx_18206_capture_id").on(table.captureId),
	}
});

export const netOc = pgTable("net_oc", {
	netOcId: bigserial("net_oc_id", { mode: "bigint" }).primaryKey().notNull(),
	openTime: timestamp("open_time", { withTimezone: true, mode: 'string' }).notNull(),
	closeTime: timestamp("close_time", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	netEffId: bigint("net_eff_id", { mode: "number" }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const effortVariableRegister = pgTable("effort_variable_register", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortVariableId: bigint("effort_variable_id", { mode: "number" }).primaryKey().notNull(),
	name: varchar("name", { length: 45 }).notNull(),
	description: text("description").notNull(),
	portugueseLabel: varchar("portuguese_label", { length: 45 }).notNull(),
	fieldSize: varchar("field_size", { length: 45 }).notNull(),
	type: varchar("type", { length: 45 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").default(false).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	unit: varchar("unit", { length: 10 }).default(sql`NULL::character varying`),
});

export const netRegister = pgTable("net_register", {
	netId: bigserial("net_id", { mode: "bigint" }).primaryKey().notNull(),
	netNumber: varchar("net_number", { length: 45 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	netLat: bigint("net_lat", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	netLong: bigint("net_long", { mode: "number" }).notNull(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	stationId: bigint("station_id", { mode: "number" }).notNull().references(() => stationRegister.stationId, { onDelete: "restrict", onUpdate: "restrict" } ),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	meshSize: numeric("mesh_size"),
	netLength: numeric("net_length"),
},
(table) => {
	return {
		idx18274StationId: index("idx_18274_station_id").on(table.stationId),
	}
});

export const protocolRegister = pgTable("protocol_register", {
	protocolId: bigserial("protocol_id", { mode: "bigint" }).primaryKey().notNull(),
	protocolCode: varchar("protocol_code", { length: 45 }).notNull(),
	protocolDescription: text("protocol_description").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const protocolVars = pgTable("protocol_vars", {
	protocolParamId: bigserial("protocol_param_id", { mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	protocolId: bigint("protocol_id", { mode: "number" }).notNull().references(() => protocolRegister.protocolId, { onDelete: "restrict", onUpdate: "restrict" } ),
	mandatory: boolean("mandatory").notNull(),
	order: integer("order").default(0).notNull(),
	hasChanged: boolean("has_changed").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	captureVariableId: bigint("capture_variable_id", { mode: "number" }).notNull().references(() => captureVariableRegister.captureVariableId, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => {
	return {
		idx18286ProtocolId: index("idx_18286_protocol_id").on(table.protocolId),
		idx18286VariableId: index("idx_18286_variable_id").on(table.captureVariableId),
	}
});

export const sequelizemeta = pgTable("sequelizemeta", {
	name: varchar("name", { length: 255 }).primaryKey().notNull(),
},
(table) => {
	return {
		idx18291Name: uniqueIndex("idx_18291_name").on(table.name),
	}
});

export const sppRegister = pgTable("spp_register", {
	sppId: bigserial("spp_id", { mode: "bigint" }).primaryKey().notNull(),
	order: varchar("order", { length: 45 }).notNull(),
	family: varchar("family", { length: 45 }).notNull(),
	genus: varchar("genus", { length: 45 }).notNull(),
	species: varchar("species", { length: 45 }).notNull(),
	ptName: varchar("pt_name", { length: 45 }).notNull(),
	enName: varchar("en_name", { length: 45 }).notNull(),
	sciCode: varchar("sci_code", { length: 6 }).notNull(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const stationRegister = pgTable("station_register", {
	stationId: bigserial("station_id", { mode: "bigint" }).primaryKey().notNull(),
	stationCode: varchar("station_code", { length: 6 }).notNull(),
	stationName: varchar("station_name", { length: 45 }).notNull(),
	city: varchar("city", { length: 45 }).notNull(),
	state: varchar("state", { length: 45 }).notNull(),
	centerLat: numeric("center_lat", { precision: 10, scale:  0 }).notNull(),
	centerLong: numeric("center_long", { precision: 10, scale:  0 }).notNull(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
});

export const effort = pgTable("effort", {
	effortId: bigserial("effort_id", { mode: "bigint" }).primaryKey().notNull(),
	dateEffort: timestamp("date_effort", { withTimezone: true, mode: 'string' }).notNull(),
	notes: varchar("notes", { length: 250 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	// TODO: failed to parse database type 'bytea'
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	stationId: bigint("station_id", { mode: "number" }).notNull().references(() => stationRegister.stationId, { onDelete: "restrict", onUpdate: "restrict" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	protocolId: bigint("protocol_id", { mode: "number" }).notNull().references(() => protocolRegister.protocolId, { onDelete: "restrict", onUpdate: "restrict" } ),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		idx18220ProtocolId: index("idx_18220_protocol_id").on(table.protocolId),
		idx18220StationId: index("idx_18220_station_id").on(table.stationId),
	}
});

export const effortCategoricalOptions = pgTable("effort_categorical_options", {
	effortCategoricalOptionId: bigserial("effort_categorical_option_id", { mode: "bigint" }).primaryKey().notNull(),
	description: text("description").notNull(),
	valueOama: varchar("value_oama", { length: 45 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortVariableId: bigint("effort_variable_id", { mode: "number" }).notNull().references(() => effortVariableRegister.effortVariableId, { onDelete: "restrict", onUpdate: "restrict" } ),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		idx18227EffortVariableId: index("idx_18227_effort_variable_id").on(table.effortVariableId),
	}
});

export const captureContinuousValues = pgTable("capture_continuous_values", {
	captureContinuousValuesId: bigserial("capture_continuous_values_id", { mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	captureId: bigint("capture_id", { mode: "number" }).notNull().references(() => capture.captureId, { onDelete: "restrict", onUpdate: "restrict" } ),
	value: varchar("value", { length: 100 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	captureVariableId: bigint("capture_variable_id", { mode: "number" }).notNull().references(() => captureVariableRegister.captureVariableId, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => {
	return {
		idx18201CaptureContinuousValuesCaptureVariableIdForeign: index("idx_18201_capture_continuous_values_capture_variable_id_foreign").on(table.captureVariableId),
		idx18201CaptureId: index("idx_18201_capture_id").on(table.captureId),
	}
});

export const effortCategoricalValues = pgTable("effort_categorical_values", {
	effortCategoricalValueId: bigserial("effort_categorical_value_id", { mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortId: bigint("effort_id", { mode: "number" }).notNull().references(() => effort.effortId, { onDelete: "restrict", onUpdate: "restrict" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortCategoricalOptionId: bigint("effort_categorical_option_id", { mode: "number" }).notNull().references(() => effortCategoricalOptions.effortCategoricalOptionId, { onDelete: "restrict", onUpdate: "restrict" } ),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortTimeId: bigint("effort_time_id", { mode: "number" }).notNull().references(() => effortTime.effortTimeId, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortVariableId: bigint("effort_variable_id", { mode: "number" }).notNull().references(() => effortVariableRegister.effortVariableId, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => {
	return {
		idx18234EffortCategoricalOptionId: index("idx_18234_effort_categorical_option_id").on(table.effortCategoricalOptionId),
		idx18234EffortCategoricalValuesEffortVariableIdForeign: index("idx_18234_effort_categorical_values_effort_variable_id_foreign_").on(table.effortVariableId),
		idx18234EffortId: index("idx_18234_effort_id").on(table.effortId),
		idx18234EffortTimeId: index("idx_18234_effort_time_id").on(table.effortTimeId),
	}
});

export const effortContinuousValues = pgTable("effort_continuous_values", {
	effortContinuousValueId: bigserial("effort_continuous_value_id", { mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortId: bigint("effort_id", { mode: "number" }).notNull().references(() => effort.effortId, { onDelete: "restrict", onUpdate: "restrict" } ),
	value: varchar("value", { length: 6 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortTimeId: bigint("effort_time_id", { mode: "number" }).notNull().references(() => effortTime.effortTimeId, { onDelete: "restrict", onUpdate: "restrict" } ),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortVariableId: bigint("effort_variable_id", { mode: "number" }).notNull().references(() => effortVariableRegister.effortVariableId, { onDelete: "restrict", onUpdate: "restrict" } ),
},
(table) => {
	return {
		idx18239EffortContinuousValuesEffortVariableIdForeignI: index("idx_18239_effort_continuous_values_effort_variable_id_foreign_i").on(table.effortVariableId),
		idx18239EffortId: index("idx_18239_effort_id").on(table.effortId),
		idx18239EffortTimeId: index("idx_18239_effort_time_id").on(table.effortTimeId),
	}
});

export const effortSummaries = pgTable("effort_summaries", {
	effortSummaryId: bigserial("effort_summary_id", { mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	effortId: bigint("effort_id", { mode: "number" }).notNull().references(() => effort.effortId, { onDelete: "restrict", onUpdate: "restrict" } ),
	newBands: integer("new_bands").notNull(),
	recapture: integer("recapture").notNull(),
	unbanded: integer("unbanded").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
	hasChanged: boolean("has_changed").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalId: bigint("original_id", { mode: "number" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		idx18244EffortId: index("idx_18244_effort_id").on(table.effortId),
	}
});