import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Loader from "@/components/organisms/loader";
import NetRegisterMap from "@/components/organisms/net-register-map";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const StationDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const station = api.stations.getStationById.useQuery(
    { stationId: Number(id) },
    {
      enabled: !!id,
      retry: 0,
      refetchOnWindowFocus: false,
    }
  );

  const stationData = station.data;

  if (!id || station.isLoading) return <Loader />;

  if (!stationData) {
    return (
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <h1 className="text-2xl font-bold">Estação não encontrada</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {stationData.stationName} ({stationData.stationCode})
          </h1>
          <p className="text-muted-foreground">
            {stationData.city}, {stationData.state}
          </p>
          <p className="text-sm text-muted-foreground">
            Coordenadas: {stationData.centerLat}, {stationData.centerLong}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/stations/${stationData.stationId}/edit`}>
            Editar Estação
          </Link>
        </Button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          Redes ({stationData.nets.length})
        </h2>
      </div>

      <NetRegisterMap className="mb-8" nets={stationData.nets} />

      <div className="mb-8 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Malha</TableHead>
              <TableHead>Comprimento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stationData.nets.map((net) => (
              <TableRow key={net.netId}>
                <TableCell className="font-medium">{net.netNumber}</TableCell>
                <TableCell>{net.netLat}</TableCell>
                <TableCell>{net.netLong}</TableCell>
                <TableCell>{net.meshSize}</TableCell>
                <TableCell>{net.netLength}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          Esforços ({stationData.efforts.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Protocolo</TableHead>
              <TableHead className="text-right">Horas Rede</TableHead>
              <TableHead className="text-right">Novas</TableHead>
              <TableHead className="text-right">Recapturas</TableHead>
              <TableHead className="text-right">Sem Anilha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stationData.efforts.map((effort) => (
              <TableRow
                key={effort.effortId}
                onClick={() => router.push(`/efforts/${effort.effortId}`)}
                className="animate-fade-in cursor-pointer"
              >
                <TableCell className="font-medium">{effort.effortId}</TableCell>
                <TableCell>{effort.date}</TableCell>
                <TableCell>{effort.protocolCode}</TableCell>
                <TableCell className="text-right">
                  {effort.totalNetHours}
                </TableCell>
                <TableCell className="text-right">{effort.newBands}</TableCell>
                <TableCell className="text-right">{effort.recapture}</TableCell>
                <TableCell className="text-right">{effort.unbanded}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StationDetailPage;
