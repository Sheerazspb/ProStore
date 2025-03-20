import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert a prisma object to JS object
export function convertToPlainObj<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Formate number with decimal points
export function formatNumber(num: number): string {
  const [integer, decimal] = num.toString().split(".");
  return decimal ? `${integer}.${decimal.padEnd(2, "0")}` : `${integer}.00`;
}
