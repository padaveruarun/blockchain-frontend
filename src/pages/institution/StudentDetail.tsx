import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { Student, Certificate } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { CertificatesTable } from "@/components/shared/CertificatesTable";
import { formatDate } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}

export default function InstitutionStudentDetail() {
  const { id } = useParams<{ id: string }>();

  const student = useQuery({
    queryKey: ["inst-student", id],
    queryFn: async () => {
      const res = await api.get<{ data: Student }>(`/api/v1/students/${id}`);
      return res.data.data;
    },
  });

  const certs = useQuery({
    queryKey: ["inst-student-certs", id],
    queryFn: async () => {
      const res = await api.get<{ data: { items: Certificate[] } }>(`/api/v1/certificates`, {
        params: { per_page: 50 },
      });
      const items = res.data.data.items;
      return items.filter((c) => c.student_id === id);
    },
  });

  if (student.isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-72 w-full rounded-xl" /></div>;
  }

  if (student.isError || !student.data) {
    return <ErrorState message="Could not load the student." />;
  }

  const s = student.data;

  return (
    <div>
      <PageHeader
        title={s.full_name}
        description={s.student_registration_number}
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link to="/institution/students">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Student Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Email" value={s.email} />
              <DetailRow label="Course" value={s.course} />
              <DetailRow label="Department" value={s.department} />
              <DetailRow label="Graduation Year" value={s.graduation_year?.toString()} />
              <DetailRow label="Date of Birth" value={formatDate(s.date_of_birth)} />
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Certificates</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {certs.isLoading ? (
              <div className="p-6"><Skeleton className="h-40 w-full" /></div>
            ) : certs.data && certs.data.length > 0 ? (
              <CertificatesTable certificates={certs.data} basePath="/institution/certificates" />
            ) : (
              <p className="p-6 text-sm text-gray-500">No certificates issued to this student yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}