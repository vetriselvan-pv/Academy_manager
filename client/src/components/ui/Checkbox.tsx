import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, id, ...props }, ref) => {
  const input = (
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className={cn(
        'size-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-100 focus:ring-offset-0',
        className,
      )}
      {...props}
    />
  )

  if (!label) return input

  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 text-sm text-slate-700">
      {input}
      {label}
    </label>
  )
})
Checkbox.displayName = 'Checkbox'
