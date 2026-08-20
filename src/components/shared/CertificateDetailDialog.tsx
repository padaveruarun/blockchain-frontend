import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate, shortHash } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}

export function CertificateDetailDialog({
  open,
  onOpenChange,
  certificate,
  verificationDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: Certificate | null | undefined;
  verificationDate?: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>Certificate Details</DialogTitle>
          <DialogDescription>
            Full record for this certificate as issued by the institution.
          </DialogDescription>
        </DialogHeader>

        {!certificate ? (
          <p className="py-6 text-center text-sm text-gray-500">No certificate record to display.</p>
        ) : (
          <div className="space-y-4">
            <dl>
              <Row
                label="Recipient Name"
                value={
                  <span className="inline-flex items-center gap-2">
                    {certificate.student_full_name ?? "—"}
                    {certificate.status === "ACTIVE" && <StatusBadge status="ACTIVE" />}
                  </span>
                }
              />
              <Row label="Issuing Institution" value={certificate.institution_name} />
              <Row label="Course of Study" value={certificate.course_name} />
              <Row label="Certificate Type" value={certificate.certificate_type} />
              <Row label="Certificate ID" value={<span className="font-mono text-xs">{certificate.certificate_id}</span>} />
              <Row label="Registry Serial" value={<span className="font-mono text-xs">{certificate.certificate_number}</span>} />
              <Row label="Date of Issuance" value={formatDate(certificate.issue_date)} />
              <Row label="Expiry Date" value={formatDate(certificate.expiry_date)} />
              <Row label="Status" value={<StatusBadge status={certificate.status} />} />
            </dl>

            {certificate.status === "ACTIVE" && certificate.blockchain_transaction_hash && (
              <>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-600">Blockchain Anchoring</h4>
                <dl>
                  <Row
                    label="Transaction Hash"
                    value={
                      <span className="font-mono text-xs" title={certificate.blockchain_transaction_hash}>
                        {shortHash(certificate.blockchain_transaction_hash, 12, 8)}
                      </span>
                    }
                  />
                  <Row label="Block Number" value={certificate.blockchain_block_number?.toLocaleString() ?? "—"} />
                  <Row label="On-Chain ID" value={certificate.blockchain_certificate_id ?? "—"} />
                </dl>
              </>
            )}

            {verificationDate && (
              <p className="text-right text-xs text-gray-400">
                Verified at {new Date(verificationDate).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}