import TDwidget from 'react-tradingview-widget'
import { useEffect, useState } from 'react'
import { useDarkMode, useWindowSize } from '../../hooks'

function TradingViewWidget({ activeSymbol, activeExchange }) {
  const [darkModeState] = useDarkMode()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const { width } = useWindowSize()

  const dark = darkMode ? 'Dark' : 'Light'
  const darkBg = darkMode ? '#171717' : '#FFFFFF'

  useEffect(() => {
    function checkDarkModeStatus() {
      const darkModeStatus = window.localStorage.getItem('dark-mode-enabled')
      if (darkModeStatus === 'true') {
        setDarkMode(true)
      } else {
        setDarkMode(false)
      }
    }
    window.addEventListener('storage', checkDarkModeStatus)

    return () => {
      window.removeEventListener('storage', checkDarkModeStatus)
    }
  }, [])

  const constructedSymbol = `${activeExchange?.toUpperCase()}:${activeSymbol?.replace(
    '/',
    ''
  )}`

  return (
    <TDwidget
      symbol={constructedSymbol}
      height={width > 1024 ? 750 : 420}
      width="100%"
      interval="D"
      timezone="etc/UTC"
      theme={dark}
      hide_top_toolbar={true}
      // hide_side_toolbar={false}
      backgroundColor={darkBg}
    />
  )
}

export default TradingViewWidget
