import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { branchesApi } from '@/api/branches.api'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/apiClient'
import { AuthLayout } from './AuthLayout'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  branch: z.string().min(1, 'Select your branch'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.literal('')),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterStudentPage() {
  const { registerStudent } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches', 'public'],
    queryFn: () => branchesApi.list(),
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null)
    try {
      await registerStudent({
        ...values,
        gender: values.gender === '' ? undefined : values.gender,
      })
      toast.success('Account created — welcome to Viva Academy!')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      if (fieldErrors) {
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (messages?.[0] && field in registerSchema.shape) {
            setError(field as keyof RegisterFormValues, { message: messages[0] })
          }
        }
      }
      setFormError(getApiErrorMessage(error, 'Could not create your account'))
    }
  }

  const activeBranches = (branches ?? []).filter((branch) => branch.isActive)

  return (
    <AuthLayout
      title="Create your student account"
      description="Join Viva Academy to browse and enroll in courses."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {formError}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="name" error={errors.name?.message} required>
            <Input id="name" autoComplete="name" {...register('name')} />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" autoComplete="tel" {...register('phone')} />
          </FormField>
        </div>

        <FormField label="Branch" htmlFor="branch" error={errors.branch?.message} required>
          <Select
            id="branch"
            placeholder={branchesLoading ? 'Loading branches…' : 'Select a branch'}
            disabled={branchesLoading}
            options={activeBranches.map((branch) => ({ value: branch._id, label: `${branch.name} — ${branch.city}` }))}
            {...register('branch')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date of birth" htmlFor="dateOfBirth" error={errors.dateOfBirth?.message}>
            <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
          </FormField>
          <FormField label="Gender" htmlFor="gender" error={errors.gender?.message}>
            <Select
              id="gender"
              placeholder="Prefer not to say"
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
              {...register('gender')}
            />
          </FormField>
        </div>

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

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
