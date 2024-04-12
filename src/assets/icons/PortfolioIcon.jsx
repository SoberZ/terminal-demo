export default function PortfolioIcon(props) {
  return (
    <svg
      className={`fill-inherit`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2">
        <path
          strokeDasharray="16"
          strokeDashoffset="16"
          d="M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7"
          opacity="0">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.7s"
            dur="0.2s"
            values="16;32"></animate>
          <set attributeName="opacity" begin="0.7s" to="1"></set>
        </path>
        <path
          strokeDasharray="64"
          strokeDashoffset="64"
          d="M9 7H20C20.5523 7 21 7.44772 21 8V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V8C3 7.44772 3.44772 7 4 7z">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.6s"
            values="64;0"></animate>
        </path>
      </g>
    </svg>
  )
}
