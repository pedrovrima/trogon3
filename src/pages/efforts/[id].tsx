import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { AlertCircle, Book, Calendar, Clock, Quote } from "lucide-react";
export default function Effort() {
  const router = useRouter();
  const { id } = router.query;

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
        </div>

        <div className="w-1/2 rounded-md bg-slate-700 px-6 py-8">
          <h2 className="mb-4 flex items-center gap-2">
            Sumário de capturas{" "}
            {hasErrors && (
              <div className="">
                <AlertCircle className="text-red-600" size={16} />
              </div>
            )}
          </h2>
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
      <ul>
        {data?.captures
          .sort(
            (a, b) =>
              a.captureCode.localeCompare(b.captureCode) ||
              a.captureTime - b.captureTime
          )
          .map((capture) => (
            <li key={capture.captureId}>
              {capture.captureCode} {capture.bandNumber} {capture.bandSize}{" "}
              {capture.sppCode}
            </li>
          ))}
      </ul>
    </div>
  );
}
