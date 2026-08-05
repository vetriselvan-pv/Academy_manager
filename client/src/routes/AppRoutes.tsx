import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandingPage } from "@/features/landing/LandingPage";
import { NotFoundPage } from "@/components/StatusPages";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterStudentPage } from "@/features/auth/RegisterStudentPage";
import { BranchesPage } from "@/features/branches/BranchesPage";
import { CoursesPage } from "@/features/courses/CoursesPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { EnrollmentsPage } from "@/features/enrollments/EnrollmentsPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { StudentsPage } from "@/features/students/StudentsPage";
import { TeachersPage } from "@/features/teachers/TeachersPage";
import { Permission, UserRole } from "@/types/enums";
import { GuestRoute, ProtectedRoute } from "./ProtectedRoute";
import { RequireAccess } from "./RequireAccess";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterStudentPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="branches"
            element={
              <RequireAccess roles={[UserRole.SUPER_ADMIN]}>
                <BranchesPage />
              </RequireAccess>
            }
          />

          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/manage" element={<CoursesPage />} />

          <Route
            path="teachers"
            element={
              <RequireAccess roles={[UserRole.SUPER_ADMIN, UserRole.TEACHER]}>
                <TeachersPage />
              </RequireAccess>
            }
          />

          <Route
            path="students"
            element={
              <RequireAccess
                roles={[UserRole.SUPER_ADMIN, UserRole.TEACHER]}
                permissions={[Permission.VIEW_STUDENTS]}
              >
                <StudentsPage />
              </RequireAccess>
            }
          />

          <Route
            path="enrollments"
            element={
              <RequireAccess
                roles={[UserRole.SUPER_ADMIN, UserRole.TEACHER]}
                permissions={[Permission.VIEW_ENROLLMENTS]}
              >
                <EnrollmentsPage />
              </RequireAccess>
            }
          />
          <Route
            path="my-enrollments"
            element={
              <RequireAccess roles={[UserRole.STUDENT]}>
                <EnrollmentsPage />
              </RequireAccess>
            }
          />

          <Route
            path="reports"
            element={
              <RequireAccess
                roles={[UserRole.SUPER_ADMIN, UserRole.TEACHER]}
                permissions={[Permission.VIEW_REPORTS]}
              >
                <ReportsPage />
              </RequireAccess>
            }
          />

          <Route path="profile" element={<ProfilePage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
