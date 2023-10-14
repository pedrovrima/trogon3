import {
  mysqlTable,
  mysqlSchema,
  AnyMySqlColumn,
  varchar,
  datetime,
  tinyint,
  index,
  foreignKey,
  text,
  binary,
  uniqueIndex,
  decimal,
  int,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const banderRegister = mysqlTable("BANDER_REGISTER", {
  banderId: int("bander_id").autoincrement().primaryKey().notNull(),
  name: varchar("name", { length: 45 }).notNull(),
  code: varchar("code", { length: 3 }).notNull(),
  email: varchar("email", { length: 45 }).notNull(),
  phone: varchar("phone", { length: 14 }).notNull(),
  notes: varchar("notes", { length: 250 }).notNull(),
  createdAt: datetime("created_at", { mode: "string" })
    .default("current_timestamp()")
    .notNull(),
  originalId: int("original_id"),
  updatedAt: datetime("updated_at", { mode: "string" }),
  hasChanged: tinyint("has_changed").default(0).notNull(),
});

export const bands = mysqlTable(
  "BANDS",
  {
    bandId: int("band_id").autoincrement().primaryKey().notNull(),
    stringId: int("string_id")
      .notNull()
      .references(() => bandStringRegister.stringId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    bandNumber: varchar("band_number", { length: 45 }).notNull(),
    used: int("used").notNull().default(0),
    createdAt: datetime("created_at", { mode: "string" })
      .notNull()
      .default("current_timestamp()"),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      stringId: index("string_id").on(table.stringId),
    };
  }
);

export const bandStringRegister = mysqlTable("BAND_STRING_REGISTER", {
  stringId: int("string_id").autoincrement().primaryKey().notNull(),
  size: varchar("size", { length: 2 }).notNull(),
  firstBand: varchar("first_band", { length: 10 }).notNull(),
  createdAt: datetime("created_at", { mode: "string" })
    .notNull()
    .default("current_timestamp()"),
  hasChanged: tinyint("has_changed").default(0).notNull(),
  originalId: int("original_id"),
  updatedAt: datetime("updated_at", { mode: "string" }),
});

export const capture = mysqlTable(
  "CAPTURE",
  {
    captureId: int("capture_id").autoincrement().primaryKey().notNull(),
    captureTime: varchar("capture_time", { length: 3 }),
    captureCode: varchar("capture_code", { length: 1 }).notNull(),
    notes: varchar("notes", { length: 1500 }),
    netEffId: int("net_eff_id")
      .notNull()
      .references(() => netEffort.netEffId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    banderId: int("bander_id")
      .notNull()
      .references(() => banderRegister.banderId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    bandId: int("band_id")
      .notNull()
      .references(() => bands.bandId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    sppId: int("spp_id")
      .notNull()
      .references(() => sppRegister.sppId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    originalId: int("original_id"),
  },
  (table) => {
    return {
      netEffId: index("net_eff_id").on(table.netEffId),
      banderId: index("bander_id").on(table.banderId),
      bandId: index("band_id").on(table.bandId),
      sppId: index("spp_id").on(table.sppId),
    };
  }
);

export const captureCategoricalOptions = mysqlTable(
  "CAPTURE_CATEGORICAL_OPTIONS",
  {
    captureCategoricalOptionId: int("capture_categorical_option_id")
      .autoincrement()
      .primaryKey()
      .notNull(),
    description: text("description").notNull(),
    valueOama: varchar("value_oama", { length: 45 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    captureVariableId: int("capture_variable_id")
      .notNull()
      .references(() => captureVariableRegister.captureVariableId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      captureVariableId: index("capture_variable_id").on(
        table.captureVariableId
      ),
    };
  }
);

export const captureCategoricalValues = mysqlTable(
  "CAPTURE_CATEGORICAL_VALUES",
  {
    captureCategoricalValuesId: int("capture_categorical_values_id")
      .autoincrement()
      .primaryKey()
      .notNull(),
    captureId: int("capture_id")
      .notNull()
      .references(() => capture.captureId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    captureCategoricalOptionId: int("capture_categorical_option_id")
      .notNull()
      .references(() => captureCategoricalOptions.captureCategoricalOptionId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    captureVariableId: int("capture_variable_id")
      .notNull()
      .references(() => captureVariableRegister.captureVariableId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
  },
  (table) => {
    return {
      captureId: index("capture_id").on(table.captureId),
      captureCategoricalOptionId: index("capture_categorical_option_id").on(
        table.captureCategoricalOptionId
      ),
      captureVariableIdForeignIdx: index(
        "CAPTURE_CATEGORICAL_VALUES_capture_variable_id_foreign_idx"
      ).on(table.captureVariableId),
    };
  }
);

export const captureContinuousValues = mysqlTable(
  "CAPTURE_CONTINUOUS_VALUES",
  {
    captureContinuousValuesId: int("capture_continuous_values_id")
      .autoincrement()
      .primaryKey()
      .notNull(),
    captureId: int("capture_id")
      .notNull()
      .references(() => capture.captureId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    value: varchar("value", { length: 50 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    captureVariableId: int("capture_variable_id")
      .notNull()
      .references(() => captureVariableRegister.captureVariableId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
  },
  (table) => {
    return {
      captureId: index("capture_id").on(table.captureId),
      captureVariableIdForeignIdx: index(
        "CAPTURE_CONTINUOUS_VALUES_capture_variable_id_foreign_idx"
      ).on(table.captureVariableId),
    };
  }
);

export const captureFlag = mysqlTable(
  "CAPTURE_FLAG",
  {
    flagId: int("flag_id").autoincrement().primaryKey().notNull(),
    captureId: int("capture_id")
      .notNull()
      .references(() => capture.captureId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    note: text("note"),
  },
  (table) => {
    return {
      captureId: index("capture_id").on(table.captureId),
    };
  }
);

export const captureVariableRegister = mysqlTable("CAPTURE_VARIABLE_REGISTER", {
  captureVariableId: int("capture_variable_id").primaryKey().notNull(),
  name: varchar("name", { length: 45 }).notNull(),
  description: text("description").notNull(),
  portugueseLabel: varchar("portuguese_label", { length: 45 }).notNull(),
  fieldSize: varchar("field_size", { length: 45 }).notNull(),
  duplicable: tinyint("duplicable").notNull(),
  type: varchar("type", { length: 45 }).notNull(),
  createdAt: datetime("created_at", { mode: "string" }).notNull(),
  hasChanged: tinyint("has_changed").default(0).notNull(),
  originalId: int("original_id"),
  updatedAt: datetime("updated_at", { mode: "string" }),
  special: tinyint("special"),
  unit: varchar("unit", { length: 10 }),
  precision: tinyint("precision"),
});

export const effort = mysqlTable(
  "EFFORT",
  {
    effortId: int("effort_id").autoincrement().primaryKey().notNull(),
    dateEffort: datetime("date_effort", { mode: "string" }).notNull(),
    notes: varchar("notes", { length: 250 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: binary("has_changed", { length: 1 }).notNull(),
    originalId: int("original_id"),
    stationId: int("station_id")
      .notNull()
      .references(() => stationRegister.stationId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    protocolId: int("protocol_id")
      .notNull()
      .references(() => protocolRegister.protocolId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      stationId: index("station_id").on(table.stationId),
      protocolId: index("protocol_id").on(table.protocolId),
    };
  }
);

export const effortCategoricalOptions = mysqlTable(
  "EFFORT_CATEGORICAL_OPTIONS",
  {
    effortCategoricalOptionId: int("effort_categorical_option_id")
      .autoincrement()
      .primaryKey()
      .notNull(),
    description: text("description").notNull(),
    valueOama: varchar("value_oama", { length: 45 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    effortVariableId: int("effort_variable_id")
      .notNull()
      .references(() => effortVariableRegister.effortVariableId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      effortVariableId: index("effort_variable_id").on(table.effortVariableId),
    };
  }
);

export const effortCategoricalValues = mysqlTable(
  "EFFORT_CATEGORICAL_VALUES",
  {
    effortCategoricalValueId: int("effort_categorical_value_id")
      .autoincrement()
      .primaryKey()
      .notNull(),
    effortId: int("effort_id")
      .notNull()
      .references(() => effort.effortId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    effortCategoricalOptionId: int("effort_categorical_option_id")
      .notNull()
      .references(() => effortCategoricalOptions.effortCategoricalOptionId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    effortTimeId: int("effort_time_id")
      .notNull()
      .references(() => effortTime.effortTimeId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    effortVariableId: int("effort_variable_id")
      .notNull()
      .references(() => effortVariableRegister.effortVariableId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
  },
  (table) => {
    return {
      effortId: index("effort_id").on(table.effortId),
      effortCategoricalOptionId: index("effort_categorical_option_id").on(
        table.effortCategoricalOptionId
      ),
      effortTimeId: index("effort_time_id").on(table.effortTimeId),
      effortVariableIdForeignIdx: index(
        "EFFORT_CATEGORICAL_VALUES_effort_variable_id_foreign_idx"
      ).on(table.effortVariableId),
    };
  }
);

export const effortContinuousValues = mysqlTable(
  "EFFORT_CONTINUOUS_VALUES",
  {
    effortContinuousValueId: int("effort_continuous_value_id")
      .autoincrement()
      .primaryKey()
      .notNull(),
    effortId: int("effort_id")
      .notNull()
      .references(() => effort.effortId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    value: varchar("value", { length: 6 }).notNull(),
    effortTimeId: int("effort_time_id")
      .notNull()
      .references(() => effortTime.effortTimeId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    effortVariableId: int("effort_variable_id")
      .notNull()
      .references(() => effortVariableRegister.effortVariableId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
  },
  (table) => {
    return {
      effortId: index("effort_id").on(table.effortId),
      effortTimeId: index("effort_time_id").on(table.effortTimeId),
      effortVariableIdForeignIdx: index(
        "EFFORT_CONTINUOUS_VALUES_effort_variable_id_foreign_idx"
      ).on(table.effortVariableId),
    };
  }
);

export const effortSummaries = mysqlTable(
  "EFFORT_SUMMARIES",
  {
    effortSummaryId: int("effort_summary_id")
      .autoincrement()
      .primaryKey()
      .notNull(),
    effortId: int("effort_id")
      .notNull()
      .references(() => effort.effortId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    newBands: int("new_bands").notNull(),
    recapture: int("recapture").notNull(),
    unbanded: int("unbanded").notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      effortId: index("effort_id").on(table.effortId),
    };
  }
);

export const effortTime = mysqlTable("EFFORT_TIME", {
  effortTimeId: int("effort_time_id").autoincrement().primaryKey().notNull(),
  description: text("description").notNull(),
  portugueseLabel: varchar("portuguese_label", { length: 45 }).notNull(),
  createdAt: datetime("created_at", { mode: "string" }).notNull(),
  hasChanged: tinyint("has_changed").notNull(),
  originalId: int("original_id"),
  updatedAt: datetime("updated_at", { mode: "string" }),
});

export const effortVariableRegister = mysqlTable("EFFORT_VARIABLE_REGISTER", {
  effortVariableId: int("effort_variable_id").primaryKey().notNull(),
  name: varchar("name", { length: 45 }).notNull(),
  description: text("description").notNull(),
  portugueseLabel: varchar("portuguese_label", { length: 45 }).notNull(),
  fieldSize: varchar("field_size", { length: 45 }).notNull(),
  type: varchar("type", { length: 45 }).notNull(),
  createdAt: datetime("created_at", { mode: "string" }).notNull(),
  hasChanged: tinyint("has_changed").default(0).notNull(),
  originalId: int("original_id"),
  updatedAt: datetime("updated_at", { mode: "string" }),
  unit: varchar("unit", { length: 10 }),
});

export const netEffort = mysqlTable(
  "NET_EFFORT",
  {
    netEffId: int("net_eff_id").autoincrement().primaryKey().notNull(),
    effortId: int("effort_id")
      .notNull()
      .references(() => effort.effortId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    netId: int("net_id")
      .notNull()
      .references(() => netRegister.netId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    redeId: varchar("REDE.ID", { length: 2 }),
  },
  (table) => {
    return {
      effortId: index("effort_id").on(table.effortId),
      netId: index("net_id").on(table.netId),
    };
  }
);

export const netOc = mysqlTable("NET_OC", {
  netOcId: int("net_oc_id").autoincrement().primaryKey().notNull(),
  openTime: datetime("open_time", { mode: "string" }).notNull(),
  closeTime: datetime("close_time", { mode: "string" }).notNull(),
  createdAt: datetime("created_at", { mode: "string" }),
  hasChanged: tinyint("has_changed").notNull(),
  originalId: int("original_id"),
  netEffId: int("net_eff_id").notNull(),
  updatedAt: datetime("updated_at", { mode: "string" }),
});

export const netRegister = mysqlTable(
  "NET_REGISTER",
  {
    netId: int("net_id").autoincrement().primaryKey().notNull(),
    netNumber: varchar("net_number", { length: 45 }).notNull(),
    netLat: int("net_lat").notNull(),
    netLong: int("net_long").notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    stationId: int("station_id")
      .notNull()
      .references(() => stationRegister.stationId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    updatedAt: datetime("updated_at", { mode: "string" }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => {
    return {
      stationId: index("station_id").on(table.stationId),
    };
  }
);

export const protocolRegister = mysqlTable("PROTOCOL_REGISTER", {
  protocolId: int("protocol_id").autoincrement().primaryKey().notNull(),
  protocolCode: varchar("protocol_code", { length: 45 }).notNull(),
  protocolDescription: text("protocol_description").notNull(),
  createdAt: datetime("created_at", { mode: "string" }).notNull(),
  hasChanged: tinyint("has_changed").notNull(),
  originalId: int("original_id"),
  updatedAt: datetime("updated_at", { mode: "string" }),
});

export const protocolVars = mysqlTable(
  "PROTOCOL_VARS",
  {
    protocolParamId: int("protocol_param_id")
      .autoincrement()
      .primaryKey()
      .notNull(),
    protocolId: int("protocol_id")
      .notNull()
      .references(() => protocolRegister.protocolId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    mandatory: tinyint("mandatory").notNull(),
    order: int("order").default(0).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    captureVariableId: int("capture_variable_id")
      .notNull()
      .references(() => captureVariableRegister.captureVariableId, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
  },
  (table) => {
    return {
      protocolId: index("protocol_id").on(table.protocolId),
      variableId: index("variable_id").on(table.captureVariableId),
    };
  }
);

export const sequelizeMeta = mysqlTable(
  "SequelizeMeta",
  {
    name: varchar("name", { length: 255 }).primaryKey().notNull(),
  },
  (table) => {
    return {
      name: uniqueIndex("name").on(table.name),
    };
  }
);

export const sppRegister = mysqlTable("SPP_REGISTER", {
  sppId: int("spp_id").autoincrement().primaryKey().notNull(),
  order: varchar("order", { length: 45 }).notNull(),
  family: varchar("family", { length: 45 }).notNull(),
  genus: varchar("genus", { length: 45 }).notNull(),
  species: varchar("species", { length: 45 }).notNull(),
  ptName: varchar("pt_name", { length: 45 }).notNull(),
  enName: varchar("en_name", { length: 45 }).notNull(),
  sciCode: varchar("sci_code", { length: 6 }).notNull(),
  hasChanged: tinyint("has_changed").notNull(),
  originalId: int("original_id"),
  createdAt: datetime("created_at", { mode: "string" }).notNull(),
  updatedAt: datetime("updated_at", { mode: "string" }),
});

export const stationRegister = mysqlTable("STATION_REGISTER", {
  stationId: int("station_id").autoincrement().primaryKey().notNull(),
  stationCode: varchar("station_code", { length: 6 }).notNull(),
  stationName: varchar("station_name", { length: 45 }).notNull(),
  city: varchar("city", { length: 45 }).notNull(),
  state: varchar("state", { length: 45 }).notNull(),
  centerLat: decimal("center_lat", { precision: 10, scale: 0 }).notNull(),
  centerLong: decimal("center_long", { precision: 10, scale: 0 }).notNull(),
  hasChanged: tinyint("has_changed").notNull(),
  originalId: int("original_id"),
  createdAt: datetime("created_at", { mode: "string" }).notNull(),
  updatedAt: datetime("updated_at", { mode: "string" }),
});
