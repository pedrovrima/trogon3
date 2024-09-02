import { type NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Loader from "@/components/organisms/loader";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const EffortsPage: NextPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const efforts = api.efforts.getEffortsPaginated.useQuery(
    { page, searchTerm },
    {
      retry: 0,
      refetchOnWindowFocus: false,
    }
  );

  const effortsData = efforts.data?.efforts ?? [];
  const totalPages = efforts.data?.totalPages ?? 1;

  if (effortsData.length === 0 && efforts.isLoading) return <Loader />;

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Esforços</h1>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Effort ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Station Code</TableHead>
              <TableHead className="text-right">Total Net Hours</TableHead>
              <TableHead className="text-right">New Bands</TableHead>
              <TableHead className="text-right">Recaptures</TableHead>
              <TableHead className="text-right">Unbanded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {effortsData.map((effort) => (
              <TableRow
                key={effort.effortId}
                onClick={() => router.push(`/efforts/${effort.effortId}`)}
                className="animate-fade-in cursor-pointer"
              >
                <TableCell className="font-medium">{effort.effortId}</TableCell>
                <TableCell>{effort.date}</TableCell>
                <TableCell>{effort.stationCode}</TableCell>
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
      <div className="mt-4 flex justify-between">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default EffortsPage;

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
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
