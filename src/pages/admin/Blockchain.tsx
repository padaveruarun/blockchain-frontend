import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Layers } from "lucide-react";
import { api } from "@/lib/api";
import type { NetworkStats, BlockchainTransaction, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/CertificatesTable";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, shortHash } from "@/lib/utils";

export default function AdminBlockchain() {
  const [page, setPage] = useState(1);

  const network = useQuery({
    queryKey: ["blockchain-network"],
    queryFn: async () => {
      const res = await api.get<{ data: NetworkStats }>("/api/v1/blockchain/network");
      return res.data.data;
    },
  });

  const txs = useQuery({
    queryKey: ["blockchain-txs", page],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<BlockchainTransaction> }>("/api/v1/blockchain/transactions", {
        params: { page, per_page: 15 },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader title="Blockchain" description="Network status and on-chain transaction history." />

      {network.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : network.isError ? (
        <ErrorState message="Could not connect to the blockchain network." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Network"
            value={network.data!.connected ? "Connected" : "Disconnected"}
            icon={Boxes}
            hint={network.data!.network ?? "—"}
          />
          <StatCard title="Chain ID" value={network.data!.chain_id ?? "—"} icon={Layers} hint="Blockchain network ID" />
          <StatCard title="Latest Block" value={network.data!.latest_block?.toLocaleString() ?? "—"} icon={Layers} />
          <StatCard
            title="Transactions"
            value={network.data!.total_transactions ?? 0}
            icon={Boxes}
            hint={`${network.data!.successful_transactions ?? 0} confirmed · ${network.data!.pending_transactions ?? 0} pending`}
          />
        </div>
      )}

      <div className="mt-8">
        <CardHeader className="px-0">
          <CardTitle className="text-base">On-Chain Transactions</CardTitle>
        </CardHeader>
        {txs.isLoading ? (
          <SkeletonList />
        ) : txs.isError ? (
          <ErrorState message="Could not load transactions." />
        ) : txs.data!.items.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No transactions yet"
            description="Certificate issuance, revocations and registrations will be recorded here."
          />
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confirmed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txs.data!.items.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium text-navy-900">{tx.transaction_type}</TableCell>
                    <TableCell className="font-mono text-xs">{shortHash(tx.transaction_hash, 12, 8)}</TableCell>
                    <TableCell className="font-mono text-xs">{tx.block_number?.toLocaleString() ?? "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell className="text-gray-500">{formatDateTime(tx.confirmed_at ?? tx.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} pages={txs.data!.pages} onPage={setPage} />
          </Card>
        )}
      </div>
    </div>
  );
}