import { api } from "@/utils/api";
import { Trash, Edit } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

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
  const updateCaptureCodeMutation = api.captures.updateCaptureCode.useMutation();

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
              <p className="mt-2 text-sm">Nenhuma opção de Capture Code disponível.</p>
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
          <p className="mb-4 text-red-500">{updateCaptureCodeMutation.error.message}</p>
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

export default function CaptureInfo() {
  const { id } = useRouter().query;
  const captureId = Number(Array.isArray(id) ? id[0] : id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCaptureCodeModalOpen, setIsCaptureCodeModalOpen] = useState(false);

  const query = api.captures.getCaptureById.useQuery(
    { captureId: Number.isFinite(captureId) ? captureId : 0 },
    { enabled: Number.isFinite(captureId) }
  );
  const deleteMutation = api.captures.deleteCapture.useMutation();

  if (!Number.isFinite(captureId) || query.isLoading) return <p>Loading...</p>;
  const { data } = query;

  if (data) {
    return (
      <div>
        {data.hasChanged && <p className="text-red-500">EXCLUIDO</p>}
        <div className="flex justify-between">
          <h1>
            {data.sppName} - {data.sppCode}
          </h1>

          {!data.hasChanged && (
            <div className="flex gap-2">
              <button
                className="rounded-md bg-blue-500 p-2 text-white"
                onClick={() => setIsModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                className="rounded-md bg-red-500 p-2 text-white"
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
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <h2>{data.captureCode}</h2>
          {!data.hasChanged && (
            <button
              className="rounded-md bg-blue-500 p-2 text-white"
              onClick={() => setIsCaptureCodeModalOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
        <h2>
          {data?.bandSize}
          {data.bandNumber}
        </h2>
        <h2>
          {typeof data.data === "string" &&
            new Date(data.data).toLocaleDateString("pt-BR", {
              timeZone: "GMT",
            })}{" "}
          - {data.captureTime?.slice(0, 2)}:{data.captureTime?.slice(2, 3)}0
        </h2>
        <h2>
          {data.station} - Rede {data.netNumber}
        </h2>
        <h2>{data.bander}</h2>
        {data.notes && <p>Notas: {data.notes}</p>}
        <div>
          {data?.categoricalValues.map((value) => {
            return (
              <p key={value.id}>
                {value.label}: {value.value}
              </p>
            );
          })}
        </div>
        <div>
          {data?.continuousValues.map((value) => {
            return (
              <p key={value.id}>
                {value.label}: {value.value}
              </p>
            );
          })}
        </div>

        {/* Modal */}
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
      </div>
    );
  }

  return <p>Capture not found</p>;
}
