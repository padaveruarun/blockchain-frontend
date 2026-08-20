import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortHash(value?: string | null, head = 10, tail = 4): string {
  if (!value) return "—";
  if (value.length <= head + tail) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export const VERIFY_STATUS_COLORS: Record<string, string> = {
  VALID: "verified",
  INVALID: "danger",
  TAMPERED: "danger",
  REVOKED: "pending",
  EXPIRED: "pending",
  ACTIVE: "verified",
  DRAFT: "pending",
  ISSUED: "pending",
  PENDING: "pending",
  APPROVED: "verified",
  CONFIRMED: "verified",
  FAILED: "danger",
  SUSPENDED: "pending",
  REJECTED: "danger",
};