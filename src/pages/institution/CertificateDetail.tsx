import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api, getErrorMessage } from "@/lib/api";
import { CertificateDetailView } from "@/components/shared/CertificateDetailView";
import type { Certificate } from "@/lib/types";

export default function InstitutionCertificateDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const revokeMutation = useMutation({
    mutationFn: async (cert: Certificate) => {
      const res = await api.post(`/api/v1/certificates/${cert.id}/revoke`, {
        reason: "Revoked by institution",
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate"] });
      qc.invalidateQueries({ queryKey: ["inst-certs"] });
      qc.invalidateQueries({ queryKey: ["inst-stats"] });
      qc.invalidateQueries({ queryKey: ["inst-charts"] });
    },
    onError: (err) => alert(getErrorMessage(err)),
  });

  return (
    <CertificateDetailView
      fetchUrl={`/api/v1/certificates/${id}`}
      backHref="/institution/certificates"
      onRevoke={(cert) => revokeMutation.mutate(cert)}
    />
  );
}