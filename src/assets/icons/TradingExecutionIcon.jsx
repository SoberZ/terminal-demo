export default function TradingExecutionIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 15 14"
      className={`fill-inherit`}
      {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round">
        <circle cx="2" cy="2" r="1.5"></circle>
        <path d="M3.5 2h10"></path>
        <circle cx="7" cy="7" r="1.5"></circle>
        <path d="M.5 7h5m3 0h5"></path>
        <circle cx="12" cy="12" r="1.5"></circle>
        <path d="M10.5 12H.5"></path>
      </g>
    </svg>
  )
}
