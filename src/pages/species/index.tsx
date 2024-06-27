import { type NextPage } from "next";

import { api } from "@/utils/api";
import Loader from "@/components/organisms/loader";
import { BandersTable, columns } from "@/components/organisms/banders_table";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useRouter } from "next/router";

const SppDetails: NextPage = () => {
  const spp = api.species.getSpeciesSummary.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("total");
  const [sortDirection, setSortDirection] = useState("desc");
  const speciesData = spp.data ?? [];

  const filteredData = useMemo(() => {
    return speciesData
      .filter(
        (species) =>
          species.name!.toLowerCase().includes(searchTerm.toLowerCase()) ||
          species
            //@ts-expect-error
            .scientificName!.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortColumn === "total" && sortDirection === "asc") {
          return a.total - b.total;
        }
        if (sortColumn === "total" && sortDirection === "desc") {
          return b.total - a.total;
        }
        //@ts-expect-error
        if (a[sortColumn] < b[sortColumn])
          return sortDirection === "asc" ? -1 : 1;
        //@ts-expect-error
        if (a[sortColumn] > b[sortColumn])
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [speciesData, searchTerm, sortColumn, sortDirection]);
  // @ts-expect-error
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  if (speciesData.length === 0 && spp.isLoading) return <Loader />;
  return (
    <>
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Species Registrations</h1>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-md bg-muted py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  ID
                  {sortColumn === "id" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "\u25B2" : "\u25BC"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Nome português
                  {sortColumn === "name" && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? "\u25B2" : "\u25BC"}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("scientificName")}
                >
                  Nome científico
                  {sortColumn === "scientificName" && (
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
                  onClick={() => router.push(`/species/${species.id}`)}
                  key={species.id}
                  className="animate-fade-in cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {"" + species.id}
                  </TableCell>
                  <TableCell>{species.name}</TableCell>
                  <TableCell className="italic">
                    {/* @ts-expect-error */}
                    {species.scientificName}
                  </TableCell>
                  <TableCell className="text-right">{species.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default SppDetails;
//@ts-expect-error
function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
