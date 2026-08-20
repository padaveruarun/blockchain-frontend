import { Link } from "react-router-dom";
import { TriangleAlert, FileText, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

export function CertificatesTable({
  certificates,
  basePath,
  onRevoke,
  showRevoke = false,
}: {
  certificates: Certificate[];
  basePath: string;
  onRevoke?: (cert: Certificate) => void;
  showRevoke?: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Certificate</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {certificates.map((cert) => (
          <TableRow key={cert.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                <span className="font-medium text-navy-900">{cert.certificate_id}</span>
              </div>
              <p className="text-xs text-gray-500">{cert.certificate_type}</p>
            </TableCell>
            <TableCell>{cert.student_full_name ?? "—"}</TableCell>
            <TableCell>{cert.course_name}</TableCell>
            <TableCell>{formatDate(cert.issue_date)}</TableCell>
            <TableCell>
              <StatusBadge status={cert.status} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button asChild variant="ghost" size="icon" aria-label={`View ${cert.certificate_id}`}>
                  <Link to={`${basePath}/${cert.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {showRevoke && onRevoke && cert.status === "ACTIVE" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Revoke ${cert.certificate_id}`}
                    className="text-danger hover:bg-red-50"
                    onClick={() => onRevoke(cert)}
                  >
                    <TriangleAlert className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm" aria-label="Pagination">
      <p className="text-gray-500">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
}