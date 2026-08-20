import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ShieldCheck, Building2, GraduationCap, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Course, Institution, User } from "@/lib/types";

const studentSchema = z.object({
  email: z.string().email("Enter a valid email"),
  full_name: z.string().min(2, "Enter your full name"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
  confirm_password: z.string().min(8, "Re-enter your password"),
  institution_id: z.string().min(1, "Select your institution"),
  course_id: z.string().min(1, "Select your course"),
  student_id: z.string().min(2, "Enter the student ID issued by your institution"),
  batch: z.string().optional(),
  graduation_year: z
    .preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(1950).max(2100).optional()),
});

const institutionSchema = studentSchema.omit({
  institution_id: true,
  course_id: true,
  student_id: true,
  full_name: true,
  confirm_password: true,
  batch: true,
  graduation_year: true,
}).extend({
  name: z.string().min(2, "Enter the institution name"),
  registration_number: z.string().min(3, "Enter the registration number"),
  wallet_address: z.string().optional(),
});

type StudentValues = z.infer<typeof studentSchema>;
type InstitutionValues = z.infer<typeof institutionSchema>;

function portalRoute(role: string): string {
  return role === "INSTITUTION" ? "/institution" : "/student";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState<"student" | "institution">("student");
  const [error, setError] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [pendingInfo, setPendingInfo] = useState<{ name: string; institution: string } | null>(null);

  const studentForm = useForm<StudentValues>({
    resolver: zodResolver(studentSchema),
    mode: "onBlur",
  });
  const institutionForm = useForm<InstitutionValues>({ resolver: zodResolver(institutionSchema) });

  const institutionsQuery = useQuery({
    queryKey: ["enrollment-institutions"],
    queryFn: async () => {
      const res = await api.get<{ data: { items: Institution[] } }>("/api/v1/institutions/enrollment");
      return res.data.data.items;
    },
  });

  const coursesQuery = useQuery({
    queryKey: ["enrollment-courses", selectedInstitution],
    queryFn: async () => {
      if (!selectedInstitution) return [];
      const res = await api.get<{ data: { items: Course[] } }>(
        `/api/v1/institutions/${selectedInstitution}/courses`,
      );
      return res.data.data.items;
    },
    enabled: !!selectedInstitution,
  });

  const afterRegister = async (email: string, password: string, role: string) => {
    await login(email, password);
    const res = await api.get<{ data: User }>("/api/v1/auth/me");
    navigate(portalRoute(res.data.data.role ?? role));
  };

  const onSubmitStudent = async (values: StudentValues) => {
    setError(null);
    try {
      await api.post("/api/v1/auth/register/student", {
        email: values.email,
        password: values.password,
        confirm_password: values.confirm_password,
        full_name: values.full_name,
        institution_id: values.institution_id,
        student_id: values.student_id,
        course_id: values.course_id,
        batch: values.batch || undefined,
        graduation_year: values.graduation_year,
      });
      const institution = (institutionsQuery.data ?? []).find((i) => i.id === values.institution_id);
      setPendingInfo({ name: values.full_name, institution: institution?.name ?? "your institution" });
      studentForm.reset();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const onSubmitInstitution = async (values: InstitutionValues) => {
    setError(null);
    try {
      await api.post("/api/v1/auth/register/institution", {
        email: values.email,
        password: values.password,
        name: values.name,
        registration_number: values.registration_number,
        wallet_address: values.wallet_address,
      });
      await afterRegister(values.email, values.password, "INSTITUTION");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const formError = (tab === "student" ? studentForm : institutionForm).formState.errors as Record<string, { message?: string }>;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 animate-in fade-in duration-300">
      <Card className="p-8 md:p-10 border-slate-150 shadow-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-navy-800 to-navy-500 shadow-md shadow-navy-500/10">
            <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-navy-900">Create account</h1>
          <p className="mt-1.5 text-xs text-slate-400 font-medium">Join the cryptographic academic network</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "student" | "institution")}>
          <TabsList className="w-full bg-slate-100 p-1.5 rounded-xl border border-slate-100">
            <TabsTrigger value="student" className="w-1/2 py-2 rounded-lg text-xs font-semibold transition-all">
              <GraduationCap className="mr-1.5 h-4 w-4" aria-hidden="true" /> Student Portal
            </TabsTrigger>
            <TabsTrigger value="institution" className="w-1/2 py-2 rounded-lg text-xs font-semibold transition-all">
              <Building2 className="mr-1.5 h-4 w-4" aria-hidden="true" /> Institution
            </TabsTrigger>
          </TabsList>

          {error && (
            <p role="alert" className="mb-4 mt-6 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-danger font-medium leading-relaxed">
              {error}
            </p>
          )}

          <TabsContent value="student" className="mt-6 outline-none">
            {pendingInfo ? (
              <div className="py-8 text-center space-y-4">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100 shadow-sm animate-pulse">
                  <Clock3 className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-bold text-navy-900">Registration Under Review</h2>
                <div className="space-y-2 max-w-sm mx-auto text-xs text-slate-500 leading-relaxed">
                  <p>
                    Thank you, <span className="font-semibold text-slate-700">{pendingInfo.name}</span>. Your registration for <span className="font-semibold text-slate-700">{pendingInfo.institution}</span> has been logged.
                  </p>
                  <p>
                    The institution registrar will verify your academic enrollment records. You will receive an approval alert enabling portal access.
                  </p>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="rounded-xl border-slate-200" asChild>
                    <a href="/login">Return to Sign In</a>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={studentForm.handleSubmit(onSubmitStudent)} className="space-y-5">
                <div className="space-y-1">
                  <Label htmlFor="s-name" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</Label>
                  <Input id="s-name" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="Jane Student" {...studentForm.register("full_name")} />
                  {formError.full_name && <p className="mt-1 text-xs text-danger font-medium">{formError.full_name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</Label>
                  <Input id="s-email" type="email" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="jane@example.com" {...studentForm.register("email")} />
                  {formError.email && <p className="mt-1 text-xs text-danger font-medium">{formError.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-institution" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Institution</Label>
                  <Select
                    id="s-institution"
                    className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm bg-white"
                    {...studentForm.register("institution_id", {
                      onChange: (e) => setSelectedInstitution(e.target.value),
                    })}
                    disabled={institutionsQuery.isLoading}
                  >
                    <option value="">{institutionsQuery.isLoading ? "Loading registrars…" : "Choose your institution"}</option>
                    {(institutionsQuery.data ?? []).map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </Select>
                  {formError.institution_id && <p className="mt-1 text-xs text-danger font-medium">{formError.institution_id.message}</p>}
                  {institutionsQuery.isError && (
                    <p className="mt-1 text-xs text-danger font-medium">Could not fetch institution registry list.</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-course" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Select Course</Label>
                  <Select id="s-course" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm bg-white" {...studentForm.register("course_id")} disabled={!selectedInstitution || coursesQuery.isLoading}>
                    <option value="">
                      {!selectedInstitution
                        ? "Choose institution first"
                        : coursesQuery.isLoading
                          ? "Loading programs…"
                          : (coursesQuery.data ?? []).length === 0
                            ? "No academic programs found"
                            : "Choose your course"}
                    </option>
                    {(coursesQuery.data ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.code ? `(${c.code})` : ""}
                      </option>
                    ))}
                  </Select>
                  {formError.course_id && <p className="mt-1 text-xs text-danger font-medium">{formError.course_id.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-student-id" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Student ID / Matric Number</Label>
                  <Input id="s-student-id" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="Issued by institution, e.g. ITU2026001" {...studentForm.register("student_id")} />
                  {formError.student_id && <p className="mt-1 text-xs text-danger font-medium">{formError.student_id.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="s-batch" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Batch Year</Label>
                    <Input id="s-batch" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="e.g. 2026" {...studentForm.register("batch")} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="s-year" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Graduation</Label>
                    <Select id="s-year" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm bg-white" {...studentForm.register("graduation_year")}>
                      <option value="">—</option>
                      {Array.from({ length: 11 }, (_, i) => 2020 + i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portal Password</Label>
                  <Input id="s-password" type="password" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="At least 8 chars (letters + numbers)" {...studentForm.register("password")} />
                  {formError.password && <p className="mt-1 text-xs text-danger font-medium">{formError.password.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s-confirm-password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm Password</Label>
                  <Input id="s-confirm-password" type="password" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="Re-enter password" {...studentForm.register("confirm_password")} />
                  {formError.confirm_password && <p className="mt-1 text-xs text-danger font-medium">{formError.confirm_password.message}</p>}
                </div>
                <Button type="submit" className="w-full bg-navy-500 hover:bg-navy-700 shadow-md shadow-navy-500/10 h-11 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] mt-2" disabled={studentForm.formState.isSubmitting}>
                  Create Student Account
                </Button>
                <p className="text-[10px] text-center text-slate-400 font-medium">
                  Enrollment requires registrar confirmation before credentials can be issued.
                </p>
              </form>
            )}
          </TabsContent>

          <TabsContent value="institution" className="mt-6 outline-none">
            <form onSubmit={institutionForm.handleSubmit(onSubmitInstitution)} className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="i-name" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Institution Name</Label>
                <Input id="i-name" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="Example University" {...institutionForm.register("name")} />
                {formError.name && <p className="mt-1 text-xs text-danger font-medium">{formError.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="i-reg" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registration Serial</Label>
                <Input id="i-reg" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="REG-2026-001" {...institutionForm.register("registration_number")} />
                {formError.registration_number && <p className="mt-1 text-xs text-danger font-medium">{formError.registration_number.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="i-email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Official Contact Email</Label>
                <Input id="i-email" type="email" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="registrar@example.edu" {...institutionForm.register("email")} />
                {formError.email && <p className="mt-1 text-xs text-danger font-medium">{formError.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="i-password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Password</Label>
                <Input id="i-password" type="password" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm" placeholder="At least 8 characters" {...institutionForm.register("password")} />
                {formError.password && <p className="mt-1 text-xs text-danger font-medium">{formError.password.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="i-wallet" className="text-xs font-semibold uppercase tracking-wider text-slate-400">On-Chain Wallet Address (optional)</Label>
                <Input id="i-wallet" className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 text-sm font-mono" placeholder="0x…" {...institutionForm.register("wallet_address")} />
              </div>
              <Button type="submit" className="w-full bg-navy-500 hover:bg-navy-700 shadow-md shadow-navy-500/10 h-11 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] mt-2">
                Apply for Institution Account
              </Button>
              <p className="text-[10px] text-center text-slate-400 font-medium">
                Registrar credentials will be vetted by the network admin before issuing is activated.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
