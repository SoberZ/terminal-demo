import TDwidget from 'react-tradingview-widget'
import { useEffect, useState } from 'react'
import { useDarkMode, useWindowSize } from '../../hooks'

function TradingViewWidget({ activeSymbol, activeExchange, dashboard }) {
  const [darkModeState] = useDarkMode()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const { width } = useWindowSize()

  const dark = darkMode ? 'Dark' : 'Light'
  const darkBg =
    dashboard && darkMode ? '#1D1D1D' : darkMode ? '#171717' : '#FFFFFF'

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
  const heightTV = dashboard ? 502 : width > 1024 ? 750 : 420
  return (
    <TDwidget
      symbol={constructedSymbol}
      height={heightTV}
      width="100%"
      interval="D"
      timezone="etc/UTC"
      theme={dark}
      hide_top_toolbar={true}
      style={dashboard ? '2' : '1'}
      hide_volume={dashboard ? true : false}
      // gridColor={dashboard && 'rgba(240, 243, 250, 0)'}
      // hide_side_toolbar={false}
      backgroundColor={darkBg}
    />
  )
}

export default TradingViewWidget
