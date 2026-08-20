import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScanLine, Search, Camera, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyCertificate } from "@/pages/public/VerifyCertificate";
import { VerificationResultDialog } from "@/components/shared/VerificationResultCard";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

const schema = z.object({
  certificate_id: z.string().min(5, "Enter a valid certificate ID"),
});

type FormValues = z.infer<typeof schema>;

export default function VerifyPage() {
  const mutation = useVerifyCertificate();
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const qrRegionId = "qr-reader-region";
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const destroyScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        // already stopped
      }
      try {
        await scanner.clear();
      } catch {
        // element already removed
      }
    }
  };

  const startScanner = async () => {
    setScanError(null);
    setIsScanning(true);
    await destroyScanner();
    const scanner = new Html5Qrcode(qrRegionId);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decoded) => {
          await destroyScanner();
          setIsScanning(false);
          // Certificate QR codes embed the /verify/<id> URL; fall back to the raw value.
          const match = decoded.match(/\/verify\/([^/?#]+)/);
          const certificateId = (match ? match[1] : decoded).trim();
          mutation.mutate({ certificateId, method: "CERTIFICATE_ID" });
        },
        () => undefined,
      );
    } catch (err) {
      await destroyScanner();
      setIsScanning(false);
      setScanError(
        err instanceof Error ? err.message : "Could not access the camera. Enter the certificate ID manually.",
      );
    }
  };

  const stopScanning = async () => {
    setScanError(null);
    await destroyScanner();
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      destroyScanner();
    };
  }, []);

  const onSubmit = (values: FormValues) => {
    mutation.mutate({ certificateId: values.certificate_id, method: "CERTIFICATE_ID" });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">Verify a Certificate</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500 text-sm md:text-base leading-relaxed">
          Scan the certificate's QR code, or type the Certificate ID manually to verify its cryptographic proof on-chain.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* Manual entry */}
        <Card className="p-6 md:p-8 card-hover border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="flex items-center gap-2.5 font-bold text-navy-900 text-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-500">
                <Search className="h-4.5 w-4.5" aria-hidden="true" />
              </span> 
              Enter Certificate ID
            </h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="certificate_id" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Certificate ID</Label>
                <Input
                  id="certificate_id"
                  className="h-11 rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500 placeholder-slate-400 text-sm"
                  placeholder="e.g. CERT-2026-00001"
                  aria-describedby="certificate_id-help"
                  {...form.register("certificate_id")}
                />
                {form.formState.errors.certificate_id && (
                  <p id="certificate_id-help" role="alert" className="mt-1.5 text-xs text-danger font-medium">
                    {form.formState.errors.certificate_id.message}
                  </p>
                )}
              </div>
              <Button type="submit" variant="primary" disabled={mutation.isPending} className="w-full bg-navy-500 hover:bg-navy-700 shadow-md shadow-navy-500/10 h-11 rounded-xl text-sm font-semibold transition-all">
                {mutation.isPending ? "Connecting to ledger…" : "Verify Certificate"}
              </Button>
            </form>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">Sandbox Examples</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link to="/verify/CERT-2026-00001" className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium transition-colors border border-slate-100 hover:border-emerald-100">genuine</Link>
              <Link to="/verify/CERT-2026-00005" className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 font-medium transition-colors border border-slate-100 hover:border-amber-100">revoked</Link>
              <Link to="/verify/CERT-2026-00011" className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-medium transition-colors border border-slate-100 hover:border-rose-100">tampered</Link>
              <Link to="/verify/CERT-NOT-EXIST" className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 font-medium transition-colors border border-slate-100">invalid id</Link>
            </div>
          </div>
        </Card>

        {/* QR scanner */}
        <Card className="p-6 md:p-8 card-hover border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="flex items-center gap-2.5 font-bold text-navy-900 text-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50 text-navy-500">
                <Camera className="h-4.5 w-4.5" aria-hidden="true" />
              </span> 
              Scan QR Code
            </h2>
            
            <div className="relative mt-6 overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[220px]">
              <div id={qrRegionId} className={cn("w-full min-h-[220px] overflow-hidden", !isScanning && "hidden")} />
              
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400 mb-3 border border-slate-700 animate-pulse">
                    <ScanLine className="h-6 w-6" />
                  </div>
                  <p className="text-slate-400 text-xs font-medium">Camera is offline</p>
                  <p className="text-slate-500 text-[10px] mt-1">Press start camera below to scan a certificate QR code</p>
                </div>
              )}

              {isScanning && (
                <>
                  {/* Animated laser line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-scan top-0 pointer-events-none" />
                  {/* Corner targets */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-indigo-400 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-indigo-400 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-indigo-400 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-indigo-400 pointer-events-none" />
                </>
              )}
            </div>

            {scanError && (
              <p role="alert" className="mt-3 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-danger font-medium leading-relaxed">
                {scanError}
              </p>
            )}
          </div>
          
          <div className="mt-6 flex flex-col gap-2">
            {!isScanning ? (
              <Button variant="secondary" className="w-full h-11 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all" onClick={startScanner}>
                <ScanLine className="h-4 w-4 mr-2" aria-hidden="true" /> Start Camera
              </Button>
            ) : (
              <Button variant="danger" className="w-full h-11 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md" onClick={stopScanning}>
                <X className="h-4 w-4 mr-2" aria-hidden="true" /> Stop Camera
              </Button>
            )}
          </div>
        </Card>
      </div>

      <VerificationResultDialog
        loading={mutation.isPending}
        result={mutation.data ?? null}
        error={mutation.isError ? getErrorMessage(mutation.error) : null}
      />
    </div>
  );
}