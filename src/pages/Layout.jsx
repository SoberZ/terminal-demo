import { useLayoutEffect, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import {
  ClientProvider,
  Sidebar,
  HamburgerSidebar,
  ThemeToggler,
  CompactSidebar,
} from '../components'

import { useDarkMode, useTime, useKeyPress, useWindowSize } from '../hooks'

const Layout = () => {
  const [darkMode, setDarkMode] = useDarkMode()

  const shiftKey = useKeyPress('Shift')
  const letterDKey = useKeyPress('D')
  const time = useTime()
  const { width } = useWindowSize()

  const location = useLocation()

  useLayoutEffect(() => {
    toast.dismiss()
  }, [location])

  useEffect(() => {
    if (shiftKey && letterDKey) {
      setDarkMode(!darkMode)
    }
  }, [shiftKey, letterDKey])

  const handleToggle = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-dark-1st">
      <ClientProvider />
      <div className="flex bg-gray-50 dark:bg-dark-1st ">
        {(width > 768 && width < 1270) ||
        (width > 1270 && !location.pathname.match(/\/$/)) ? (
          <CompactSidebar themeState={darkMode} />
        ) : width >= 1270 ? (
          <Sidebar themeState={darkMode} />
        ) : null}

        <div
          className={`w-screen px-2 md:py-5 md:px-5 h-screen overflow-y-scroll`}>
          <div
            className={`flex my-5 px-2 justify-between items-center md:my-0 ${
              width > 768 ? 'md:justify-end' : ''
            }`}>
            <div>
              {width <= 768 ? <HamburgerSidebar themeState={darkMode} /> : null}
            </div>

            {width > 768 ? (
              <p className="px-2 text-xl text-color-secondary">{time}</p>
            ) : null}
            <ThemeToggler checked={darkMode} onChange={handleToggle} />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
