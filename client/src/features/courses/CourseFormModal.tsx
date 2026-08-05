import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/ui/FormField'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/apiClient'
import type { Course } from '@/types/models'
import { useCreateCourse, useUpdateCourse } from './useCourses'
import { useCourseCategories } from './useCourseCategories'

const courseFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(1, 'Select a category'),
  description: z.string().optional(),
  durationMonths: z.string().optional(),
  fee: z
    .string()
    .min(1, 'Fee is required')
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, 'Fee must be 0 or more'),
  isActive: z.boolean().optional(),
})

type CourseFormValues = z.infer<typeof courseFormSchema>

interface CourseFormModalProps {
  open: boolean
  onClose: () => void
  course?: Course | null
  canEditActiveState?: boolean
}

export function CourseFormModal({ open, onClose, course, canEditActiveState }: CourseFormModalProps) {
  const isEditing = !!course
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()
  const isSaving = createCourse.isPending || updateCourse.isPending

  const { data: categories } = useCourseCategories({ isActive: 'true' })
  const CATEGORY_OPTIONS = (categories ?? []).map((cat) => ({ value: cat._id, label: cat.name }))

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CourseFormValues>({ resolver: zodResolver(courseFormSchema) })

  useEffect(() => {
    if (!open) return
    reset({
      name: course?.name ?? '',
      category: typeof course?.category === 'object' ? course.category._id : (course?.category ?? ''),
      description: course?.description ?? '',
      durationMonths: course?.durationMonths ? String(course.durationMonths) : '',
      fee: course?.fee !== undefined ? String(course.fee) : '',
      isActive: course?.isActive ?? true,
    })
  }, [open, course, reset])

  async function onSubmit(values: CourseFormValues) {
    const payload = {
      name: values.name,
      category: values.category,
      description: values.description || undefined,
      durationMonths: values.durationMonths ? Number(values.durationMonths) : undefined,
      fee: Number(values.fee),
      ...(canEditActiveState ? { isActive: values.isActive } : {}),
    }

    try {
      if (isEditing) {
        await updateCourse.mutateAsync({ id: course._id, payload })
        toast.success('Course updated')
      } else {
        await createCourse.mutateAsync(payload)
        toast.success('Course created')
      }
      onClose()
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      if (fieldErrors) {
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (messages?.[0] && field in courseFormSchema.shape) {
            setError(field as keyof CourseFormValues, { message: messages[0] })
          }
        }
      }
      toast.error(getApiErrorMessage(error, 'Could not save the course'))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit course' : 'Create course'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Name" htmlFor="course-name" error={errors.name?.message} required>
          <Input id="course-name" {...register('name')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Category" htmlFor="course-category" error={errors.category?.message} required>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  id="course-category"
                  options={CATEGORY_OPTIONS}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Select a category..."
                />
              )}
            />
          </FormField>
          <FormField label="Fee (₹)" htmlFor="course-fee" error={errors.fee?.message} required>
            <Input id="course-fee" inputMode="decimal" {...register('fee')} />
          </FormField>
        </div>

        <FormField label="Duration (months)" htmlFor="course-duration" error={errors.durationMonths?.message}>
          <Input id="course-duration" inputMode="numeric" {...register('durationMonths')} />
        </FormField>

        <FormField label="Description" htmlFor="course-description" error={errors.description?.message}>
          <Textarea id="course-description" {...register('description')} />
        </FormField>

        {canEditActiveState && isEditing && (
          <Checkbox id="course-active" label="Active" {...register('isActive')} />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {isEditing ? 'Save changes' : 'Create course'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
