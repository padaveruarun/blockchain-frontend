import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, VERIFY_STATUS_COLORS } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gray-100 text-gray-700",
        verified: "border-transparent bg-green-100 text-green-800",
        danger: "border-transparent bg-red-100 text-red-800",
        pending: "border-transparent bg-amber-100 text-amber-800",
        navy: "border-transparent bg-navy-50 text-navy-800",
        outline: "border-gray-300 text-gray-700",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
));
Badge.displayName = "Badge";

/** Map a status string to a badge variant for consistent coloring + text. */
export function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const color = VERIFY_STATUS_COLORS[status ?? ""] ?? "default";
  const variant =
    color === "verified" || color === "danger" || color === "pending" || color === "navy"
      ? color
      : ("default" as const);
  return (
    <Badge variant={variant} className={className}>
      {status ?? "—"}
    </Badge>
  );
}

export { Badge, badgeVariants };