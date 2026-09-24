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
 * Automatically capitalizes the first letter of each word in a string.
 * Used for names, company names, cities/locations, and titles.
 */
export function capitalizeWords(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-|\/)\S/g, (match) => match.toUpperCase());
}

/**
 * Formats phone number into standard Indian format (+91 XXXXXXXXXX).
 */
export function formatIndianPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    return cleaned;
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  return phone;
}

/**
 * Validates Indian phone number (10 digits, or +91 followed by 10 digits).
 */
export function isValidIndianPhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
}

/**
 * Extracts only the user's FIRST NAME from a full name or contact string.
 * Ensures greeting does NOT use company or business names.
 */
export function getFirstName(fullNameOrFirstName?: string | null, fallbackRole: string = "User"): string {
  if (!fullNameOrFirstName || !fullNameOrFirstName.trim()) return fallbackRole;
  
  // Strip company suffixes if present e.g. "Vinay Kumar (M.V. Builders)" or "M.V Builders - Vinay"
  let clean = fullNameOrFirstName.trim();
  if (clean.includes(" - ")) {
    clean = clean.split(" - ").pop() || clean;
  }
  if (clean.includes(" / ")) {
    clean = clean.split(" / ").pop() || clean;
  }
  if (clean.includes("(")) {
    clean = clean.split("(")[0].trim();
  }

  const parts = clean.split(/\s+/);
  const first = parts[0] || fallbackRole;
  return capitalizeWords(first);
}

/**
 * Returns dynamic time-based greeting using the user's FIRST NAME:
 * 5:00 AM – 11:59 AM -> Good morning [FirstName]
 * 12:00 PM – 4:59 PM -> Good afternoon [FirstName]
 * 5:00 PM – 8:59 PM  -> Good evening [FirstName]
 * 9:00 PM – 4:59 AM  -> Good night [FirstName]
 */
export function getTimeBasedGreeting(name?: string | null, fallbackRole: string = "User"): string {
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

  const firstName = getFirstName(name, fallbackRole);
  return `${prefix} ${firstName}`;
}

/**
 * Safely masks a 12-digit Aadhaar number showing only the last 4 digits (e.g. XXXX XXXX 1234).
 */
export function maskAadhaar(aadhaar: string | null | undefined): string {
  if (!aadhaar) return "Verification Pending";
  const digits = aadhaar.replace(/\D/g, "");
  if (digits.length >= 4) {
    return `XXXX XXXX ${digits.slice(-4)}`;
  }
  return "XXXX XXXX XXXX";
}
