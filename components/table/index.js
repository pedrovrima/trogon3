import React, { useMemo } from "react";
import { useTable, useGlobalFilter, useFilters } from "react-table";

import { DefaultColumnFilter, GlobalFilter } from "./filters";



import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  Checkbox,
  Box,
  Input,
  Heading,
  Flex
} from "@chakra-ui/react";

import { ViewIcon } from "@chakra-ui/icons";

const Taable = ({ columns, data, clickFunction }) => {
  const filterTypes = useMemo(
    () => ({
      //   // Add a new fuzzyTextFilterFn filter type.
      //   fuzzyText: fuzzyTextFilterFn,
      //   // Or, override the default text filter to use
      //   // "startWith"
      hasAny: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? filterValue.indexOf(rowValue) > -1
            : true;
        });
      },

      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      }
    }),
    []
  );
  const defaultColumn = useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
    allColumns
  } = useTable(
    {
      columns,
      data: data,
      defaultColumn, // Be sure to pass the defaultColumn option
      filterTypes,
      initialState: {
        hiddenColumns: columns.map(column => {
          if (column.show === false) return column.accessor || column.id;
        })
      }
    },
    useFilters, // useFilters!
    useGlobalFilter // useGlobalFilter!
  );

  return (
    <Box>
      <Accordion mt="4" mb="8" defaultIndex={[0]} allowToggle allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Heading size="sm"> Columns</Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Flex wrap="wrap">
              {allColumns.map(column =>
                <Box p="2" key={column.id}>
                  <label>
                    <input
                      type="checkbox"
                      {...column.getToggleHiddenProps()}
                    />{" "}
                    {column.render("Header")}
                  </label>
                </Box>
              )}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton>
            <Heading size="sm">Filters</Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Heading size="sm"> Global </Heading>
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
            {allColumns.map(column => {
              return (
                <Box mb="4" key={column.id}>
                  {!column.disableFilters
                    ? <div>
                        <Heading size="sm">
                          {column.render("Header")}
                        </Heading>
                        {column.render("Filter")}
                      </div>
                    : null}
                </Box>
              );
            })}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Box />

<Box>
  <p>Total Records: {preGlobalFilteredRows.length}</p>
</Box>
      
      <Table className="" {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup, i) =>
            <Tr key={i} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column =>
                <Th key={i} {...column.getHeaderProps()}>
                  {column.render("Header")}
                </Th>
              )}
              <Th>View</Th>
            </Tr>
          )}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <Tr key={i} {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <Td key={i} {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </Td>
                  );
                })}
                <Td>
                  <ViewIcon
                    onClick={() => clickFunction(row.values)}
                    style={{ cursor: "pointer" }}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Taable;
