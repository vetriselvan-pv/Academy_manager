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

  const [branchFilter, setBranchFilter] = useState<string>(() => (ownBranchIds.length > 0 ? ownBranchIds[0] : ''))
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [creating, setCreating] = useState(false)
  const [deactivating, setDeactivating] = useState<Teacher | null>(null)

  const { data: teachers, isLoading } = useTeachers(branchFilter || undefined)
  const deactivateTeacher = useDeactivateTeacher()

  // A teacher with a single branch is auto-scoped with no picker shown at all.
  const showBranchPicker = isAdmin || ownBranchIds.length > 1

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
    { key: 'name', header: 'Name', render: (teacher) => <span className="font-medium text-slate-900">{teacher.name}</span> },
    { key: 'email', header: 'Email', render: (teacher) => teacher.email },
    {
      key: 'designation',
      header: 'Designation',
      render: (teacher) => <Badge tone="brand">{DESIGNATION_LABELS[teacher.designation]}</Badge>,
    },
    {
      key: 'branches',
      header: 'Branches',
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

      {showBranchPicker && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select
              value={branchFilter}
              onChange={(event) => setBranchFilter(event.target.value)}
              placeholder={isAdmin ? 'All branches' : undefined}
              options={branchFilterOptions}
            />
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={teachers ?? []}
        rowKey={(teacher) => teacher._id}
        isLoading={isLoading}
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
