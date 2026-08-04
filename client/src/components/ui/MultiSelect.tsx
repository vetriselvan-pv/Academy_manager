import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  id?: string
}

export function MultiSelect({ options, value, onChange, placeholder = 'Select…', disabled, id }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function toggleValue(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const selectedOptions = options.filter((option) => value.includes(option.value))

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex min-h-9.5 w-full flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-left text-sm shadow-xs',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
          disabled && 'cursor-not-allowed bg-slate-50 text-slate-400',
        )}
      >
        {selectedOptions.length === 0 && <span className="text-slate-400">{placeholder}</span>}
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700"
          >
            {option.label}
            <X
              className="size-3 cursor-pointer text-brand-500 hover:text-brand-700"
              onClick={(event) => {
                event.stopPropagation()
                toggleValue(option.value)
              }}
            />
          </span>
        ))}
        <ChevronDown className="ml-auto size-4 shrink-0 text-slate-400" />
      </button>

      {open && !disabled && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {options.length === 0 && <p className="px-3 py-2 text-sm text-slate-400">No options available</p>}
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-100"
                checked={value.includes(option.value)}
                onChange={() => toggleValue(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
