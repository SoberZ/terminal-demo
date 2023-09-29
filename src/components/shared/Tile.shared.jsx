import { SpotlightCard } from './Spotlight.shared'
import { useNavigate } from 'react-router-dom'
import { commaSeparator } from '../../utils/misc'
import { useWindowSize } from '../../hooks'

const Tile = ({ data, title, description, fontSize, dashboard, redirect }) => {
  const navigate = useNavigate()
  const { width } = useWindowSize()
  return dashboard ? (
    width > 768 ? (
      <SpotlightCard className="rounded-lg shadow-md dark:shadow-soft-xl ">
        <div
          className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-color-secondary"
          onClick={() => navigate(redirect)}>
          <div
            className={`flex !h-[inherit] flex-col items-center justify-center rounded-[inherit] border border-gray-50 bg-white p-5 shadow-soft-xl dark:border-neutral-800 ${
              redirect && 'hover:cursor-pointer'
            } ${dashboard ? 'dark:bg-dark-2nd' : 'dark:bg-[#111111]'} `}>
            <h1
              className={`text-center font-bold ${
                fontSize ?? 'text-xl md:text-3xl'
              } text-primary mb-1 break-words dark:text-white md:mb-3 `}>
              {data ? commaSeparator(data) : data ?? 0}
            </h1>
            <h2 className="break-all text-center text-xs font-semibold text-color-secondary md:text-sm">
              {title}
            </h2>
            <p className="break-all text-xs font-light text-color-tertiary md:text-sm">
              {description}
            </p>
          </div>
        </div>
      </SpotlightCard>
    ) : (
      <div
        onClick={() => navigate(redirect)}
        className={`flex h-full flex-col items-center justify-center rounded-lg border border-gray-50 bg-color-secondary p-5 shadow-md  dark:border-neutral-800 dark:shadow-soft-xl ${
          redirect && 'hover:cursor-pointer'
        } ${dashboard ? 'dark:bg-dark-2nd' : 'dark:bg-[#111111]'} `}>
        <h1
          className={`text-center font-bold ${
            fontSize ?? 'text-xl md:text-3xl'
          } text-primary mb-1 break-all dark:text-white md:mb-3`}>
          {data ? commaSeparator(data) : data ?? 0}
        </h1>
        <h2 className="break-all text-center text-xs font-semibold text-color-secondary md:text-sm">
          {title}
        </h2>
        <p className="break-all text-xs font-light text-color-tertiary md:text-sm">
          {description}
        </p>
      </div>
    )
  ) : (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-gray-50 bg-white p-5 shadow-soft-xl dark:border-neutral-800 dark:bg-[#111111] `}>
      <h1
        className={`text-center font-bold ${
          fontSize ?? 'text-xl md:text-3xl'
        } text-primary mb-1 break-all dark:text-white md:mb-3 md:break-normal md:break-words`}>
        {data ? commaSeparator(data) : data ?? 0}
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
