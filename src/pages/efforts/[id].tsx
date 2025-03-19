import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { AlertCircle, Book, Calendar, Clock, Quote, Edit } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

function UpdateSummaryModal({
  isOpen,
  onClose,
  currentSummary,
  effortId,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentSummary: {
    new: number;
    recaptures: number;
    unbanded: number;
  };
  effortId: number;
}) {
  const [newBands, setNewBands] = useState(currentSummary.new);
  const [recapture, setRecapture] = useState(currentSummary.recaptures);
  const [unbanded, setUnbanded] = useState(currentSummary.unbanded);
  const [justification, setJustification] = useState("");

  const updateMutation = api.efforts.updateEffortSummary.useMutation();
  const utils = api.useContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-slate-800 p-6">
        <h2 className="mb-4 text-xl font-bold">Update Summary</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block">New Bands</label>
            <input
              type="number"
              className="w-full rounded border bg-slate-700 p-2"
              value={newBands}
              onChange={(e) => setNewBands(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-2 block">Recaptures</label>
            <input
              type="number"
              className="w-full rounded border bg-slate-700 p-2"
              value={recapture}
              onChange={(e) => setRecapture(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-2 block">Unbanded</label>
            <input
              type="number"
              className="w-full rounded border bg-slate-700 p-2"
              value={unbanded}
              onChange={(e) => setUnbanded(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-2 block">Justification</label>
            <textarea
              className="w-full rounded border bg-slate-700 p-2"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Why are you updating the summary?"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button className="rounded border px-4 py-2" onClick={onClose}>
              Cancel
            </button>
            <button
              className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-blue-300"
              disabled={!justification || updateMutation.isLoading}
              onClick={async () => {
                await updateMutation.mutateAsync({
                  effortId,
                  newSummary: {
                    newBands,
                    recapture,
                    unbanded,
                  },
                  justification,
                });
                await utils.efforts.getEffortById.invalidate({ effortId });
                onClose();
              }}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Effort() {
  const router = useRouter();
  const { id } = router.query;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addNANet = api.efforts.addNANet.useMutation();
  const { data, isLoading } = api.efforts.getEffortById.useQuery({
    effortId: Number(id),
  });

  const hasErrorStyle = " text-red-300 underline  font-bold bg-opacity-50";

  const captureTotals = data?.captures.reduce(
    (acc, curr) => {
      return {
        new: acc.new + (curr.captureCode === "N" ? 1 : 0),
        recaptures:
          acc.recaptures +
          (curr.captureCode === "R" ||
          curr.captureCode === "C" ||
          curr.captureCode === "E"
            ? 1
            : 0),
        unbanded: acc.unbanded + (curr.captureCode === "U" ? 1 : 0),
      };
    },
    { new: 0, recaptures: 0, unbanded: 0 }
  );

  const newError = captureTotals?.new !== data?.summary_new;
  const recapturesError = captureTotals?.recaptures !== data?.summary_recapture;
  const unbandedError = captureTotals?.unbanded !== data?.summary_unbanded;

  const hasErrors = newError || recapturesError || unbandedError;

  const speciesSummary = data?.captures.reduce((acc, curr) => {
    if (!acc[curr.sppCode ?? ""]) {
      acc[curr.sppCode ?? ""] = {
        N: 0,
        R: 0,
        U: 0,
      };
    }
    acc[curr.sppCode][curr.captureCode]++;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const processCaptureTimes = (captures, openTime, closeTime) => {
    // Create bins from open time to close time
    const hourlyBins = {};

    // Add padding of 40 minutes (in milliseconds)
    const paddingTime = 40 * 60 * 1000;

    // Convert times to hours
    const startHour = parseInt(openTime?.split(":")[0] ?? "5");
    const endHour = parseInt(closeTime?.split(":")[0] ?? "18");

    // Create bins for each hour from start to end
    for (let i = startHour; i <= endHour; i++) {
      const hour = i.toString().padStart(2, "0");
      hourlyBins[`${hour}:00`] = 0;
    }

    // Add exact open/close times with 0 captures if they don't exist
    if (openTime) hourlyBins[openTime] = 0;
    if (closeTime) hourlyBins[closeTime] = 0;

    // Count captures per hour
    captures?.forEach((capture) => {
      const hour = capture.captureTime.split(":")[0] + ":00";
      if (hourlyBins[hour] !== undefined) {
        hourlyBins[hour]++;
      }
    });

    // Convert to array and sort by time
    return {
      data: Object.entries(hourlyBins)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([hour, count]) => ({
          hour: new Date(`1970-01-01T${hour}`).getTime(),
          hourLabel: hour,
          captures: count,
        })),
      startTime: new Date(`1970-01-01T${openTime}`).getTime() - paddingTime,
      endTime: new Date(`1970-01-01T${closeTime}`).getTime() + paddingTime,
    };
  };

  const captureTimeData = processCaptureTimes(
    data?.captures,
    data?.openTime,
    data?.closeTime
  );

  return (
    <div className="prose-h1:text-3xl prose-h2:text-xl prose-p:text-lg">
      <div className="flex gap-4">
        <div className="flex w-1/2 flex-col gap-2 rounded-md bg-slate-700 px-6 py-8">
          <h1 className="text-3xl">
            {data?.effortId} - {data?.stationCode}
          </h1>
          <p className="flex items-center gap-2">
            <Calendar size={16} /> {data?.date}
          </p>
          <p className="flex items-center gap-2">
            <Book size={16} /> Protocolo: {data?.protocolCode}
          </p>
          <p className="flex items-center gap-2">
            <Clock size={16} /> Horas de rede:{" "}
            {Number(data?.totalNetHours).toFixed(2)}
          </p>

          {data?.notes && (
            <div className="flex flex-col gap-0">
              <p className="flex items-center gap-2">
                <Quote size={16} /> Notas:
              </p>
              <p>{data?.notes}</p>
            </div>
          )}
          <button
            className="w-fit cursor-pointer rounded-md border border-slate-300 bg-slate-100 px-8 py-2 text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              addNANet.mutate({
                effortId: Number(id),
                stationId: data?.stationId,
              });
            }}
            disabled={data?.hasNANet}
            title={data?.hasNANet ? "Effort already has NA net" : ""}
          >
            Add NA Net
          </button>
        </div>

        <div className="w-1/2 rounded-md bg-slate-700 px-6 py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2">
              Sumário de capturas{" "}
              {hasErrors && (
                <div className="">
                  <AlertCircle className="text-red-600" size={16} />
                </div>
              )}
            </h2>
            <button
              className="rounded-md bg-blue-500 p-2 text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th></th>
                <th className="text-right">Nova</th>
                <th className="text-right">Recaptura</th>
                <th className="text-right">Não Anilhada</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sumário</td>
                <td className={`text-right ${newError ? hasErrorStyle : ""}`}>
                  {data?.summary_new}
                </td>
                <td
                  className={`text-right ${
                    recapturesError ? hasErrorStyle : ""
                  }`}
                >
                  {data?.summary_recapture}
                </td>
                <td
                  className={`text-right ${unbandedError ? hasErrorStyle : ""}`}
                >
                  {data?.summary_unbanded}
                </td>
              </tr>
              <tr>
                <td>Capturas Entradas</td>
                <td className={`text-right ${newError ? hasErrorStyle : ""}`}>
                  {captureTotals?.new}
                </td>
                <td
                  className={`text-right ${
                    recapturesError ? hasErrorStyle : ""
                  }`}
                >
                  {captureTotals?.recaptures}
                </td>
                <td
                  className={`text-right ${unbandedError ? hasErrorStyle : ""}`}
                >
                  {captureTotals?.unbanded}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-8 w-full rounded-md bg-slate-700 px-6 py-8">
        <h2 className="mb-4">Capturas por Hora</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={captureTimeData.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="hour"
                type="number"
                domain={[captureTimeData.startTime, captureTimeData.endTime]}
                ticks={captureTimeData.data
                  .filter((d) => d.hourLabel.endsWith(":00"))
                  .map((d) => d.hour)}
                tickFormatter={(unixTime) => {
                  return new Date(unixTime)
                    .toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    .slice(0, 5);
                }}
                stroke="#fff"
                tick={{ fill: "#fff" }}
              />
              <YAxis stroke="#fff" tick={{ fill: "#fff" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelFormatter={(unixTime) => {
                  return new Date(unixTime).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }}
              />
              <ReferenceLine
                x={new Date(`1970-01-01T${data?.openTime}`).getTime()}
                stroke="#22c55e"
                strokeDasharray="3 3"
                label={{
                  value: "Abertura",
                  fill: "#22c55e",
                  position: "top",
                }}
              />
              <ReferenceLine
                x={new Date(`1970-01-01T${data?.closeTime}`).getTime()}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: "Fechamento",
                  fill: "#ef4444",
                  position: "top",
                }}
              />
              <Bar dataKey="captures" fill="#3b82f6" name="Capturas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-8 w-1/3 rounded-md bg-slate-700 px-6 py-8">
        <h2 className="mb-4">Sumário por Espécie</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th>Espécie</th>
              <th className="text-right">Nova</th>
              <th className="text-right">Recaptura</th>
              <th className="text-right">Não Anilhada</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {speciesSummary &&
              Object.entries(speciesSummary).map(([species, counts]) => (
                <tr key={species}>
                  <td>{species}</td>
                  <td className="text-right">{counts.N}</td>
                  <td className="text-right">{counts.R}</td>
                  <td className="text-right">{counts.U}</td>
                  <td className="text-right">
                    {Object.values(counts).reduce(
                      (sum, count) => sum + count,
                      0
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <ul>
        {data?.captures
          .sort(
            (a, b) =>
              a.captureCode.localeCompare(b.captureCode) ||
              a.sppCode.localeCompare(b.sppCode) ||
              a.bandSize.localeCompare(b.bandSize) ||
              (a.bandNumber && b.bandNumber
                ? Number(a.bandNumber) - Number(b.bandNumber)
                : 0)
          )
          .map((capture) => (
            <li key={capture.captureId}>
              <Link href={`/captures/${capture.captureId}`}>
                {capture.captureCode} {capture.bandNumber} {capture.bandSize}{" "}
                {capture.sppCode}
              </Link>
            </li>
          ))}
      </ul>

      {/* Modal */}
      {captureTotals && data && (
        <UpdateSummaryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentSummary={{
            new: data.summary_new,
            recaptures: data.summary_recapture,
            unbanded: data.summary_unbanded,
          }}
          effortId={Number(id)}
        />
      )}
    </div>
  );
}
