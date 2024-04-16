import { useEffect, useState, useLayoutEffect, useRef, Suspense } from 'react'
import { toast } from 'react-hot-toast'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useNavigate } from 'react-router-dom'
import { Tag } from 'primereact/tag'
import { Accordion, AccordionTab } from 'primereact/accordion'
import Joyride, { STATUS } from 'react-joyride'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { ErrorBoundary } from 'react-error-boundary'

// Import FakeData
import Data from '../data/homepageData'

import {
  Tile,
  TerminalButton,
  FundingRatesLineChart,
  AllOrders,
  AllTrades,
  Spotlight,
  Fallback,
  Loader,
  BalancesLineChart,
  TradingViewWidget,
  LiveDashboardChart,
} from '../components'

import { useWindowSize, useDarkMode } from '../hooks'
import { statusColors } from '../utils/statusColors'
import { BiInfoCircle } from 'react-icons/bi'
import { numberFormatting, caseToTitleCase } from '../utils/misc'
import FakeLineChartData from '../data/exchangeChart.json'

const TranslateWrapper = ({ children, reverse }) => {
  return (
    <motion.div
      initial={{ translateX: reverse ? '-100%' : '0%' }}
      animate={{ translateX: reverse ? '0%' : '-100%' }}
      transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
      className="flex gap-5">
      {children}
    </motion.div>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [darkMode] = useDarkMode()
  const [homeData, setHomeData] = useState({
    strategiesRunning: '12',
    totalPnl: '15341 USD',
    realizedPnL: '11828 USD',
    unrealizedPnL: '3513 USD',
    liveExchangeAccounts: '6',
    tradingVolume: '1249823',
    tradesExecuted: '4653',
    ordersPlaced: '34523',
    activeStrategies: [],
    orders: [],
    pnls: [],
    fundingRates: [],
    fundingLabels: [],
  })
  const { width } = useWindowSize()
  const [tokens, setTokens] = useState({})
  const [newsArticles, setNewsArticles] = useState([])
  const [cryptoData, setCryptoData] = useState({})
  const previousDataRef = useRef(null)

  const [lineChartData, setLineChartData] = useState({})
  const [singleChart, setSingleChart] = useState(null)

  const getSeverity = (input) => {
    switch (input) {
      case 'active':
        return statusColors.active
      case 'paused':
        return statusColors.paused
      case 'new':
        return statusColors.new
      case 'stop':
        return statusColors.stop
      case 'paused_err':
        return statusColors.pausedErr
      case 'starting':
        return statusColors.starting
      case 'pausing':
        return statusColors.pausing
      default:
        return 'MidnightBlue'
    }
  }
  // https://api.autowhale.net/data/market-data/get-fundingrates-for-pair?pair=BTC/USDT:USDT
  useLayoutEffect(() => {
    toast.dismiss()
  }, [])

  useEffect(() => {
    toast.dismiss()
    setHomeData(Data)
  }, [])
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
              this tour will give you an overview of the features we provide
              <br />
              <span className="font-bold">(with fake data of course)</span>
            </h2>
          </>
        ),
        placement: 'center',
        target: 'body',
      },
      {
        title: <strong>Home Page</strong>,
        content: (
          <h2 className="text-left">
            the Home page here gives you{' '}
            <span className="font-bold">
              an overview of your trading activity,
            </span>
            <br />
            <br />
            <div className="flex flex-col items-center">
              <ul className="list-disc">
                <li>System-wide performance indicators</li>
                <li>Market data</li>
                <li>PnL & Volume</li>
                <li>Exchange accounts</li>
                <li>Trades and orders</li>
              </ul>
            </div>
          </h2>
        ),
        placement: 'center',
        locale: {
          back: (
            <span className="rounded bg-autowhale-blue py-[4.8px] px-2 text-white">
              Back
            </span>
          ),
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
            All Order tables in the system come with{' '}
            <span className="font-bold">
              {' '}
              advanced querying and filtering options with pagination
            </span>{' '}
            to quickly find the order/data you need, and are Mobile friendly
          </h2>
        ),
        placement: 'bottom',
        target: '#step-3',
        styles: {
          options: {
            width: 450,
          },
        },
        locale: {
          back: (
            <span className="rounded bg-autowhale-blue py-[4.8px] px-2 text-white">
              Back
            </span>
          ),
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Cbinancecoin%2Csolana%2Cripple%2Ccardano%2Cpolkadot%2Cavalanche-2%2Cthe-open-network%2Cpolygon%2CLitecoin%2Cchainlink%2Cbitcoin-cash%2Cstellar%2internet-computer&vs_currencies=usd&include_last_updated_at=true',
          {
            headers: {
              'x-cg-demo-api-key': 'CG-KFURhuBDU8yeY2CfEfv9CqN4',
            },
          }
        )
        const data = await response.json()
        setTokens(data)
      } catch (error) {
        // Handle any errors that occur during the fetch
        console.error(error)
      }
    }
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q='crypto'&from=2024-01-16&to=2024-01-16&sortBy=relevancy&pageSize=6&language=en&apiKey=7856bc7132644ff593db348b9ec59074`
        )
        const data = await response.json()
        setNewsArticles(data.articles)
      } catch (error) {
        // Handle any errors that occur during the fetch
        console.error(error)
      }
    }

    fetchData()
    fetchNews()

    setLineChartData(FakeLineChartData)

    const interval = setInterval(() => {
      fetchData()
    }, 60000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (tokens && Object.keys(tokens).length > 0) {
      const newCryptoData = { ...cryptoData }

      for (const key in tokens) {
        if (tokens[key].usd !== null) {
          const currentPrice = tokens[key].usd

          // Compare with previous data
          if (previousDataRef.current && previousDataRef.current[key]) {
            const previousPrice = previousDataRef.current[key].usd
            let textColor =
              currentPrice === previousPrice
                ? 'text-color-secondary dark:text-white'
                : currentPrice > previousPrice
                ? 'text-green-600'
                : 'text-red-600'

            newCryptoData[key] = { usd: currentPrice, color: textColor }
          } else {
            // If no previous data, just set the current price
            newCryptoData[key] = { usd: currentPrice, color: 'inherit' }
          }
        }
      }

      // Update the current state and the ref to the previous data
      setCryptoData(newCryptoData)
      previousDataRef.current = tokens
    }
  }, [tokens])

  const TokensList = () => (
    <>
      {Object.entries(cryptoData).map(([key, value]) => (
        <h1 key={key} className="flex items-center gap-1">
          <span className={`whitespace-nowrap font-bold`}>
            {caseToTitleCase(key)}:
          </span>
          <span className={`font-light ${value.color}`}>
            ${numberFormatting(value.usd)}
          </span>
        </h1>
      ))}
    </>
  )

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
      <Helmet>
        <title>Main Dashboard</title>
      </Helmet>
      <div className="flex flex-col space-y-6">
        <div id={`step-2`} className="flex flex-col space-y-10">
          {width > 768 ? (
            <Spotlight className="group grid grid-cols-2 gap-6 lg:grid-cols-4 2xl:grid-cols-8">
              <Tile
                dashboard
                data={homeData.strategiesRunning}
                title="Strategies running"
                redirect="/strategies"
              />
              <Tile
                dashboard
                data={homeData.totalPnl}
                title="Total PnL"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.unrealizedPnL}
                title="Unrealized PnL"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.realizedPnL}
                title="Realized PnL"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.liveExchangeAccounts}
                title="Live exchange accounts"
                redirect="/exchanges"
              />
              <Tile
                dashboard
                data={homeData.tradingVolume}
                title="Trading volume"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.tradesExecuted}
                title="Trades executed"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.ordersPlaced}
                title="Orders placed"
                description="Total"
              />
            </Spotlight>
          ) : (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 2xl:grid-cols-8">
              <Tile
                dashboard
                data={homeData.strategiesRunning}
                title="Strategies running"
                redirect="/strategies"
              />
              <Tile
                dashboard
                data={homeData.totalPnl}
                title="Total PnL"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.unrealizedPnL}
                title="Unrealized PnL"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.realizedPnL}
                title="Realized PnL"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.liveExchangeAccounts}
                title="Live exchange accounts"
                redirect="/exchanges"
              />
              <Tile
                dashboard
                data={homeData.tradingVolume}
                title="Trading volume"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.tradesExecuted}
                title="Trades executed"
                description="Total"
              />
              <Tile
                dashboard
                data={homeData.ordersPlaced}
                title="Orders placed"
                description="Total"
              />
            </div>
          )}
        </div>
        <div className="rounded-lg bg-color-secondary p-5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800">
          {/* <marquee behavior="slide" direction="left">
            hello
          </marquee> */}
          <div className="flex gap-5 overflow-hidden text-color-secondary dark:text-white">
            <TranslateWrapper>
              <TokensList />
            </TranslateWrapper>
            <TranslateWrapper>
              <TokensList />
            </TranslateWrapper>
            <TranslateWrapper>
              <TokensList />
            </TranslateWrapper>
          </div>
        </div>

        {/* <div className="grid grid-cols-3 gap-5">
          {newsArticles.map((article, index) => (
            <div
              key={index}
              className="h-full rounded-lg p-5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800">
              <a href={article.url} className="flex flex-col space-y-2">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="h-64 w-full rounded-lg object-cover"
                />

                <div>
                  <h1 className="text-xl font-bold">{article.title}</h1>
                  <p className="text-sm font-light">{article.description}</p>
                </div>
              </a>
            </div>
          ))} 

          {newsArticles?.map((article, index) => (
            <a
              href={article.url}
              target="_blank"
              key={index}
              className="group relative h-64 overflow-hidden rounded-lg border shadow-soft-xl transition-colors ease-in hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 hover:dark:border-neutral-300 ">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="absolute inset-0 h-full w-full object-cover grayscale ease-in-out group-hover:filter-none group-hover:transition-all"
              />
              <div className="absolute inset-0 bg-white bg-opacity-90 group-hover:bg-opacity-80 group-hover:transition-all dark:bg-black dark:bg-opacity-80 dark:group-hover:bg-opacity-50"></div>
              <div className="absolute inset-0 flex items-center justify-start p-5">
                <div className="text-start text-color-secondary dark:text-white">
                  <h1 className="text-xl font-bold drop-shadow-sm">
                    {article.title}
                  </h1>
                  <p className="text-xs text-color-tertiary">
                    {article.source.name}
                    {' - '}
                    <span className="text-xs text-color-tertiary">
                      {new Date(article.publishedAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </span>
                  </p>
                  <p
                    className="line-clamping mt-4 text-sm font-medium text-color-tertiary drop-shadow-sm"
                    title={article.description}>
                    {article.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
        */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-lg bg-color-secondary p-5 pb-48 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:pb-40 md:pb-32 lg:pb-24">
            <div className="h-96">
              <div className="flex flex-row items-center space-x-2">
                <div className="demo__projects">
                  <h6 className="text-secondary text-md font-semibold">
                    Bitcoin Funding Rates
                  </h6>
                </div>
              </div>
              <p className="text-sm font-light">
                Find an example usage of data casher here where funding rates
                for some BTCUSD futures markets are cashed. Per default data
                casher, cashes all markets of strategies and some large markets
                including BTCUSD, ETHUSD, BTCETH, BNBUSD, etc.{' '}
              </p>
              <FundingRatesLineChart
                data={homeData.fundingRates}
                labels={homeData.fundingLabels}
              />
            </div>
          </div>
          <div className="rounded-lg bg-color-secondary text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 ">
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <TradingViewWidget
                  activeExchange={'BINANCE'}
                  activeSymbol={'BTCUSDT'}
                  dashboard
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
        {/* <div className="grid grid-cols-2 gap-5">
          <div className="rounded-lg bg-color-secondary p-5 pb-48 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:pb-40 md:pb-32 lg:pb-24">
            <div className="h-96">
              <div className="flex flex-row items-center space-x-2">
                <div className="demo__projects">
                  <h6 className="text-secondary text-md font-semibold">
                    Bitcoin Funding Rates
                  </h6>
                </div>
              </div>
              <p className="text-sm font-light">
                Find an example usage of data casher here where funding rates
                for some BTCUSD futures markets are cashed. Per default data
                casher, cashes all markets of strategies and some large markets
                including BTCUSD, ETHUSD, BTCETH, BNBUSD, etc.{' '}
              </p>
              <FundingRatesLineChart
                data={homeData.fundingRates}
                labels={homeData.fundingLabels}
              />
            </div>
          </div>
          <div className="rounded-lg bg-color-secondary text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 ">
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <LiveDashboardChart />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-1">
          <div className="space-y-7 rounded-lg bg-color-secondary p-5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800">
            <div className="">
              <h6 className="text-md font-semibold text-color-secondary">
                Active Strategy Instances
              </h6>
              <p className="text-sm font-light">
                List of active strategies running, find more details on the
                strategies page or by clicking load more
              </p>
            </div>
            {/* //! Active strategies has a limit of 15 instances, collapsible when more than 10 and in mobile view */}
            {homeData.activeStrategies.length > 10 || width < 768 ? (
              <Accordion>
                <AccordionTab>
                  <DataTable
                    value={homeData.activeStrategies}
                    sortField="active_status"
                    sortOrder={1}
                    breakpoint="0"
                    scrollable
                    onRowClick={(e) => {
                      navigate(`/strategies/${e.data.strategy_id}`)
                    }}
                    className="text-[0.75rem]">
                    <Column
                      header="#"
                      body={(data, options) => options.rowIndex + 1}
                      frozen
                      className="max-w-[0.5rem] md:min-w-[2rem] md:max-w-[3rem]"
                    />
                    <Column
                      field="strategy_id"
                      header="ID"
                      frozen
                      className="min-w-[8rem] break-all shadow-[5px_0px_5px_#00000022] md:min-w-[15rem] lg:min-w-[18rem] xl:shadow-none"
                    />
                    <Column
                      field="exchange"
                      header="Exchange"
                      className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
                    />
                    <Column
                      field="market"
                      header="Market"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                    />
                    <Column
                      sortable
                      field="active_status"
                      header="Status"
                      body={(account) => (
                        <Tag
                          value={account.active_status}
                          style={{
                            backgroundColor: getSeverity(account.active_status),
                          }}
                          className="text-md"
                        />
                      )}
                      className="min-w-[8rem] lg:min-w-[10rem]"
                    />
                  </DataTable>
                </AccordionTab>
              </Accordion>
            ) : (
              <DataTable
                value={homeData.activeStrategies}
                sortField="active_status"
                sortOrder={1}
                breakpoint="0"
                scrollable
                onRowClick={(e) => {
                  navigate(`/strategies/${e.data.strategy_id}`)
                }}
                className="text-[0.75rem]">
                <Column
                  header="#"
                  body={(data, options) => options.rowIndex + 1}
                  frozen
                  className="max-w-[0.5rem] md:min-w-[2rem] md:max-w-[3rem]"
                />
                <Column
                  field="strategy_id"
                  header="ID"
                  frozen
                  className="min-w-[8rem] break-all shadow-[5px_0px_5px_#00000022] md:min-w-[15rem] lg:min-w-[18rem] xl:shadow-none"
                />
                <Column
                  field="exchange"
                  header="Exchange"
                  className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
                />
                <Column
                  field="market"
                  header="Market"
                  className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                />
                <Column
                  sortable
                  field="active_status"
                  header="Status"
                  body={(account) => (
                    <Tag
                      value={account.active_status}
                      style={{
                        backgroundColor: getSeverity(account.active_status),
                      }}
                      className="text-md"
                    />
                  )}
                  className="min-w-[8rem] lg:min-w-[10rem]"
                />
              </DataTable>
            )}

            <TerminalButton
              text={'Load more'}
              styles="w-28"
              onClick={() => navigate(`/strategies`)}
            />
          </div>
        </div>

        <div
          id={`step-3`}
          className="space-y-5 rounded-lg bg-color-secondary p-5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800">
          <h1>Recent orders</h1>
          <p className="text-sm font-light">
            List of orders of all strategies where you can sort them by
            attribute.
          </p>
          <AllOrders totalRecords={0} />
        </div>

        <div className="space-y-5 rounded-lg bg-color-secondary p-5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800">
          <h1>Recent trades</h1>
          <p className="text-sm font-light">
            List of trades of all strategies where you can sort them by
            attribute.
          </p>
          <AllTrades totalRecords={0} />
        </div>
      </div>
      <div className="fixed bottom-5 left-5 z-20">
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

export default Dashboard
