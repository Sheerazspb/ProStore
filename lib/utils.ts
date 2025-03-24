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

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if(error.name === "ZodError"){
    const fieldErrors = Object.keys(error.errors).map((field) => error.errors[field].message);
    return fieldErrors.join(", ")
    }else if(error.name === "PrismaClientKnownRequestError" && error.code === "P2002"){
        const field = error.meta?.target[0] || "Field";
        return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  }else{
    return typeof error.message === "string" ? error.message : JSON.stringify(error.message)
  }
}

