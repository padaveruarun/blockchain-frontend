import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PageResponse, VerificationLog } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { VerificationLogsTable } from "@/components/shared/VerificationLogsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonList } from "@/components/ui/skeleton";

export default function StudentHistory() {
  const logsQuery = useQuery({
    queryKey: ["student-verify-logs"],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<VerificationLog> }>("/api/v1/student/verifications", {
        params: { per_page: 50 },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader title="Verification History" description="When your certificates were verified and with what result." />
      {logsQuery.isLoading ? (
        <SkeletonList />
      ) : logsQuery.isError ? (
        <ErrorState message="Could not load history." />
      ) : !logsQuery.data || logsQuery.data.items.length === 0 ? (
        <EmptyState title="No verification activity yet" description="When someone verifies your certificates, it shows up here." />
      ) : (
        <Card className="overflow-hidden">
          <VerificationLogsTable logs={logsQuery.data.items} />
        </Card>
      )}
    </div>
  );
}