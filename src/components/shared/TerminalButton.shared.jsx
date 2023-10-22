import { twMerge } from 'tailwind-merge'

const TerminalButton = ({
  text,
  children,
  red,
  className,
  textSize = 'text-sm',
  ...props
}) => {
  return (
    <button
      {...props}
      className={twMerge(
        `btn-primary dark:btn-primary-dark w-52 rounded-lg p-3 font-medium shadow-soft-xl transition duration-200 hover:opacity-95`,
        className
      )}>
      {text && (
        <h1 className={`${textSize} font-semibold text-white`}>{text}</h1>
      )}
      {children}
    </button>
  )
}

export default TerminalButton
