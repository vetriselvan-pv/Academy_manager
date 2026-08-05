import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ban, GraduationCap, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { branchesApi } from "@/api/branches.api";
import { useAuth } from "@/auth/AuthContext";
import {
  hasPermission,
  isStudent,
  isSuperAdmin,
  isTeacher,
} from "@/auth/permissions";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ENROLLMENT_STATUS_LABELS,
  EnrollmentStatus,
  Permission,
} from "@/types/enums";
import { refId, refLabel, type Enrollment } from "@/types/models";
import { EditEnrollmentModal } from "./EditEnrollmentModal";
import { EnrollmentFormModal } from "./EnrollmentFormModal";
import { useCancelEnrollment, useEnrollments } from "./useEnrollments";

const STATUS_OPTIONS = Object.values(EnrollmentStatus).map((value) => ({
  value,
  label: ENROLLMENT_STATUS_LABELS[value],
}));

const STATUS_TONE: Record<EnrollmentStatus, BadgeProps["tone"]> = {
  ACTIVE: "green",
  COMPLETED: "blue",
  CANCELLED: "slate",
};

export function EnrollmentsPage() {
  const { user } = useAuth();
  const studentUser = isStudent(user);
  const canManage = hasPermission(user, Permission.MANAGE_ENROLLMENTS);
  const canCreate = canManage || studentUser;
  const canCancelRows = canManage || studentUser;

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [debouncedFilters, setDebouncedFilters] = useState<
    Record<string, string>
  >({});
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(
    null,
  );
  const [cancelling, setCancelling] = useState<Enrollment | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [filters]);

  const { data: response, isLoading } = useEnrollments(
    studentUser
      ? { page, limit: 10 }
      : { ...debouncedFilters, page, limit: 10 },
  );

  const { data: allBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesApi.list(),
    enabled: isSuperAdmin(user),
  });

  const branchOptions = isSuperAdmin(user)
    ? (allBranches?.data ?? []).map((branch) => ({
        value: branch._id,
        label: branch.name,
      }))
    : isTeacher(user)
      ? (user.branches ?? []).map((branch) => ({
          value: refId(branch) ?? "",
          label: refLabel(branch),
        }))
      : [];

  const cancelEnrollment = useCancelEnrollment();

  const visibleEnrollments = response?.data ?? [];
  const totalPages = response?.totalPages ?? 1;

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCancel() {
    if (!cancelling) return;
    try {
      await cancelEnrollment.mutateAsync(cancelling._id);
      toast.success("Enrollment cancelled");
      setCancelling(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not cancel the enrollment"));
    }
  }

  const columns: DataTableColumn<Enrollment>[] = [
    {
      key: "student",
      header: "Student",
      filterable: true,
      render: (e) => (
        <span className="font-medium text-slate-900">
          {refLabel(e.student)}
        </span>
      ),
    },
    {
      key: "course",
      header: "Course",
      filterable: true,
      render: (e) => refLabel(e.course),
    },
    {
      key: "branch",
      header: "Branch",
      filterable: true,
      filterOptions: branchOptions,
      render: (e) => refLabel(e.branch),
    },
    {
      key: "teacher",
      header: "Teacher",
      filterable: true,
      render: (e) => (e.teacher ? refLabel(e.teacher) : "—"),
    },
    {
      key: "batchTiming",
      header: "Batch timing",
      filterable: true,
      render: (e) => e.batchTiming || "—",
    },
    {
      key: "status",
      header: "Status",
      filterable: true,
      filterOptions: STATUS_OPTIONS,
      render: (e) => (
        <Badge tone={STATUS_TONE[e.status]}>
          {ENROLLMENT_STATUS_LABELS[e.status]}
        </Badge>
      ),
    },
    {
      key: "startDate",
      header: "Start date",
      render: (e) => formatDate(e.startDate),
    },
    {
      key: "feePaid",
      header: "Fee paid",
      render: (e) => formatCurrency(e.feePaid),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (e) => (
        <div className="flex justify-end gap-1">
          {canManage && (
            <button
              type="button"
              onClick={() => setEditingEnrollment(e)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label={`Edit enrollment for ${refLabel(e.student)}`}
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canCancelRows && e.status === "ACTIVE" && (
            <button
              type="button"
              onClick={() => setCancelling(e)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              aria-label="Cancel enrollment"
            >
              <Ban className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={studentUser ? "My Courses" : "Enrollments"}
        description={
          studentUser
            ? "Courses you are currently enrolled in."
            : "Manage student enrollments across your branches."
        }
        actions={
          canCreate && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Enroll
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={visibleEnrollments}
        rowKey={(e) => e._id}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={GraduationCap}
            title={studentUser ? "No enrollments yet" : "No enrollments found"}
            description={
              studentUser
                ? "Enroll in a course to see it listed here."
                : "Try adjusting the filters, or enroll a student."
            }
          />
        }
      />

      <EnrollmentFormModal
        open={creating}
        onClose={() => setCreating(false)}
        enrollments={response?.data ?? []}
      />

      <EditEnrollmentModal
        open={!!editingEnrollment}
        onClose={() => setEditingEnrollment(null)}
        enrollment={editingEnrollment}
      />

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel enrollment?"
        description={
          cancelling
            ? `This cancels ${refLabel(cancelling.student)}'s enrollment in ${refLabel(cancelling.course)}.`
            : undefined
        }
        confirmLabel="Cancel enrollment"
        destructive
        isLoading={cancelEnrollment.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelling(null)}
      />
    </div>
  );
}
