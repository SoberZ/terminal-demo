import { useLayoutEffect, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Joyride, { STATUS } from 'react-joyride'
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

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        content: <h2>Let's begin our journey!</h2>,
        locale: { skip: <strong>SKIP</strong> },
        placement: 'center',
        target: 'body',
      },
      {
        content: <h2>Here is first step!</h2>,
        placement: 'bottom',
        target: '#step-0',
        title: 'First step',
      },
      {
        content: <h2>Here is first step!</h2>,
        placement: 'bottom',
        target: '#step-1',
        title: 'First step',
      },
      {
        content: <h2>Here is first step!</h2>,
        placement: 'bottom',
        target: '#step-2',
        title: 'First step',
      },
      {
        content: <h2>Here is first step!</h2>,
        placement: 'bottom',
        target: '#step-3',
        title: 'First step',
      },
    ],
  })

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
  const handleJoyrideCallback = (data) => {
    const { status } = data
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setState((prev) => ({ ...prev, run: false }))
    }
  }
  return (
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        // disableOverlay={true}
        styles={{
          options: {
            overlayHeight: `100vh`,
            zIndex: 10000,
          },
        }}
        // styles={{ overlay: { height: '100%' } }}
      />
      <div className="w-full bg-gray-50  dark:bg-dark-1st">
        <ClientProvider />

        <div className="flex bg-gray-50 dark:bg-dark-1st ">
          {(width > 768 && width < 1270) ||
          (width > 1270 && !location.pathname.match(/\/$/)) ? (
            <CompactSidebar themeState={darkMode} setter={setState} />
          ) : width >= 1270 ? (
            <Sidebar themeState={darkMode} setter={setState} />
          ) : null}

          <div
            className={`h-screen w-screen overflow-y-scroll px-2 md:py-5 md:px-5`}>
            <div
              className={`my-5 flex items-center justify-between px-2 md:my-0 ${
                width > 768 ? 'md:justify-end' : ''
              }`}>
              <div>
                {width <= 768 ? (
                  <HamburgerSidebar themeState={darkMode} />
                ) : null}
              </div>

              {width > 768 ? (
                <p className="px-2 text-xl text-color-secondary">{time}</p>
              ) : null}
              <ThemeToggler checked={darkMode} onChange={handleToggle} />
            </div>
            <Outlet />
          </div>
        </div>
      </div>{' '}
    </>
  )
}

export default Layout
