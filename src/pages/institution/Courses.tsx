import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import type { Course } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonList } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Course name is required").max(255),
  code: z.string().max(50).optional(),
});

type Values = z.infer<typeof schema>;

export default function InstitutionCourses() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const query = useQuery({
    queryKey: ["inst-courses"],
    queryFn: async () => {
      const res = await api.get<{ data: { items: Course[] } }>("/api/v1/institution/courses");
      return res.data.data.items;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (values: Values) => {
      const res = await api.post<{ data: Course }>("/api/v1/institution/courses", {
        name: values.name,
        code: values.code || undefined,
      });
      return res.data.data;
    },
    onSuccess: () => {
      setMessage({ type: "success", text: "Course added to your catalogue." });
      setOpen(false);
      form.reset();
      qc.invalidateQueries({ queryKey: ["inst-courses"] });
    },
    onError: (err) => setMessage({ type: "error", text: getErrorMessage(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (course: Course) => {
      await api.delete(`/api/v1/institution/courses/${course.id}`);
      return course;
    },
    onSuccess: (course) => {
      setMessage({ type: "success", text: `"${course.name}" was deleted.` });
      qc.invalidateQueries({ queryKey: ["inst-courses"] });
    },
    onError: (err) => setMessage({ type: "error", text: getErrorMessage(err) }),
  });

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Manage the courses your institution offers. Students pick their course from this list when they register."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="primary">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Course</DialogTitle>
                <DialogDescription>Add a course your institution offers to students.</DialogDescription>
              </DialogHeader>
              {message && (
                <p role="alert" className={`rounded-md p-3 text-sm ${message.type === "success" ? "bg-green-50 text-verified" : "bg-red-50 text-danger"}`}>
                  {message.text}
                </p>
              )}
              <form onSubmit={form.handleSubmit((v) => addMutation.mutate(v))} className="space-y-4">
                <div>
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input id="course-name" placeholder="e.g. BSc Computer Science" {...form.register("name")} />
                </div>
                <div>
                  <Label htmlFor="course-code">Course Code (optional)</Label>
                  <Input id="course-code" placeholder="e.g. CS-101" {...form.register("code")} />
                </div>
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Saving…" : "Add Course"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {message && (
        <p role="status" className={`mb-4 rounded-md p-3 text-sm ${message.type === "success" ? "bg-green-50 text-verified" : "bg-red-50 text-danger"}`}>
          {message.text}
        </p>
      )}

      {query.isLoading ? (
        <SkeletonList />
      ) : query.isError ? (
        <ErrorState message="Could not load courses." />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Add your first course so students can select it during registration."
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data ?? []).map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium text-navy-900">{course.name}</TableCell>
                  <TableCell>{course.code ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={course.status} />
                  </TableCell>
                  <TableCell>{course.created_at ? formatDate(course.created_at) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${course.name}`}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete "{course.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This removes the course from your catalogue. Students already registered in this course keep their records.
                        </AlertDialogDescription>
                        <div className="mt-4 flex justify-end gap-2">
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-danger text-white hover:bg-red-700"
                            onClick={() => deleteMutation.mutate(course)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? "Deleting…" : "Delete Course"}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
