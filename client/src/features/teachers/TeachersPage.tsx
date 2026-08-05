import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/auth/AuthContext'
import { hasPermission, isSuperAdmin, isTeacher } from '@/auth/permissions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { useBranches } from '@/features/branches/useBranches'
import { getApiErrorMessage } from '@/lib/apiClient'
import { DESIGNATION_LABELS, Permission } from '@/types/enums'
import { refId, refLabel } from '@/types/models'
import type { Teacher } from '@/types/models'
import { TeacherFormModal } from './TeacherFormModal'
import { useDeactivateTeacher, useTeachers } from './useTeachers'

export function TeachersPage() {
  const { user } = useAuth()
  const isAdmin = isSuperAdmin(user)
  const canManageBranchTeachers = isTeacher(user) && hasPermission(user, Permission.MANAGE_BRANCH_TEACHERS)

  // A TEACHER viewer must never see the full branch list — only their own branches
  // (per DOMAIN_FLOW.md §4.5: scope to `branches` from their own /me response).
  const ownBranches = useMemo(() => {
    if (!user || user.role !== 'TEACHER') return []
    return user.branches
  }, [user])
  const ownBranchIds = useMemo(
    () => ownBranches.map((branch) => refId(branch)).filter((id): id is string => !!id),
    [ownBranches],
  )

  const { data: allBranches } = useBranches()

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [creating, setCreating] = useState(false)
  const [deactivating, setDeactivating] = useState<Teacher | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const { data: teachers, isLoading } = useTeachers()
  const deactivateTeacher = useDeactivateTeacher()

  const filteredTeachers = useMemo(() => {
    if (!teachers) return []
    return teachers.filter((teacher) => {
      if (filters.name && !teacher.name.toLowerCase().includes(filters.name.toLowerCase())) return false
      if (filters.email && !teacher.email.toLowerCase().includes(filters.email.toLowerCase())) return false
      if (filters.designation && teacher.designation !== filters.designation) return false
      if (filters.branches) {
        const hasBranch = teacher.branches.some(b => refId(b) === filters.branches)
        if (!hasBranch) return false
      }
      return true
    })
  }, [teachers, filters])

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const branchFilterOptions = isAdmin
    ? (allBranches ?? []).map((branch) => ({ value: branch._id, label: branch.name }))
    : ownBranches.map((branch) => ({ value: refId(branch) ?? '', label: refLabel(branch) })).filter((option) => option.value)

  function sharesABranch(teacher: Teacher): boolean {
    const teacherBranchIds = teacher.branches.map((branch) => refId(branch)).filter((id): id is string => !!id)
    return teacherBranchIds.some((id) => ownBranchIds.includes(id))
  }

  function canEdit(teacher: Teacher): boolean {
    if (isAdmin) return true
    if (canManageBranchTeachers) return sharesABranch(teacher)
    return false
  }

  async function handleDeactivate() {
    if (!deactivating) return
    try {
      await deactivateTeacher.mutateAsync(deactivating._id)
      toast.success('Teacher deactivated')
      setDeactivating(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not deactivate the teacher'))
    }
  }

  const columns: DataTableColumn<Teacher>[] = [
    { key: 'name', header: 'Name', filterable: true, render: (teacher) => <span className="font-medium text-slate-900">{teacher.name}</span> },
    { key: 'email', header: 'Email', filterable: true, render: (teacher) => teacher.email },
    {
      key: 'designation',
      header: 'Designation',
      filterable: true,
      filterOptions: Object.entries(DESIGNATION_LABELS).map(([value, label]) => ({ value, label })),
      render: (teacher) => <Badge tone="brand">{DESIGNATION_LABELS[teacher.designation]}</Badge>,
    },
    {
      key: 'branches',
      header: 'Branches',
      filterable: true,
      filterOptions: branchFilterOptions,
      render: (teacher) => (
        <div className="flex flex-wrap gap-1">
          {teacher.branches.map((branch) => (
            <Badge key={refId(branch)} tone="slate">
              {refLabel(branch)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'specializedCourses',
      header: 'Specialized courses',
      render: (teacher) => (
        <div className="flex flex-wrap gap-1">
          {teacher.specializedCourses.length === 0 && <span className="text-slate-400">—</span>}
          {teacher.specializedCourses.map((course) => (
            <Badge key={refId(course)} tone="blue">
              {refLabel(course)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (teacher) => (
        <div className="flex justify-end gap-1">
          {canEdit(teacher) && (
            <button
              type="button"
              onClick={() => setEditingTeacher(teacher)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label={`Edit ${teacher.name}`}
            >
              <Pencil className="size-4" />
            </button>
          )}
          {isAdmin && teacher.isActive && (
            <button
              type="button"
              onClick={() => setDeactivating(teacher)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              aria-label={`Deactivate ${teacher.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Manage teaching staff across branches."
        actions={
          isAdmin && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New teacher
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={filteredTeachers}
        rowKey={(teacher) => teacher._id}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        emptyState={
          <EmptyState
            icon={UserRound}
            title="No teachers yet"
            description={isAdmin ? 'Create your first teacher to get started.' : 'Check back soon.'}
          />
        }
      />

      <TeacherFormModal open={creating} onClose={() => setCreating(false)} />
      <TeacherFormModal open={!!editingTeacher} onClose={() => setEditingTeacher(null)} teacher={editingTeacher} />

      <ConfirmDialog
        open={!!deactivating}
        title="Deactivate teacher?"
        description={`"${deactivating?.name}" will be marked inactive and hidden from default views.`}
        confirmLabel="Deactivate"
        destructive
        isLoading={deactivateTeacher.isPending}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivating(null)}
      />
    </div>
  )
}
