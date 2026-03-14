import { api } from "@/utils/api";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

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

function formatEffortDateParts(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const yyyy = date.getUTCFullYear();
  const yy = String(yyyy).slice(-2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return {
    yyyy,
    yy,
    mm,
    dd,
    yymm: `${yy}${mm}`,
    yymmdd: `${yy}${mm}${dd}`,
  };
}

function getStationFolderName(stationCode: string): string {
  return stationCode.replace(/\d+$/, "");
}

function buildFolderPreview(stationCode: string, dateValue: string | Date) {
  const parts = formatEffortDateParts(dateValue);
  const stationFolderName = getStationFolderName(stationCode);
  const monthFolderName = `${stationCode}_${parts.yymm}`;
  const dayFolderName = `${stationCode}_${parts.yymmdd}`;
  return `${stationFolderName}/${monthFolderName}/${dayFolderName}`;
}

function buildUniqueFileName(
  baseName: string,
  ext: string,
  existingNames: Set<string>
) {
  const normalizedExt = ext.replace(/^\./, "");
  const baseFileName = `${baseName}.${normalizedExt}`;
  if (!existingNames.has(baseFileName)) {
    existingNames.add(baseFileName);
    return baseFileName;
  }

  let counter = 2;
  while (true) {
    const suffix = String(counter).padStart(2, "0");
    const candidate = `${baseName}_${suffix}.${normalizedExt}`;
    if (!existingNames.has(candidate)) {
      existingNames.add(candidate);
      return candidate;
    }
    counter += 1;
  }
}

export default function CapturePictures() {
  const router = useRouter();
  const captureId = Number(router.query.id);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<
    { id: string; file: File; position: string; previewUrl: string }[]
  >([]);
  const [deleteJustification, setDeleteJustification] = useState("");
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPhotosRef = useRef<
    { id: string; file: File; position: string; previewUrl: string }[]
  >([]);

  const captureQuery = api.captures.getCaptureById.useQuery(
    { captureId },
    { enabled: !!captureId && !isNaN(captureId) }
  );

  const photosQuery = api.photos.getPhotosByCapture.useQuery(
    { captureId },
    { enabled: !!captureId && !isNaN(captureId) }
  );

  const deletePhotoMutation = api.photos.deletePhoto.useMutation();
  const utils = api.useContext();

  const updatePhotoPosition = (id: string, position: string) => {
    setSelectedPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, position } : photo
      )
    );
  };

  const removeSelectedPhoto = (id: string) => {
    setSelectedPhotos((prev) => {
      const photoToRemove = prev.find((photo) => photo.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }
      return prev.filter((photo) => photo.id !== id);
    });
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setSelectedPhotos((prev) => {
        prev.forEach((photo) => {
          URL.revokeObjectURL(photo.previewUrl);
        });
        return [];
      });
      return;
    }

    const next = Array.from(files).map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      file,
      position: "",
      previewUrl: URL.createObjectURL(file),
    }));
    setSelectedPhotos((prev) => {
      prev.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });
      return next;
    });
    setUploadError(null);
  };

  useEffect(() => {
    selectedPhotosRef.current = selectedPhotos;
  }, [selectedPhotos]);

  useEffect(() => {
    return () => {
      selectedPhotosRef.current.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });
    };
  }, []);

  const handleUpload = async () => {
    if (selectedPhotos.length === 0) return;

    const missingPosition = selectedPhotos.find((photo) => !photo.position);
    if (missingPosition) {
      setUploadError("Selecione a posição de todas as fotos antes de enviar.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      for (const photo of selectedPhotos) {
        const formData = new FormData();
        formData.append("file", photo.file);
        formData.append("captureId", String(captureId));
        formData.append("position", photo.position);

        const response = await fetch("/api/upload-photo", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }
      }

      await utils.photos.getPhotosByCapture.invalidate({ captureId });
      setSelectedPhotos((prev) => {
        prev.forEach((photo) => {
          URL.revokeObjectURL(photo.previewUrl);
        });
        return [];
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Erro ao fazer upload"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!deleteJustification.trim()) return;

    try {
      await deletePhotoMutation.mutateAsync({
        photoId,
        justification: deleteJustification.trim(),
      });
      await utils.photos.getPhotosByCapture.invalidate({ captureId });
      setDeletingPhotoId(null);
      setDeleteJustification("");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (!captureId || isNaN(captureId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060e1e] text-slate-100">
        <p>ID de captura inválido</p>
      </div>
    );
  }

  if (captureQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060e1e] text-slate-100">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const data = captureQuery.data;
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060e1e] text-slate-100">
        <p>Captura não encontrada</p>
      </div>
    );
  }

  const photos = photosQuery.data ?? [];
  const categoricalValues = data.categoricalValues ?? [];
  const ageValue = categoricalValues.find((value) =>
    matchesPromotedVariable(value, PROMOTED_VARIABLE_ALIASES.age)
  );
  const sexValue = categoricalValues.find((value) =>
    matchesPromotedVariable(value, PROMOTED_VARIABLE_ALIASES.sex)
  );
  const speciesSegment = formatSegment(data.sppCode ?? "", "SEM_ESPECIE");
  const bandSegment =
    data.bandSize && data.bandNumber
      ? formatSegment(`${data.bandSize}${data.bandNumber}`, "SEM_ANILHA")
      : "SEM_ANILHA";
  const effortDateSegment = data.data
    ? formatEffortDate(String(data.data))
    : "00000000";
  const ageSegment = formatSegment(ageValue?.value ?? "NA", "NA");
  const sexSegment = formatSegment(sexValue?.value ?? "U", "U");
  const folderPreview =
    data.station && data.data
      ? buildFolderPreview(data.station, String(data.data))
      : "";
  const baseFileName = `${speciesSegment}_${bandSegment}_${effortDateSegment}_${ageSegment}_${sexSegment}`;
  const existingFileNames = new Set(
    photos.map((photo) => String(photo.fileName))
  );
  const previewNamesById = new Map<string, string>();
  const nameAccumulator = new Set(existingFileNames);
  selectedPhotos.forEach((photo) => {
    const ext = photo.file.name.split(".").pop() || "jpg";
    const positionSegment = formatSegment(
      photo.position || "SEM_POSICAO",
      "SEM_POSICAO"
    );
    const baseName = `${baseFileName}_${positionSegment}`;
    const uniqueName = buildUniqueFileName(baseName, ext, nameAccumulator);
    previewNamesById.set(photo.id, uniqueName);
  });

  return (
    <main className="min-h-screen bg-[#060e1e]">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 p-4">
        {/* Header */}
        <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href={`/captures/${captureId}`}
                  className="border border-transparent p-1.5 text-slate-400 transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    fotos
                  </p>
                  <p className="font-mono text-lg font-semibold text-cyan-200">
                    {data.sppCode} - {data.bandNumber || "Sem anilha"}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400">
                <p>{data.station}</p>
                <p>{String(data.data ?? "")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload area */}
        <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Pasta de destino
                  </p>
                  <p className="text-sm text-slate-200">
                    {folderPreview || "—"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelection(e.target.files)}
                    disabled={isUploading}
                  />
                  <button
                    className="flex items-center gap-2 border border-cyan-300/40 px-4 py-2 text-cyan-200 transition-colors hover:bg-cyan-500/10 disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4" />
                    Selecionar fotos
                  </button>
                  <button
                    className="flex items-center gap-2 border border-cyan-300/40 px-4 py-2 text-cyan-200 transition-colors hover:bg-cyan-500/10 disabled:opacity-50"
                    onClick={handleUpload}
                    disabled={
                      isUploading ||
                      selectedPhotos.length === 0 ||
                      selectedPhotos.some((photo) => !photo.position)
                    }
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Enviar fotos
                      </>
                    )}
                  </button>
                </div>
              </div>

              {selectedPhotos.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Selecione as fotos para definir a posição de cada uma.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex flex-col gap-3 border border-[#2d3f64] bg-[#0b1428] p-3"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo.previewUrl}
                            alt={photo.file.name}
                            className="h-16 w-16 border border-[#2d3f64] object-cover"
                          />
                          <div>
                            <p className="text-sm text-slate-100">
                              {photo.file.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              Nome final:{" "}
                              {previewNamesById.get(photo.id) || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex w-full max-w-xs items-end gap-2">
                          <div className="flex w-full flex-col gap-1">
                            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Posição
                            </label>
                            <select
                              className="w-full border border-cyan-300/40 bg-[#0a1224] px-3 py-2 text-sm text-slate-100"
                              value={photo.position}
                              onChange={(event) =>
                                updatePhotoPosition(
                                  photo.id,
                                  event.target.value
                                )
                              }
                              disabled={isUploading}
                            >
                              <option value="">Selecione...</option>
                              {PHOTO_POSITIONS.map((position) => (
                                <option key={position} value={position}>
                                  {position}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            className="border border-transparent p-2 text-red-300 transition-colors hover:border-red-400/40 hover:bg-red-500/10 disabled:opacity-50"
                            onClick={() => removeSelectedPhoto(photo.id)}
                            disabled={isUploading}
                            title="Remover foto"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uploadError && (
                <p className="text-sm text-red-400">{uploadError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photos grid */}
        {photosQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : photos.length === 0 ? (
          <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
            <CardContent className="p-8 text-center text-slate-400">
              Nenhuma foto enviada
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((photo) => (
              <Card
                key={photo.photoId}
                className="group relative overflow-hidden rounded-none border-[#2d3f64] bg-[#0a1224] shadow-none"
              >
                <img
                  src={`https://drive.google.com/thumbnail?id=${photo.driveFileId}&sz=w400`}
                  alt={photo.originalFileName}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
                  <p className="truncate text-xs text-slate-300">
                    {photo.originalFileName}
                  </p>
                  {photo.position && (
                    <p className="text-[10px] uppercase tracking-wide text-cyan-200">
                      {photo.position}
                    </p>
                  )}
                </div>
                <button
                  className="absolute right-1 top-1 border border-transparent bg-black/50 p-1 text-red-300 opacity-0 transition-all hover:border-red-400/40 hover:bg-red-500/20 group-hover:opacity-100"
                  onClick={() => setDeletingPhotoId(Number(photo.photoId))}
                  title="Excluir foto"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deletingPhotoId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Excluir foto</h2>
            <p className="mb-4 text-sm text-gray-600">
              Esta ação irá remover a foto do Google Drive e marcar como
              excluída no banco de dados.
            </p>
            <div className="mb-4">
              <label className="mb-2 block">Justificativa</label>
              <textarea
                className="w-full rounded border p-2"
                value={deleteJustification}
                onChange={(e) => setDeleteJustification(e.target.value)}
                placeholder="Justificativa da exclusão"
              />
            </div>

            {deletePhotoMutation.error && (
              <p className="mb-4 text-red-500">
                {deletePhotoMutation.error.message}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="rounded border px-4 py-2"
                onClick={() => {
                  setDeletingPhotoId(null);
                  setDeleteJustification("");
                }}
              >
                Cancelar
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-white disabled:bg-red-300"
                disabled={
                  !deleteJustification.trim() ||
                  deletePhotoMutation.isLoading
                }
                onClick={() => handleDelete(deletingPhotoId)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
