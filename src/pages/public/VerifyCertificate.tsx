import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { api, getErrorMessage } from "@/lib/api";
import type { VerificationResult } from "@/lib/types";
import { VerificationResultDialog } from "@/components/shared/VerificationResultCard";

export const QUERY_KEYS = {
  verify: (id: string) => ["verify", id] as const,
};

export function useVerifyCertificate() {
  return useMutation<VerificationResult, Error, { certificateId: string; method: string }>({
    mutationFn: async ({ certificateId, method }) => {
      const res = await api.post<{ data: VerificationResult }>("/api/v1/verification", {
        certificate_id: certificateId,
        method,
      });
      return res.data.data;
    },
  });
}

export default function VerifyCertificatePage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const mutation = useVerifyCertificate();
  const errorMessage = mutation.isError ? getErrorMessage(mutation.error) : null;

  useEffect(() => {
    if (certificateId) {
      mutation.mutate({ certificateId, method: "CERTIFICATE_ID" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificateId]);

  return (
    <VerificationResultDialog loading={mutation.isPending} result={mutation.data ?? null} error={errorMessage} />
  );
}