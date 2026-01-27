import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Loader from "@/components/organisms/loader";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const StationsPage: NextPage = () => {
  const router = useRouter();

  const stations = api.stations.getStations.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const stationsData = stations.data ?? [];

  if (stationsData.length === 0 && stations.isLoading) return <Loader />;

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Estações</h1>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total Esforços</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stationsData.map((station) => (
              <TableRow
                key={station.stationId}
                onClick={() => router.push(`/stations/${station.stationId}`)}
                className="animate-fade-in cursor-pointer"
              >
                <TableCell className="font-medium">
                  {station.stationCode}
                </TableCell>
                <TableCell>{station.stationName}</TableCell>
                <TableCell>{station.city}</TableCell>
                <TableCell>{station.state}</TableCell>
                <TableCell className="text-right">
                  {station.totalEfforts}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StationsPage;
