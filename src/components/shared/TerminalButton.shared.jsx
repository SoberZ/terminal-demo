//TODO add twMerge and clsx here to make it more dynamic

const TerminalButton = ({ text, children, red, styles, ...props }) => {
  return (
    <button
      {...props}
      className={`font-medium shadow-soft-xl p-3 rounded-lg w-52 hover:opacity-95 transition duration-200 btn-primary dark:btn-primary-dark ${styles}`}>
      {text && <h1 className="text-sm font-semibold text-white">{text}</h1>}
      {children}
    </button>
  )
}

export default TerminalButton
