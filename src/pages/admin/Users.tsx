import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserRound, Shield, Lock } from "lucide-react";
import { api } from "@/lib/api";
import type { User, Role, PageResponse } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/CertificatesTable";
import { EmptyState, ErrorState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string>("");

  const query = useQuery({
    queryKey: ["admin-users", page, role],
    queryFn: async () => {
      const res = await api.get<{ data: PageResponse<User> }>("/api/v1/admin/users", {
        params: { page, per_page: 15, role: role || undefined },
      });
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader title="Users" description="All registered users across the platform." />

      <div className="mb-4">
        <Select
          aria-label="Filter by role"
          className="w-48"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="INSTITUTION">Institution</option>
          <option value="STUDENT">Student</option>
          <option value="VERIFIER">Verifier</option>
        </Select>
      </div>

      {query.isLoading ? (
        <SkeletonList />
      ) : query.isError ? (
        <ErrorState message="Could not load users." />
      ) : query.data!.items.length === 0 ? (
        <EmptyState icon={UserRound} title="No users" description="Registered users will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data!.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-navy-900">
                      {u.role === "ADMIN" ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                          <Shield className="h-4 w-4 text-red-500" aria-hidden="true" />
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-50">
                          <UserRound className="h-4 w-4 text-navy-800" aria-hidden="true" />
                        </span>
                      )}
                      {u.full_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{u.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={u.role as Role} />
                  </TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-gray-500">{formatDate(u.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} pages={query.data!.pages} onPage={setPage} />
        </Card>
      )}
    </div>
  );
}