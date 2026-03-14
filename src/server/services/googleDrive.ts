import { google } from "googleapis";
import { Readable } from "stream";

const getAuthClient = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!email || !key) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
};

const getDriveClient = () => {
  const auth = getAuthClient();
  return google.drive({ version: "v3", auth });
};

/**
 * Find or create a folder inside a parent folder.
 */
async function findOrCreateFolder(
  parentId: string,
  folderName: string
): Promise<string> {
  const drive = getDriveClient();

  const searchResponse = await drive.files.list({
    q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const existingFolder = searchResponse.data.files?.[0];
  if (existingFolder?.id) {
    return existingFolder.id;
  }

  const createResponse = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });

  const folderId = createResponse.data.id;
  if (!folderId) {
    throw new Error(`Failed to create folder: ${folderName}`);
  }

  return folderId;
}

/**
 * Derives the station folder name from the station code.
 * e.g., "BOA1" -> "BOA" (removes trailing digits)
 */
function getStationFolderName(stationCode: string): string {
  return stationCode.replace(/\d+$/, "");
}

/**
 * Builds the folder hierarchy for a capture's effort:
 *   Root > StationFolder > StationCode_YYMM > StationCode_YYMMDD
 *
 * e.g., Root > BOA > BOA1_2603 > BOA1_260314
 */
export async function getOrCreateEffortFolderPath(
  stationCode: string,
  effortDate: Date
): Promise<string> {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootFolderId) {
    throw new Error("Missing GOOGLE_DRIVE_ROOT_FOLDER_ID");
  }

  const yy = String(effortDate.getUTCFullYear()).slice(-2);
  const mm = String(effortDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(effortDate.getUTCDate()).padStart(2, "0");

  const stationFolderName = getStationFolderName(stationCode);
  const monthFolderName = `${stationCode}_${yy}${mm}`;
  const dayFolderName = `${stationCode}_${yy}${mm}${dd}`;

  // Level 1: Station folder (e.g., "BOA")
  const stationFolderId = await findOrCreateFolder(
    rootFolderId,
    stationFolderName
  );

  // Level 2: Month folder (e.g., "BOA1_2603")
  const monthFolderId = await findOrCreateFolder(
    stationFolderId,
    monthFolderName
  );

  // Level 3: Day folder (e.g., "BOA1_260314")
  const dayFolderId = await findOrCreateFolder(monthFolderId, dayFolderName);

  return dayFolderId;
}

export async function uploadFile(
  folderId: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer
): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDriveClient();

  const fileStream = new Readable();
  fileStream.push(fileBuffer);
  fileStream.push(null);

  const createResponse = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: fileStream,
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  const fileId = createResponse.data.id;
  if (!fileId) {
    throw new Error("Failed to upload file");
  }

  // Make file viewable by anyone with the link
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
    supportsAllDrives: true,
  });

  return {
    fileId,
    webViewLink: createResponse.data.webViewLink || "",
  };
}

export async function deleteFile(driveFileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId: driveFileId, supportsAllDrives: true });
}

export function getThumbnailUrl(driveFileId: string, size = 400): string {
  return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w${size}`;
}
