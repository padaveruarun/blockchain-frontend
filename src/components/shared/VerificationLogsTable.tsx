import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { VerificationLog } from "@/lib/types";

export function VerificationLogsTable({ logs }: { logs: VerificationLog[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Certificate</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Verified At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium text-navy-900">
              {log.certificate_certificate_id ?? "Unknown"}
            </TableCell>
            <TableCell>{log.verification_method}</TableCell>
            <TableCell>
              <StatusBadge status={log.verification_status} />
            </TableCell>
            <TableCell className="text-gray-500">{log.ip_address ?? "—"}</TableCell>
            <TableCell className="text-gray-500">{formatDateTime(log.verified_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}