import React from 'react'
import { FormField, FormLabel, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { Control, FieldValues, Path } from 'react-hook-form'

interface FormInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  type?: string
  disabled?: boolean
  className?: string
  hasIcon?: boolean
  showIcon?: boolean
  onToggleIcon?: () => void
}

function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
  hasIcon = false,
  showIcon = false,
  onToggleIcon,
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`space-y-2 flex flex-col ${className}`}>
          <FormLabel>{label}</FormLabel>
          {hasIcon ? (
            <div className="relative">
              <FormControl>
                <Input type={type} placeholder={placeholder} disabled={disabled} {...field} className="pr-10" />
              </FormControl>
              <button
                type="button"
                onClick={onToggleIcon}
                className="absolute right-3 top-0 bottom-0 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                {showIcon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <FormControl>
              <Input type={type} placeholder={placeholder} disabled={disabled} {...field} />
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default FormInput
