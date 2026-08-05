import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { teachersApi } from '@/api/teachers.api'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/apiClient'
import { toDateInputValue } from '@/lib/utils'
import { ENROLLMENT_STATUS_LABELS, EnrollmentStatus } from '@/types/enums'
import { refId, refLabel, type Enrollment } from '@/types/models'
import { useUpdateEnrollment } from './useEnrollments'

const editEnrollmentSchema = z.object({
  teacher: z.string().optional(),
  batchTiming: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().min(1, 'Select a status'),
  feePaid: z
    .string()
    .optional()
    .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0), 'Fee paid must be 0 or more'),
})
type EditEnrollmentValues = z.infer<typeof editEnrollmentSchema>

const STATUS_OPTIONS = Object.values(EnrollmentStatus).map((value) => ({ value, label: ENROLLMENT_STATUS_LABELS[value] }))

interface EditEnrollmentModalProps {
  open: boolean
  onClose: () => void
  enrollment?: Enrollment | null
}

export function EditEnrollmentModal({ open, onClose, enrollment }: EditEnrollmentModalProps) {
  const updateEnrollment = useUpdateEnrollment()
  const branchId = refId(enrollment?.branch)

  const { data: branchTeachers } = useQuery({
    queryKey: ['teachers', { branch: branchId ?? null }],
    queryFn: () => teachersApi.list(branchId ? { branch: branchId } : {}),
    enabled: open && !!branchId,
  })
  const teacherOptions = (branchTeachers?.data ?? []).map((t) => ({ value: t._id, label: t.name }))

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditEnrollmentValues>({ resolver: zodResolver(editEnrollmentSchema) })

  useEffect(() => {
    if (!open) return
    reset({
      teacher: refId(enrollment?.teacher) ?? '',
      batchTiming: enrollment?.batchTiming ?? '',
      endDate: toDateInputValue(enrollment?.endDate),
      status: enrollment?.status ?? '',
      feePaid: enrollment?.feePaid !== undefined ? String(enrollment.feePaid) : '',
    })
  }, [open, enrollment, reset])

  async function onSubmit(values: EditEnrollmentValues) {
    if (!enrollment) return
    const payload = {
      teacher: values.teacher || undefined,
      batchTiming: values.batchTiming || undefined,
      endDate: values.endDate || undefined,
      status: values.status as EnrollmentStatus,
      feePaid: values.feePaid ? Number(values.feePaid) : undefined,
    }

    try {
      await updateEnrollment.mutateAsync({ id: enrollment._id, payload })
      toast.success('Enrollment updated')
      onClose()
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      if (fieldErrors) {
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (messages?.[0] && field in editEnrollmentSchema.shape) {
            setError(field as keyof EditEnrollmentValues, { message: messages[0] })
          }
        }
      }
      toast.error(getApiErrorMessage(error, 'Could not update the enrollment'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit enrollment"
      description={enrollment ? `${refLabel(enrollment.student)} · ${refLabel(enrollment.course)}` : undefined}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Teacher" htmlFor="edit-enroll-teacher" error={errors.teacher?.message} hint="Optional batch instructor">
          <Select id="edit-enroll-teacher" options={teacherOptions} placeholder="Unassigned" {...register('teacher')} />
        </FormField>

        <FormField label="Batch timing" htmlFor="edit-enroll-batch-timing" error={errors.batchTiming?.message}>
          <Input id="edit-enroll-batch-timing" {...register('batchTiming')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Status" htmlFor="edit-enroll-status" error={errors.status?.message} required>
            <Select id="edit-enroll-status" options={STATUS_OPTIONS} {...register('status')} />
          </FormField>
          <FormField label="End date" htmlFor="edit-enroll-end-date" error={errors.endDate?.message}>
            <Input id="edit-enroll-end-date" type="date" {...register('endDate')} />
          </FormField>
        </div>

        <FormField label="Fee paid (₹)" htmlFor="edit-enroll-fee-paid" error={errors.feePaid?.message}>
          <Input id="edit-enroll-fee-paid" inputMode="decimal" {...register('feePaid')} />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateEnrollment.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
