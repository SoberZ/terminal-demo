import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { fetchExchanges, fetchMarkets } from '../utils/Fetchers/DataFetchers'
import { Fallback, Loader, MarketIndicatorChart, Select } from '../components'
import { ErrorBoundary } from 'react-error-boundary'

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

  return (
    <div className="space-y-5 rounded-lg bg-color-secondary p-3.5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:p-5">
      <h2 className="text-2xl font-bold text-autowhale-blue dark:text-white">
        Market Indicators
      </h2>
      <p>
        In this page you can see live data feed from BTC/USDT, which you can
        select a new exchange and the market, and new data will be fed through
        the charts
      </p>
      <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:items-center md:gap-5">
        <ErrorBoundary FallbackComponent={Fallback}>
          <Suspense fallback={<Loader />}>
            <Select
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
        <h1 className="pt-1 text-center text-xl font-bold text-autowhale-blue dark:text-white md:col-span-2 md:pt-0 md:text-right md:text-3xl">
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
  )
}

export default MarketIndicators
