import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Student } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatDate } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}

export default function StudentProfile() {
  const query = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const res = await api.get<{ data: Student | null }>("/api/v1/student/profile");
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader title="Profile" description="Your personal information as registered by your institution." />
      {query.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : query.isError ? (
        <ErrorState message="Could not load profile." />
      ) : query.data ? (
        <Card className="max-w-2xl p-6">
          <h2 className="text-lg font-semibold text-navy-900">{query.data.full_name}</h2>
          <p className="text-sm text-gray-500">{query.data.student_registration_number}</p>
          <dl className="mt-6">
            <DetailRow label="Email" value={query.data.email} />
            <DetailRow label="Registration Number" value={query.data.student_registration_number} />
            <DetailRow label="Institution" value={query.data.institution_name} />
            <DetailRow label="Course" value={query.data.course} />
            <DetailRow label="Department" value={query.data.department} />
            <DetailRow label="Graduation Year" value={query.data.graduation_year?.toString()} />
            <DetailRow label="Date of Birth" value={formatDate(query.data.date_of_birth)} />
            <DetailRow label="Member Since" value={formatDate(query.data.created_at)} />
          </dl>
        </Card>
      ) : (
        <Card className="p-6 text-sm text-gray-500">
          No student profile linked to your account yet.
        </Card>
      )}
    </div>
  );
}