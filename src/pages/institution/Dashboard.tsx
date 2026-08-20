import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { GraduationCap, Award, Hourglass, ScanEye, Plus, Check, X } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import type { InstitutionStats, PendingVerification, ChartPoint } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarsChart, StatusPieChart } from "@/components/shared/Charts";

export default function InstitutionDashboard() {
  const qc = useQueryClient();
  const [rejecting, setRejecting] = useState<PendingVerification | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const stats = useQuery({
    queryKey: ["inst-stats"],
    queryFn: async () => {
      const res = await api.get<{ data: InstitutionStats }>("/api/v1/institutions/me/dashboard");
      return res.data.data;
    },
  });

  const charts = useQuery({
    queryKey: ["inst-charts"],
    queryFn: async () => {
      const res = await api.get<{ data: { issued_by_month: ChartPoint[]; verification_status: ChartPoint[]; certificate_status: ChartPoint[] } }>(
        "/api/v1/institutions/me/charts",
      );
      return res.data.data;
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["inst-stats"] });
    qc.invalidateQueries({ queryKey: ["inst-students"] });
  };

  const approveMutation = useMutation({
    mutationFn: async (student: PendingVerification) => {
      const res = await api.post(`/api/v1/institution/students/${student.id}/approve`);
      return res.data;
    },
    onSuccess: () => {
      setMessage("Student approved. Their login is now active.");
      invalidate();
    },
    onError: (err) => setMessage(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/v1/institution/students/${rejecting!.id}/reject`, { reason: reason.trim() || "Rejected" });
      return res.data;
    },
    onSuccess: () => {
      setMessage("Student rejected. Their account has been disabled.");
      setRejecting(null);
      setReason("");
      invalidate();
    },
    onError: (err) => {
      setMessage(getErrorMessage(err));
    },
  });

  const pending = stats.data?.pending_verifications ?? [];

  const renderPending = () => {
    if (stats.isLoading) {
      return (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Student Verification Requests</CardTitle>
          <StatusBadge status={`${pending.length} pending`} className="bg-amber-50 text-amber-700" />
        </CardHeader>
        <CardContent className="p-0">
          {pending.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No students waiting for verification.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pending.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link to={`/institution/students/${s.id}`} className="font-medium text-navy-900 hover:underline">
                      {s.full_name}
                    </Link>
                    <p className="truncate text-sm text-gray-500">
                      {s.student_registration_number}
                      {s.course ? ` · ${s.course}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setMessage(null);
                        setRejecting(s);
                      }}
                    >
                      <X className="h-4 w-4" aria-hidden="true" /> Reject
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => approveMutation.mutate(s)} disabled={approveMutation.isPending}>
                      <Check className="h-4 w-4" aria-hidden="true" /> Approve
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <PageHeader
        title="Institution Dashboard"
        description="Overview of students awaiting verification, issued certificates and verification activity."
        actions={
          <Button asChild variant="primary">
            <Link to="/institution/certificates/issue">
              <Plus className="h-4 w-4" aria-hidden="true" /> Issue Certificate
            </Link>
          </Button>
        }
      />

      {message && (
        <p role="status" className="mb-4 rounded-md bg-green-50 p-3 text-sm text-verified">
          {message}
        </p>
      )}

      {stats.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : stats.isError ? (
        <ErrorState message="Could not load dashboard." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Students" value={stats.data!.total_students} icon={GraduationCap} />
          <StatCard title="Pending Verification" value={stats.data!.pending_students} icon={Hourglass} />
          <StatCard title="Verified Students" value={stats.data!.verified_students} icon={Check} />
          <StatCard title="Certificates Issued" value={stats.data!.certificates_issued} icon={Award} />
          <StatCard title="Verification Requests" value={stats.data!.verification_requests} icon={ScanEye} />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {renderPending()}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending (Draft)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{stats.data?.pending_certificates ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revoked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{stats.data?.revoked_certificates ?? 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {charts.isLoading ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : charts.isError ? (
        <ErrorState message="Could not load charts." />
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Certificates Issued by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <BarsChart data={charts.data!.issued_by_month} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification Results</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusPieChart data={charts.data!.verification_status} />
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejecting?.full_name}</DialogTitle>
            <DialogDescription>
              Provide a reason. This disables the student's login account and rejects their registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Reason</Label>
              <Input
                id="reject-reason"
                placeholder="e.g. Student ID could not be confirmed"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRejecting(null)}>
                Cancel
              </Button>
              <Button className="bg-danger text-white hover:bg-red-700" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
                <X className="h-4 w-4" aria-hidden="true" /> {rejectMutation.isPending ? "Rejecting…" : "Reject Student"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}