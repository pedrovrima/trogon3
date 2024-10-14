import { api } from "@/utils/api";
import Link from "next/link";
import { columns, DataTable } from "@/components/organisms/data-check-table";
export default function DataCheck() {
  const { data, isLoading } = api.datacheck.checkEffortNumbers.useQuery();

  if (isLoading) return <div>Loading...</div>;
  return (
    <div className="px-16 prose-h1:text-2xl prose-h1:font-bold prose-p:text-lg">
      <h1 className="mb-2">
        Diferenças entre capturas entradas e sumário de capturas no esforço
      </h1>
      <p className="mb-8">
        {Math.round((100 * data?.totalMismatch) / data?.totalEfforts)}% dos
        esforços com problemas
      </p>
      <div className="flex justify-center">
        <DataTable columns={columns} data={data?.efforts ?? []} />
      </div>
    </div>
  );
}
