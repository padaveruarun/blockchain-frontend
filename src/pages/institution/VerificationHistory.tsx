import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScanEye } from "lucide-react";
import { api } from "@/lib/api";
import type { VerificationLog, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { VerificationLogsTable } from "@/components/shared/VerificationLogsTable";
import { Pagination } from "@/components/shared/CertificatesTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/ui/skeleton";

export default function InstitutionVerificationHistory() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");

  const query = useQuery({
    queryKey: ["inst-verifications", page, status],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<VerificationLog> }>("/api/v1/institutions/me/verifications", {
        params: { page, per_page: 15, status: status || undefined },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader
        title="Verification History"
        description="Every time someone verifies one of your certificates."
      />

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
        <p className="py-10 text-center text-sm text-gray-500">Could not load verification history.</p>
      ) : query.data!.items.length === 0 ? (
        <EmptyState
          icon={ScanEye}
          title="No verification activity yet"
          description="Verifications performed against your certificates will show up here."
        />
      ) : (
        <Card className="overflow-hidden">
          <VerificationLogsTable logs={query.data!.items} />
          <Pagination page={page} pages={query.data!.pages} onPage={setPage} />
        </Card>
      )}
    </div>
  );
}