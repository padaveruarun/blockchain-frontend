import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Landmark, Wallet, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, getErrorMessage } from "@/lib/api";
import type { Institution } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatDate, shortHash } from "@/lib/utils";

const schema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  wallet_address: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export default function InstitutionProfile() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const query = useQuery({
    queryKey: ["inst-profile"],
    queryFn: async () => {
      const res = await api.get<{ data: Institution }>("/api/v1/institutions/me");
      return res.data.data;
    },
  });

  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const saveMutation = useMutation({
    mutationFn: async (values: Values) => {
      const res = await api.patch<{ data: Institution }>("/api/v1/institutions/me", values);
      return res.data.data;
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      qc.invalidateQueries({ queryKey: ["inst-profile"] });
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  const walletMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/v1/institutions/me/register-wallet");
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inst-profile"] });
      alert("Your wallet has been registered on the blockchain.");
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  if (query.isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Could not load institution profile." />;
  }

  const inst = query.data;

  return (
    <div>
      <PageHeader title="Institution Profile" description="Manage how your institution appears and its blockchain identity." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-4 w-4 text-navy-800" aria-hidden="true" /> Institution Details
            </CardTitle>
            <CardDescription>Update contact and branding information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <p className="font-semibold text-navy-900">{inst.name}</p>
              <p className="text-sm text-gray-500">{inst.registration_number}</p>
              <p className="text-sm text-gray-500">{inst.email}</p>
            </div>
            <form
              onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1 555 000 1234" defaultValue={inst.phone ?? ""} {...form.register("phone")} />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 University Ave" defaultValue={inst.address ?? ""} {...form.register("address")} />
              </div>
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input id="logo_url" placeholder="https://…/logo.png" defaultValue={inst.logo_url ?? ""} {...form.register("logo_url")} />
                {form.formState.errors.logo_url && (
                  <p className="mt-1 text-xs text-danger">{form.formState.errors.logo_url.message}</p>
                )}
              </div>
              <Button type="submit" variant="primary" disabled={saveMutation.isPending}>
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4 text-navy-800" aria-hidden="true" /> Blockchain Wallet
              </CardTitle>
              <CardDescription>Your wallet signs certificate issuance transactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500">Wallet Address</span>
                <span className="font-mono text-xs text-navy-900">{shortHash(inst.wallet_address, 12, 8)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500">Member Since</span>
                <span>{formatDate(inst.created_at)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500">Status</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-verified">{inst.status}</span>
              </div>
              <Button variant="secondary" className="w-full" onClick={() => walletMutation.mutate()} disabled={walletMutation.isPending}>
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {walletMutation.isPending ? "Registering…" : "Register Wallet On-Chain"}
              </Button>
              <p className="text-xs text-gray-400">
                Registers the institution's wallet identity in the {`CertificateVerification`} smart contract.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}