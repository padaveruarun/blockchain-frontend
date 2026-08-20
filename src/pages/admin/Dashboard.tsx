import { useQuery } from "@tanstack/react-query";
import { Building2, Award, ScanSearch, Users, Hourglass } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminStats, ChartPoint } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarsChart, StatusPieChart, TrendLineChart } from "@/components/shared/Charts";

export default function AdminDashboard() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get<{ data: AdminStats }>("/api/v1/admin/dashboard");
      return res.data.data;
    },
  });

  const charts = useQuery({
    queryKey: ["admin-charts"],
    queryFn: async () => {
      const res = await api.get<{ data: { certificates_issued: ChartPoint[]; verification_activity: ChartPoint[]; user_counts_by_role: ChartPoint[]; verification_by_status: ChartPoint[]; certificate_status: ChartPoint[] } }>(
        "/api/v1/admin/charts",
      );
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Platform-wide overview of certificates and blockchain health." />

      {stats.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : stats.isError ? (
        <ErrorState message="Could not load dashboard." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Institutions" value={stats.data!.total_institutions} icon={Building2} hint={`${stats.data!.pending_institutions} pending approval`} />
          <StatCard title="Certificates" value={stats.data!.total_certificates} icon={Award} hint={`${stats.data!.active_certificates} active`} />
          <StatCard title="Verifications" value={stats.data!.total_verifications} icon={ScanSearch} hint={`${stats.data!.valid_verifications} valid`} />
          <StatCard title="Students" value={stats.data!.total_students} icon={Users} />
          <StatCard title="Total Users" value={stats.data!.total_users} icon={Users} />
        </div>
      )}

      {charts.isLoading ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : charts.isError ? (
        <ErrorState message="Could not load charts." />
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Certificates Issued by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <BarsChart data={charts.data!.certificates_issued} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification Activity (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendLineChart data={charts.data!.verification_activity} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification Results by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusPieChart data={charts.data!.verification_by_status} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Users by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusPieChart data={charts.data!.user_counts_by_role} labelKey="role" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}