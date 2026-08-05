import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/apiClient'
import type { Branch } from '@/types/models'
import { usersApi } from '@/api/users.api'
import { useQuery } from '@tanstack/react-query'
import { useCreateBranch, useUpdateBranch } from './useBranches'

const branchFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(2, 'Address must be at least 2 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  manager: z.string().optional(),
  isActive: z.boolean().optional(),
})

type BranchFormValues = z.infer<typeof branchFormSchema>

interface BranchFormModalProps {
  open: boolean
  onClose: () => void
  branch?: Branch | null
  canEditActiveState?: boolean
}

export function BranchFormModal({ open, onClose, branch, canEditActiveState }: BranchFormModalProps) {
  const isEditing = !!branch
  const createBranch = useCreateBranch()
  const updateBranch = useUpdateBranch()
  const isSaving = createBranch.isPending || updateBranch.isPending
  
  const { data: admins } = useQuery({
    queryKey: ['admins'],
    queryFn: () => usersApi.getAdmins(),
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BranchFormValues>({ resolver: zodResolver(branchFormSchema) })

  useEffect(() => {
    if (!open) return
    reset({
      name: branch?.name ?? '',
      address: branch?.address ?? '',
      city: branch?.city ?? '',
      state: branch?.state ?? '',
      phone: branch?.phone ?? '',
      email: branch?.email ?? '',
      manager: typeof branch?.manager === 'string' ? branch.manager : (branch?.manager?._id ?? ''),
      isActive: branch?.isActive ?? true,
    })
  }, [open, branch, reset])

  async function onSubmit(values: BranchFormValues) {
    const payload = {
      name: values.name,
      address: values.address,
      city: values.city,
      state: values.state || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      manager: values.manager || undefined,
      ...(canEditActiveState ? { isActive: values.isActive } : {}),
    }

    try {
      if (isEditing) {
        await updateBranch.mutateAsync({ id: branch._id, payload })
        toast.success('Branch updated')
      } else {
        await createBranch.mutateAsync(payload)
        toast.success('Branch created')
      }
      onClose()
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      if (fieldErrors) {
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (messages?.[0] && field in branchFormSchema.shape) {
            setError(field as keyof BranchFormValues, { message: messages[0] })
          }
        }
      }
      toast.error(getApiErrorMessage(error, 'Could not save the branch'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit branch' : 'Create branch'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-1">
          <FormField label="Name" htmlFor="branch-name" error={errors.name?.message} required>
            <Input id="branch-name" {...register('name')} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Address" htmlFor="branch-address" error={errors.address?.message} required>
            <Input id="branch-address" {...register('address')} />
          </FormField>
          <FormField label="Manager" htmlFor="branch-manager" error={errors.manager?.message}>
            <select
              id="branch-manager"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              {...register('manager')}
            >
              <option value="">Select a manager...</option>
              {admins?.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.name} ({admin.email})
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="City" htmlFor="branch-city" error={errors.city?.message} required>
            <Input id="branch-city" {...register('city')} />
          </FormField>
          <FormField label="State" htmlFor="branch-state" error={errors.state?.message}>
            <Input id="branch-state" {...register('state')} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone" htmlFor="branch-phone" error={errors.phone?.message}>
            <Input id="branch-phone" {...register('phone')} />
          </FormField>
          <FormField label="Email" htmlFor="branch-email" error={errors.email?.message}>
            <Input id="branch-email" type="email" {...register('email')} />
          </FormField>
        </div>

        {canEditActiveState && isEditing && (
          <Checkbox id="branch-active" label="Active" {...register('isActive')} />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {isEditing ? 'Save changes' : 'Create branch'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
