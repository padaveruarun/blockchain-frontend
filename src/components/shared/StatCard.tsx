import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <Card className="p-6 card-hover border-slate-100 bg-white">
      <div className="flex items-center justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="truncate text-3xl font-extrabold text-navy-900 tracking-tight leading-none">{value}</p>
          {hint && <p className="text-[10.5px] font-medium text-slate-400 pt-0.5">{hint}</p>}
        </div>
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-navy-50 to-indigo-50/20 border border-navy-100/50 text-navy-500 shadow-xs">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-6 border-slate-100">
      <Skeleton className="h-3.5 w-24 rounded-md" />
      <Skeleton className="mt-3.5 h-8 w-16 rounded-md" />
    </Card>
  );
}