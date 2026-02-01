import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ghostStyles = {
  border: "border-gray-600",
  text: "text-gray-600",
} as const;
