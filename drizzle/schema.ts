import {
  mysqlTable,
  primaryKey,
  int,
  varchar,
  datetime,
  tinyint,
  text,
  binary,
  decimal,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { table } from "console";

export const checklistMetadata = mysqlTable(
  "CHECKLIST_METADATA",
  {
    checklistMetadataId: int("checklist_metadata_id").autoincrement().notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").default(0).notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    stationId: int("station_id").notNull(),
    date: datetime("date", { mode: "string" }).notNull(),
    startTime: datetime("start_time", { mode: "string" }).notNull(),
    endTime: datetime("end_time", { mode: "string" }).notNull(),
    notes: varchar("notes", { length: 250 }),
    activity: varchar("activity", { length: 45 }).notNull(),
  },
  (table) => {
    return {
      checklistMetadataChecklistMetadataId: primaryKey(
        table.checklistMetadataId
      ),
    };
  }
);

export const checklistObservers = mysqlTable(
  "CHECKLIST_OBSERVERS",
  {
    checklistObserversId: int("checklist_observers_id")
      .autoincrement()
      .notNull(),
    checklistMetadataId: int("checklist_metadata_id").notNull(),
    observerId: int("observer_id").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").default(0).notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      checklistObserversChecklistObserversId: primaryKey(
        table.checklistObserversId
      ),
    };
  }
);

export const checklistSpecies = mysqlTable(
  "CHECKLIST_SPECIES",
  {
    checklistSpeciesId: int("checklist_species_id").autoincrement().notNull(),
    checklistMetadataId: int("checklist_metadata_id").notNull(),
    speciesId: int("species_id").notNull(),
    detectionTypeId: int("detection_type_id").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").default(0).notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      checklistSpeciesChecklistSpeciesId: primaryKey(table.checklistSpeciesId),
    };
  }
);

export const checklistDetectionTypes = mysqlTable(
  "CHECKLIST_DETECTION_TYPES",
  {
    checklistDetectionTypesId: int("checklist_detection_types_id")
      .autoincrement()
      .notNull(),
    detectionTypeCode: varchar("detection_type_code", { length: 45 }).notNull(),
    detectionTypeName: varchar("detection_type_name", { length: 45 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").default(0).notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      checklistDetectionTypesChecklistDetectionTypesId: primaryKey(
        table.checklistDetectionTypesId
      ),
    };
  }
);

export const banderRegister = mysqlTable(
  "BANDER_REGISTER",
  {
    banderId: int("bander_id").autoincrement().notNull(),
    name: varchar("name", { length: 45 }).notNull(),
    code: varchar("code", { length: 3 }).notNull(),
    email: varchar("email", { length: 45 }).notNull(),
    phone: varchar("phone", { length: 14 }).notNull(),
    notes: varchar("notes", { length: 250 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    hasChanged: tinyint("has_changed").default(0).notNull(),
  },
  (table) => {
    return {
      banderRegisterBanderId: primaryKey(table.banderId),
    };
  }
);

export const bands = mysqlTable(
  "BANDS",
  {
    bandId: int("band_id").autoincrement().notNull(),
    stringId: int("string_id").notNull(),
    bandNumber: varchar("band_number", { length: 45 }).notNull(),
    used: int("used").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      bandsBandId: primaryKey(table.bandId),
    };
  }
);

export const bandStringRegister = mysqlTable(
  "BAND_STRING_REGISTER",
  {
    stringId: int("string_id").autoincrement().notNull(),
    size: varchar("size", { length: 2 }).notNull(),
    firstBand: varchar("first_band", { length: 10 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").default(0).notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      bandStringRegisterStringId: primaryKey(table.stringId),
    };
  }
);

export const capture = mysqlTable(
  "CAPTURE",
  {
    captureId: int("capture_id").autoincrement().notNull(),
    captureTime: varchar("capture_time", { length: 3 }),
    captureCode: varchar("capture_code", { length: 1 }).notNull(),
    notes: varchar("notes", { length: 250 }),
    netEffId: int("net_eff_id").notNull(),
    banderId: int("bander_id").notNull(),
    bandId: int("band_id").notNull(),
    sppId: int("spp_id").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    originalId: int("original_id"),
  },
  (table) => {
    return {
      captureCaptureId: primaryKey(table.captureId),
    };
  }
);

export const captureCategoricalOptions = mysqlTable(
  "CAPTURE_CATEGORICAL_OPTIONS",
  {
    captureCategoricalOptionId: int("capture_categorical_option_id")
      .autoincrement()
      .notNull(),
    description: text("description").notNull(),
    valueOama: varchar("value_oama", { length: 45 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    captureVariableId: int("capture_variable_id").notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      captureCategoricalOptionsCaptureCategoricalOptionId: primaryKey(
        table.captureCategoricalOptionId
      ),
    };
  }
);

export const captureCategoricalValues = mysqlTable(
  "CAPTURE_CATEGORICAL_VALUES",
  {
    captureCategoricalValuesId: int("capture_categorical_values_id")
      .autoincrement()
      .notNull(),
    captureId: int("capture_id").notNull(),
    captureCategoricalOptionId: int("capture_categorical_option_id").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    captureVariableId: int("capture_variable_id").notNull(),
  },
  (table) => {
    return {
      captureCategoricalValuesCaptureCategoricalValuesId: primaryKey(
        table.captureCategoricalValuesId
      ),
    };
  }
);

export const captureContinuousValues = mysqlTable(
  "CAPTURE_CONTINUOUS_VALUES",
  {
    captureContinuousValuesId: int("capture_continuous_values_id")
      .autoincrement()
      .notNull(),
    captureId: int("capture_id").notNull(),
    value: varchar("value", { length: 100 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    captureVariableId: int("capture_variable_id").notNull(),
  },
  (table) => {
    return {
      captureContinuousValuesCaptureContinuousValuesId: primaryKey(
        table.captureContinuousValuesId
      ),
    };
  }
);

export const captureFlag = mysqlTable(
  "CAPTURE_FLAG",
  {
    flagId: int("flag_id").autoincrement().notNull(),
    captureId: int("capture_id").notNull(),
    note: text("note"),
  },
  (table) => {
    return {
      captureFlagFlagId: primaryKey(table.flagId),
    };
  }
);

export const captureVariableRegister = mysqlTable(
  "CAPTURE_VARIABLE_REGISTER",
  {
    captureVariableId: int("capture_variable_id").autoincrement().notNull(),
    name: varchar("name", { length: 45 }).notNull(),
    description: text("description").notNull(),
    portugueseLabel: varchar("portuguese_label", { length: 45 }).notNull(),
    fieldSize: varchar("field_size", { length: 45 }).notNull(),
    duplicable: tinyint("duplicable").notNull(),
    type: varchar("type", { length: 45 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").default(0).notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    special: tinyint("special"),
    unit: varchar("unit", { length: 10 }),
    precision: tinyint("precision"),
  },
  (table) => {
    return {
      captureVariableRegisterCaptureVariableId: primaryKey(
        table.captureVariableId
      ),
    };
  }
);

export const effort = mysqlTable(
  "EFFORT",
  {
    effortId: int("effort_id").autoincrement().notNull(),
    dateEffort: datetime("date_effort", { mode: "string" }).notNull(),
    notes: varchar("notes", { length: 250 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: binary("has_changed", { length: 1 }).notNull(),
    originalId: int("original_id"),
    stationId: int("station_id").notNull(),
    protocolId: int("protocol_id").notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      effortEffortId: primaryKey(table.effortId),
    };
  }
);

export const effortCategoricalOptions = mysqlTable(
  "EFFORT_CATEGORICAL_OPTIONS",
  {
    effortCategoricalOptionId: int("effort_categorical_option_id")
      .autoincrement()
      .notNull(),
    description: text("description").notNull(),
    valueOama: varchar("value_oama", { length: 45 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    effortVariableId: int("effort_variable_id").notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      effortCategoricalOptionsEffortCategoricalOptionId: primaryKey(
        table.effortCategoricalOptionId
      ),
    };
  }
);

export const effortCategoricalValues = mysqlTable(
  "EFFORT_CATEGORICAL_VALUES",
  {
    effortCategoricalValueId: int("effort_categorical_value_id")
      .autoincrement()
      .notNull(),
    effortId: int("effort_id").notNull(),
    effortCategoricalOptionId: int("effort_categorical_option_id").notNull(),
    effortTimeId: int("effort_time_id").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    effortVariableId: int("effort_variable_id").notNull(),
  },
  (table) => {
    return {
      effortCategoricalValuesEffortCategoricalValueId: primaryKey(
        table.effortCategoricalValueId
      ),
    };
  }
);

export const effortContinuousValues = mysqlTable(
  "EFFORT_CONTINUOUS_VALUES",
  {
    effortContinuousValueId: int("effort_continuous_value_id")
      .autoincrement()
      .notNull(),
    effortId: int("effort_id").notNull(),
    value: varchar("value", { length: 6 }).notNull(),
    effortTimeId: int("effort_time_id").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    effortVariableId: int("effort_variable_id").notNull(),
  },
  (table) => {
    return {
      effortContinuousValuesEffortContinuousValueId: primaryKey(
        table.effortContinuousValueId
      ),
    };
  }
);

export const effortSummaries = mysqlTable(
  "EFFORT_SUMMARIES",
  {
    effortSummaryId: int("effort_summary_id").autoincrement().notNull(),
    effortId: int("effort_id").notNull(),
    newBands: int("new_bands").notNull(),
    recapture: int("recapture").notNull(),
    unbanded: int("unbanded").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      effortSummariesEffortSummaryId: primaryKey(table.effortSummaryId),
    };
  }
);

export const effortTime = mysqlTable(
  "EFFORT_TIME",
  {
    effortTimeId: int("effort_time_id").autoincrement().notNull(),
    description: text("description").notNull(),
    portugueseLabel: varchar("portuguese_label", { length: 45 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      effortTimeEffortTimeId: primaryKey(table.effortTimeId),
    };
  }
);

export const effortVariableRegister = mysqlTable(
  "EFFORT_VARIABLE_REGISTER",
  {
    effortVariableId: int("effort_variable_id").autoincrement().notNull(),
    name: varchar("name", { length: 45 }).notNull(),
    description: text("description").notNull(),
    portugueseLabel: varchar("portuguese_label", { length: 45 }).notNull(),
    fieldSize: varchar("field_size", { length: 45 }).notNull(),
    type: varchar("type", { length: 45 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").default(0).notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    unit: varchar("unit", { length: 10 }),
  },
  (table) => {
    return {
      effortVariableRegisterEffortVariableId: primaryKey(
        table.effortVariableId
      ),
    };
  }
);

export const netEffort = mysqlTable(
  "NET_EFFORT",
  {
    netEffId: int("net_eff_id").autoincrement().notNull(),
    effortId: int("effort_id").notNull(),
    netId: int("net_id").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    redeId: varchar("REDE.ID", { length: 2 }),
  },
  (table) => {
    return {
      netEffortNetEffId: primaryKey(table.netEffId),
    };
  }
);

export const netOc = mysqlTable(
  "NET_OC",
  {
    netOcId: int("net_oc_id").autoincrement().notNull(),
    openTime: datetime("open_time", { mode: "string" }).notNull(),
    closeTime: datetime("close_time", { mode: "string" }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").default(0).notNull(),
    originalId: int("original_id"),
    netEffId: int("net_eff_id").notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      netOcNetOcId: primaryKey(table.netOcId),
    };
  }
);

export const netRegister = mysqlTable(
  "NET_REGISTER",
  {
    netId: int("net_id").autoincrement().notNull(),
    netNumber: varchar("net_number", { length: 45 }).notNull(),
    netLat: int("net_lat").notNull(),
    netLong: int("net_long").notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    stationId: int("station_id").notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }).notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => {
    return {
      netRegisterNetId: primaryKey(table.netId),
    };
  }
);

export const protocolRegister = mysqlTable(
  "PROTOCOL_REGISTER",
  {
    protocolId: int("protocol_id").autoincrement().notNull(),
    protocolCode: varchar("protocol_code", { length: 45 }).notNull(),
    protocolDescription: text("protocol_description").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      protocolRegisterProtocolId: primaryKey(table.protocolId),
    };
  }
);

export const protocolVars = mysqlTable(
  "PROTOCOL_VARS",
  {
    protocolParamId: int("protocol_param_id").autoincrement().notNull(),
    protocolId: int("protocol_id").notNull(),
    mandatory: tinyint("mandatory").notNull(),
    order: int("order").default(0).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    originalId: int("original_id"),
    updatedAt: datetime("updated_at", { mode: "string" }),
    captureVariableId: int("capture_variable_id").notNull(),
  },
  (table) => {
    return {
      protocolVarsProtocolParamId: primaryKey(table.protocolParamId),
    };
  }
);

export const sppRegister = mysqlTable(
  "SPP_REGISTER",
  {
    sppId: int("spp_id").autoincrement().notNull(),
    order: varchar("order", { length: 45 }).notNull(),
    family: varchar("family", { length: 45 }).notNull(),
    genus: varchar("genus", { length: 45 }).notNull(),
    species: varchar("species", { length: 45 }).notNull(),
    ptName: varchar("pt_name", { length: 45 }).notNull(),
    enName: varchar("en_name", { length: 45 }).notNull(),
    sciCode: varchar("sci_code", { length: 6 }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      sppRegisterSppId: primaryKey(table.sppId),
    };
  }
);

export const stationRegister = mysqlTable(
  "STATION_REGISTER",
  {
    stationId: int("station_id").autoincrement().notNull(),
    stationCode: varchar("station_code", { length: 6 }).notNull(),
    stationName: varchar("station_name", { length: 45 }).notNull(),
    city: varchar("city", { length: 45 }).notNull(),
    state: varchar("state", { length: 45 }).notNull(),
    centerLat: decimal("center_lat", { precision: 10, scale: 0 }).notNull(),
    centerLong: decimal("center_long", { precision: 10, scale: 0 }).notNull(),
    hasChanged: tinyint("has_changed").notNull(),
    originalId: int("original_id"),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => {
    return {
      stationRegisterStationId: primaryKey(table.stationId),
    };
  }
);

export const sequelizeMeta = mysqlTable(
  "SequelizeMeta",
  {
    name: varchar("name", { length: 255 }).notNull(),
  },
  (table) => {
    return {
      sequelizeMetaName: primaryKey(table.name),
    };
  }
);
