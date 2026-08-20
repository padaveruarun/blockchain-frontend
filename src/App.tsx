import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";

import LandingPage from "@/pages/public/Landing";
import VerifyPage from "@/pages/public/Verify";
import VerifyCertificatePage from "@/pages/public/VerifyCertificate";
import HowItWorksPage from "@/pages/public/HowItWorks";
import AboutPage from "@/pages/public/About";
import LoginPage from "@/pages/public/Login";
import RegisterPage from "@/pages/public/Register";

import StudentDashboard from "@/pages/student/Dashboard";
import StudentCertificates from "@/pages/student/Certificates";
import StudentCertificateDetail from "@/pages/student/CertificateDetail";
import StudentHistory from "@/pages/student/History";
import StudentProfile from "@/pages/student/Profile";
import StudentSettings from "@/pages/student/Settings";

import InstitutionDashboard from "@/pages/institution/Dashboard";
import InstitutionStudents from "@/pages/institution/Students";
import InstitutionCourses from "@/pages/institution/Courses";
import InstitutionStudentDetail from "@/pages/institution/StudentDetail";
import InstitutionCertificates from "@/pages/institution/Certificates";
import InstitutionCertificateDetail from "@/pages/institution/CertificateDetail";
import InstitutionIssue from "@/pages/institution/IssueCertificate";
import InstitutionVerificationHistory from "@/pages/institution/VerificationHistory";
import InstitutionProfile from "@/pages/institution/Profile";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminInstitutions from "@/pages/admin/Institutions";
import AdminInstitutionDetail from "@/pages/admin/InstitutionDetail";
import AdminUsers from "@/pages/admin/Users";
import AdminCertificates from "@/pages/admin/Certificates";
import AdminVerifications from "@/pages/admin/Verifications";
import AdminBlockchain from "@/pages/admin/Blockchain";
import AdminAuditLogs from "@/pages/admin/AuditLogs";
import AdminSettings from "@/pages/admin/Settings";

function RequireRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const home =
      user.role === "ADMIN" ? "/admin" : user.role === "INSTITUTION" ? "/institution" : user.role === "STUDENT" ? "/student" : "/";
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:certificateId" element={<VerifyCertificatePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Student portal */}
      <Route
        element={
          <RequireRole roles={["STUDENT"]}>
            <PortalLayout />
          </RequireRole>
        }
      >
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/certificates" element={<StudentCertificates />} />
        <Route path="/student/certificates/:id" element={<StudentCertificateDetail />} />
        <Route path="/student/history" element={<StudentHistory />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/settings" element={<StudentSettings />} />
      </Route>

      {/* Institution portal */}
      <Route
        element={
          <RequireRole roles={["INSTITUTION"]}>
            <PortalLayout />
          </RequireRole>
        }
      >
        <Route path="/institution" element={<InstitutionDashboard />} />
        <Route path="/institution/students" element={<InstitutionStudents />} />
        <Route path="/institution/courses" element={<InstitutionCourses />} />
        <Route path="/institution/students/:id" element={<InstitutionStudentDetail />} />
        <Route path="/institution/certificates" element={<InstitutionCertificates />} />
        <Route path="/institution/certificates/:id" element={<InstitutionCertificateDetail />} />
        <Route path="/institution/certificates/issue" element={<InstitutionIssue />} />
        <Route path="/institution/verification-history" element={<InstitutionVerificationHistory />} />
        <Route path="/institution/profile" element={<InstitutionProfile />} />
      </Route>

      {/* Admin portal */}
      <Route
        element={
          <RequireRole roles={["ADMIN"]}>
            <PortalLayout />
          </RequireRole>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/institutions" element={<AdminInstitutions />} />
        <Route path="/admin/institutions/:id" element={<AdminInstitutionDetail />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/certificates" element={<AdminCertificates />} />
        <Route path="/admin/verifications" element={<AdminVerifications />} />
        <Route path="/admin/blockchain" element={<AdminBlockchain />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}