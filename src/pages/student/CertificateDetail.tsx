import { useParams } from "react-router-dom";
import { CertificateDetailView } from "@/components/shared/CertificateDetailView";

export default function StudentCertificateDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <CertificateDetailView
      fetchUrl={`/api/v1/student/certificates/${id}`}
      backHref="/student/certificates"
    />
  );
}