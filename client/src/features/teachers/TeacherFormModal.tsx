import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAuth } from '@/auth/AuthContext'
import { isSuperAdmin } from '@/auth/permissions'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { useBranches } from '@/features/branches/useBranches'
import { useCourses } from '@/features/courses/useCourses'
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/apiClient'
import { toDateInputValue } from '@/lib/utils'
import { DESIGNATION_LABELS, Permission, PERMISSION_LABELS, TeacherDesignation } from '@/types/enums'
import { refId } from '@/types/models'
import type { Teacher } from '@/types/models'
import { useCreateTeacher, useUpdateTeacher } from './useTeachers'

const FORM_FIELD_KEYS = [
  'name',
  'email',
  'password',
  'phone',
  'designation',
  'branches',
  'specializedCourses',
  'permissions',
  'joiningDate',
] as const

function buildSchema(isEditing: boolean, showDesignation: boolean) {
  return z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: isEditing ? z.string().optional() : z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: isEditing ? z.string().optional() : z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    designation: showDesignation ? z.string().min(1, 'Select a designation') : z.string().optional(),
    branches: z.array(z.string()).min(1, 'Select at least one branch'),
    specializedCourses: z.array(z.string()).optional(),
    permissions: z.array(z.string()).optional(),
    joiningDate: z.string().optional(),
  })
}

type TeacherFormValues = z.infer<ReturnType<typeof buildSchema>>

const DESIGNATION_OPTIONS = Object.values(TeacherDesignation).map((value) => ({ value, label: DESIGNATION_LABELS[value] }))
const PERMISSION_OPTIONS = Object.values(Permission).map((value) => ({ value, label: PERMISSION_LABELS[value] }))

interface TeacherFormModalProps {
  open: boolean
  onClose: () => void
  teacher?: Teacher | null
}

export function TeacherFormModal({ open, onClose, teacher }: TeacherFormModalProps) {
  const { user } = useAuth()
  const isEditing = !!teacher
  const isAdminEditor = isSuperAdmin(user)
  const showDesignation = !isEditing || isAdminEditor
  const showPermissions = isEditing && isAdminEditor

  const { data: branches } = useBranches()
  const { data: courses } = useCourses()
  const branchOptions = (branches?.data ?? []).map((branch) => ({ value: branch._id, label: branch.name }))
  const courseOptions = (courses?.data ?? []).map((course) => ({ value: course._id, label: course.name }))

  const createTeacher = useCreateTeacher()
  const updateTeacher = useUpdateTeacher()
  const isSaving = createTeacher.isPending || updateTeacher.isPending

  const schema = useMemo(() => buildSchema(isEditing, showDesignation), [isEditing, showDesignation])

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TeacherFormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!open) return
    reset({
      name: teacher?.name ?? '',
      email: teacher?.email ?? '',
      password: '',
      phone: teacher?.phone ?? '',
      designation: teacher?.designation ?? '',
      branches: (teacher?.branches ?? []).map((branch) => refId(branch)).filter((id): id is string => !!id),
      specializedCourses: (teacher?.specializedCourses ?? []).map((course) => refId(course)).filter((id): id is string => !!id),
      permissions: teacher?.permissions ?? [],
      joiningDate: toDateInputValue(teacher?.joiningDate),
    })
  }, [open, teacher, reset])

  async function onSubmit(values: TeacherFormValues) {
    try {
      if (isEditing) {
        const payload = {
          name: values.name,
          phone: values.phone || undefined,
          branches: values.branches,
          specializedCourses: values.specializedCourses ?? [],
          joiningDate: values.joiningDate || undefined,
          ...(isAdminEditor
            ? {
                designation: values.designation as TeacherDesignation,
                permissions: (values.permissions ?? []) as Permission[],
              }
            : {}),
        }
        await updateTeacher.mutateAsync({ id: teacher._id, payload })
        toast.success('Teacher updated')
      } else {
        const payload = {
          name: values.name,
          email: values.email!,
          password: values.password!,
          phone: values.phone || undefined,
          designation: values.designation as TeacherDesignation,
          branches: values.branches,
          specializedCourses: values.specializedCourses?.length ? values.specializedCourses : undefined,
          joiningDate: values.joiningDate || undefined,
        }
        await createTeacher.mutateAsync(payload)
        toast.success('Teacher created')
      }
      onClose()
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      if (fieldErrors) {
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (messages?.[0] && (FORM_FIELD_KEYS as readonly string[]).includes(field)) {
            setError(field as keyof TeacherFormValues, { message: messages[0] })
          }
        }
      }
      toast.error(getApiErrorMessage(error, 'Could not save the teacher'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit teacher' : 'Create teacher'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Name" htmlFor="teacher-name" error={errors.name?.message} required>
          <Input id="teacher-name" {...register('name')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          {isEditing ? (
            <FormField label="Email" htmlFor="teacher-email">
              <Input id="teacher-email" value={teacher?.email ?? ''} disabled readOnly />
            </FormField>
          ) : (
            <FormField label="Email" htmlFor="teacher-email" error={errors.email?.message} required>
              <Input id="teacher-email" type="email" {...register('email')} />
            </FormField>
          )}
          <FormField label="Phone" htmlFor="teacher-phone" error={errors.phone?.message}>
            <Input id="teacher-phone" {...register('phone')} />
          </FormField>
        </div>

        {!isEditing && (
          <FormField label="Password" htmlFor="teacher-password" error={errors.password?.message} required>
            <Input id="teacher-password" type="password" {...register('password')} />
          </FormField>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {showDesignation && (
            <FormField label="Designation" htmlFor="teacher-designation" error={errors.designation?.message} required>
              <Select id="teacher-designation" options={DESIGNATION_OPTIONS} placeholder="Select designation" {...register('designation')} />
            </FormField>
          )}
          <FormField label="Joining date" htmlFor="teacher-joining-date" error={errors.joiningDate?.message}>
            <Input id="teacher-joining-date" type="date" {...register('joiningDate')} />
          </FormField>
        </div>

        <FormField label="Branches" htmlFor="teacher-branches" error={errors.branches?.message} required>
          <Controller
            control={control}
            name="branches"
            render={({ field }) => (
              <MultiSelect
                id="teacher-branches"
                options={branchOptions}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Select branches"
              />
            )}
          />
        </FormField>

        <FormField label="Specialized courses" htmlFor="teacher-courses" error={errors.specializedCourses?.message}>
          <Controller
            control={control}
            name="specializedCourses"
            render={({ field }) => (
              <MultiSelect
                id="teacher-courses"
                options={courseOptions}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Select courses"
              />
            )}
          />
        </FormField>

        {showPermissions && (
          <FormField label="Permissions" htmlFor="teacher-permissions" error={errors.permissions?.message}>
            <Controller
              control={control}
              name="permissions"
              render={({ field }) => (
                <MultiSelect
                  id="teacher-permissions"
                  options={PERMISSION_OPTIONS}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Select permissions"
                />
              )}
            />
          </FormField>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {isEditing ? 'Save changes' : 'Create teacher'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
