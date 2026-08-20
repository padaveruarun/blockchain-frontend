import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, Plus, Search } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import type { Course, PageResponse, Student } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonList } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  student_registration_number: z.string().min(2, "Required"),
  full_name: z.string().min(2, "Required"),
  email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  confirm_password: z.string().optional().or(z.literal("")),
  course: z.string().optional().or(z.literal("")),
  department: z.string().optional(),
  graduation_year: z
    .preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(1950).max(2100).optional()),
}).superRefine((data, ctx) => {
  if (data.password && data.password.length > 0 && !data.email) {
    ctx.addIssue({ code: "custom", path: ["email"], message: "Email is required when creating a login account." });
  }
  if (data.password && data.password.length > 0 && data.password !== data.confirm_password) {
    ctx.addIssue({ code: "custom", path: ["confirm_password"], message: "Passwords do not match." });
  }
});

type Values = z.infer<typeof schema>;

export default function InstitutionStudents() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const query = useQuery({
    queryKey: ["inst-students", page, search],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<Student> }>("/api/v1/students", {
        params: { page, per_page: 10, search: search || undefined },
      });
      return res.data.data;
    },
  });

  const courses = useQuery({
    queryKey: ["inst-courses"],
    queryFn: async () => {
      const res = await api.get<{ data: { items: Course[] } }>("/api/v1/institution/courses");
      return res.data.data.items;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      const res = await api.post<{ data: Student }>("/api/v1/students", {
        student_registration_number: values.student_registration_number,
        full_name: values.full_name,
        email: values.email || undefined,
        password: values.password || undefined,
        confirm_password: values.confirm_password || undefined,
        course: values.course || undefined,
        department: values.department || undefined,
        graduation_year: values.graduation_year,
      });
      return res.data.data;
    },
    onSuccess: () => {
      setMessage({ type: "success", text: "Student added successfully." });
      setOpen(false);
      form.reset();
      qc.invalidateQueries({ queryKey: ["inst-students"] });
      qc.invalidateQueries({ queryKey: ["inst-stats"] });
    },
    onError: (err) => setMessage({ type: "error", text: getErrorMessage(err) }),
  });

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage students registered at your institution."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="primary">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Student</DialogTitle>
                <DialogDescription>Register a new student in your institution.</DialogDescription>
              </DialogHeader>
              {message && (
                <p role="alert" className={`rounded-md p-3 text-sm ${message.type === "success" ? "bg-green-50 text-verified" : "bg-red-50 text-danger"}`}>
                  {message.text}
                </p>
              )}
              <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
                <div>
                  <Label htmlFor="reg">Registration Number</Label>
                  <Input id="reg" placeholder="e.g. ITU2026001" {...form.register("student_registration_number")} />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...form.register("full_name")} />
                </div>
                <div>
                  <Label htmlFor="email">Email (required with password)</Label>
                  <Input id="email" type="email" placeholder="student@example.com" {...form.register("email")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Select id="course" {...form.register("course")} disabled={courses.isLoading}>
                      <option value="">Select a course…</option>
                      {(courses.data ?? []).map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" {...form.register("department")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Set a login password" {...form.register("password")} />
                  </div>
                  <div>
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input id="confirm_password" type="password" placeholder="Re-enter password" {...form.register("confirm_password")} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Add an email and password to create a login account for this student. The student is verified
                  immediately when you create the account.
                </p>
                <div>
                  <Label htmlFor="year">Graduation Year</Label>
                  <Select id="year" {...form.register("graduation_year")}>
                    <option value="">—</option>
                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving…" : "Save Student"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <Input
          placeholder="Search by name or registration number…"
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {query.isLoading ? (
        <SkeletonList />
      ) : query.isError ? (
        <ErrorState message="Could not load students." />
      ) : query.data!.items.length === 0 ? (
        <EmptyState
          title={search ? "No matching students" : "No students yet"}
          description="Add your first student to start issuing certificates."
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data!.items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-navy-900">{s.full_name}</TableCell>
                  <TableCell>{s.student_registration_number}</TableCell>
                  <TableCell>{s.course ?? "—"}</TableCell>
                  <TableCell>{s.department ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.verification_status ?? "ACTIVE"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" aria-label={`View ${s.full_name}`}>
                      <Link to={`/institution/students/${s.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {query.data!.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm">
              <span className="text-gray-500">
                Page {query.data!.page} of {query.data!.pages}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= query.data!.pages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}