import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { set } from "zod";
import { CommandList } from "cmdk";
import { Input } from "../ui/input";

type Options = {
  label: string;
  value: string;
}[];

type ComboboxProps = {
  options: Options;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  onBlur?: () => void;
  focusOnRender?: boolean;
};

export default function ComboboxDemo({
  options,
  value,
  className,
  onBlur,
  focusOnRender,
  onChange: setValue,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const thisRef = React.useRef();

  React.useEffect(() => {
    focusOnRender && thisRef?.current?.focus();
  }, []);

  return (
    <>
      <Command
        filter={(value, search) =>
          value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
        }
        className={cn("relative overflow-visible rounded-md", className)}
      >
        <CommandInput
          ref={thisRef}
          value={inputValue}
          onValueChange={(e) => {
            setInputValue(e);
            const typedOption = options.find(
              (f) => f.label.toLowerCase() === e.toLowerCase()
            );
            setOpen(e.length > 0);

            if (typedOption) {
              setValue(typedOption.value);
              setInputValue(typedOption.label);
            } else {
              setValue("");
            }
          }}
          onBlur={() => {
            setOpen(false);
            onBlur && onBlur();
          }}
          placeholder="Search option..."
          className={cn(className)}
        />
        <CommandList
          className={cn(
            open ? "block" : "hidden",
            "absolute top-12 z-50 w-full rounded-b-md bg-popover"
          )}
        >
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                value={option.label}
                key={option.value}
                onSelect={() => {
                  setValue(option.value);
                  setInputValue(option.label);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  );
}
