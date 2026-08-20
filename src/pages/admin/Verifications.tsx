import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScanSearch } from "lucide-react";
import { api } from "@/lib/api";
import type { VerificationLog, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { VerificationLogsTable } from "@/components/shared/VerificationLogsTable";
import { Pagination } from "@/components/shared/CertificatesTable";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/ui/skeleton";

export default function AdminVerifications() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");

  const query = useQuery({
    queryKey: ["admin-verifications", page, status],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<VerificationLog> }>("/api/v1/admin/verifications", {
        params: { page, per_page: 15, status: status || undefined },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader title="Verifications" description="Every certificate verification performed on the platform." />

      <div className="mb-4">
        <Select
          aria-label="Filter by status"
          className="w-48"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="VALID">Valid</option>
          <option value="INVALID">Invalid</option>
          <option value="TAMPERED">Tampered</option>
          <option value="REVOKED">Revoked</option>
          <option value="EXPIRED">Expired</option>
        </Select>
      </div>

      {query.isLoading ? (
        <SkeletonList />
      ) : query.isError ? (
        <ErrorState message="Could not load verifications." />
      ) : query.data!.items.length === 0 ? (
        <EmptyState icon={ScanSearch} title="No verifications yet" description="Verifications will appear here once certificates are checked." />
      ) : (
        <Card className="overflow-hidden">
          <VerificationLogsTable logs={query.data!.items} />
          <Pagination page={page} pages={query.data!.pages} onPage={setPage} />
        </Card>
      )}
    </div>
  );
}