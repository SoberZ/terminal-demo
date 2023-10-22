import { useLayoutEffect, useEffect, useState, useRef } from 'react'
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
        title: <strong>Autowhale's Terminal Tour</strong>,
        content: (
          <>
            <h2>
              this is your interface to control, interact and monitor the
              trading engine.
            </h2>
            <br />
            <h2>
              {' '}
              this tour will give you an overview of the features we provide
              (with fake data of course)
            </h2>
          </>
        ),
        locale: { skip: <strong>SKIP</strong> },
        placement: 'center',
        target: 'body',
      },
      {
        title: <strong>Home Page</strong>,
        content: (
          <h2>
            the Home page here gives you an overview of your trading activity,
            system-wide performance indicators, market data, PnL, accounts,
            volume, trades and orders.
          </h2>
        ),
        placement: 'center',
        styles: {
          options: {
            width: 450,
          },
        },
        target: 'body',
      },
      {
        title: <strong>Widgets</strong>,
        target: '#step-2',
        content: (
          <h2>
            These contain general info about your whole trading activity at a
            glance
          </h2>
        ),
        locale: {
          back: (
            <span className="rounded bg-autowhale-blue py-[4.8px] px-2 text-white">
              Back
            </span>
          ),
        },
        placement: 'bottom',
      },
      {
        title: <strong>Recent Orders & Trades</strong>,
        content: (
          <h2>
            All Order tables in the system come with advanced querying and
            filtering options with pagination to quickly find the order/data you
            need, and are Mobile friendly
          </h2>
        ),
        placement: 'bottom',
        target: '#step-3',
        styles: {
          options: {
            width: 450,
          },
        },
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
      <div className="w-full bg-gray-50  dark:bg-dark-1st" id="AllApp">
        <ClientProvider />

        <div className="flex bg-gray-50 dark:bg-dark-1st ">
          {(width > 768 && width < 1270) ||
          (width > 1270 && !location.pathname.match(/\/$/)) ? (
            <CompactSidebar themeState={darkMode} />
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
