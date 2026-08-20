import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Certificate, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { CertificatesTable, Pagination } from "@/components/shared/CertificatesTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonList } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function StudentCertificates() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["student-certs", page],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<Certificate> }>("/api/v1/certificates/student", {
        params: { page, per_page: 10 },
      });
      return res.data.data;
    },
  });

  const filtered = query.data?.items.filter((c) =>
    search.trim() ? (c.certificate_id + " " + c.course_name).toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <div>
      <PageHeader
        title="My Certificates"
        description="All academic credentials issued to you."
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <Input
              placeholder="Search certificates…"
              className="w-64 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      {query.isLoading ? (
        <SkeletonList />
      ) : query.isError ? (
        <ErrorState message="Could not load certificates." />
      ) : filtered!.length === 0 ? (
        <EmptyState title="No certificates yet" description="Your issued certificates will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <CertificatesTable certificates={filtered!} basePath="/student/certificates" />
          <Pagination page={page} pages={query.data!.pages} onPage={setPage} />
        </Card>
      )}
    </div>
  );
}