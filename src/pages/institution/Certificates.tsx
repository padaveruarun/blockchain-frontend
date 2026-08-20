import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import type { Certificate, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CertificatesTable, Pagination } from "@/components/shared/CertificatesTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonList } from "@/components/ui/skeleton";

export default function InstitutionCertificates() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  const query = useQuery({
    queryKey: ["inst-certs", page, search, status],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<Certificate> }>("/api/v1/certificates", {
        params: { page, per_page: 10, search: search || undefined, status: status || undefined },
      });
      return res.data.data;
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (certId: string) => {
      const res = await api.post(`/api/v1/certificates/${certId}/revoke`, { reason: "Revoked by institution" });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inst-certs"] });
      qc.invalidateQueries({ queryKey: ["inst-stats"] });
      qc.invalidateQueries({ queryKey: ["inst-charts"] });
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Certificates"
        description="Manage certificates issued by your institution."
        actions={
          <Button asChild variant="primary">
            <Link to="/institution/certificates/issue">
              <Plus className="h-4 w-4" aria-hidden="true" /> Issue Certificate
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            placeholder="Search certificates…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          aria-label="Filter by status"
          className="w-40"
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
        <EmptyState title="No certificates yet" description="Your issued certificates will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <CertificatesTable
            certificates={query.data!.items}
            basePath="/institution/certificates"
            showRevoke
            onRevoke={(cert) => revokeMutation.mutate(cert.id)}
          />
          <Pagination page={page} pages={query.data!.pages} onPage={setPage} />
        </Card>
      )}
    </div>
  );
}