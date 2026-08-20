import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.new_password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

type Values = z.infer<typeof schema>;

export default function StudentSettings() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setMessage(null);
    try {
      await api.post("/api/v1/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      setMessage({ type: "success", text: "Password updated successfully." });
      form.reset();
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account security." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-navy-800" aria-hidden="true" /> Change Password
          </CardTitle>
          <CardDescription>Use a strong password that you don&apos;t reuse elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <p
              role="alert"
              className={`mb-4 rounded-md p-3 text-sm ${message.type === "success" ? "bg-green-50 text-verified" : "bg-red-50 text-danger"}`}
            >
              {message.text}
            </p>
          )}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" {...form.register("current_password")} />
              {form.formState.errors.current_password && (
                <p className="mt-1 text-xs text-danger">{form.formState.errors.current_password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="new">New Password</Label>
              <Input id="new" type="password" {...form.register("new_password")} />
              {form.formState.errors.new_password && (
                <p className="mt-1 text-xs text-danger">{form.formState.errors.new_password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" type="password" {...form.register("confirm")} />
              {form.formState.errors.confirm && (
                <p className="mt-1 text-xs text-danger">{form.formState.errors.confirm.message}</p>
              )}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}