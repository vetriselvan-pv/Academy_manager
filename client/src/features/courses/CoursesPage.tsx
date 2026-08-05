import { useState } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import { hasPermission, isSuperAdmin } from "@/auth/permissions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";
import { Permission } from "@/types/enums";
import type { Course } from "@/types/models";
import { CourseFormModal } from "./CourseFormModal";
import { useCourses, useDeactivateCourse } from "./useCourses";
import { useCourseCategories } from "./useCourseCategories";

export function CoursesPage() {
  const { user } = useAuth();
  const canManage =
    isSuperAdmin(user) || hasPermission(user, Permission.MANAGE_COURSE_CONTENT);
  const canDeactivate = isSuperAdmin(user);

  const { data: categories } = useCourseCategories();
  const CATEGORY_OPTIONS = (categories ?? []).map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  const [filters, setFilters] = useState<Record<string, string>>({
    isActive: "true",
  });
  const [debouncedFilters, setDebouncedFilters] = useState<
    Record<string, string>
  >({ isActive: "true" });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<Course | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [filters]);

  const { data: response, isLoading } = useCourses({
    ...debouncedFilters,
    page,
    limit: 10,
  });
  const deactivateCourse = useDeactivateCourse();

  const visibleCourses = response?.data ?? [];
  const totalPages = response?.totalPages ?? 1;

  async function handleDeactivate() {
    if (!deactivating) return;
    try {
      await deactivateCourse.mutateAsync(deactivating._id);
      toast.success("Course deactivated");
      setDeactivating(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not deactivate the course"));
    }
  }

  const columns: DataTableColumn<Course>[] = [
    {
      key: "name",
      header: "Name",
      filterable: true,
      render: (course) => (
        <span className="font-medium text-slate-900">{course.name}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      filterable: true,
      filterOptions: CATEGORY_OPTIONS,
      render: (course) => (
        <Badge tone="brand">
          {typeof course.category === "object" && course.category !== null
            ? course.category.name
            : "Unknown"}
        </Badge>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (course) =>
        course.durationMonths ? `${course.durationMonths} mo` : "—",
    },
    {
      key: "fee",
      header: "Fee",
      render: (course) => formatCurrency(course.fee),
    },
    {
      key: "isActive",
      header: "Status",
      filterable: true,
      filterOptions: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
      render: (course) => (
        <Badge tone={course.isActive ? "green" : "slate"}>
          {course.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (course) => (
        <div className="flex justify-end gap-1">
          {canManage && (
            <button
              type="button"
              onClick={() => setEditingCourse(course)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label={`Edit ${course.name}`}
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canDeactivate && course.isActive && (
            <button
              type="button"
              onClick={() => setDeactivating(course)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              aria-label={`Deactivate ${course.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Browse the course catalog offered across all branches."
        actions={
          canManage && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New course
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={visibleCourses}
        rowKey={(course) => course._id}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description={
              canManage
                ? "Create your first course to get started."
                : "Check back soon for new courses."
            }
          />
        }
      />

      <CourseFormModal
        open={creating}
        onClose={() => setCreating(false)}
        canEditActiveState={canDeactivate}
      />
      <CourseFormModal
        open={!!editingCourse}
        onClose={() => setEditingCourse(null)}
        course={editingCourse}
        canEditActiveState={canDeactivate}
      />

      <ConfirmDialog
        open={!!deactivating}
        title="Deactivate course?"
        description={`"${deactivating?.name}" will be hidden from default views but its history is kept.`}
        confirmLabel="Deactivate"
        destructive
        isLoading={deactivateCourse.isPending}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivating(null)}
      />
    </div>
  );
}
