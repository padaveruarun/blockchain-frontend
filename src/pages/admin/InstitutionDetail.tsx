import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import type { Institution } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatDate, shortHash } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}

export default function AdminInstitutionDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-institution", id],
    queryFn: async () => {
      const res = await api.get<{ data: Institution }>(`/api/v1/institutions/${id}`);
      return res.data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await api.patch(`/api/v1/institutions/${id}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-institution"] });
      qc.invalidateQueries({ queryKey: ["admin-institutions"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Could not load institution." />;
  }

  const inst = query.data;

  return (
    <div>
      <PageHeader
        title={inst.name}
        description={inst.registration_number}
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link to="/admin/institutions">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-navy-800" aria-hidden="true" /> Institution Details
              <StatusBadge status={inst.status} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Name" value={inst.name} />
              <DetailRow label="Registration Number" value={inst.registration_number} />
              <DetailRow label="Email" value={inst.email} />
              <DetailRow label="Phone" value={inst.phone} />
              <DetailRow label="Address" value={inst.address} />
              <DetailRow label="Wallet Address" value={<span className="font-mono text-xs">{shortHash(inst.wallet_address, 12, 8)}</span>} />
              <DetailRow label="Joined" value={formatDate(inst.created_at)} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inst.status === "PENDING" && (
              <Button className="w-full" variant="primary" onClick={() => statusMutation.mutate("ACTIVE")}>
                Approve Institution
              </Button>
            )}
            {inst.status === "ACTIVE" && (
              <ConfirmDialog
                title={`Suspend ${inst.name}?`}
                description="Suspending blocks the institution from issuing new certificates."
                confirmText="Suspend"
                onConfirm={() => statusMutation.mutate("SUSPENDED")}
                trigger={
                  <Button className="w-full" variant="danger">
                    Suspend Institution
                  </Button>
                }
              />
            )}
            {(inst.status === "SUSPENDED" || inst.status === "REJECTED") && (
              <Button className="w-full" variant="primary" onClick={() => statusMutation.mutate("ACTIVE")}>
                Re-activate
              </Button>
            )}
            <p className="text-xs text-gray-400">
              Status changes are recorded to the audit log for accountability.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}