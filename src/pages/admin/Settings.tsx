import { useMutation } from "@tanstack/react-query";
import { Settings as SettingsIcon, LogOut } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const schema = z
  .object({
    current_password: z.string().min(6, "Current password required"),
    new_password: z.string().min(8, "At least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type Values = z.infer<typeof schema>;

export default function AdminSettings() {
  const { logout } = useAuth();
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const changePassword = useMutation({
    mutationFn: async (values: Values) => {
      const res = await api.post("/api/v1/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      return res.data;
    },
    onSuccess: () => {
      form.reset();
      alert("Password updated successfully.");
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Account and security preferences."
        actions={
          <ConfirmDialog
            title="Sign out?"
            description="You will need to log in again to continue."
            confirmText="Sign Out"
            onConfirm={() => logout()}
            trigger={
              <Button variant="secondary" size="sm">
                <LogOut className="h-4 w-4" aria-hidden="true" /> Sign Out
              </Button>
            }
          />
        }
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4 text-navy-800" aria-hidden="true" /> Change Password
          </CardTitle>
          <CardDescription>Use a strong, unique password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit((v) => changePassword.mutate(v))} className="space-y-4">
            <div>
              <Label htmlFor="current_password">Current Password</Label>
              <Input id="current_password" type="password" {...form.register("current_password")} />
            </div>
            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input id="new_password" type="password" {...form.register("new_password")} />
              {form.formState.errors.new_password && (
                <p className="mt-1 text-xs text-danger">{form.formState.errors.new_password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input id="confirm_password" type="password" {...form.register("confirm_password")} />
              {form.formState.errors.confirm_password && (
                <p className="mt-1 text-xs text-danger">{form.formState.errors.confirm_password.message}</p>
              )}
            </div>
            <Button type="submit" variant="primary" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Saving…" : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}