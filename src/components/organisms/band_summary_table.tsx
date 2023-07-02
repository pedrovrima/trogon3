"use client";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export type BandData = {
  bandSize: string | null;
  noCaptures: number | null;
  totalBands: number | null;
};

export const columns: ColumnDef<BandData>[] = [
  // {
  //   accessorKey: "bandNumber",
  //   header: "Numero da Anilha",
  // },
  {
    accessorKey: "bandSize",
    header: "Tamanho da Anilha",
    cell: (props) => {
      const cell = props.cell.renderValue() as string;
      return <TableCell className="font-bold">{cell}</TableCell>;
    },
  },

  {
    accessorKey: "noCaptures",
    header: "Sem Captura",
    cell: (props) => {
      const value = props?.cell?.getValue() as number;
      return (
        <TableCell className={value < 50 ? "text-destructive" : ""}>
          {value}
        </TableCell>
      );
    },
  },
  {
    accessorKey: "totalBands",
    header: "Total de Anilhas",
  },
];

export function BandSummaryTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader>
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
