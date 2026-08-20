import { useQuery } from "@tanstack/react-query";
import { Award, BadgeCheck, Hourglass, ScanEye } from "lucide-react";
import { api } from "@/lib/api";
import type { StudentStats } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { CertificatesTable } from "@/components/shared/CertificatesTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonList } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();

  const stats = useQuery({
    queryKey: ["student-stats"],
    queryFn: async () => {
      const res = await api.get<{ data: StudentStats }>("/api/v1/student/dashboard");
      return res.data.data;
    },
  });

  const recent = useQuery({
    queryKey: ["student-recent-certs"],
    queryFn: async () => {
      const res = await api.get<{ data: { items: unknown[] } }>("/api/v1/certificates/student", { params: { per_page: 5 } });
      return res.data.data.items as unknown as import("@/lib/types").Certificate[];
    },
  });

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] ?? "there"}`}
        description="Manage and share your verified academic credentials."
      />

      {stats.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : stats.isError ? (
        <ErrorState message="Could not load your dashboard." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Certificates" value={stats.data!.total_certificates} icon={Award} />
          <StatCard title="Verified / Active" value={stats.data!.verified_certificates} icon={BadgeCheck} />
          <StatCard title="Pending" value={stats.data!.pending_certificates} icon={Hourglass} />
          <StatCard title="Total Verifications" value={stats.data!.total_verifications} icon={ScanEye} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-navy-900">Recent Certificates</h2>
        {recent.isLoading ? (
          <SkeletonList />
        ) : recent.isError ? (
          <ErrorState message="Could not load certificates." />
        ) : recent.data!.length === 0 ? (
          <EmptyState
            title="No certificates yet"
            description="Your issued certificates will appear here."
          />
        ) : (
          <Card className="overflow-hidden">
            <CertificatesTable certificates={recent.data!} basePath="/student/certificates" />
          </Card>
        )}
      </div>
    </div>
  );
}