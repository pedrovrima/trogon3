import { api } from "@/utils/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trash,
  Edit,
  FileText,
  AlertTriangle,
  ExternalLink,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type EditableCaptureVariable =
  | {
      kind: "categorical";
      id: number;
      variableId: number;
      optionId: number;
      label: string;
      value: string;
    }
  | {
      kind: "continuous";
      id: number;
      variableId: number;
      label: string;
      value: string;
    };

// Add a Modal component
function NetEffortModal({
  isOpen,
  onClose,
  captureId,
}: {
  isOpen: boolean;
  onClose: () => void;
  captureId: number;
}) {
  const [selectedStation, setSelectedStation] = useState<number | undefined>(
    undefined
  );
  const [selectedEffort, setSelectedEffort] = useState<number | undefined>(
    undefined
  );
  const [selectedNetEff, setSelectedNetEff] = useState<number | undefined>(
    undefined
  );
  const [justification, setJustification] = useState("");

  const stations = api.captures.getStations.useQuery();
  const efforts = api.captures.getEffortsByStation.useQuery(
    { stationId: selectedStation! },
    { enabled: selectedStation !== undefined }
  );
  const netEfforts = api.captures.getNetEffortsByEffort.useQuery(
    { effortId: selectedEffort! },
    { enabled: selectedEffort !== undefined }
  );

  const updateMutation = api.captures.updateCaptureNetEffort.useMutation();
  const utils = api.useContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Update Net Effort</h2>

        {/* Station Selection */}
        <div className="mb-4">
          <label className="mb-2 block">Station</label>
          <select
            className="w-full rounded border p-2"
            onChange={(e) => {
              console.log(e);
              const value = e.target.value;
              console.log(value);
              setSelectedStation(value === "" ? undefined : Number(value));
              setSelectedEffort(undefined);
              setSelectedNetEff(undefined);
            }}
          >
            <option value="">Select a station</option>
            {stations.data?.map((station) => (
              <option key={station.stationId} value={Number(station.stationId)}>
                {station.stationCode} - {station.stationName}
              </option>
            ))}
          </select>
        </div>

        {/* Effort Selection */}
        {selectedStation !== undefined && (
          <div className="mb-4">
            <label className="mb-2 block">Effort Date</label>
            <select
              className="w-full rounded border p-2"
              onChange={(e) => {
                setSelectedEffort(Number(e.target.value));
                setSelectedNetEff(undefined);
              }}
            >
              <option value="">Select a date</option>
              {efforts.data?.map((effort) => (
                <option key={effort.effortId} value={effort.effortId}>
                  {new Date(effort.dateEffort).toLocaleDateString()} -{" "}
                  {effort.protocolCode}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Net Selection */}
        {selectedEffort !== undefined && (
          <div className="mb-4">
            <label className="mb-2 block">Net</label>
            <select
              className="w-full rounded border p-2"
              onChange={(e) => setSelectedNetEff(Number(e.target.value))}
            >
              <option value="">Select a net</option>
              {netEfforts.data?.map((net) => (
                <option key={net.netEffId} value={Number(net.netEffId)}>
                  Net {net.netNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Justification */}
        <div className="mb-4">
          <label className="mb-2 block">Justification</label>
          <textarea
            className="w-full rounded border p-2"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Why are you making this change?"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button className="rounded border px-4 py-2" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-blue-300"
            disabled={
              !selectedNetEff || !justification || updateMutation.isLoading
            }
            onClick={async () => {
              if (selectedNetEff && justification) {
                await updateMutation.mutateAsync({
                  captureId,
                  newNetEffId: selectedNetEff,
                  justification,
                });
                await utils.captures.getCaptureById.invalidate({ captureId });
                onClose();
              }
            }}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function CaptureCodeModal({
  isOpen,
  onClose,
  captureId,
  currentCaptureCode,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  captureId: number;
  currentCaptureCode: string;
  onUpdated: () => Promise<void>;
}) {
  const [selectedCaptureCode, setSelectedCaptureCode] = useState("");
  const [captureCodeJustification, setCaptureCodeJustification] = useState("");

  const captureCodeOptionsQuery = api.captures.getCaptureCodeOptions.useQuery(
    undefined,
    { enabled: isOpen }
  );
  const updateCaptureCodeMutation =
    api.captures.updateCaptureCode.useMutation();

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedCaptureCode("");
    setCaptureCodeJustification("");
    onClose();
  };

  const selectedCode = selectedCaptureCode || currentCaptureCode;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Editar Capture Code</h2>

        <div className="mb-4">
          <label className="mb-2 block">Capture Code</label>
          <select
            className="w-full rounded border p-2"
            value={selectedCode}
            onChange={(e) => setSelectedCaptureCode(e.target.value)}
            disabled={captureCodeOptionsQuery.isLoading}
          >
            <option value="">Selecione um código</option>
            {captureCodeOptionsQuery.data?.map((option) => (
              <option key={option.optionId} value={option.value}>
                {option.value}
                {option.description ? ` - ${option.description}` : ""}
              </option>
            ))}
          </select>
          {captureCodeOptionsQuery.isLoading && (
            <p className="mt-2 text-sm">Carregando opções de Capture Code...</p>
          )}
          {!captureCodeOptionsQuery.isLoading &&
            captureCodeOptionsQuery.data?.length === 0 && (
              <p className="mt-2 text-sm">
                Nenhuma opção de Capture Code disponível.
              </p>
            )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block">Justificativa</label>
          <textarea
            className="w-full rounded border p-2"
            value={captureCodeJustification}
            onChange={(e) => setCaptureCodeJustification(e.target.value)}
            placeholder="Justificativa da alteração"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Justificativa obrigatória para salvar.
          </p>
        </div>

        {updateCaptureCodeMutation.error && (
          <p className="mb-4 text-red-500">
            {updateCaptureCodeMutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button className="rounded border px-4 py-2" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="rounded bg-green-600 px-4 py-2 text-white disabled:bg-green-300"
            disabled={
              !selectedCode ||
              !captureCodeJustification.trim() ||
              updateCaptureCodeMutation.isLoading ||
              captureCodeOptionsQuery.isLoading
            }
            onClick={async () => {
              if (!selectedCode || !captureCodeJustification.trim()) {
                return;
              }

              await updateCaptureCodeMutation.mutateAsync({
                captureId,
                newCaptureCode: selectedCode,
                justification: captureCodeJustification.trim(),
              });

              handleClose();
              await onUpdated();
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function CaptureSpeciesModal({
  isOpen,
  onClose,
  captureId,
  currentSppId,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  captureId: number;
  currentSppId: number;
  onUpdated: () => Promise<void>;
}) {
  const [selectedSppId, setSelectedSppId] = useState<number | undefined>(
    undefined
  );
  const [speciesJustification, setSpeciesJustification] = useState("");

  const speciesOptionsQuery = api.captures.getSpeciesOptions.useQuery(
    undefined,
    {
      enabled: isOpen,
    }
  );
  const updateSpeciesMutation = api.captures.updateCaptureSpecies.useMutation();

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedSppId(undefined);
    setSpeciesJustification("");
    onClose();
  };

  const selectedSpeciesId = selectedSppId ?? currentSppId;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Trocar espécie</h2>

        <div className="mb-4">
          <label className="mb-2 block">Espécie</label>
          <select
            className="w-full rounded border p-2"
            value={selectedSpeciesId}
            onChange={(e) => setSelectedSppId(Number(e.target.value))}
            disabled={speciesOptionsQuery.isLoading}
          >
            <option value="">Selecione uma espécie</option>
            {speciesOptionsQuery.data?.map((option) => (
              <option key={option.sppId} value={Number(option.sppId)}>
                {option.sppCode} - {option.sppName}
              </option>
            ))}
          </select>
          {speciesOptionsQuery.isLoading && (
            <p className="mt-2 text-sm">Carregando opções de espécie...</p>
          )}
          {!speciesOptionsQuery.isLoading &&
            speciesOptionsQuery.data?.length === 0 && (
              <p className="mt-2 text-sm">Nenhuma espécie disponível.</p>
            )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block">Justificativa</label>
          <textarea
            className="w-full rounded border p-2"
            value={speciesJustification}
            onChange={(e) => setSpeciesJustification(e.target.value)}
            placeholder="Justificativa da alteração"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Justificativa obrigatória para salvar.
          </p>
        </div>

        {updateSpeciesMutation.error && (
          <p className="mb-4 text-red-500">
            {updateSpeciesMutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button className="rounded border px-4 py-2" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="rounded bg-green-600 px-4 py-2 text-white disabled:bg-green-300"
            disabled={
              !selectedSpeciesId ||
              selectedSpeciesId === currentSppId ||
              !speciesJustification.trim() ||
              updateSpeciesMutation.isLoading ||
              speciesOptionsQuery.isLoading
            }
            onClick={async () => {
              if (!selectedSpeciesId || !speciesJustification.trim()) {
                return;
              }

              await updateSpeciesMutation.mutateAsync({
                captureId,
                newSppId: selectedSpeciesId,
                justification: speciesJustification.trim(),
              });

              handleClose();
              await onUpdated();
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function CaptureVariableModal({
  isOpen,
  onClose,
  captureId,
  variable,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  captureId: number;
  variable: EditableCaptureVariable | null;
  onUpdated: () => Promise<void>;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | undefined>(
    undefined
  );
  const [continuousValue, setContinuousValue] = useState("");
  const [justification, setJustification] = useState("");

  const variableOptionsQuery =
    api.captures.getCategoricalVariableOptions.useQuery(
      { variableId: variable?.variableId ?? 0 },
      { enabled: isOpen && variable?.kind === "categorical" }
    );
  const updateVariableMutation =
    api.captures.updateCaptureVariableValue.useMutation();

  useEffect(() => {
    if (!isOpen || !variable) {
      return;
    }

    setJustification("");

    if (variable.kind === "categorical") {
      setSelectedOptionId(variable.optionId);
      setContinuousValue("");
      return;
    }

    setContinuousValue(variable.value);
    setSelectedOptionId(undefined);
  }, [isOpen, variable]);

  if (!isOpen || !variable) return null;

  const handleClose = () => {
    setSelectedOptionId(undefined);
    setContinuousValue("");
    setJustification("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Editar variável</h2>

        <div className="mb-4">
          <label className="mb-2 block">{variable.label}</label>
          {variable.kind === "categorical" ? (
            <select
              className="w-full rounded border p-2"
              value={selectedOptionId ?? ""}
              onChange={(e) => setSelectedOptionId(Number(e.target.value))}
              disabled={variableOptionsQuery.isLoading}
            >
              <option value="">Selecione uma opção</option>
              {variableOptionsQuery.data?.map((option) => (
                <option key={option.optionId} value={Number(option.optionId)}>
                  {option.value}
                  {option.description ? ` - ${option.description}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-2">
              <input
                className="w-full rounded border p-2"
                value={continuousValue}
                onChange={(e) => setContinuousValue(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => setContinuousValue("NA")}
                >
                  NA
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => setContinuousValue("U")}
                >
                  U
                </button>
              </div>
            </div>
          )}

          {variable.kind === "categorical" &&
            variableOptionsQuery.isLoading && (
              <p className="mt-2 text-sm">Carregando opções...</p>
            )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block">Justificativa</label>
          <textarea
            className="w-full rounded border p-2"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Justificativa da alteração"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Justificativa obrigatória para salvar.
          </p>
        </div>

        {updateVariableMutation.error && (
          <p className="mb-4 text-red-500">
            {updateVariableMutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button className="rounded border px-4 py-2" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="rounded bg-green-600 px-4 py-2 text-white disabled:bg-green-300"
            disabled={
              !justification.trim() ||
              updateVariableMutation.isLoading ||
              (variable.kind === "categorical"
                ? !selectedOptionId ||
                  selectedOptionId === variable.optionId ||
                  variableOptionsQuery.isLoading
                : !continuousValue.trim() || continuousValue === variable.value)
            }
            onClick={async () => {
              if (!justification.trim()) {
                return;
              }

              if (variable.kind === "categorical") {
                if (!selectedOptionId) {
                  return;
                }

                await updateVariableMutation.mutateAsync({
                  captureId,
                  valueId: variable.id,
                  variableKind: "categorical",
                  newOptionId: selectedOptionId,
                  justification: justification.trim(),
                });
              } else {
                await updateVariableMutation.mutateAsync({
                  captureId,
                  valueId: variable.id,
                  variableKind: "continuous",
                  newValue: continuousValue,
                  justification: justification.trim(),
                });
              }

              handleClose();
              await onUpdated();
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function CaptureTimeModal({
  isOpen,
  onClose,
  captureId,
  currentCaptureTime,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  captureId: number;
  currentCaptureTime: string;
  onUpdated: () => Promise<void>;
}) {
  const [captureTime, setCaptureTime] = useState("");
  const [justification, setJustification] = useState("");

  const updateCaptureTimeMutation =
    api.captures.updateCaptureTime.useMutation();

  useEffect(() => {
    if (isOpen) {
      setCaptureTime(currentCaptureTime);
      setJustification("");
    }
  }, [isOpen, currentCaptureTime]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCaptureTime("");
    setJustification("");
    onClose();
  };

  const isValidTime = (() => {
    if (!/^\d{3}$/.test(captureTime)) return false;
    const padded = captureTime + "0";
    const hours = parseInt(padded.slice(0, 2), 10);
    const minutes = parseInt(padded.slice(2, 4), 10);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  })();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Editar horário de captura</h2>

        <div className="mb-4">
          <label className="mb-2 block">Horário (3 dígitos)</label>
          <input
            className="w-full rounded border p-2"
            value={captureTime}
            onChange={(e) => setCaptureTime(e.target.value)}
            placeholder="Ex: 069, 102, 145"
            maxLength={3}
          />
          {captureTime && !isValidTime && (
            <p className="mt-1 text-sm text-red-500">
              O horário deve ter 3 dígitos e formar um horário válido (ex: 069 = 06:90 inválido, 065 = 06:50 válido).
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block">Justificativa</label>
          <textarea
            className="w-full rounded border p-2"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Justificativa da alteração"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Justificativa obrigatória para salvar.
          </p>
        </div>

        {updateCaptureTimeMutation.error && (
          <p className="mb-4 text-red-500">
            {updateCaptureTimeMutation.error.message}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button className="rounded border px-4 py-2" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="rounded bg-green-600 px-4 py-2 text-white disabled:bg-green-300"
            disabled={
              !isValidTime ||
              !justification.trim() ||
              captureTime === currentCaptureTime ||
              updateCaptureTimeMutation.isLoading
            }
            onClick={async () => {
              if (!isValidTime || !justification.trim()) return;

              await updateCaptureTimeMutation.mutateAsync({
                captureId,
                newCaptureTime: captureTime,
                justification: justification.trim(),
              });

              handleClose();
              await onUpdated();
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoCarousel({ captureId }: { captureId: number }) {
  const photosQuery = api.photos.getPhotosByCapture.useQuery({ captureId });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const photos = photosQuery.data ?? [];

  if (photosQuery.isLoading) return null;
  if (photos.length === 0) return null;

  const safeIndex = Math.min(currentIndex, photos.length - 1);
  const current = photos[safeIndex];

  const goTo = (index: number) => {
    setCurrentIndex((index + photos.length) % photos.length);
  };

  return (
    <>
      <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Fotos ({photos.length})
            </p>
            <Link
              href={`/captures/${captureId}/pictures`}
              className="flex items-center gap-1 text-xs font-medium text-cyan-200 transition-colors hover:text-cyan-100 hover:underline"
            >
              Gerenciar fotos
              <ExternalLink size={12} />
            </Link>
          </div>

          {/* Main image */}
          <div className="relative">
            <button
              type="button"
              className="block w-full cursor-pointer"
              onClick={() => setFullscreen(true)}
            >
              {current && (
                <img
                  src={`https://drive.google.com/thumbnail?id=${current.driveFileId}&sz=w800`}
                  alt={current.position ?? current.fileName ?? "Foto"}
                  className="mx-auto max-h-[400px] w-full object-contain"
                  loading="lazy"
                />
              )}
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
                  onClick={() => goTo(safeIndex - 1)}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
                  onClick={() => goTo(safeIndex + 1)}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Position label */}
          {current?.position && (
            <p className="mt-2 text-center text-xs uppercase tracking-widest text-slate-400">
              {current.position}
            </p>
          )}

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, index) => (
                <button
                  key={photo.photoId}
                  type="button"
                  className={`flex-shrink-0 border-2 transition ${
                    index === safeIndex
                      ? "border-cyan-400"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img
                    src={`https://drive.google.com/thumbnail?id=${photo.driveFileId}&sz=w120`}
                    alt={photo.position ?? photo.fileName ?? "Foto"}
                    className="h-16 w-20 object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen overlay */}
      {fullscreen && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setFullscreen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={() => setFullscreen(false)}
          >
            <X size={24} />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(safeIndex - 1);
                }}
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(safeIndex + 1);
                }}
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          <img
            src={`https://drive.google.com/thumbnail?id=${current.driveFileId}&sz=w1200`}
            alt={current.position ?? current.fileName ?? "Foto"}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {current.position && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm uppercase tracking-widest text-white/70">
              {current.position}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function normalizeVariableKey(value: string | null | undefined) {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .trim();
}

const PROMOTED_VARIABLE_ALIASES = {
  age: ["age_wrp", "idade", "wrp", "idwrp", "idade_wrp"],
  sex: ["sex_code", "sexo", "sex"],
  ageCriteria: ["age_criteria", "criterio_de_idade", "criterio_idade"],
  sexCriteria: ["sex_criteria", "criterio_de_sexo", "criterio_sexo"],
};

const EXTRA_EXCLUDED_ALIASES = [
  ...PROMOTED_VARIABLE_ALIASES.age,
  ...PROMOTED_VARIABLE_ALIASES.sex,
  ...PROMOTED_VARIABLE_ALIASES.ageCriteria,
  ...PROMOTED_VARIABLE_ALIASES.sexCriteria,
  "status",
  "capture_code",
  "codigo_de_captura",
  "cloacal_protuberance",
  "protuberancia_cloacal",
  "broodpatch",
  "brood_patch",
  "fat_score",
  "fat",
  "gordura",
  "body_molt",
  "body_moult",
  "body_mold",
  "muda_corporal",
  "wing_molt",
  "wing_moult",
  "wing_mold",
  "wing_mode",
  "wing_multi",
  "multi_wing",
  "multiwing",
  "muda_de_asa",
  "muda_da_asa",
  "flight_feather_molt",
  "molt_limit",
  "skull",
  "cranio",
  "crânio",
  "juvenile_feather",
  "pena_juvenil",
  "damage",
  "dano",
];

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

function getVariableOrder(order: unknown) {
  if (typeof order === "number" && Number.isFinite(order)) {
    return order;
  }

  if (typeof order === "string") {
    const parsedOrder = Number(order);
    return Number.isFinite(parsedOrder) ? parsedOrder : 999;
  }

  return 999;
}

function displayValue(value: string | null | undefined, fallback = "—") {
  if (!value) return fallback;
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : fallback;
}

function formatUsageTime(captureTime: string | null | undefined) {
  if (!captureTime) return "—";
  const normalized = captureTime.trim();
  if (normalized.length === 3) return `${normalized}0`;
  if (normalized.length === 4) return normalized;
  return normalized;
}

function findVariableValue<
  T extends {
    variableName: string | null;
    label: string | null;
    value: string | null;
  }
>(variables: T[], aliases: string[]): T | undefined {
  return variables.find((variable) => {
    const normalizedName = normalizeVariableKey(variable.variableName);
    const normalizedLabel = normalizeVariableKey(variable.label);

    return aliases.some((alias) => {
      const normalizedAlias = normalizeVariableKey(alias);
      return (
        normalizedName === normalizedAlias ||
        normalizedLabel === normalizedAlias ||
        normalizedName.includes(normalizedAlias) ||
        normalizedLabel.includes(normalizedAlias)
      );
    });
  });
}

function isGreaterThanOne(value: string | null | undefined) {
  if (!value) return false;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 1;
}

function isGreaterThan(value: string | null | undefined, threshold: number) {
  if (!value) return false;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > threshold;
}

function variableDisplayLabel(
  variable:
    | {
        label: string | null;
        variableName: string | null;
      }
    | undefined
    | null,
  fallback: string
) {
  return variable?.label ?? variable?.variableName ?? fallback;
}

function isMeasurementVariable(variable: {
  variableName: string | null;
  label: string | null;
}) {
  const normalizedName = normalizeVariableKey(variable.variableName);
  const normalizedLabel = normalizeVariableKey(variable.label);
  const target = `${normalizedName}_${normalizedLabel}`;
  const measurementKeywords = [
    "peso",
    "weight",
    "massa",
    "comprimento",
    "length",
    "wing_length",
    "asa",
    "tail",
    "cauda",
    "tarsus",
    "tarso",
    "bill",
    "bico",
    "culmen",
    "envergadura",
  ];

  return measurementKeywords.some((keyword) => target.includes(keyword));
}

function formatValueWithUnit(
  value: string | null | undefined,
  unit: string | null | undefined
) {
  const displayedValue = displayValue(value);
  const displayedUnit = displayValue(unit, "");
  return displayedUnit ? `${displayedValue} ${displayedUnit}` : displayedValue;
}

function formatDate(dateStr: unknown) {
  if (typeof dateStr !== "string") return "";
  return new Date(dateStr).toLocaleDateString("pt-BR", { timeZone: "GMT" });
}

export default function CaptureInfo() {
  const { id } = useRouter().query;
  const captureId = Number(Array.isArray(id) ? id[0] : id);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCaptureCodeModalOpen, setIsCaptureCodeModalOpen] = useState(false);
  const [isCaptureSpeciesModalOpen, setIsCaptureSpeciesModalOpen] =
    useState(false);
  const [isCaptureTimeModalOpen, setIsCaptureTimeModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] =
    useState<EditableCaptureVariable | null>(null);

  const query = api.captures.getCaptureById.useQuery(
    { captureId: Number.isFinite(captureId) ? captureId : 0 },
    { enabled: Number.isFinite(captureId) }
  );
  const deleteMutation = api.captures.deleteCapture.useMutation();

  if (!Number.isFinite(captureId) || query.isLoading) return <p>Loading...</p>;
  const { data } = query;

  if (data) {
    const canEdit = !data.hasChanged && isEditMode;

    const ageValue = data.categoricalValues.find((value) =>
      matchesPromotedVariable(value, PROMOTED_VARIABLE_ALIASES.age)
    );
    const sexValue = data.categoricalValues.find((value) =>
      matchesPromotedVariable(value, PROMOTED_VARIABLE_ALIASES.sex)
    );
    const ageCriteriaValues = data.categoricalValues.filter((value) =>
      matchesPromotedVariable(value, PROMOTED_VARIABLE_ALIASES.ageCriteria)
    );
    const sexCriteriaValues = data.categoricalValues.filter((value) =>
      matchesPromotedVariable(value, PROMOTED_VARIABLE_ALIASES.sexCriteria)
    );

    const allVariables = [
      ...data.categoricalValues.map((value) => ({
        ...value,
        kind: "categorical" as const,
      })),
      ...data.continuousValues.map((value) => ({
        ...value,
        kind: "continuous" as const,
      })),
    ].sort((first, second) => {
      const orderDiff =
        getVariableOrder(first.order) - getVariableOrder(second.order);

      if (orderDiff !== 0) return orderDiff;

      const firstLabel =
        normalizeVariableKey(first.label) ||
        normalizeVariableKey(first.variableName);
      const secondLabel =
        normalizeVariableKey(second.label) ||
        normalizeVariableKey(second.variableName);

      return firstLabel.localeCompare(secondLabel);
    });

    const cloacalProtuberanceValue = findVariableValue(allVariables, [
      "cloacal_protuberance",
      "protuberancia_cloacal",
      "protuberância_cloacal",
      "cloical_protuberance",
    ]);
    const broodPatchValue = findVariableValue(allVariables, [
      "broodpatch",
      "brood_patch",
      "placa_de_incubacao",
      "placa_de_incubação",
      "brutepatch",
    ]);
    const fatScoreValue = findVariableValue(allVariables, [
      "fat_score",
      "fat",
      "gordura",
      "fet",
    ]);
    const bodyMoltValue = findVariableValue(allVariables, [
      "body_molt",
      "body_moult",
      "body_mold",
      "muda_corporal",
    ]);
    const wingMoltValue = findVariableValue(allVariables, [
      "wing_molt",
      "wing_moult",
      "wing_mold",
      "wing_mode",
      "wing_multi",
      "multi_wing",
      "multiwing",
      "muda_de_asa",
      "muda_da_asa",
      "muda_asa",
      "flight_feather_molt",
    ]);
    const moltLimitValue = findVariableValue(allVariables, [
      "molt_limit",
      "limite_de_muda",
      "limite_muda",
    ]);
    const skullValue = findVariableValue(allVariables, [
      "skull",
      "cranio",
      "crânio",
      "skull_ossification",
      "cranial_ossification",
    ]);
    const damageValue = findVariableValue(allVariables, [
      "damage",
      "dano",
      "feather_damage",
      "plumage_damage",
    ]);
    const juvenileFeatherValue = findVariableValue(allVariables, [
      "juvenile_feather",
      "juvenile_plumage",
      "pena_juvenil",
      "plumagem_juvenil",
    ]);
    const measureContinuousVariables = data.continuousValues.filter((value) =>
      isMeasurementVariable(value)
    );

    const listedVariableIds = new Set(
      [
        ageValue,
        sexValue,
        ...ageCriteriaValues,
        ...sexCriteriaValues,
        cloacalProtuberanceValue,
        broodPatchValue,
        fatScoreValue,
        bodyMoltValue,
        wingMoltValue,
        moltLimitValue,
        skullValue,
        damageValue,
        juvenileFeatherValue,
      ]
        .filter((value) => value && value.kind === "categorical")
        .map((value) => Number(value?.id))
    );

    const extraCategoricalVariables = data.categoricalValues.filter(
      (value) =>
        !listedVariableIds.has(Number(value.id)) &&
        !matchesPromotedVariable(value, EXTRA_EXCLUDED_ALIASES)
    );

    const openCategoricalEditor = (
      value: (typeof data.categoricalValues)[number] | undefined
    ) => {
      if (!canEdit || !value || value.optionId === null) return;

      setEditingVariable({
        kind: "categorical",
        id: Number(value.id),
        variableId: Number(value.variableId),
        optionId: Number(value.optionId),
        label: value.label ?? value.variableName ?? "Variável categórica",
        value: value.value ?? "",
      });
    };

    const openContinuousEditor = (
      value: (typeof data.continuousValues)[number] | undefined
    ) => {
      if (!canEdit || !value) return;

      setEditingVariable({
        kind: "continuous",
        id: Number(value.id),
        variableId: Number(value.variableId),
        label: value.label ?? value.variableName ?? "Variável contínua",
        value: value.value ?? "",
      });
    };

    const openAnyVariableEditor = (value: (typeof allVariables)[number]) => {
      if (value.kind === "categorical") {
        openCategoricalEditor(value);
        return;
      }

      openContinuousEditor(value);
    };

    return (
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-6">
        {/* Deleted banner */}
        {data.hasChanged && (
          <div className="flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
            <AlertTriangle size={18} />
            <span className="font-medium">Este registro foi excluído</span>
          </div>
        )}

        {/* Hero Card */}
        <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              {!data.hasChanged && (
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                  <input
                    type="checkbox"
                    checked={isEditMode}
                    onChange={(event) => setIsEditMode(event.target.checked)}
                    className="rounded-none border-slate-500 bg-[#0a1224]"
                  />
                  <span>Modo edição</span>
                </label>
              )}

              <div className="flex items-center gap-2">
                <Link
                  href={`/captures/${data.captureId}/pictures`}
                  className="border border-transparent p-1.5 text-cyan-300 transition-colors hover:border-cyan-300/40 hover:bg-cyan-500/10 hover:text-cyan-200"
                  title="Fotos"
                >
                  <Camera className="h-4 w-4" />
                </Link>
                {canEdit && (
                  <button
                    className="border border-transparent p-1.5 text-red-300 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200"
                    onClick={async () => {
                      await deleteMutation.mutateAsync({
                        recordId: Number(data.captureId),
                        justification: "delete duplicated record",
                      });
                      await query.refetch();
                    }}
                    disabled={deleteMutation.isLoading}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-semibold text-cyan-200">
                {displayValue(data.captureCode)}
              </span>
              <span className="text-slate-500">-</span>
              {data.bandNumber ? (
                <Link
                  href={`/bands/${data.bandSize ?? ""}${data.bandNumber}`}
                  className="text-center font-mono text-3xl font-semibold tracking-widest text-cyan-200 transition-colors hover:text-cyan-100 hover:underline"
                >
                  {`${data.bandSize ?? ""}${data.bandNumber}`}
                </Link>
              ) : (
                <span className="text-center font-mono text-3xl font-semibold text-slate-500">
                  Sem anilha
                </span>
              )}
              {canEdit && (
                <button
                  className="border border-transparent p-0.5 text-slate-400 transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
                  onClick={() => setIsCaptureCodeModalOpen(true)}
                  title="Editar capture code"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <h1 className="text-2xl font-semibold italic text-cyan-100">
                {data.sppName}
              </h1>
              {canEdit && (
                <button
                  className="border border-transparent p-1 text-slate-300 transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
                  onClick={() => setIsCaptureSpeciesModalOpen(true)}
                  title="Editar espécie"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="mt-1 text-center text-xs uppercase tracking-widest text-cyan-300/80">
              {data.sppCode}
            </p>
          </CardContent>
        </Card>

        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
          <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
            <CardContent className="p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  esforço
                </p>
                <div className="flex items-center gap-2">
                  {data.effortId && (
                    <Link
                      href={`/efforts/${data.effortId}`}
                      className="flex items-center gap-1 text-xs font-medium text-cyan-200 transition-colors hover:text-cyan-100 hover:underline"
                    >
                      Ver esforço
                      <ExternalLink size={12} />
                    </Link>
                  )}
                  {canEdit && (
                    <button
                      className="border border-transparent p-1 text-slate-300 transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
                      onClick={() => setIsModalOpen(true)}
                      title="Editar esforço/rede"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-lg font-semibold text-cyan-100">
                {formatDate(data.data)} - {displayValue(data.station)}
              </p>
              <p className="mt-1 text-base text-slate-300">
                Rede {displayValue(data.netNumber)}
              </p>
              <p className="mt-3 text-sm text-slate-300">
                Anilhador: {displayValue(data.bander, "—")}
              </p>
              <p className="inline-flex items-center gap-1 text-sm text-slate-300">
                Horário de captura: {formatUsageTime(data.captureTime)}
                {canEdit && (
                  <button
                    className="border border-transparent p-0.5 text-slate-400 transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
                    onClick={() => setIsCaptureTimeModalOpen(true)}
                    title="Editar horário de captura"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Idade
                  </p>
                  <button
                    type="button"
                    className={`relative mt-1 inline-flex items-center justify-center px-1 text-3xl font-semibold text-cyan-100 ${
                      canEdit && ageValue
                        ? "cursor-pointer transition hover:text-cyan-50"
                        : ""
                    }`}
                    onClick={
                      canEdit && ageValue
                        ? () => openCategoricalEditor(ageValue)
                        : undefined
                    }
                  >
                    {displayValue(ageValue?.value)}
                    {canEdit && ageValue && (
                      <Edit className="pointer-events-none absolute -right-3 -top-1 h-3 w-3 text-cyan-300/70" />
                    )}
                  </button>
                  <p className="mt-1 text-sm text-slate-300">
                    critério:{" "}
                    {ageCriteriaValues.length > 0
                      ? ageCriteriaValues.map((value, index) => (
                          <span key={`age-criteria-${value.id}`}>
                            <button
                              type="button"
                              className={`${
                                canEdit
                                  ? "cursor-pointer underline decoration-dotted underline-offset-2 hover:text-cyan-100"
                                  : ""
                              }`}
                              onClick={
                                canEdit
                                  ? () => openCategoricalEditor(value)
                                  : undefined
                              }
                            >
                              {displayValue(value.value)}
                            </button>
                            {index < ageCriteriaValues.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "—"}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Sexo
                  </p>
                  <button
                    type="button"
                    className={`relative mt-1 inline-flex items-center justify-center px-1 text-3xl font-semibold text-cyan-100 ${
                      canEdit && sexValue
                        ? "cursor-pointer transition hover:text-cyan-50"
                        : ""
                    }`}
                    onClick={
                      canEdit && sexValue
                        ? () => openCategoricalEditor(sexValue)
                        : undefined
                    }
                  >
                    {displayValue(sexValue?.value)}
                    {canEdit && sexValue && (
                      <Edit className="pointer-events-none absolute -right-3 -top-1 h-3 w-3 text-cyan-300/70" />
                    )}
                  </button>
                  <p className="mt-1 text-sm text-slate-300">
                    critério:{" "}
                    {sexCriteriaValues.length > 0
                      ? sexCriteriaValues.map((value, index) => (
                          <span key={`sex-criteria-${value.id}`}>
                            <button
                              type="button"
                              className={`${
                                canEdit
                                  ? "cursor-pointer underline decoration-dotted underline-offset-2 hover:text-cyan-100"
                                  : ""
                              }`}
                              onClick={
                                canEdit
                                  ? () => openCategoricalEditor(value)
                                  : undefined
                              }
                            >
                              {displayValue(value.value)}
                            </button>
                            {index < sexCriteriaValues.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "—"}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-100">
                    {displayValue(data.captureCode)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Cards */}
        <div className="space-y-3">
          <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
            <CardContent className="p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                Características reprodutivas
              </p>
              <div className="flex flex-wrap gap-2">
                <div
                  className={`relative w-fit min-w-[8.5rem] border px-3 py-2 text-center ${
                    isGreaterThanOne(cloacalProtuberanceValue?.value)
                      ? "border-amber-300/60 bg-amber-500/10"
                      : "border-[#2d3f64] bg-[#0d1830]"
                  } ${
                    canEdit && cloacalProtuberanceValue
                      ? "cursor-pointer transition hover:border-cyan-300/60"
                      : ""
                  }`}
                  onClick={
                    canEdit && cloacalProtuberanceValue
                      ? () => openAnyVariableEditor(cloacalProtuberanceValue)
                      : undefined
                  }
                >
                  {canEdit && cloacalProtuberanceValue && (
                    <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                  )}
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {variableDisplayLabel(
                      cloacalProtuberanceValue,
                      "Cloacal protuberance"
                    )}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-cyan-100">
                    {displayValue(cloacalProtuberanceValue?.value)}
                  </p>
                </div>

                <div
                  className={`relative w-fit min-w-[8.5rem] border px-3 py-2 text-center ${
                    isGreaterThanOne(broodPatchValue?.value)
                      ? "border-amber-300/60 bg-amber-500/10"
                      : "border-[#2d3f64] bg-[#0d1830]"
                  } ${
                    canEdit && broodPatchValue
                      ? "cursor-pointer transition hover:border-cyan-300/60"
                      : ""
                  }`}
                  onClick={
                    canEdit && broodPatchValue
                      ? () => openAnyVariableEditor(broodPatchValue)
                      : undefined
                  }
                >
                  {canEdit && broodPatchValue && (
                    <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                  )}
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {variableDisplayLabel(broodPatchValue, "Brood patch")}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-cyan-100">
                    {displayValue(broodPatchValue?.value)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
            <CardContent className="p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                Outras características
              </p>
              <div className="flex flex-wrap gap-2">
                <div
                  className={`relative w-fit min-w-[8.5rem] border px-3 py-2 ${
                    isGreaterThan(fatScoreValue?.value, 2)
                      ? "border-amber-300/60 bg-amber-500/10"
                      : "border-[#2d3f64] bg-[#0d1830]"
                  } ${
                    canEdit && fatScoreValue
                      ? "cursor-pointer transition hover:border-cyan-300/60"
                      : ""
                  }`}
                  onClick={
                    canEdit && fatScoreValue
                      ? () => openAnyVariableEditor(fatScoreValue)
                      : undefined
                  }
                >
                  {canEdit && fatScoreValue && (
                    <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                  )}
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {variableDisplayLabel(fatScoreValue, "FAT score")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-100">
                    {displayValue(fatScoreValue?.value)}
                  </p>
                </div>

                <div
                  className={`relative w-fit min-w-[8.5rem] border px-3 py-2 ${
                    isGreaterThan(bodyMoltValue?.value, 1)
                      ? "border-amber-300/60 bg-amber-500/10"
                      : "border-[#2d3f64] bg-[#0d1830]"
                  } ${
                    canEdit && bodyMoltValue
                      ? "cursor-pointer transition hover:border-cyan-300/60"
                      : ""
                  }`}
                  onClick={
                    canEdit && bodyMoltValue
                      ? () => openAnyVariableEditor(bodyMoltValue)
                      : undefined
                  }
                >
                  {canEdit && bodyMoltValue && (
                    <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                  )}
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {variableDisplayLabel(bodyMoltValue, "Body molt")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-100">
                    {displayValue(bodyMoltValue?.value)}
                  </p>
                </div>

                <div
                  className={`relative w-fit min-w-[8.5rem] border px-3 py-2 ${
                    isGreaterThan(wingMoltValue?.value, 2)
                      ? "border-amber-300/60 bg-amber-500/10"
                      : "border-[#2d3f64] bg-[#0d1830]"
                  } ${
                    canEdit && wingMoltValue
                      ? "cursor-pointer transition hover:border-cyan-300/60"
                      : ""
                  }`}
                  onClick={
                    canEdit && wingMoltValue
                      ? () => openAnyVariableEditor(wingMoltValue)
                      : undefined
                  }
                >
                  {canEdit && wingMoltValue && (
                    <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                  )}
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {variableDisplayLabel(wingMoltValue, "Wing molt")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-100">
                    {displayValue(wingMoltValue?.value)}
                  </p>
                </div>

                <div
                  className={`relative w-fit min-w-[8.5rem] border border-[#2d3f64] bg-[#0d1830] px-3 py-2 ${
                    canEdit && moltLimitValue
                      ? "cursor-pointer transition hover:border-cyan-300/60"
                      : ""
                  }`}
                  onClick={
                    canEdit && moltLimitValue
                      ? () => openAnyVariableEditor(moltLimitValue)
                      : undefined
                  }
                >
                  {canEdit && moltLimitValue && (
                    <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                  )}
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {variableDisplayLabel(moltLimitValue, "Limite de muda")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-100">
                    {displayValue(moltLimitValue?.value)}
                  </p>
                </div>

                <div
                  className={`relative w-fit min-w-[8.5rem] border border-[#2d3f64] bg-[#0d1830] px-3 py-2 ${
                    canEdit && skullValue
                      ? "cursor-pointer transition hover:border-cyan-300/60"
                      : ""
                  }`}
                  onClick={
                    canEdit && skullValue
                      ? () => openAnyVariableEditor(skullValue)
                      : undefined
                  }
                >
                  {canEdit && skullValue && (
                    <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                  )}
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {variableDisplayLabel(skullValue, "Crânio")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-100">
                    {displayValue(skullValue?.value)}
                  </p>
                </div>

                <div
                  className={`relative w-fit min-w-[8.5rem] border border-[#2d3f64] bg-[#0d1830] px-3 py-2 ${
                    canEdit && juvenileFeatherValue
                      ? "cursor-pointer transition hover:border-cyan-300/60"
                      : ""
                  }`}
                  onClick={
                    canEdit && juvenileFeatherValue
                      ? () => openAnyVariableEditor(juvenileFeatherValue)
                      : undefined
                  }
                >
                  {canEdit && juvenileFeatherValue && (
                    <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                  )}
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {variableDisplayLabel(juvenileFeatherValue, "Pena juvenil")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-100">
                    {displayValue(juvenileFeatherValue?.value)}
                  </p>
                </div>

                <div
                  className={`relative w-fit min-w-[8.5rem] border border-[#2d3f64] bg-[#0d1830] px-3 py-2 ${
                    canEdit && damageValue
                      ? "cursor-pointer transition hover:border-cyan-300/60"
                      : ""
                  }`}
                  onClick={
                    canEdit && damageValue
                      ? () => openAnyVariableEditor(damageValue)
                      : undefined
                  }
                >
                  {canEdit && damageValue && (
                    <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                  )}
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {variableDisplayLabel(damageValue, "Dano")}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-100">
                    {displayValue(damageValue?.value)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
            <CardContent className="p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                Medidas
              </p>
              {measureContinuousVariables.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Sem variáveis contínuas para esta captura.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {measureContinuousVariables.map((value) => (
                    <div
                      key={`measure-${value.id}`}
                      className={`relative w-fit min-w-[8.5rem] border border-[#2d3f64] bg-[#0d1830] px-3 py-2 ${
                        canEdit
                          ? "cursor-pointer transition hover:border-cyan-300/60"
                          : ""
                      }`}
                      onClick={
                        canEdit ? () => openContinuousEditor(value) : undefined
                      }
                    >
                      {canEdit && (
                        <Edit className="pointer-events-none absolute right-1 top-1 h-3 w-3 text-cyan-300/70" />
                      )}
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {value.label ??
                          value.variableName ??
                          "Variável contínua"}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-cyan-100">
                        {formatValueWithUnit(value.value, value.unit)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {extraCategoricalVariables.length > 0 && (
            <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
              <CardContent className="p-5">
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  Dados extras
                </p>
                <div className="divide-y divide-[#2d3f64]">
                  {extraCategoricalVariables.map((value) => (
                    <div
                      key={`extra-${value.id}`}
                      className={`flex items-center justify-between py-2 ${
                        canEdit
                          ? "cursor-pointer transition hover:text-cyan-100"
                          : ""
                      }`}
                      onClick={
                        canEdit ? () => openCategoricalEditor(value) : undefined
                      }
                    >
                      <span className="text-xs text-slate-300">
                        {value.label ??
                          value.variableName ??
                          "Variável categórica"}
                      </span>
                      <span className="text-sm font-medium text-cyan-100">
                        {displayValue(value.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Photos Carousel */}
        <PhotoCarousel captureId={captureId} />

        {/* Notes Card */}
        {data.notes && (
          <Card className="rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <FileText size={16} className="mt-0.5 text-cyan-300/70" />
                <div>
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                    Notas
                  </p>
                  <p className="text-slate-200/90">{data.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <NetEffortModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          captureId={captureId}
        />
        <CaptureCodeModal
          isOpen={isCaptureCodeModalOpen}
          onClose={() => setIsCaptureCodeModalOpen(false)}
          captureId={captureId}
          currentCaptureCode={data.captureCode ?? ""}
          onUpdated={async () => {
            await query.refetch();
          }}
        />
        <CaptureSpeciesModal
          isOpen={isCaptureSpeciesModalOpen}
          onClose={() => setIsCaptureSpeciesModalOpen(false)}
          captureId={captureId}
          currentSppId={Number(data.sppId)}
          onUpdated={async () => {
            await query.refetch();
          }}
        />
        <CaptureTimeModal
          isOpen={isCaptureTimeModalOpen}
          onClose={() => setIsCaptureTimeModalOpen(false)}
          captureId={captureId}
          currentCaptureTime={data.captureTime ?? ""}
          onUpdated={async () => {
            await query.refetch();
          }}
        />
        <CaptureVariableModal
          isOpen={editingVariable !== null}
          onClose={() => setEditingVariable(null)}
          captureId={captureId}
          variable={editingVariable}
          onUpdated={async () => {
            await query.refetch();
          }}
        />
      </div>
    );
  }

  return <p>Capture not found</p>;
}
