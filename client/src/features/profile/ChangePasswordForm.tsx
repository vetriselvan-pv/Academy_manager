import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { getApiErrorMessage } from '@/lib/apiClient'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) })

  async function onSubmit(values: PasswordFormValues) {
    try {
      await authApi.changePassword(values)
      toast.success('Password updated')
      reset()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update your password'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Current password" htmlFor="currentPassword" error={errors.currentPassword?.message} required>
        <Input id="currentPassword" type="password" autoComplete="current-password" {...register('currentPassword')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message} required>
          <Input id="newPassword" type="password" autoComplete="new-password" {...register('newPassword')} />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
        </FormField>
      </div>
      <Button type="submit" isLoading={isSubmitting}>
        Update password
      </Button>
    </form>
  )
}
