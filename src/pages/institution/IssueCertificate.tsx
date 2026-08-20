import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  Circle,
  FileText,
  Hash,
  UploadCloud,
  Loader2,
  Boxes,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api, API_URL, getErrorCode, getErrorMessage } from "@/lib/api";
import type { Certificate, PageResponse, Student } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z
  .object({
    student_id: z.string().min(1, "Select a student"),
    certificate_type: z.string().min(2, "Required"),
    course_name: z.string().min(2, "Required"),
    certificate_number: z.string().min(2, "Required"),
    certificate_id: z.string().min(6, "At least 6 characters"),
    issue_date: z.string().min(1, "Issued date required"),
    expiry_date: z.string().optional(),
    file: z.any().optional(),
  })
  .refine((d) => !d.expiry_date || d.expiry_date >= d.issue_date, {
    message: "Expiry date must be after issue date",
    path: ["expiry_date"],
  });

type Values = z.infer<typeof schema>;

type StepState = "pending" | "active" | "done" | "error";

const STEPS = ["Creating certificate", "Generating hash", "Uploading certificate", "Registering on blockchain", "Confirming transaction", "Generating QR"];

function StepRow({ step, state, isLast }: { step: string; state: StepState; isLast: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span className="relative flex flex-col items-center">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
          {state === "done" && <Check className="h-4 w-4 text-verified" aria-hidden="true" />}
          {state === "active" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />}
          {state === "error" && <AlertCircle className="h-4 w-4 text-danger" aria-hidden="true" />}
          {state === "pending" && <Circle className="h-2 w-2 text-gray-300" aria-hidden="true" />}
        </span>
        {!isLast && <span className="h-5 w-0.5 bg-gray-200" />}
      </span>
      <span className={`text-sm ${state === "pending" ? "text-gray-400" : "text-gray-800"}`}>{step}</span>
    </li>
  );
}

export default function IssueCertificate() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [steps, setSteps] = useState<StepState[]>(Array(STEPS.length).fill("pending"));
  const [issued, setIssued] = useState<Certificate | null>(null);
  const [preview, setPreview] = useState<{
    hash: string;
    course: string;
    studentName: string;
    certificateId: string;
    certificateNumber: string;
    certificateType: string;
    certificateTypeCode: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const collisionRetriedRef = useRef(false);

  const studentsQuery = useQuery({
    queryKey: ["issue-students"],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<Student> }>("/api/v1/students", { params: { per_page: 100 } });
      return res.data.data.items;
    },
  });

  const typesQuery = useQuery({
    queryKey: ["certificate-types"],
    queryFn: async () => {
      const res = await api.get<{ data: { code: string; name: string }[] }>("/api/v1/certificates/types");
      return res.data.data;
    },
  });

  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const studentId = form.watch("student_id");
  const certificateType = form.watch("certificate_type");

  const selectedStudent = useMemo(
    () => studentsQuery.data?.find((s) => s.id === studentId),
    [studentId, studentsQuery.data],
  );

  // Server-computed next certificate_id/number so the preview matches what
  // will actually be issued (the backend is the source of truth on collision).
  const nextIdsQuery = useQuery({
    queryKey: ["issue-next-ids", studentId, certificateType],
    enabled: Boolean(studentId && certificateType),
    queryFn: async () => {
      const res = await api.get<{
        data: { certificate_id: string; certificate_number: string; year: number };
      }>("/api/v1/certificates/next", { params: { certificate_type: certificateType } });
      return res.data.data;
    },
  });

  // Default the certificate type to the first option once loaded.
  useEffect(() => {
    if (!certificateType && typesQuery.data?.length) {
      form.setValue("certificate_type", typesQuery.data[0].name);
    }
  }, [typesQuery.data, certificateType, form]);

  // Default the issue date to today.
  useEffect(() => {
    if (!form.getValues("issue_date")) {
      form.setValue("issue_date", new Date().toISOString().slice(0, 10));
    }
  }, [form]);

  // Auto-fill the course from the selected student (editable afterwards).
  useEffect(() => {
    if (studentId && selectedStudent?.course) {
      form.setValue("course_name", selectedStudent.course);
    }
  }, [selectedStudent, studentId, form]);

  // Prefill auto-generated certificate_id/number without clobbering manual edits.
  const autoIdsRef = useRef<{ certificate_id?: string; certificate_number?: string }>({});
  useEffect(() => {
    const next = nextIdsQuery.data;
    if (!next) return;
    const values = form.getValues();
    const previous = autoIdsRef.current;
    if (!values.certificate_id || values.certificate_id === previous.certificate_id) {
      form.setValue("certificate_id", next.certificate_id);
    }
    if (!values.certificate_number || values.certificate_number === previous.certificate_number) {
      form.setValue("certificate_number", next.certificate_number);
    }
    autoIdsRef.current = { certificate_id: next.certificate_id, certificate_number: next.certificate_number };
  }, [nextIdsQuery.data, form]);

  const studentName = selectedStudent?.full_name ?? "";

  // Local hash preview (demo): hash of the certificate number to show tamper-proofing intent.
  const computePreview = (v: Values) => {
    const text = `${v.certificate_id}|${v.course_name}|${v.certificate_number}|${v.issue_date}`;
    const type = typesQuery.data?.find((t) => t.name === v.certificate_type);
    return {
      hash: getPreviewHash(text),
      course: v.course_name,
      studentName: studentName,
      certificateId: v.certificate_id,
      certificateNumber: v.certificate_number,
      certificateType: v.certificate_type,
      certificateTypeCode: type?.code ?? "",
    };
  };

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      const fd = new FormData();
      fd.append("certificate_id", values.certificate_id);
      fd.append("student_id", values.student_id);
      fd.append("certificate_type", values.certificate_type);
      fd.append("course_name", values.course_name);
      fd.append("certificate_number", values.certificate_number);
      fd.append("issue_date", values.issue_date);
      if (values.expiry_date) fd.append("expiry_date", values.expiry_date);
      if (values.file && values.file instanceof File) {
        fd.append("file", values.file);
        // Validate PDF upload server-side is the source of truth.
      }
      const res = await api.post<{ data: Certificate }>("/api/v1/certificates", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: () => {
          setSteps((s) => s.map((v, i) => (i <= 2 ? "done" : v)));
          setSteps((s) => {
            const next = [...s];
            next[3] = "active";
            return next;
          });
        },
      });
      return res.data.data;
    },
    onSuccess: (cert) => {
      setIssued(cert);
      setSteps((s) => {
        const next = s.map(() => "done" as StepState);
        return next;
      });
      setConfirmOpen(false);
      // The auto-generated IDs advanced; make sure the next issue is fresh.
      queryClient.invalidateQueries({ queryKey: ["issue-next-ids"] });
    },
    onError: (err) => {
      const code = getErrorCode(err);

      // Concurrent/stale auto-generated IDs: fetch the next free ones and
      // re-submit silently once instead of failing the user.
      if (code === "CERTIFICATE_ID_EXISTS" || code === "CERTIFICATE_NUMBER_EXISTS") {
        if (!collisionRetriedRef.current) {
          collisionRetriedRef.current = true;
          const values = form.getValues();
          nextIdsQuery.refetch().then(() => {
            const next = nextIdsQuery.data;
            if (!next) return;
            form.setValue("certificate_id", next.certificate_id);
            form.setValue("certificate_number", next.certificate_number);
            autoIdsRef.current = { certificate_id: next.certificate_id, certificate_number: next.certificate_number };
            const retryValues = form.getValues();
            setSteps((s) => s.map((_, i) => (i < 3 ? "done" : "pending")));
            setPreview(computePreview(retryValues));
            mutation.mutate(retryValues);
          });
          return;
        }
      }

      setSteps((s) => {
        const next = [...s];
        const firstPending = next.indexOf("pending") > -1 ? next.indexOf("pending") : next.length - 1;
        next[firstPending] = "error";
        return next;
      });
      setFormError(getErrorMessage(err));
      setConfirmOpen(false);
    },
  });

  const onConfirm = (values: Values) => {
    setSteps((s) => s.map((_, i) => (i < 3 ? "done" : "pending")));
    setPreview(null);
    mutation.mutate(values);
  };

  if (issued) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="overflow-hidden text-center">
          <div className="bg-green-50 p-8">
            <CheckCircle2 className="mx-auto h-12 w-12 text-verified" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold text-navy-900">Certificate Issued Successfully</h2>
            <p className="mt-1 text-sm text-gray-500">
              The certificate hash has been registered on the blockchain.
            </p>
          </div>
          <div className="space-y-2 p-6 text-left text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Certificate ID</dt><dd className="font-semibold text-navy-900">{issued.certificate_id}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Transaction Hash</dt><dd className="font-mono text-xs">{issued.blockchain_transaction_hash}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Block</dt><dd className="font-mono text-xs">{issued.blockchain_block_number}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">On-Chain ID</dt><dd>{issued.blockchain_certificate_id}</dd></div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 border-t border-gray-100 p-6">
            <Button asChild variant="primary">
              <Link to={`/institution/certificates/${issued.id}`}>View Certificate</Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.open(`${API_URL}/api/v1/certificates/${issued.id}/download`, "_blank")}
            >
              <FileText className="h-4 w-4" aria-hidden="true" /> Download
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Issue Certificate" description="Generate a tamper-proof certificate and register it on the blockchain." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>Fill in the details. The PDF is hashed with SHA-256 and anchored on-chain.</CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-danger">{formError}</p>
            )}
            <form onSubmit={form.handleSubmit((v) => setPreview(computePreview(v)))} onInvalid={() => undefined} className="space-y-4">
              <div>
                <Label htmlFor="student_id">Student</Label>
                {studentsQuery.isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select id="student_id" {...form.register("student_id")}>
                    <option value="">Select a student…</option>
                    {studentsQuery.data?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} — {s.student_registration_number}
                      </option>
                    ))}
                  </Select>
                )}
                {form.formState.errors.student_id && <p className="mt-1 text-xs text-danger">{form.formState.errors.student_id.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="certificate_type">Certificate Type</Label>
                  {typesQuery.isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select id="certificate_type" {...form.register("certificate_type")}>
                      <option value="">Select certificate type…</option>
                      {typesQuery.data?.map((t) => (
                        <option key={t.code} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  )}
                  {form.formState.errors.certificate_type && (
                    <p className="mt-1 text-xs text-danger">{form.formState.errors.certificate_type.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="course_name">Course</Label>
                  <Input
                    id="course_name"
                    placeholder={selectedStudent?.course || "e.g. BSc Computer Science"}
                    {...form.register("course_name")}
                  />
                  <p className="mt-1 text-xs text-gray-400">Auto-filled from the selected student; editable.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="certificate_number">Certificate Number</Label>
                  <Input
                    id="certificate_number"
                    placeholder={nextIdsQuery.data?.certificate_number || "Auto-generated"}
                    {...form.register("certificate_number")}
                  />
                </div>
                <div>
                  <Label htmlFor="certificate_id">Certificate ID</Label>
                  <Input
                    id="certificate_id"
                    placeholder={nextIdsQuery.data?.certificate_id || "Auto-generated"}
                    {...form.register("certificate_id")}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input id="issue_date" type="date" {...form.register("issue_date")} />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date (optional)</Label>
                  <Input id="expiry_date" type="date" {...form.register("expiry_date")} />
                  {form.formState.errors.expiry_date && <p className="mt-1 text-xs text-danger">{form.formState.errors.expiry_date.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="file">Certificate PDF (optional — PDF will be generated if omitted)</Label>
                <Input id="file" type="file" accept="application/pdf" {...form.register("file")} />
                <p className="mt-1 text-xs text-gray-400">Max 8 MB. If omitted, a formatted certificate is generated automatically.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="primary">
                  <Hash className="h-4 w-4" aria-hidden="true" /> Preview & Confirm
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Preview / confirm */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Preview</CardTitle>
              <CardDescription>Review before issuing on-chain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {preview ? (
                <>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-gray-500">Student</p>
                    <p className="font-medium text-navy-900">{preview.studentName}</p>
                    <p className="mt-2 text-gray-500">Course</p>
                    <p className="font-medium text-navy-900">{preview.course}</p>
                    <p className="mt-2 text-gray-500">Certificate ID</p>
                    <p className="font-mono text-xs text-navy-900">{preview.certificateId}</p>
                    <p className="mt-2 text-gray-500">Certificate Number</p>
                    <p className="font-mono text-xs text-navy-900">{preview.certificateNumber}</p>
                    <p className="mt-2 text-gray-500">Type</p>
                    <p className="font-medium text-navy-900">
                      {preview.certificateType}
                      {preview.certificateTypeCode ? ` (${preview.certificateTypeCode})` : ""}
                    </p>
                    <p className="mt-2 text-gray-500">Hash</p>
                    <p className="break-all font-mono text-xs">{preview.hash}</p>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-amber-600">
                    <Boxes className="h-4 w-4" aria-hidden="true" /> Blockchain registration will be performed.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setPreview(null)}>Cancel</Button>
                    <Button variant="primary" disabled={mutation.isPending} onClick={() => form.handleSubmit(onConfirm)()}>
                      {mutation.isPending ? "Issuing…" : "Issue Certificate"}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Fill the form to see a preview.</p>
              )}
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {mutation.isPending ? (
                <ol className="space-y-1">
                  {STEPS.map((s, i) => (
                    <StepRow key={s} step={s} state={steps[i] ?? "pending"} isLast={i === STEPS.length - 1} />
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-gray-500">Progress will appear here while issuing.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Deterministic pseudo-hash for preview purposes (the real SHA-256 is computed
// server-side over the exact PDF bytes).
const getPreviewHash = (input: string): string => {
  let h1 = 0xdeadbeef ^ 2;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const bytes = new Uint8Array(32);
  let v = h1 >>> 0;
  for (let i = 0; i < 8; i++) {
    bytes[i] = v & 0xff;
    v >>>= 8;
  }
  v = h2 >>> 0;
  for (let i = 8; i < 16; i++) {
    bytes[i] = v & 0xff;
    v >>>= 8;
  }
  for (let i = 16; i < 32; i++) bytes[i] = bytes[(i * 7) % 16] ^ 0xa5;
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};