import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function convertToCSV(objArray: Object[]): string {
  let str = `${Object.keys(objArray[0])
    .map((value) => `"${value}"`)
    .join(",")}\r\n`;

  for (let i = 0; i < array.length; i++) {
    let line = "";
    for (const index in array[i]) {
      if (line !== "") line += ",";
      line += `"${array[i][index]}"`;
    }
    str += line + "\r\n";
  }
  return str;
}
