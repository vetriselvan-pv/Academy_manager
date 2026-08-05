import { useState, useEffect } from 'react'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/auth/AuthContext'
import { isSuperAdmin } from '@/auth/permissions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { getApiErrorMessage } from '@/lib/apiClient'
import type { Branch } from '@/types/models'
import { BranchFormModal } from './BranchFormModal'
import { useBranches, useDeactivateBranch } from './useBranches'

export function BranchesPage() {
  const { user } = useAuth()
  const canManage = isSuperAdmin(user)
  const canDeactivate = isSuperAdmin(user)

  const [showInactive, setShowInactive] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [creating, setCreating] = useState(false)
  const [deactivating, setDeactivating] = useState<Branch | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 400)
    return () => clearTimeout(handler)
  }, [filters])

  const { data: branches, isLoading } = useBranches({
    ...debouncedFilters,
    ...(showInactive ? {} : { isActive: 'true' }),
  })
  const deactivateBranch = useDeactivateBranch()

  const visibleBranches = branches ?? []

  async function handleDeactivate() {
    if (!deactivating) return
    try {
      await deactivateBranch.mutateAsync(deactivating._id)
      toast.success('Branch deactivated')
      setDeactivating(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not deactivate the branch'))
    }
  }

  const columns: DataTableColumn<Branch>[] = [
    { key: 'name', header: 'Name', filterable: true, render: (branch) => <span className="font-medium text-slate-900">{branch.name}</span> },
    { key: 'code', header: 'Code', filterable: true, render: (branch) => <Badge tone="brand">{branch.code}</Badge> },
    { key: 'city', header: 'City', filterable: true, render: (branch) => branch.city },
    { key: 'phone', header: 'Phone', filterable: true, render: (branch) => branch.phone || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (branch) => <Badge tone={branch.isActive ? 'green' : 'slate'}>{branch.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (branch) => (
        <div className="flex justify-end gap-1">
          {canManage && (
            <button
              type="button"
              onClick={() => setEditingBranch(branch)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label={`Edit ${branch.name}`}
            >
              <Pencil className="size-4" />
            </button>
          )}
          {canDeactivate && branch.isActive && (
            <button
              type="button"
              onClick={() => setDeactivating(branch)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              aria-label={`Deactivate ${branch.name}`}
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
        title="Branches"
        description="Manage the branches operating across the institution."
        actions={
          canManage && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New branch
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Checkbox
          id="show-inactive-branches"
          label="Show inactive"
          checked={showInactive}
          onChange={(event) => setShowInactive(event.target.checked)}
        />
      </div>

      <DataTable
        columns={columns}
        data={visibleBranches}
        rowKey={(branch) => branch._id}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        emptyState={
          <EmptyState
            icon={Building2}
            title="No branches yet"
            description={canManage ? 'Create your first branch to get started.' : 'Check back soon for new branches.'}
          />
        }
      />

      <BranchFormModal open={creating} onClose={() => setCreating(false)} canEditActiveState={canDeactivate} />
      <BranchFormModal
        open={!!editingBranch}
        onClose={() => setEditingBranch(null)}
        branch={editingBranch}
        canEditActiveState={canDeactivate}
      />

      <ConfirmDialog
        open={!!deactivating}
        title="Deactivate branch?"
        description={`"${deactivating?.name}" will be hidden from default views but its history is kept.`}
        confirmLabel="Deactivate"
        destructive
        isLoading={deactivateBranch.isPending}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivating(null)}
      />
    </div>
  )
}
