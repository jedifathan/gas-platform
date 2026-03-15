/**
 * TextArea — labelled multi-line text input.
 *
 * Props:
 *   label     string
 *   error     string
 *   hint      string
 *   required  boolean
 *   rows      number  (default 4)
 *   maxLength number  — shows character counter when set
 *   ...rest   native <textarea> props
 */
export default function TextArea({
  label,
  error,
  hint,
  required,
  rows      = 4,
  maxLength,
  value = '',
  className = '',
  ...rest
}) {
  const id = rest.id ?? rest.name ?? label?.toLowerCase().replace(/\s+/g, '_')

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={`input resize-none leading-relaxed ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        {...rest}
      />
      <div className="flex justify-between items-start">
        <div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
        {maxLength && (
          <p className={`text-xs ml-auto shrink-0 ${
            value.length >= maxLength ? 'text-red-500' : 'text-gray-400'
          }`}>
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
