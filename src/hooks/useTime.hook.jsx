import { useEffect, useState } from 'react'

const useTime = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const intervalID = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => {
      clearInterval(intervalID)
    }
  }, [])

  const formattedTime = time.toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return formattedTime
}
export default useTime
