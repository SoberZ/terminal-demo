import { twMerge } from 'tailwind-merge'

const Input = ({
  id,
  title,
  register,
  placeholder,
  inputNumber,
  inputString,
  inputDecimal,
  min,
  max,
  optional,
  className,
  tooltip,
  ...props
}) => {
  // Determine regex for input type
  const pattern = () => {
    if (inputString) return '/[a-zA-Z0-9]+$/'
    else if (inputNumber) return '/[0-9]+$/'
    else if (inputDecimal) return 'd+(.d+)?'
  }

  const params = () => {
    if (inputString) return { inputMode: 'text' }
    else if (inputNumber) return { inputMode: 'numeric' }
    else if (inputDecimal) return { inputMode: 'decimal' }
  }

  return (
    <label
      className={`inputTooltip relative block rounded-md border border-gray-200 shadow transition-all focus-within:border-autowhale-blue focus-within:ring-1 focus-within:ring-autowhale-blue focus-within:ring-opacity-40 hover:border-autowhale-blue dark:focus-within:border-blue-600 dark:focus-within:ring-blue-600 dark:focus-within:ring-opacity-60 dark:hover:border-blue-600 ${className}}`}>
      <input
        inputMode={params}
        type={inputDecimal || inputNumber ? 'number' : 'text'}
        data-pr-tooltip={`${placeholder} ${tooltip ? `(${tooltip})` : ''}`}
        data-pr-position="top"
        data-pr-my="center bottom-10"
        step={inputDecimal ? 'any' : null}
        placeholder={placeholder}
        className="inputTooltip peer w-full border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0"
        required={!optional}
        min={min}
        max={max}
        {...props}
        {...register(id, {
          required: !optional,
          pattern: {
            value: pattern(),
            message: `Invalid ${title}`,
          },
          valueAsNumber: inputNumber || inputDecimal,
        })}
      />

      <span className="inputTooltip pointer-events-none absolute left-2.5 top-0 -translate-y-1/2 bg-color-secondary p-0.5 text-xs transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
        {title} {tooltip ? '%' : ''}
        {!optional ? <span className="text-red-600">*</span> : ''}
      </span>
    </label>
  )
}

export default Input
