/**
 * SelectInput — labelled <select> dropdown.
 *
 * Props:
 *   label       string
 *   options     { value, label }[]
 *   placeholder string  — empty first option (default 'Pilih...')
 *   error       string
 *   hint        string
 *   required    boolean
 *   ...rest     native <select> props
 */
export default function SelectInput({
  label,
  options       = [],
  placeholder   = 'Pilih...',
  error,
  hint,
  required,
  className     = '',
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
      <select
        id={id}
        className={`input ${error ? 'input-error' : ''} cursor-pointer`}
        aria-invalid={!!error}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  )
}
