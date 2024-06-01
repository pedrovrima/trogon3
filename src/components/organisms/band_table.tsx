"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/router";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  clickableRow?: boolean;
}

export type BandData = {
  id: bigint | null;
  bandNumber: string | null;
  speciesName: string | null;
  date: string | null;
  age: string | null;
  station: string | null;
};

export const columns: ColumnDef<BandData>[] = [
  {
    accessorKey: "id",
    header: "",
  },
  {
    accessorKey: "speciesName",
    header: "Espécie",
  },
  {
    accessorKey: "age",
    header: "Idade",
  },

  {
    header: "Data",
    accessorFn: (data) => {
      if (data.date) {
        return new Date(data.date).toLocaleDateString("pt-BR");
      }
    },
  },
  {
    accessorKey: "station",
    header: "Estação",
  },
  { accessorKey: "netNumber", header: "Rede" },
];

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const router = useRouter();

  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader className="text-red-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="cursor-pointer hover:bg-gray-800"
                onClick={() => {
                  // @ts-ignore
                  router.push(`/captures/${row.original.id}`);
                }}
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
