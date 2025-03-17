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

export default function CaptureInfo() {
  const { id } = useRouter().query;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const query = api.captures.getCaptureById.useQuery({ captureId: +id });
  const deleteMutation = api.captures.deleteCapture.useMutation();

  if (query.isLoading) return <p>Loading...</p>;
  const { data } = query;

  if (data) {
    return (
      <div>
        {data.hasChanged && <p className="text-red-500">EXCLUIDO</p>}
        <div className="flex justify-between">
          <h1>{data.sppCode}</h1>
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
                  query.refetch();
                }}
                disabled={deleteMutation.isLoading}
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <h2>
          {data.captureCode} - {data?.bandSize}
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
          captureId={+id}
        />
      </div>
    );
  }
}
