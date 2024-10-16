import { api } from "@/utils/api";
import { Trash } from "lucide-react";
import { useRouter } from "next/router";

export default function CaptureInfo() {
  const { id } = useRouter().query;
  if (!id || typeof id !== "string") return null;

  const query = api.captures.getCaptureById.useQuery({ captureId: +id });
  const deleteMutation = api.captures.deleteCapture.useMutation();
  console.log(query);
  if (query.isLoading) return <p>Loading...</p>;
  const { data } = query;
  if (data) {
    return (
      <div>
        {data.hasChanged && <p className="text-red-500">EXCLUIDO</p>}
        <div className="flex justify-between">
          <h1>{data.sppCode}</h1>
          {!data.hasChanged && (
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
          )}
        </div>
        <h2>
          {data.captureCode} - {data?.bandSize}
          {data.bandNumber}
        </h2>
        <h2>
          {typeof data.data === "string" &&
            new Date(data.data).toLocaleDateString("pt-BR")}{" "}
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
      </div>
    );
  }
}
