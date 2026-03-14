import * as React from "react";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string | number;
  label: string;
  searchText?: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowFreeText?: boolean;
  autoFocus?: boolean;
};

export function Combobox({
  options,
  value,
  onChange,
  onClear,
  placeholder = "Buscar...",
  className,
  disabled,
  allowFreeText,
  autoFocus,
}: ComboboxProps) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  // Track if selection was already made (e.g. via Tab/Enter) so blur doesn't double-fire
  const justSelected = React.useRef(false);

  const selectedOption = options.find((o) => o.value === value);
  const displayText = open ? query : selectedOption?.label ?? query;

  const filtered = React.useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => {
      const labelMatch = o.label.toLowerCase().includes(q);
      const searchMatch = o.searchText
        ? o.searchText.toLowerCase().includes(q)
        : false;
      return labelMatch || searchMatch;
    });
  }, [options, query]);

  // Reset highlight when filtered list changes
  React.useEffect(() => {
    setHighlightIndex(0);
  }, [filtered.length]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[highlightIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, open]);

  const selectOption = React.useCallback(
    (opt: ComboboxOption) => {
      justSelected.current = true;
      onChange(opt.value);
      setQuery("");
      setOpen(false);
    },
    [onChange]
  );

  // Try to resolve the current query to a selection
  const resolveQuery = React.useCallback(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }

    if (!query) {
      setOpen(false);
      return;
    }

    // If query matches the currently selected option's label, keep it
    if (selectedOption && query === selectedOption.label) {
      setQuery("");
      setOpen(false);
      return;
    }

    // If exactly 1 filtered result, auto-select it
    if (filtered.length === 1) {
      selectOption(filtered[0]!);
      return;
    }

    // Try exact match on the query text
    const q = query.toLowerCase();
    const exact = options.find((o) => {
      return (
        o.label.toLowerCase() === q ||
        (o.searchText && o.searchText.toLowerCase() === q)
      );
    });

    if (exact) {
      selectOption(exact);
      return;
    }

    // Try prefix match on just the value code (before " - ")
    const prefixMatch = filtered.find((o) => {
      const code = o.label.split(" - ")[0] ?? "";
      return code.toLowerCase() === q;
    });

    if (prefixMatch) {
      selectOption(prefixMatch);
      return;
    }

    // No match found
    if (!allowFreeText && onClear) {
      onClear();
    }
    setQuery("");
    setOpen(false);
  }, [query, filtered, options, selectedOption, selectOption, allowFreeText, onClear]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setOpen(true);
        setQuery(selectedOption?.label ?? "");
        e.preventDefault();
        return;
      }
      // Start typing opens the dropdown
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightIndex]) {
          selectOption(filtered[highlightIndex]);
        } else {
          resolveQuery();
        }
        break;
      case "Escape":
        e.preventDefault();
        justSelected.current = true; // prevent blur from re-resolving
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
        break;
      case "Tab":
        // Tab: select highlighted item (or resolve), then let focus move naturally
        if (filtered[highlightIndex]) {
          selectOption(filtered[highlightIndex]);
        } else {
          resolveQuery();
        }
        // Don't preventDefault — let the browser move focus to next field
        break;
    }
  };

  const handleFocus = () => {
    setOpen(true);
    setQuery(selectedOption?.label ?? "");
  };

  const handleBlur = () => {
    // Small delay to allow mousedown on option to fire first
    setTimeout(() => {
      resolveQuery();
    }, 120);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="text"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={displayText}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
          if (selectedOption && onClear) {
            onClear();
          }
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      {value && !open && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          onClick={() => {
            if (onClear) onClear();
            setQuery("");
            inputRef.current?.focus();
          }}
          tabIndex={-1}
        >
          &times;
        </button>
      )}
      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-slate-600 bg-slate-800 shadow-lg"
        >
          {filtered.map((opt, i) => (
            <div
              key={`${opt.value}`}
              className={cn(
                "cursor-pointer px-3 py-1.5 text-sm",
                i === highlightIndex
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-700"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(opt);
              }}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && query && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-400 shadow-lg">
          Nenhum resultado
        </div>
      )}
    </div>
  );
}
