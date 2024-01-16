import { twMerge } from 'tailwind-merge'

const TerminalButton = ({ text, children, red, className, ...props }) => {
  return (
    <button
      {...props}
      className={twMerge(
        `btn-primary dark:btn-primary-dark w-52 rounded-lg p-3 font-medium text-white shadow-soft-xl transition duration-200 hover:opacity-95`,
        className
      )}>
      {text && <h1 className="text-sm font-semibold ">{text}</h1>}
      {children}
    </button>
  )
}

export default TerminalButton
