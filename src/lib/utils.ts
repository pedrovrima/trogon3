import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDatabaseDate(value: Date | string | null | undefined) {
  if (!value) return "";

  if (typeof value === "string") {
    const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoDateMatch) {
      const [, year, month, day] = isoDateMatch;
      return `${day}/${month}/${year}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${day}/${month}/${year}`;
}
