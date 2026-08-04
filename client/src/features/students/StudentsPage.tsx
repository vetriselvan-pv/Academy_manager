import { useState } from 'react'
import { Pencil, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/auth/AuthContext'
import { hasPermission, isSuperAdmin, isTeacher } from '@/auth/permissions'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { useBranches } from '@/features/branches/useBranches'
import { getApiErrorMessage } from '@/lib/apiClient'
import { Permission } from '@/types/enums'
import { refId, refLabel } from '@/types/models'
import type { Student } from '@/types/models'
import { StudentFormModal } from './StudentFormModal'
import { useDeactivateStudent, useStudents } from './useStudents'

export function StudentsPage() {
  const { user } = useAuth()
  const admin = isSuperAdmin(user)
  const teacher = isTeacher(user)
  // Students self-register via a separate registration flow, so there is no "create student"
  // action on this admin/teacher-facing list.
  const canManage = admin || hasPermission(user, Permission.MANAGE_STUDENTS)

  const teacherBranches = teacher ? user.branches : []
  const showBranchPicker = admin || teacherBranches.length > 1

  const [branchFilter, setBranchFilter] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [deactivating, setDeactivating] = useState<Student | null>(null)

  // Only SUPER_ADMIN needs the full branch list; teachers pick from their own already-populated branches.
  const { data: allBranches } = useBranches()
  const branchOptions = admin
    ? (allBranches ?? []).map((branch) => ({ value: branch._id, label: `${branch.name} (${branch.code})` }))
    : teacherBranches.map((branch) => ({ value: refId(branch) ?? '', label: refLabel(branch) }))

  const effectiveBranch = admin || teacherBranches.length > 1 ? branchFilter || undefined : refId(teacherBranches[0])

  const { data: students, isLoading } = useStudents(effectiveBranch)
  const deactivateStudent = useDeactivateStudent()

  const visibleStudents = (students ?? []).filter((student) => showInactive || student.isActive)

  async function handleDeactivate() {
    if (!deactivating) return
    try {
      await deactivateStudent.mutateAsync(deactivating._id)
      toast.success('Student deactivated')
      setDeactivating(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not deactivate the student'))
    }
  }

  const columns: DataTableColumn<Student>[] = [
    { key: 'name', header: 'Name', render: (student) => <span className="font-medium text-slate-900">{student.name}</span> },
    { key: 'email', header: 'Email', render: (student) => student.email },
    { key: 'phone', header: 'Phone', render: (student) => student.phone || '—' },
    { key: 'branch', header: 'Branch', render: (student) => refLabel(student.branch) },
    {
      key: 'status',
      header: 'Status',
      render: (student) => <Badge tone={student.isActive ? 'green' : 'slate'}>{student.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (student) => (
        <div className="flex justify-end gap-1">
          {canManage && (
            <button
              type="button"
              onClick={() => setEditingStudent(student)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label={`Edit ${student.name}`}
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canManage && student.isActive && (
            <button
              type="button"
              onClick={() => setDeactivating(student)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              aria-label={`Deactivate ${student.name}`}
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
      <PageHeader title="Students" description="Browse and manage students enrolled across the institution." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {showBranchPicker && (
          <div className="w-56">
            <Select
              value={branchFilter}
              onChange={(event) => setBranchFilter(event.target.value)}
              placeholder="All branches"
              options={branchOptions}
            />
          </div>
        )}
        <Checkbox
          id="show-inactive-students"
          label="Show inactive"
          checked={showInactive}
          onChange={(event) => setShowInactive(event.target.checked)}
        />
      </div>

      <DataTable
        columns={columns}
        data={visibleStudents}
        rowKey={(student) => student._id}
        isLoading={isLoading}
        emptyState={<EmptyState icon={Users} title="No students yet" description="Students will appear here once they register." />}
      />

      <StudentFormModal open={!!editingStudent} onClose={() => setEditingStudent(null)} student={editingStudent} />

      <ConfirmDialog
        open={!!deactivating}
        title="Deactivate student?"
        description={`"${deactivating?.name}" will be hidden from default views but their history is kept.`}
        confirmLabel="Deactivate"
        destructive
        isLoading={deactivateStudent.isPending}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivating(null)}
      />
    </div>
  )
}
