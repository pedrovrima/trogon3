import { type NextPage } from "next";
import { useRouter } from "next/router";
import { groupBy } from "lodash";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useState, useMemo } from "react";

import { api } from "@/utils/api";
import { DataTable, columns } from "@/components/organisms/band_table";
import Loader from "@/components/organisms/loader";

type Query = {
  sppId: string;
};

const SpeciesCaptures: NextPage = () => {
  const router = useRouter();

  const { sppId } = router.query as Query;
  const [sortColumn, setSortColumn] = useState("total");
  const [sortDirection, setSortDirection] = useState("desc");

  const query = api.species.getSpeciesDataById.useQuery(
    { speciesId: sppId },
    { retry: 2, refetchOnWindowFocus: false }
  );

  const groupedData =
    query.data &&
    Object.keys(
      groupBy(query.data, (val) => val.bandSize + val.bandNumber)
    ).map((key) => ({
      bandNumber: key,
      total: query.data.filter((val) => val.bandSize + val.bandNumber === key)
        .length,
    }));

  const filteredData = useMemo(() => {
    if (!groupedData) return [];
    return groupedData.sort((a, b) => {
      if (sortColumn === "total" && sortDirection === "asc") {
        return a.total - b.total;
      }
      if (sortColumn === "total" && sortDirection === "desc") {
        return b.total - a.total;
      }
      if (a[sortColumn] < b[sortColumn])
        return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn])
        return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [groupedData, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  if (query.isLoading) return <Loader />;

  // ...

  return (
    <>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          {query.data[0].speciesName}
        </h1>

        {groupedData && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("bandNumber")}
                    >
                      Número Anilha
                      {sortColumn === "bandNumber" && (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "\u25B2" : "\u25BC"}
                        </span>
                      )}
                    </TableHead>

                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("total")}
                    >
                      Total de capturas
                      {sortColumn === "total" && (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "\u25B2" : "\u25BC"}
                        </span>
                      )}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((species) => (
                    <TableRow
                      onClick={() =>
                        router.push(`/bands/${species.bandNumber}`)
                      }
                      key={species.bandNumber}
                      className="animate-fade-in cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {"" + species.bandNumber}
                      </TableCell>

                      <TableCell className="text-right">
                        {species.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SpeciesCaptures;
