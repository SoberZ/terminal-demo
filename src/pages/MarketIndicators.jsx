import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { fetchExchanges, fetchMarkets } from '../utils/Fetchers/DataFetchers'
import {
  Fallback,
  Loader,
  MarketIndicatorChart,
  Select,
  TerminalButton,
} from '../components'
import { ErrorBoundary } from 'react-error-boundary'

import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'

const MarketIndicators = () => {
  const { watch, control } = useForm()
  const [loading, setLoading] = useState(false)
  const [exchanges, setExchanges] = useState([])
  const [currentExchange, setCurrentExchange] = useState('Binance')
  const [currentMarket, setCurrentMarket] = useState('BTC/USDT')
  const [markets, setMarkets] = useState([])

  useEffect(() => {
    fetchExchanges(setExchanges)
  }, [])

  const watchedMarket = watch('market')
  const watchedExchange = watch('exchange')

  useEffect(() => {
    if (currentExchange !== (undefined || 'Binance')) {
      setLoading(true)
      fetchMarkets(currentExchange, setMarkets)
      setLoading(false)
    }
  }, [currentExchange])

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Market Indicators page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              in this page you can see live data feed from any exchange & market
              combination you choose,
            </h2>
            <h2>
              and you can see the volatility, buys and sells, and trades' Volume
            </h2>
          </div>
        ),
        placement: 'center',
        target: 'body',
        styles: {
          options: {
            width: 450,
          },
        },
      },
    ],
  })

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
        disableOverlay
        disableScrollParentFix
        // spotlightPadding={5}
        // disableOverlayClose
        // spotlightClicks
        styles={{
          options: {
            zIndex: 1000,
            primaryColor: '#4432e2',
            arrowColor: '#fff',
            backgroundColor: '#fff',
            textColor: '#171717',
          },
        }}
        // styles={{ overlay: { height: '100%' } }}
      />
      <div className="space-y-5 rounded-lg bg-color-secondary p-3.5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:p-5">
        <h2 className="text-2xl font-bold text-autowhale-blue dark:text-white">
          Market Indicators
        </h2>
        <p>
          In this page you can see live data feed from BTC/USDT, which you can
          select a new exchange and the market, and new data will be fed through
          the charts
        </p>
        <div className="flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:items-center lg:gap-5">
          <div className="flex gap-2 lg:col-span-2 lg:grid lg:grid-cols-3">
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <Select
                  defaulted={{
                    label: 'binance',
                    value: 'binance',
                  }}
                  label="Exchange"
                  options={exchanges}
                  id="exchange"
                  control={control}
                  useMode
                  setMode={setCurrentExchange}
                  optional
                />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <Select
                  defaulted={{
                    label: 'BTC/USDT',
                    value: 'BTC/USDT',
                  }}
                  label="Market"
                  options={markets}
                  id="market"
                  control={control}
                  useMode
                  setMode={setCurrentMarket}
                  optional
                />
              </Suspense>
            </ErrorBoundary>
          </div>
          <h1 className="pt-1 text-center text-xl font-bold capitalize text-autowhale-blue dark:text-white md:col-span-2 md:pt-0 md:text-3xl lg:text-right">
            {`${currentMarket} - ${currentExchange}`}
          </h1>
        </div>
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-5">
          <div className="flex flex-col gap-2 md:gap-5">
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <MarketIndicatorChart
                  id="Volatility"
                  market={watchedMarket}
                  exchange={watchedExchange}
                  loading={loading}
                />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <MarketIndicatorChart
                  id="Buys and Sells"
                  market={watchedMarket}
                  exchange={watchedExchange}
                  loading={loading}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
          <ErrorBoundary FallbackComponent={Fallback}>
            <Suspense fallback={<Loader />}>
              <MarketIndicatorChart
                id="Trades' Liquidity"
                market={watchedMarket}
                exchange={watchedExchange}
                loading={loading}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
      <div className="fixed bottom-5 right-9 z-20">
        <TerminalButton
          text="Start Tour"
          textSize="text-base"
          onClick={() => {
            setState((prev) => ({ ...prev, run: true }))
          }}
          className="flex !w-auto items-center justify-center gap-2 text-white ">
          <BiInfoCircle size={25} />
        </TerminalButton>
      </div>
    </>
  )
}

export default MarketIndicators
