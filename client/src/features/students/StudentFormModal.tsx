import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAuth } from '@/auth/AuthContext'
import { isSuperAdmin } from '@/auth/permissions'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useBranches } from '@/features/branches/useBranches'
import { getApiErrorMessage } from '@/lib/apiClient'
import { toDateInputValue } from '@/lib/utils'
import { Gender, GENDER_LABELS } from '@/types/enums'
import { refId } from '@/types/models'
import type { Student } from '@/types/models'
import { useUpdateStudent } from './useStudents'

const studentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  branch: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
})

type StudentFormValues = z.infer<typeof studentFormSchema>

const GENDER_OPTIONS = Object.values(Gender).map((value) => ({ value, label: GENDER_LABELS[value] }))

interface StudentFormModalProps {
  open: boolean
  onClose: () => void
  student: Student | null
}

export function StudentFormModal({ open, onClose, student }: StudentFormModalProps) {
  const { user } = useAuth()
  // Reassigning a student's branch is only surfaced for SUPER_ADMIN — teacher-side branch
  // moves are complex to gate correctly client-side, so the field is hidden and the server
  // remains the source of truth (it will reject an unauthorized attempt with a clear message).
  const canReassignBranch = isSuperAdmin(user)

  const { data: branches } = useBranches()
  const updateStudent = useUpdateStudent()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({ resolver: zodResolver(studentFormSchema) })

  useEffect(() => {
    if (!open || !student) return
    setFormError(null)
    reset({
      name: student.name,
      phone: student.phone ?? '',
      branch: refId(student.branch) ?? '',
      dateOfBirth: toDateInputValue(student.dateOfBirth),
      gender: student.gender ?? '',
      address: student.address ?? '',
      guardianName: student.guardianName ?? '',
      guardianPhone: student.guardianPhone ?? '',
    })
  }, [open, student, reset])

  async function onSubmit(values: StudentFormValues) {
    if (!student) return
    setFormError(null)

    const payload = {
      name: values.name,
      phone: values.phone || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      gender: values.gender ? (values.gender as Gender) : undefined,
      address: values.address || undefined,
      guardianName: values.guardianName || undefined,
      guardianPhone: values.guardianPhone || undefined,
      ...(canReassignBranch ? { branch: values.branch || undefined } : {}),
    }

    try {
      await updateStudent.mutateAsync({ id: student._id, payload })
      toast.success('Student updated')
      onClose()
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not update the student')
      setFormError(message)
      toast.error(message)
    }
  }

  if (!student) return null

  const branchOptions = (branches ?? []).map((branch) => ({ value: branch._id, label: `${branch.name} (${branch.code})` }))

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${student.name}`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {formError}
          </p>
        )}

        <FormField label="Name" htmlFor="student-name" error={errors.name?.message} required>
          <Input id="student-name" {...register('name')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone" htmlFor="student-phone" error={errors.phone?.message}>
            <Input id="student-phone" {...register('phone')} />
          </FormField>
          <FormField label="Date of birth" htmlFor="student-dob" error={errors.dateOfBirth?.message}>
            <Input id="student-dob" type="date" {...register('dateOfBirth')} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Gender" htmlFor="student-gender" error={errors.gender?.message}>
            <Select id="student-gender" options={GENDER_OPTIONS} placeholder="Select gender" {...register('gender')} />
          </FormField>
          {canReassignBranch && (
            <FormField label="Branch" htmlFor="student-branch" error={errors.branch?.message}>
              <Select id="student-branch" options={branchOptions} placeholder="Select branch" {...register('branch')} />
            </FormField>
          )}
        </div>

        <FormField label="Address" htmlFor="student-address" error={errors.address?.message}>
          <Textarea id="student-address" {...register('address')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Guardian name" htmlFor="student-guardian-name" error={errors.guardianName?.message}>
            <Input id="student-guardian-name" {...register('guardianName')} />
          </FormField>
          <FormField label="Guardian phone" htmlFor="student-guardian-phone" error={errors.guardianPhone?.message}>
            <Input id="student-guardian-phone" {...register('guardianPhone')} />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateStudent.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}
