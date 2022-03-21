import { Input, Checkbox } from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { useAsyncDebounce } from "react-table";

export function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <span>
      <Input
      size="sm"
      variant="outline"
      width={200}
        value={value || ""}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: "1.1rem",
        }}
        
      />
    </span>
  );
}

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id }
}) {
  const options = useMemo(
    () => {
      const options = new Set();
      preFilteredRows.forEach(row => {
        options.add(row.values[id]);
      });
      return [...options.values()];
    },
    [id, preFilteredRows]
  );

  const [selected, setSelected] = useState(filterValue||[]);

  const changeFunc = e => {
    selected.indexOf(e.target.value) > -1
      ? setSelected(selected.filter(sel => sel !== e.target.value))
      : setSelected([...selected, e.target.value]);
  };

  useEffect(
    () => {
      // console.log(selected)
      selected.length ? setFilter(selected) : setFilter(options);
    },
    [selected]
  );

  // Calculate the options for filtering
  // using the preFilteredRows
  // Render a multi-select box
  return (
    <div>
      {/* <option value="all">All</option> */}
      {options.map((option, i) =>
        <Checkbox
          isChecked={selected.indexOf(option) > -1}
          onChange={e => changeFunc(e)}
          key={i}
          value={option}
        >
          {option}
        </Checkbox>
      )}
    </div>
  );
}

export function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter }
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}
