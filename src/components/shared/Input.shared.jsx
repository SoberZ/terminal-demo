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
}) => {
  // Determine regex for input type
  const pattern = () => {
    if (inputString) return '/[a-zA-Z0-9]+$/'
    else if (inputNumber) return '/[0-9]+$/'
    else if (inputDecimal) return 'd+(.d+)?'
  }

  return (
    <div className="flex flex-col text-sm">
      <label className="font-semibold">
        {title}
        {!optional ? <span className="text-red-600">*</span> : ''}
      </label>
      <input
        className={`border border-[#757575] text-black dark:bg-color-secondary dark:text-white transition-all p-2 shadow-sm rounded-md hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-autowhale-blue focus:ring-opacity-40  dark:focus:border-blue-300 inputTooltip ${className}`}
        placeholder={placeholder}
        type={inputDecimal || inputNumber ? 'number' : 'text'}
        {...register(id, {
          required: !optional,
          pattern: {
            value: pattern(),
            message: `Invalid ${title}`,
          },
          valueAsNumber: inputNumber || inputDecimal,
        })}
        data-pr-tooltip={tooltip}
        data-pr-position="top"
        data-pr-my="center bottom-10"
        step={inputDecimal ? 'any' : null}
        required={!optional}
        min={min}
        max={max}
      />
    </div>
  )
}

export default Input
