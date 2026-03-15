/**
 * TextInput — labelled text / number / email input field.
 *
 * Props:
 *   label       string
 *   error       string  — error message shown below field
 *   hint        string  — helper text shown below field
 *   required    boolean
 *   ...rest     all native <input> props
 */
export default function TextInput({ label, error, hint, required, className = '', ...rest }) {
  const id = rest.id ?? rest.name ?? label?.toLowerCase().replace(/\s+/g, '_')

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600 mt-0.5">{error}</p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-gray-500 mt-0.5">{hint}</p>
      )}
    </div>
  )
}
