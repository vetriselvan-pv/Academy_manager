import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { getApiErrorMessage } from '@/lib/apiClient'
import { AuthLayout } from './AuthLayout'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    try {
      await login(values)
      toast.success('Welcome back!')
      const redirectTo = (location.state as { from?: Location } | null)?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Invalid email or password'))
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Welcome back — enter your credentials to continue."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {formError}
          </p>
        )}

        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" placeholder="you@vivaacademy.com" {...register('email')} />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
        </FormField>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
