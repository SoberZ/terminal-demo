import { useTime } from '../../hooks'

const TimeDisplay = () => {
  const time = useTime()

  return <p className="px-2 text-xl text-color-secondary">{time}</p>
}

export default TimeDisplay
