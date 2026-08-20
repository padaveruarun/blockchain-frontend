import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { api } from "@/lib/api";
import type { Certificate, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { CertificatesTable, Pagination } from "@/components/shared/CertificatesTable";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/ui/skeleton";

export default function AdminCertificates() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");

  const query = useQuery({
    queryKey: ["admin-certificates", page, status],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<Certificate> }>("/api/v1/admin/certificates", {
        params: { page, per_page: 15, status: status || undefined },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader title="Certificates" description="All certificates issued across the platform." />

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
          <option value="ACTIVE">Active</option>
          <option value="REVOKED">Revoked</option>
          <option value="EXPIRED">Expired</option>
          <option value="DRAFT">Draft</option>
        </Select>
      </div>

      {query.isLoading ? (
        <SkeletonList />
      ) : query.isError ? (
        <ErrorState message="Could not load certificates." />
      ) : query.data!.items.length === 0 ? (
        <EmptyState icon={Award} title="No certificates" description="Certificates issued on the platform will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <CertificatesTable certificates={query.data!.items} basePath="/admin/certificates" />
          <Pagination page={page} pages={query.data!.pages} onPage={setPage} />
        </Card>
      )}
    </div>
  );
}