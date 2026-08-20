import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Download,
  QrCode,
  Share2,
  Lock,
  ExternalLink,
  FileText,
  ArrowLeft,
  TriangleAlert,
} from "lucide-react";
import { api, API_URL, getErrorMessage } from "@/lib/api";
import type { Certificate, BlockchainProof, VerificationLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { QRCodeDialog } from "@/components/shared/QRCodeDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDateTime, shortHash } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}

export function CertificateDetailView({
  fetchUrl,
  backHref,
  onRevoke,
}: {
  fetchUrl: string;
  backHref: string;
  onRevoke?: (cert: Certificate) => void;
}) {
  const qc = useQueryClient();
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const query = useQuery({
    queryKey: ["certificate", fetchUrl],
    queryFn: async () => {
      const res = await api.get<{ data: Certificate }>(fetchUrl);
      return res.data.data;
    },
  });

  const proofQuery = useQuery({
    queryKey: ["cert-proof", fetchUrl],
    queryFn: async () => {
      const certData = query.data;
      if (!certData?.blockchain_certificate_id) return null;
      const res = await api.get<{ data: BlockchainProof }>(`/api/v1/blockchain/certificates/${certData.certificate_id}/onchain`);
      return res.data.data;
    },
    enabled: Boolean(query.data?.blockchain_certificate_id ?? false),
  });

  const versionsQuery = useQuery({
    queryKey: ["cert-versions", query.data?.id],
    queryFn: async () => {
      const res = await api.get<{ data: { items: Record<string, unknown>[] } }>(`/api/v1/certificates/${query.data!.id}/versions`);
      return res.data.data.items;
    },
    enabled: Boolean(query.data?.id),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Card className="p-10 text-center text-gray-600">
        {query.isError ? getErrorMessage(query.error) : "Certificate not found."}
      </Card>
    );
  }

  const cert = query.data;

  const download = () => {
    window.open(`${API_URL}/api/v1/certificates/${cert.id}/download`, "_blank");
  };

  const share = async () => {
    const url = cert.verify_url ?? `${window.location.origin}/verify/${cert.certificate_id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={cert.certificate_id}
        description={cert.course_name}
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link to={backHref}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Certificate info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{cert.course_name}</CardTitle>
                <CardDescription>{cert.certificate_type}</CardDescription>
              </div>
              <StatusBadge status={cert.status} />
            </div>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Student" value={cert.student_full_name} />
              <DetailRow label="Institution" value={cert.institution_name} />
              <DetailRow label="Certificate Number" value={cert.certificate_number} />
              <DetailRow label="Issue Date" value={formatDate(cert.issue_date)} />
              <DetailRow label="Expiry Date" value={formatDate(cert.expiry_date)} />
              <DetailRow label="Certificate ID" value={cert.certificate_id} />
              <DetailRow label="Verification Count" value={cert.verification_count ?? 0} />
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={download}>
                <Download className="h-4 w-4" aria-hidden="true" /> Download PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={share}>
                {copied ? "Link Copied!" : <Share2 className="h-4 w-4" aria-hidden="true" />} Share
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setQrOpen(true)}>
                <QrCode className="h-4 w-4" aria-hidden="true" /> Generate QR
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={cert.verify_url ?? `/verify/${cert.certificate_id}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" /> Public Verify
                </a>
              </Button>
              {onRevoke && cert.status === "ACTIVE" && (
                <ConfirmDialog
                  title={`Revoke ${cert.certificate_id}?`}
                  description="Revoking writes the new status to the blockchain. The certificate can never be un-revoked."
                  confirmText="Revoke"
                  onConfirm={() => onRevoke(cert)}
                  trigger={
                    <Button variant="danger" size="sm">
                      <TriangleAlert className="h-4 w-4" aria-hidden="true" /> Revoke
                    </Button>
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Blockchain proof */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-navy-800" aria-hidden="true" /> Blockchain Proof
            </CardTitle>
            <CardDescription>Immutable on-chain record for this certificate</CardDescription>
          </CardHeader>
          <CardContent>
            {proofQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : proofQuery.data ? (
              <dl className="space-y-1">
                <DetailRow label="Transaction Hash" value={shortHash(cert.blockchain_transaction_hash, 10, 6)} />
                <DetailRow label="Block Number" value={cert.blockchain_block_number?.toLocaleString() ?? "—"} />
                <DetailRow label="On-Chain ID" value={proofQuery.data.blockchain_certificate_id ?? "—"} />
                <DetailRow
                  label="Issuer"
                  value={shortHash(proofQuery.data.issuer_wallet ?? cert.issuer_wallet_address, 8, 6)}
                />
                <DetailRow
                  label="Certificate Hash"
                  value={<span title={cert.certificate_hash ?? undefined}>{shortHash(cert.certificate_hash, 12, 6)}</span>}
                />
                <DetailRow
                  label="Chain"
                  value={proofQuery.data.chain_id ? `Chain #${proofQuery.data.chain_id}` : "—"}
                />
              </dl>
            ) : (
              <p className="text-sm text-gray-500">No on-chain record available for this certificate.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Versions */}
      {versionsQuery.data && versionsQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Certificate History</CardTitle>
            <CardDescription>Every version is preserved — nothing is overwritten.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-100 text-sm">
              {versionsQuery.data.map((v, i) => (
                <li key={String(v.id)} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Version {String(v.version_number)}</p>
                    <p className="text-xs text-gray-500">{String(v.reason ?? "—")}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDateTime(String(v.created_at))}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <QRCodeDialog open={qrOpen} onOpenChange={setQrOpen} url={cert.verify_url ?? null} />
    </div>
  );
}