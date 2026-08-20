export type Role = "ADMIN" | "INSTITUTION" | "STUDENT" | "VERIFIER";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  status: string;
  created_at?: string | null;
  institution_id?: string | null;
  institution_status?: string | null;
  institution_wallet?: string | null;
  student_id?: string | null;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface Institution {
  id: string;
  user_id?: string | null;
  name: string;
  registration_number: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  logo_url?: string | null;
  wallet_address?: string | null;
  status: string;
  created_at?: string | null;
}

export interface Course {
  id: string;
  institution_id: string;
  name: string;
  code?: string | null;
  status: string;
  created_at?: string | null;
}

export interface Student {
  id: string;
  user_id?: string | null;
  institution_id: string;
  institution_name?: string | null;
  student_registration_number: string;
  full_name: string;
  email?: string | null;
  date_of_birth?: string | null;
  course?: string | null;
  course_id?: string | null;
  department?: string | null;
  graduation_year?: number | null;
  batch?: string | null;
  verification_status?: string | null;
  verified_at?: string | null;
  created_at?: string | null;
}

export type CertificateStatus = "DRAFT" | "ISSUED" | "ACTIVE" | "REVOKED" | "EXPIRED";

export interface Certificate {
  id: string;
  certificate_id: string;
  student_id: string;
  institution_id: string;
  certificate_type: string;
  course_name: string;
  certificate_number: string;
  issue_date?: string | null;
  expiry_date?: string | null;
  status: CertificateStatus;
  certificate_file_url?: string | null;
  certificate_hash?: string | null;
  blockchain_transaction_hash?: string | null;
  blockchain_block_number?: number | null;
  blockchain_certificate_id?: number | null;
  issuer_wallet_address?: string | null;
  created_at?: string | null;
  student_full_name?: string | null;
  student_registration_number?: string | null;
  institution_name?: string | null;
  verification_count?: number;
  verify_url?: string | null;
}

export type VerificationStatusType = "VALID" | "INVALID" | "TAMPERED" | "REVOKED" | "EXPIRED";
export type VerificationMethodType = "QR" | "CERTIFICATE_ID";

export interface BlockchainProof {
  certificate_id?: number | string;
  certificate_hash?: string | null;
  issuer_wallet?: string | null;
  transaction_hash?: string | null;
  block_number?: number | null;
  blockchain_certificate_id?: number | null;
  contract_address?: string | null;
  chain_id?: number | null;
  exists_on_chain?: boolean;
}

export interface VerificationResult {
  status: VerificationStatusType;
  verification_method: VerificationMethodType;
  message: string;
  certificate?: Certificate | null;
  blockchain_proof?: BlockchainProof | null;
  verified_at?: string | null;
}

export interface VerificationLog {
  id: string;
  certificate_id?: string | null;
  certificate_certificate_id?: string | null;
  verification_method: VerificationMethodType;
  verification_status: VerificationStatusType;
  ip_address?: string | null;
  user_agent?: string | null;
  verified_at?: string | null;
}

export interface BlockchainTransaction {
  id: string;
  certificate_id?: string | null;
  certificate_certificate_id?: string | null;
  transaction_hash?: string | null;
  block_number?: number | null;
  contract_address?: string | null;
  wallet_address?: string | null;
  transaction_type: string;
  status: string;
  error?: string | null;
  created_at?: string | null;
  confirmed_at?: string | null;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_value?: unknown;
  new_value?: unknown;
  created_at?: string | null;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface AdminStats {
  total_institutions: number;
  pending_institutions: number;
  total_students: number;
  total_certificates: number;
  active_certificates: number;
  revoked_certificates: number;
  expired_certificates: number;
  draft_certificates: number;
  total_verifications: number;
  valid_verifications: number;
  failed_verifications: number;
  total_users: number;
}

export interface PendingVerification {
  id: string;
  full_name: string;
  student_registration_number: string;
  email?: string | null;
  course?: string | null;
  created_at?: string | null;
}

export interface InstitutionStats {
  total_students: number;
  pending_students: number;
  verified_students: number;
  rejected_students: number;
  suspended_students: number;
  pending_verifications: PendingVerification[];
  certificates_issued: number;
  pending_certificates: number;
  revoked_certificates: number;
  verification_requests: number;
  valid_verifications: number;
  expired_certificates: number;
}

export interface StudentStats {
  total_certificates: number;
  verified_certificates: number;
  pending_certificates: number;
  total_verifications: number;
}

export interface NetworkStats {
  connected: boolean;
  network?: string | null;
  chain_id?: number | null;
  contract_address?: string | null;
  latest_block?: number | null;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_certificates?: number | null;
}

export interface ChartPoint {
  month?: string;
  day?: string;
  count: number;
  status?: string;
  role?: string;
  time?: string;
}