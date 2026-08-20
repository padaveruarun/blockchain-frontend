import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building2, Check, X } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import type { Institution, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/CertificatesTable";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function AdminInstitutions() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");

  const query = useQuery({
    queryKey: ["admin-institutions", page, status],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<Institution> }>("/api/v1/institutions", {
        params: { page, per_page: 15, status: status || undefined },
      });
      return res.data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const res = await api.patch(`/api/v1/institutions/${id}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-institutions"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader title="Institutions" description="Approve and manage registered institutions." />

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
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>

      {query.isLoading ? (
        <SkeletonList />
      ) : query.isError ? (
        <ErrorState message="Could not load institutions." />
      ) : query.data!.items.length === 0 ? (
        <EmptyState icon={Building2} title="No institutions" description="Institutions registered on the platform will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Registration No.</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data!.items.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell>
                    <Link to={`/admin/institutions/${inst.id}`} className="flex items-center gap-2 font-medium text-navy-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50">
                        <Building2 className="h-4 w-4 text-navy-800" aria-hidden="true" />
                      </span>
                      <span>
                        {inst.name}
                        <span className="block text-xs font-normal text-gray-500">{inst.email}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{inst.registration_number}</TableCell>
                  <TableCell className="text-gray-500">{formatDate(inst.created_at)}</TableCell>
                  <TableCell>
                    <StatusBadge status={inst.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inst.status === "PENDING" && (
                        <ConfirmDialog
                          title={`Approve ${inst.name}?`}
                          description="The institution will be able to issue certificates immediately."
                          confirmText="Approve"
                          onConfirm={() => statusMutation.mutate({ id: inst.id, newStatus: "ACTIVE" })}
                          trigger={
                            <Button variant="secondary" size="sm">
                              <Check className="h-4 w-4" aria-hidden="true" /> Approve
                            </Button>
                          }
                        />
                      )}
                      {inst.status === "ACTIVE" && (
                        <ConfirmDialog
                          title={`Suspend ${inst.name}?`}
                          description="Suspending blocks the institution from issuing new certificates."
                          confirmText="Suspend"
                          onConfirm={() => statusMutation.mutate({ id: inst.id, newStatus: "SUSPENDED" })}
                          trigger={
                            <Button variant="danger" size="sm">
                              <X className="h-4 w-4" aria-hidden="true" /> Suspend
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </TableCell>
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