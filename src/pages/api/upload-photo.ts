import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import db from "@/db";
import {
  capturePhotos,
  capture,
  netEffort,
  effort,
  stationRegister,
  bands,
  sppRegister,
  captureCategoricalValues,
  captureCategoricalOptions,
  captureVariableRegister,
} from "drizzle/schema";
import { eq, like } from "drizzle-orm";
import {
  getOrCreateEffortFolderPath,
  uploadFile,
} from "@/server/services/googleDrive";
import { and } from "drizzle-orm";

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10MB
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

const PHOTO_POSITIONS = [
  "Frente",
  "Lado",
  "Costas",
  "Asa",
  "Olho",
  "Limite de Muda",
  "Anomalia",
  "Injuria",
];

const PROMOTED_VARIABLE_ALIASES = {
  age: ["age_wrp", "idade", "wrp", "idwrp", "idade_wrp"],
  sex: ["sex_code", "sexo", "sex"],
};

function normalizeVariableKey(value: string | null | undefined) {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .trim();
}

function matchesPromotedVariable(
  value: { variableName: string | null; label: string | null },
  aliases: string[]
) {
  const normalizedName = normalizeVariableKey(value.variableName);
  const normalizedLabel = normalizeVariableKey(value.label);

  return aliases.some((alias) => {
    const normalizedAlias = normalizeVariableKey(alias);
    return (
      normalizedName === normalizedAlias ||
      normalizedLabel === normalizedAlias ||
      normalizedName.startsWith(`${normalizedAlias}_`) ||
      normalizedLabel.startsWith(`${normalizedAlias}_`)
    );
  });
}

function formatSegment(value: string, fallback: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return normalized.length > 0 ? normalized : fallback;
}

function formatEffortDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function buildUniqueFileName(
  baseName: string,
  ext: string,
  existingNames: Set<string>
) {
  const normalizedExt = ext.replace(/^\./, "");
  const baseFileName = `${baseName}.${normalizedExt}`;
  if (!existingNames.has(baseFileName)) {
    return baseFileName;
  }

  let counter = 2;
  while (true) {
    const suffix = String(counter).padStart(2, "0");
    const candidate = `${baseName}_${suffix}.${normalizedExt}`;
    if (!existingNames.has(candidate)) {
      return candidate;
    }
    counter += 1;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(req);

    const captureIdRaw = Array.isArray(fields.captureId)
      ? fields.captureId[0]
      : fields.captureId;
    const captureId = Number(captureIdRaw);

    if (!captureId || isNaN(captureId)) {
      return res.status(400).json({ error: "Missing or invalid captureId" });
    }

    const positionRaw = Array.isArray(fields.position)
      ? fields.position[0]
      : fields.position;
    const position = typeof positionRaw === "string" ? positionRaw.trim() : "";

    if (!position) {
      return res.status(400).json({ error: "Missing photo position" });
    }

    if (!PHOTO_POSITIONS.includes(position)) {
      return res.status(400).json({ error: "Invalid photo position" });
    }

    const fileArray = Array.isArray(files.file) ? files.file : [files.file];
    const file = fileArray[0];

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get capture data to build folder/file names
    const captureData = await db
      .select({
        captureId: capture.captureId,
        station: stationRegister.stationCode,
        dateEffort: effort.dateEffort,
        effortId: effort.effortId,
        sppCode: sppRegister.sciCode,
        bandSize: bands.bandSize,
        bandNumber: bands.bandNumber,
      })
      .from(capture)
      .leftJoin(netEffort, eq(capture.netEffId, netEffort.netEffId))
      .leftJoin(effort, eq(netEffort.effortId, effort.effortId))
      .leftJoin(stationRegister, eq(effort.stationId, stationRegister.stationId))
      .leftJoin(bands, eq(capture.bandId, bands.bandId))
      .leftJoin(sppRegister, eq(capture.sppId, sppRegister.sppId))
      //@ts-expect-error drizzle bigint typing mismatch
      .where(eq(capture.captureId, captureId));

    if (!captureData[0]) {
      return res.status(404).json({ error: "Capture not found" });
    }

    const { station, dateEffort, sppCode, bandSize, bandNumber } =
      captureData[0];

    if (!station || !dateEffort || !sppCode) {
      return res
        .status(400)
        .json({ error: "Missing station, species, or effort date" });
    }

    const categoricalValues = await db
      .select({
        value: captureCategoricalOptions.valueOama,
        variableName: captureVariableRegister.name,
        label: captureVariableRegister.portugueseLabel,
      })
      .from(captureCategoricalValues)
      .leftJoin(
        captureCategoricalOptions,
        eq(
          captureCategoricalValues.captureCategoricalOptionId,
          captureCategoricalOptions.captureCategoricalOptionId
        )
      )
      .leftJoin(
        captureVariableRegister,
        eq(
          captureCategoricalValues.captureVariableId,
          captureVariableRegister.captureVariableId
        )
      )
      .where(
        and(
          eq(captureCategoricalValues.captureId, captureId),
          eq(captureCategoricalValues.hasChanged, false)
        )
      );

    const ageValue = categoricalValues.find((value) =>
      matchesPromotedVariable(value, PROMOTED_VARIABLE_ALIASES.age)
    );
    const sexValue = categoricalValues.find((value) =>
      matchesPromotedVariable(value, PROMOTED_VARIABLE_ALIASES.sex)
    );

    // Build 3-level folder hierarchy: Station > Month > Day
    const effortDate = new Date(dateEffort);
    const folderId = await getOrCreateEffortFolderPath(station, effortDate);

    // Build renamed filename
    const ext = file.originalFilename?.split(".").pop() || "jpg";
    const effortDateCode = formatEffortDate(dateEffort);
    const bandSegment =
      bandSize && bandNumber
        ? formatSegment(`${bandSize}${bandNumber}`, "SEM_ANILHA")
        : "SEM_ANILHA";
    const ageSegment = formatSegment(ageValue?.value ?? "NA", "NA");
    const sexSegment = formatSegment(sexValue?.value ?? "U", "U");
    const positionSegment = formatSegment(position, "POSICAO");
    const speciesSegment = formatSegment(sppCode, "SEM_ESPECIE");
    const baseName = `${speciesSegment}_${bandSegment}_${effortDateCode}_${ageSegment}_${sexSegment}_${positionSegment}`;
    const existingFileNames = await db
      .select({ fileName: capturePhotos.fileName })
      .from(capturePhotos)
      .where(
        and(
          eq(capturePhotos.captureId, captureId),
          eq(capturePhotos.hasChanged, false),
          like(capturePhotos.fileName, `${baseName}%`)
        )
      );
    const renamedFileName = buildUniqueFileName(
      baseName,
      ext,
      new Set(existingFileNames.map((item) => item.fileName))
    );

    // Read file and upload to Drive
    const fileBuffer = fs.readFileSync(file.filepath);
    const { fileId } = await uploadFile(
      folderId,
      renamedFileName,
      file.mimetype || "image/jpeg",
      fileBuffer
    );

    // Save to database
    const [photo] = await db
      .insert(capturePhotos)
      .values({
        captureId,
        fileName: renamedFileName,
        originalFileName: file.originalFilename || "unknown",
        position,
        driveFileId: fileId,
        driveFolderId: folderId,
        mimeType: file.mimetype || "image/jpeg",
        fileSize: file.size,
      })
      .returning({ photoId: capturePhotos.photoId });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      photoId: photo?.photoId ? Number(photo.photoId) : null,
      fileName: renamedFileName,
      driveFileId: fileId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
}
