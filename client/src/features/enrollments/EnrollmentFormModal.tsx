import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { branchesApi } from '@/api/branches.api'
import { coursesApi } from '@/api/courses.api'
import { studentsApi } from '@/api/students.api'
import { teachersApi } from '@/api/teachers.api'
import { useAuth } from '@/auth/AuthContext'
import { isStudent, isSuperAdmin, isTeacher } from '@/auth/permissions'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/apiClient'
import { refId, refLabel, type Enrollment } from '@/types/models'
import { useCreateEnrollment } from './useEnrollments'

interface EnrollmentFormModalProps {
  open: boolean
  onClose: () => void
  /** Caller's existing enrollments (unfiltered) — used to pre-emptively hide courses already actively enrolled in. */
  enrollments: Enrollment[]
}

export function EnrollmentFormModal({ open, onClose, enrollments }: EnrollmentFormModalProps) {
  const { user } = useAuth()
  const studentUser = isStudent(user)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enroll"
      description={studentUser ? 'Join a new course at your branch.' : 'Enroll a student into a course.'}
    >
      {studentUser ? (
        <StudentEnrollForm onClose={onClose} enrollments={enrollments} />
      ) : (
        <StaffEnrollForm onClose={onClose} />
      )}
    </Modal>
  )
}

const studentFormSchema = z.object({
  course: z.string().min(1, 'Select a course'),
  batchTiming: z.string().optional(),
})
type StudentFormValues = z.infer<typeof studentFormSchema>

function StudentEnrollForm({ onClose, enrollments }: { onClose: () => void; enrollments: Enrollment[] }) {
  const { user } = useAuth()
  const student = isStudent(user) ? user : null
  const createEnrollment = useCreateEnrollment()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({ resolver: zodResolver(studentFormSchema) })

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', { category: null }],
    queryFn: () => coursesApi.list(),
  })

  const activeEnrolledCourseIds = new Set(
    enrollments.filter((enrollment) => enrollment.status === 'ACTIVE').map((enrollment) => refId(enrollment.course)),
  )

  const availableCourses = (courses ?? []).filter((course) => course.isActive && !activeEnrolledCourseIds.has(course._id))
  const courseOptions = availableCourses.map((course) => ({ value: course._id, label: course.name }))

  async function onSubmit(values: StudentFormValues) {
    setFormError(null)
    const branch = refId(student?.branch)
    if (!branch) {
      setFormError('Your account has no registered branch — contact your branch admin.')
      return
    }
    try {
      await createEnrollment.mutateAsync({
        course: values.course,
        branch,
        batchTiming: values.batchTiming || undefined,
      })
      toast.success('Enrolled successfully')
      onClose()
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Could not complete enrollment'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {formError}
        </p>
      )}

      <FormField label="Course" htmlFor="enroll-course" error={errors.course?.message} required>
        <Select
          id="enroll-course"
          options={courseOptions}
          placeholder={coursesLoading ? 'Loading courses…' : 'Select a course'}
          {...register('course')}
        />
      </FormField>
      {!coursesLoading && availableCourses.length === 0 && (
        <p className="text-xs text-slate-400">You're already enrolled in every available course.</p>
      )}

      <FormField
        label="Preferred batch timing"
        htmlFor="enroll-batch-timing"
        error={errors.batchTiming?.message}
        hint="e.g. Mon/Wed/Fri 5–6 PM"
      >
        <Input id="enroll-batch-timing" {...register('batchTiming')} />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting || createEnrollment.isPending} disabled={availableCourses.length === 0}>
          Enroll
        </Button>
      </div>
    </form>
  )
}

const staffFormSchema = z.object({
  branch: z.string().min(1, 'Select a branch'),
  student: z.string().min(1, 'Select a student'),
  course: z.string().min(1, 'Select a course'),
  teacher: z.string().optional(),
  batchTiming: z.string().optional(),
})
type StaffFormValues = z.infer<typeof staffFormSchema>

function StaffEnrollForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const teacher = isTeacher(user) ? user : null
  const superAdmin = isSuperAdmin(user)
  const createEnrollment = useCreateEnrollment()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({ resolver: zodResolver(staffFormSchema) })

  const selectedBranch = watch('branch')

  const { data: allBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.list(),
    enabled: superAdmin,
  })

  const branchOptions = superAdmin
    ? (allBranches ?? []).map((branch) => ({ value: branch._id, label: branch.name }))
    : (teacher?.branches ?? []).map((branch) => ({ value: refId(branch) ?? '', label: refLabel(branch) }))

  useEffect(() => {
    if (!selectedBranch && branchOptions.length === 1) {
      setValue('branch', branchOptions[0].value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchOptions.length])

  const { data: courses } = useQuery({
    queryKey: ['courses', { category: null }],
    queryFn: () => coursesApi.list(),
  })
  const courseOptions = (courses ?? []).filter((course) => course.isActive).map((course) => ({ value: course._id, label: course.name }))

  const { data: branchStudents, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', { branch: selectedBranch || null }],
    queryFn: () => studentsApi.list(selectedBranch),
    enabled: !!selectedBranch,
  })
  const studentOptions = (branchStudents ?? []).map((s) => ({ value: s._id, label: `${s.name} (${s.email})` }))

  const { data: branchTeachers } = useQuery({
    queryKey: ['teachers', { branch: selectedBranch || null }],
    queryFn: () => teachersApi.list(selectedBranch),
    enabled: !!selectedBranch,
  })
  const teacherOptions = (branchTeachers ?? []).map((t) => ({ value: t._id, label: t.name }))

  async function onSubmit(values: StaffFormValues) {
    setFormError(null)
    try {
      await createEnrollment.mutateAsync({
        student: values.student,
        course: values.course,
        branch: values.branch,
        teacher: values.teacher || undefined,
        batchTiming: values.batchTiming || undefined,
      })
      toast.success('Student enrolled')
      onClose()
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Could not create the enrollment'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {formError}
        </p>
      )}

      <FormField label="Branch" htmlFor="enroll-branch" error={errors.branch?.message} required>
        <Select id="enroll-branch" options={branchOptions} placeholder="Select branch" {...register('branch')} />
      </FormField>

      <FormField
        label="Student"
        htmlFor="enroll-student"
        error={errors.student?.message}
        required
        hint={!selectedBranch ? 'Select a branch first' : undefined}
      >
        <Select
          id="enroll-student"
          options={studentOptions}
          placeholder={studentsLoading ? 'Loading…' : 'Select student'}
          disabled={!selectedBranch}
          {...register('student')}
        />
      </FormField>

      <FormField label="Course" htmlFor="enroll-course" error={errors.course?.message} required>
        <Select id="enroll-course" options={courseOptions} placeholder="Select course" {...register('course')} />
      </FormField>

      <FormField label="Teacher" htmlFor="enroll-teacher" error={errors.teacher?.message} hint="Optional batch instructor">
        <Select
          id="enroll-teacher"
          options={teacherOptions}
          placeholder={!selectedBranch ? 'Select a branch first' : 'Unassigned'}
          disabled={!selectedBranch}
          {...register('teacher')}
        />
      </FormField>

      <FormField label="Batch timing" htmlFor="enroll-batch-timing" error={errors.batchTiming?.message}>
        <Input id="enroll-batch-timing" placeholder="e.g. Mon/Wed/Fri 5–6 PM" {...register('batchTiming')} />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting || createEnrollment.isPending}>
          Enroll student
        </Button>
      </div>
    </form>
  )
}
