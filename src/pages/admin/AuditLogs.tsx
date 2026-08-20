import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileBarChart2 } from "lucide-react";
import { api } from "@/lib/api";
import type { AuditLog, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/shared/CertificatesTable";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, shortHash } from "@/lib/utils";

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState<string>("");

  const query = useQuery({
    queryKey: ["admin-audit", page, entity],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<AuditLog> }>("/api/v1/audit/logs", {
        params: { page, per_page: 15, entity_type: entity || undefined },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader title="Audit Logs" description="Immutable trail of administrative and platform actions." />

      <div className="mb-4">
        <Select
          aria-label="Filter by entity"
          className="w-48"
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All entities</option>
          <option value="CERTIFICATE">Certificate</option>
          <option value="INSTITUTION">Institution</option>
          <option value="STUDENT">Student</option>
          <option value="USER">User</option>
        </Select>
      </div>

      {query.isLoading ? (
        <SkeletonList />
      ) : query.isError ? (
        <ErrorState message="Could not load audit logs." />
      ) : query.data!.items.length === 0 ? (
        <EmptyState icon={FileBarChart2} title="No audit entries yet" description="Actions with accountability requirements will be recorded here." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data!.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-800">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {log.entity_type}
                    {log.entity_id ? <span className="ml-1 font-mono text-xs">({shortHash(log.entity_id, 8, 0)})</span> : null}
                  </TableCell>
                  <TableCell className="text-gray-500">{log.user_email ?? "—"}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-xs text-gray-500">
                    {JSON.stringify(log.new_value ?? log.old_value ?? "")}
                  </TableCell>
                  <TableCell className="text-gray-500">{formatDateTime(log.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} pages={query.data!.pages} onPage={setPage} />
        </Card>
      )}
    </div>
  );
}