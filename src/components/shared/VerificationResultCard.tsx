import { useEffect, useState } from "react";
import {
  BadgeCheck,
  XCircle,
  TriangleAlert,
  CalendarX2,
  Lock,
  ExternalLink,
  ScanLine,
  Copy,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime, shortHash } from "@/lib/utils";
import type { VerificationResult } from "@/lib/types";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 inline-flex items-center justify-center p-1 rounded-md border border-slate-200 bg-white text-slate-400 hover:text-navy-500 hover:bg-slate-50 transition-all hover:scale-105"
      title="Copy to clipboard"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function Summary({ result }: { result: VerificationResult }) {
  const config: Record<string, { color: string; border: string; icon: typeof BadgeCheck; title: string }> = {
    VALID: { color: "bg-emerald-50/50 text-emerald-800", border: "border-emerald-100", icon: BadgeCheck, title: "Certificate Verified" },
    INVALID: { color: "bg-rose-50/50 text-rose-800", border: "border-rose-100", icon: XCircle, title: "Certificate Not Found" },
    TAMPERED: { color: "bg-rose-50/50 text-rose-800", border: "border-rose-100", icon: TriangleAlert, title: "Certificate Modified" },
    REVOKED: { color: "bg-amber-50/50 text-amber-800", border: "border-amber-100", icon: CalendarX2, title: "Certificate Revoked" },
    EXPIRED: { color: "bg-amber-50/50 text-amber-800", border: "border-amber-100", icon: CalendarX2, title: "Certificate Expired" },
  };
  const c = config[result.status] ?? config.INVALID;
  const Icon = c.icon;

  return (
    <div className={`flex flex-col items-center rounded-2xl border ${c.border} p-8 text-center ${c.color}`}>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-lg font-bold tracking-tight">{c.title}</h1>
      <p className="mt-2 max-w-md text-xs leading-relaxed opacity-90">{result.message}</p>
      <div className="mt-4">
        <StatusBadge status={result.status} className="px-3 py-1 font-semibold" />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3.5 text-xs last:border-0">
      <dt className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] self-center">{label}</dt>
      <dd className="max-w-[70%] truncate text-right font-medium text-slate-800 flex items-center justify-end">{value ?? "—"}</dd>
    </div>
  );
}

export function VerificationResultDialog({
  loading,
  result,
  error,
}: {
  loading: boolean;
  result: VerificationResult | null;
  error?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const hasActivity = loading || Boolean(result);

  // Show the result exclusively in the modal; it pops as soon as loading starts
  // or a certificate result arrives (no inline rendering, no navigation).
  useEffect(() => {
    if (hasActivity) setOpen(true);
  }, [hasActivity]);

  if (!open) return null;

  const cert = result?.certificate;
  const proof = result?.blockchain_proof;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Certificate Verification</DialogTitle>
          <DialogDescription>
            {loading
              ? "Checking the certificate against the blockchain ledger…"
              : result
                ? result.message
                : error ?? "Unable to complete verification."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4" aria-busy="true">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        ) : result ? (
          <div className="space-y-4">
            <Summary result={result} />

            {cert && (
              <Card className="overflow-hidden border-slate-100 shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Certificate Specifications
                </div>
                <dl className="p-4 space-y-1">
                  <DetailRow label="Recipient Name" value={cert.student_full_name} />
                  <DetailRow
                    label="Certificate ID"
                    value={
                      <span className="font-mono text-xs flex items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {cert.certificate_id}
                        <CopyButton text={cert.certificate_id} />
                      </span>
                    }
                  />
                  <DetailRow label="Course of Study" value={cert.course_name} />
                  <DetailRow label="Issuing Institution" value={cert.institution_name} />
                  <DetailRow label="Date of Issuance" value={formatDate(cert.issue_date)} />
                  <DetailRow label="Registry Serial" value={cert.certificate_number} />
                  <DetailRow label="Current Status" value={<StatusBadge status={cert.status} />} />
                </dl>
              </Card>
            )}

            {proof && result.status === "VALID" && (
              <Card className="overflow-hidden border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-900">
                  <Lock className="h-4 w-4 text-indigo-600" aria-hidden="true" /> On-Chain Blockchain Proof
                </div>
                <dl className="p-4 space-y-1">
                  <DetailRow
                    label="Transaction Anchor"
                    value={
                      <span className="font-mono text-xs flex items-center bg-indigo-50/30 px-2 py-1 rounded-md border border-indigo-50/50">
                        <span title={proof.transaction_hash ?? undefined}>{shortHash(proof.transaction_hash, 10, 6)}</span>
                        {proof.transaction_hash && <CopyButton text={proof.transaction_hash} />}
                      </span>
                    }
                  />
                  <DetailRow label="Anchored Block" value={proof.block_number ?? "—"} />
                  <DetailRow
                    label="Issuer Wallet Key"
                    value={
                      <span className="font-mono text-xs flex items-center bg-indigo-50/30 px-2 py-1 rounded-md border border-indigo-50/50">
                        <span title={proof.issuer_wallet ?? undefined}>{shortHash(proof.issuer_wallet, 8, 6)}</span>
                        {proof.issuer_wallet && <CopyButton text={proof.issuer_wallet} />}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Cryptographic Fingerprint"
                    value={
                      <span className="font-mono text-xs flex items-center bg-indigo-50/30 px-2 py-1 rounded-md border border-indigo-50/50">
                        <span title={proof.certificate_hash ?? undefined}>{shortHash(proof.certificate_hash, 10, 6)}</span>
                        {proof.certificate_hash && <CopyButton text={proof.certificate_hash} />}
                      </span>
                    }
                  />
                  <DetailRow label="Verification Date" value={formatDateTime(result.verified_at)} />
                </dl>
              </Card>
            )}

            {result.status !== "VALID" && (
              <Card className="p-6 border-slate-100 bg-slate-50/50">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <TriangleAlert className="h-4 w-4 text-amber-500" aria-hidden="true" /> Possible Discrepancy Reasons
                </h3>
                <ul className="mt-3 list-inside list-disc space-y-1.5 text-xs text-slate-500 leading-relaxed">
                  {result.status === "INVALID" && <li>The target certificate ID was not found in the decentralized registry.</li>}
                  {result.status === "TAMPERED" && <li>The cryptographic hash of the digital file has changed since issuance (unauthorized editing).</li>}
                  {result.status === "REVOKED" && <li>The credential was explicitly revoked by the registrar (e.g. academic status change).</li>}
                  {result.status === "EXPIRED" && <li>The certificate has exceeded its formal valid duration.</li>}
                  <li>Please contact the registrar of the issuing institution to query these matching records.</li>
                </ul>
              </Card>
            )}

            {cert?.institution_id && (
              <div className="flex justify-center">
                <Button
                  asChild
                  variant="secondary"
                  className="hover:bg-slate-50 border-slate-200 rounded-xl px-5 h-10 text-xs font-semibold"
                >
                  <a href={`mailto:?subject=Certificate ${cert.certificate_id} Verification Query&body=Hello,%0D%0A%0D%0AI searched for the certificate ID ${cert.certificate_id} on CertiChain and received status: ${result.status}.%0D%0A%0D%0APlease assist with verifying this document.`}>
                    Contact Issuing Institution
                  </a>
                </Button>
              </div>
            )}

            <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <ScanLine className="h-3 w-3" aria-hidden="true" />
              Secured by CertiChain Ledger Cryptography
              <ExternalLink className="h-3 w-3 ml-0.5" aria-hidden="true" />
            </p>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-sm font-medium text-slate-500">{error ?? "No verification could be completed."}</p>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}