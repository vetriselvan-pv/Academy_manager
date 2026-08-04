import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { studentsApi } from '@/api/students.api'
import { teachersApi } from '@/api/teachers.api'
import { useAuth } from '@/auth/AuthContext'
import { isStudent, isSuperAdmin, isTeacher } from '@/auth/permissions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormField } from '@/components/ui/FormField'
import { Input, Textarea } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { getApiErrorMessage } from '@/lib/apiClient'
import { toDateInputValue } from '@/lib/utils'
import { DESIGNATION_LABELS, PERMISSION_LABELS } from '@/types/enums'
import { refLabel } from '@/types/models'
import { ChangePasswordForm } from './ChangePasswordForm'

const teacherProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
})
type TeacherProfileValues = z.infer<typeof teacherProfileSchema>

const studentProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
})
type StudentProfileValues = z.infer<typeof studentProfileSchema>

export function ProfilePage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" description="View and update your personal information." />

      <div className="space-y-6">
        {isTeacher(user) && <TeacherProfileCard />}
        {isStudent(user) && <StudentProfileCard />}
        {isSuperAdmin(user) && (
          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Name:</span> {user.name}
              </p>
              <p>
                <span className="font-medium text-slate-900">Email:</span> {user.email}
              </p>
              <p className="text-slate-400">
                Super Admin accounts are managed directly on the server — there's no self-edit form for this role yet.
              </p>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardBody>
            <ChangePasswordForm />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function TeacherProfileCard() {
  const { user, refreshUser } = useAuth()
  const teacher = isTeacher(user) ? user : null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeacherProfileValues>({ resolver: zodResolver(teacherProfileSchema) })

  useEffect(() => {
    if (teacher) reset({ name: teacher.name, phone: teacher.phone ?? '' })
  }, [teacher, reset])

  if (!teacher) return null

  async function onSubmit(values: TeacherProfileValues) {
    try {
      await teachersApi.update(teacher!._id, values)
      await refreshUser()
      toast.success('Profile updated')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update your profile'))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">{DESIGNATION_LABELS[teacher.designation]}</Badge>
          {teacher.branches.map((branch) => (
            <Badge key={typeof branch === 'string' ? branch : branch._id} tone="slate">
              {refLabel(branch)}
            </Badge>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" {...register('name')} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" {...register('phone')} />
            </FormField>
          </div>
          <FormField label="Email" htmlFor="email">
            <Input id="email" value={teacher.email} disabled />
          </FormField>

          <div className="flex flex-wrap gap-1.5">
            {teacher.permissions.map((permission) => (
              <Badge key={permission} tone="slate">
                {PERMISSION_LABELS[permission]}
              </Badge>
            ))}
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

function StudentProfileCard() {
  const { user, refreshUser } = useAuth()
  const student = isStudent(user) ? user : null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileValues>({ resolver: zodResolver(studentProfileSchema) })

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        phone: student.phone ?? '',
        address: student.address ?? '',
        guardianName: student.guardianName ?? '',
        guardianPhone: student.guardianPhone ?? '',
      })
    }
  }, [student, reset])

  if (!student) return null

  async function onSubmit(values: StudentProfileValues) {
    try {
      await studentsApi.update(student!._id, values)
      await refreshUser()
      toast.success('Profile updated')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update your profile'))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">{refLabel(student.branch)}</Badge>
          {student.dateOfBirth && <Badge tone="slate">DOB: {toDateInputValue(student.dateOfBirth)}</Badge>}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
              <Input id="name" {...register('name')} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
              <Input id="phone" type="tel" {...register('phone')} />
            </FormField>
          </div>
          <FormField label="Email" htmlFor="email">
            <Input id="email" value={student.email} disabled />
          </FormField>
          <FormField label="Address" htmlFor="address" error={errors.address?.message}>
            <Textarea id="address" {...register('address')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Guardian name" htmlFor="guardianName" error={errors.guardianName?.message}>
              <Input id="guardianName" {...register('guardianName')} />
            </FormField>
            <FormField label="Guardian phone" htmlFor="guardianPhone" error={errors.guardianPhone?.message}>
              <Input id="guardianPhone" type="tel" {...register('guardianPhone')} />
            </FormField>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
