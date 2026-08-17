import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    const diffMins = Math.floor(diffTime / (1000 * 60));
    if (diffMins < 60) {
      return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    return `${diffHours}h ago`;
  }
  
  if (diffDays <= 7) {
    return `${diffDays} days ago`;
  }
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
