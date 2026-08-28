import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Returns dynamic time-based greeting according to local device time:
 * 5:00 AM – 11:59 AM -> Good morning, [Name] 👋
 * 12:00 PM – 4:59 PM -> Good afternoon, [Name] 👋
 * 5:00 PM – 8:59 PM  -> Good evening, [Name] 👋
 * 9:00 PM – 4:59 AM  -> Good night, [Name] 👋
 */
export function getTimeBasedGreeting(name?: string, fallbackRole: string = "User"): string {
  const hour = new Date().getHours();
  let prefix = "Good morning";

  if (hour >= 5 && hour < 12) {
    prefix = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    prefix = "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    prefix = "Good evening";
  } else {
    prefix = "Good night";
  }

  const displayName = name?.trim() || fallbackRole;
  return `${prefix}, ${displayName} 👋`;
}
