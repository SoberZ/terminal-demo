import { SpotlightCard } from './Spotlight.shared'
import { useNavigate } from 'react-router-dom'
import { commaSeparator } from '../../utils/misc'
import { useWindowSize } from '../../hooks'
import { twMerge } from 'tailwind-merge'

const Tile = ({
  data,
  title,
  description,
  fontSize,
  dashboard,
  redirect,
  className,
  ...props
}) => {
  const navigate = useNavigate()
  const { width } = useWindowSize()

  return dashboard ? (
    width > 768 ? (
      <SpotlightCard
        className="rounded-lg shadow-md dark:shadow-soft-xl "
        {...props}>
        <div
          className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-color-secondary"
          onClick={() => navigate(redirect)}>
          <div
            className={`flex !h-[inherit] flex-col items-center justify-center rounded-[inherit] border border-gray-50 bg-white p-5 shadow-soft-xl dark:border-neutral-800 ${
              redirect && 'hover:cursor-pointer'
            } ${dashboard ? 'dark:bg-dark-2nd' : 'dark:bg-[#111111]'} `}>
            <h1
              className={`text-center font-bold ${
                fontSize ?? 'text-base md:text-xl'
              } text-primary break-anywhere mb-1 dark:text-white md:mb-3 `}>
              {data ? commaSeparator(data) : data ?? 0}
            </h1>
            <h2 className="break-anywhere text-center text-xs font-semibold text-color-secondary md:text-sm">
              {title}
            </h2>
            <p className="break-anywhere text-xs font-light text-color-tertiary md:text-sm">
              {description}
            </p>
          </div>
        </div>
      </SpotlightCard>
    ) : (
      <div
        {...props}
        onClick={() => navigate(redirect)}
        className={`flex flex-col items-center justify-center rounded-lg border border-gray-50 bg-color-secondary p-5 shadow-md dark:border-neutral-800 dark:shadow-soft-xl ${
          redirect && 'hover:cursor-pointer'
        } ${dashboard ? 'dark:bg-dark-2nd' : 'dark:bg-[#111111]'} `}>
        <h1
          className={`text-center font-bold ${
            fontSize ?? 'text-base md:text-2xl'
          } text-primary break-anywhere mb-1 dark:text-white md:mb-3`}>
          {data ? commaSeparator(data) : data ?? 0}
        </h1>
        <h2 className="break-anywhere text-center text-xs font-semibold text-color-secondary md:text-sm">
          {title}
        </h2>
        <p className="break-anywhere text-xs font-light text-color-tertiary md:text-sm">
          {description}
        </p>
      </div>
    )
  ) : (
    <div
      {...props}
      className={twMerge(
        `flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-color-secondary p-5 shadow-sm transition-all ease-in dark:border-neutral-700 dark:bg-color-primary`,
        className
      )}>
      <h1
        className={`text-center font-bold ${
          fontSize ?? 'text-base md:text-2xl'
        } text-primary break-anywhere mb-1 dark:text-white md:mb-3 `}>
        {data && title !== 'Last traded price'
          ? commaSeparator(data)
          : data ?? 0}
      </h1>
      <h2 className="break-words text-center text-xs font-semibold text-color-secondary md:text-sm">
        {title}
      </h2>
      <p className="break-words text-xs font-light text-color-tertiary md:text-sm">
        {description}
      </p>
    </div>
  )
}

export default Tile
