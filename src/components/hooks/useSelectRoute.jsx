import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useSelectRoute(setVisible) {
  const [selected, setSelected] = useState(0)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.match(/strategies.*/g)) {
      setSelected(2)
    } else if (location.pathname.match(/performance-metrics-dashboard.*/g)) {
      setSelected(3)
    } else if (location.pathname.match(/market-indicators.*/g)) {
      setSelected(4)
    } else if (location.pathname.match(/exchanges.*/g)) {
      setSelected(5)
    } else if (location.pathname.match(/cachers.*/g)) {
      setSelected(6)
    } else if (location.pathname.match(/users.*/g)) {
      setSelected(7)
    } else {
      setSelected(1)
    }
    if (setVisible) setVisible(false)
  }, [location])

  return [selected, setSelected]
}
