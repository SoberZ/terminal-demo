import { Suspense, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useForm, Controller } from 'react-hook-form'
import { useWindowSize } from '../hooks/'
import {
  Fallback,
  Loader,
  TradingViewWidget,
  TerminalButton,
  BalancePieChart,
  PreviewChart,
} from '../components'
import { toast } from 'react-hot-toast'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { DataTable } from 'primereact/datatable'
import { ErrorBoundary } from 'react-error-boundary'
import { Column } from 'primereact/column'
import { Badge } from 'primereact/badge'
import { TabView, TabPanel } from 'primereact/tabview'
import {
  isObjectEmpty,
  numberFormatting,
  snakeCaseToTitleCase,
} from '../utils/misc'
import { Slider } from 'primereact/slider'
import { Tag } from 'primereact/tag'

import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'

import ExchangesJson from '../data/exchanges.json'
import FakePieChartData from '../data/exchangePiechart.json'
import FakePortfolioChartData from '../data/portfolio/piechartsPortfolio.json'
import FakePortfolioChartsData from '../data/portfolio/individualPiechartsPortfolio.json'
import FakeFreeBalanceData from '../data/portfolio/freeBalance.json'
import { fetchMarkets } from '../utils/Fetchers/DataFetchers'
import ChartData from '../data/strategyData/charts.json'

import {
  avgFillPriceBodyTemplate,
  equalsFilterOptions,
  numericFilterOptions,
  orderSidesFilterTemplate,
  orderStatusFilterTemplate,
  orderTypesFilterTemplate,
  stopLossBodyTemplate,
  stringFilterOptions,
  priceBodyTemplate,
  quantityFilledBodyTemplate,
  dateFilterOptions,
  costBodyTemplate,
  dateFilterTemplate,
  rowsPerPageOptions,
  HeaderTemplate,
  getSeverity,
} from './addons/PortfolioAddons'
import { Calendar } from 'primereact/calendar'

const Portfolio = () => {
  const { width } = useWindowSize()
  const {
    handleSubmit,
    control,
    watch,
    resetField,
    trigger,
    setValue,
    formState: { isValid, isDirty },
  } = useForm({
    defaultValues: {
      exchange_account_id: '',
      symbol: 'BTC/USDT',
      type: 'Limit',
      amount: 0,
      total: 0,
      step_amount: '',
      price: '',
      stop_loss_price: '',
      take_profit_price: '',
      days: 0,
      hours: 0,
      minutes: 0,
    },
  })
  const [accessibleExchangeAccounts, setAccessibleExchangeAccounts] = useState(
    []
  )
  const [activeExchangeAccount, setActiveExchangeAccount] = useState('')
  const [activeType, setActiveType] = useState('Simple')
  const [headerBadge, setHeaderBadge] = useState({
    open: 3,
    closed: 0,
  })

  const [pieChartData, setPieChartData] = useState({})
  const [markets, setMarkets] = useState([])
  const [buyActive, setBuyActive] = useState(true)

  const watchedPrice = watch('price')
  const watchedSymbol = watch('symbol')
  const watchedAmount = watch('amount')
  const watchedTotal = watch('total')
  const watchedType = watch('type')
  const watchedStepAmount = watch('step_amount')
  const watchedDays = watch('days')
  const watchedHours = watch('hours')
  const watchedMinutes = watch('minutes')
  const watchedAll = watch()

  const submitHandler = (submittedData) => {
    //? what if not all exchanges have the symbol ? does it partially create them ?
    const exchangeAccountList =
      activeExchangeAccount !== 'all'
        ? activeExchangeAccount
        : accessibleExchangeNames
    const {
      days,
      hours,
      minutes,
      start_time,
      total,
      end_time,
      price_limit,
      ...restData
    } = submittedData

    const processedData = {
      ...restData,
      side: buyActive ? 'buy' : 'sell',
      step_amount: {
        day: submittedData.days,
        hour: submittedData.hours,
        minute: submittedData.minutes,
      },
      type: submittedData.type.toLowerCase(),
      execute_at: new Date(submittedData.start_time).toISOString(),
      exchange_account_id: exchangeAccountList,
      amount: submittedData.amount ? parseFloat(submittedData.amount) : 0,
      price: submittedData.price ? parseFloat(submittedData.price) : 0,
      stop_loss_price: submittedData.stop_loss_price
        ? parseFloat(submittedData.stop_loss_price)
        : 0,
      take_profit_price: submittedData.take_profit_price
        ? parseFloat(submittedData.take_profit_price)
        : 0,
    }
    console.log(processedData)
  }

  useEffect(() => {
    setValue('price', '62450')
    setAccessibleExchangeAccounts(ExchangesJson)
  }, [])

  //? this can never return more than one exchange
  const selectedExchange = accessibleExchangeAccounts.filter(
    (exchange) =>
      exchange.exchange_account_id === activeExchangeAccount && exchange
  )[0]?.exchange

  useEffect(() => {
    async function fetchAndCombineBalances() {
      if (!activeExchangeAccount) {
        setActiveExchangeAccount(activeExchangeAccounts[0])
      }
      if (activeExchangeAccount === 'all') {
        try {
          setPieChartData(FakePortfolioChartData)
        } catch (error) {
          console.error('Error fetching balances:', error)
        }
      } else {
        try {
          FakePortfolioChartsData.forEach((data) => {
            if (data.exchange_account_id === activeExchangeAccount) {
              setPieChartData(data)
            }
          })
        } catch (error) {
          console.error('Error fetching balances:', error)
        }
      }
    }

    fetchAndCombineBalances()
  }, [activeExchangeAccount, accessibleExchangeAccounts])

  const accessibleExchangeNames = accessibleExchangeAccounts.map(
    (exchange) => exchange.exchange_account_id
  )

  const activeExchangeAccounts = accessibleExchangeAccounts
    .filter((exchange) => exchange.status === 'running')
    .map((exchange) => exchange.exchange_account_id)

  const activeExchanges = accessibleExchangeAccounts
    .filter((exchange) => exchange.status === 'running')
    .map((exchange) => exchange.exchange)

  useEffect(() => {
    if (selectedExchange !== undefined) {
      fetchMarkets(selectedExchange, setMarkets)
    }
  }, [selectedExchange])

  const freeBalance = FakeFreeBalanceData.filter(
    (data) => data.exchange_account_id === activeExchangeAccount
  ).map((filteredData) => {
    const tradeSymbol = buyActive
      ? watchedSymbol.split('/')[1]
      : watchedSymbol.split('/')[0]

    const idx = filteredData?.labels.findIndex((label) => label === tradeSymbol)

    if (idx === -1) {
      return 0
    } else {
      const result = filteredData.data[idx]
      return result
    }
  })[0]

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Portfolio Page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              you can execute trades in this page
              <span className="font-bold">
                {' '}
                by inputting the correct data.{' '}
              </span>
            </h2>
            <h2>
              you can also see the status of your orders/trades,
              <span className="font-bold">
                {' '}
                and the balances of of all exchange accounts you've connected.{' '}
              </span>
            </h2>
            <span className="font-bold">
              {' '}
              Keep in mind that the selected exchange account is where the order
              will be executed.{' '}
            </span>
          </div>
        ),
        placement: 'center',
        target: 'body',
        styles: {
          options: {
            width: 550,
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

  const orderCount =
    watchedTotal && watchedStepAmount ? watchedTotal / watchedStepAmount : null

  const metricsDataArray = new Array(Math.round(orderCount)).fill(
    watchedStepAmount
  )

  //TODO: Hours and minutes should work just fine
  let today = new Date()
  let minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

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
            primaryColor: '#4133da',
            arrowColor: '#fff',
            backgroundColor: '#fff',
            textColor: '#171717',
          },
        }}
        // styles={{ overlay: { height: '100%' } }}
      />
      <div className="mx-auto max-w-[2200px] space-y-10">
        <Helmet>
          <title>Trading Execution</title>
        </Helmet>
        <div className="flex w-full flex-col gap-2 rounded-lg bg-color-secondary p-2 text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800 md:p-5">
          {/* <p className="text-sm font-light">PORTFOLIO PAGE LESSSGOOOOO</p> */}
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="h-fit  lg:w-1/3 ">
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="flex flex-col gap-2 rounded-lg border bg-color-secondary p-2 dark:border-neutral-800 dark:bg-color-primary md:p-5 ">
                <div className="flex gap-5">
                  <button
                    type="button"
                    className={`font-semibold text-color-tertiary transition-all hover:text-autowhale-blue ${
                      activeType === 'Simple'
                        ? 'text-autowhale-blue underline underline-offset-4 dark:text-white'
                        : ''
                    } `}
                    onClick={() => {
                      trigger('price')
                      setActiveType('Simple')
                    }}>
                    Simple
                  </button>
                  <button
                    type="button"
                    className={`font-semibold text-color-tertiary transition-all hover:text-autowhale-blue ${
                      activeType === 'Advanced'
                        ? 'text-autowhale-blue underline underline-offset-4 dark:text-white'
                        : ''
                    } `}
                    onClick={() => {
                      trigger('price')
                      setActiveType('Advanced')
                    }}>
                    Advanced
                  </button>
                </div>
                <div className="flex justify-start gap-2 overflow-x-auto pr-2 pb-2 text-sm md:pb-0 md:text-base">
                  {/* <div className="my-2 flex gap-3">
                  <button
                    type="button"
                    className={`font-semibold transition-all hover:text-autowhale-blue  ${
                      activeType === 'Limit' ? 'text-autowhale-blue' : ''
                    } `}
                    onClick={() => {
                      trigger('price')
                      setActiveType('Limit')
                    }}>
                    Limit
                  </button>
                  <button
                    type="button"
                    className={`font-semibold transition-all hover:text-autowhale-blue  ${
                      activeType === 'Market' ? 'text-autowhale-blue' : ''
                    } `}
                    onClick={() => {
                      resetField('price')
                      trigger('price')
                      setActiveType('Market')
                    }}>
                    Market
                  </button>
                  <button
                    type="button"
                    className={`font-semibold transition-all hover:text-autowhale-blue  ${
                      activeType === 'Other' ? 'text-autowhale-blue' : ''
                    } `}
                    onClick={() => {
                      resetField('price')
                      trigger('price')
                      setActiveType('Other')
                    }}>
                    Other
                  </button>
                </div> */}
                  {/* {accessibleExchangeNames?.map((exchange, idx) => (
                    <button
                      key={exchange}
                      type="button"
                      onClick={() => {
                        activeExchangeAccount === exchange
                          ? setActiveExchangeAccount('all')
                          : (() => {
                              trigger('price')
                              resetField('amount')
                              setActiveExchangeAccount(exchange)
                            })()
                      }}
                      className={`${
                        activeExchangeAccount === exchange
                          ? 'border-autowhale-blue bg-autowhale-blue text-white dark:text-color-secondary'
                          : 'bg-color-secondary dark:border-neutral-700 dark:bg-color-primary hover:dark:border-autowhale-blue'
                      } break-anywhere flex min-w-fit items-center whitespace-nowrap rounded border px-2 py-1 text-color-secondary transition-colors`}>
                      <img
                        src={`/crypto-exchanges-webp/${
                          activeExchanges[idx] || 'generic'
                        }.webp`}
                        className="h-5 w-5"
                        alt="crypto exchange icon"
                      />
                      {exchange}
                    </button>
                  ))} */}
                </div>
                {/* <ErrorBoundary FallbackComponent={Fallback}>
                <Suspense fallback={<Loader />}>
                  <BalancePieChart
                    className="p-1"
                    balances={pieChartData.data}
                    portfolio
                    labels={pieChartData.labels}
                    styling={{
                      height:
                        width > 1024 && width < 1539
                          ? '395px'
                          : width >= 1539
                          ? '439px'
                          : '410px',
                      width: '100%',
                    }}
                  />
                </Suspense>
              </ErrorBoundary> */}

                <div className="flex flex-col gap-2 2xl:flex-row">
                  <div className="flex w-full gap-2">
                    <Controller
                      name="symbol"
                      control={control}
                      rules={{
                        required: true,
                        min: { value: 1, message: 'Select an symbol' },
                      }}
                      render={({ field }) => (
                        <Dropdown
                          className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          id={field.name}
                          value={field.value ? field.value : 'BTC/USDT'}
                          filter
                          virtualScrollerOptions={{ itemSize: 50 }}
                          focusInputRef={field.ref}
                          onChange={(e) => field.onChange(e.value)}
                          options={markets}
                          placeholder="Symbol"
                        />
                      )}
                    />
                    <Controller
                      name="type"
                      control={control}
                      rules={{
                        required: true,
                        min: { value: 1, message: 'Select a type' },
                      }}
                      render={({ field }) => (
                        <Dropdown
                          className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          id={field.name}
                          value={field.value}
                          virtualScrollerOptions={{ itemSize: 50 }}
                          focusInputRef={field.ref}
                          onChange={(e) => {
                            resetField('price')
                            trigger('price')
                            field.onChange(e.value)
                          }}
                          options={['Limit', 'Market']}
                          placeholder="Type"
                        />
                      )}
                    />
                  </div>
                  <div className="flex h-10 w-full rounded-lg border dark:border-neutral-700 dark:bg-color-secondary">
                    <TerminalButton
                      type="button"
                      onClick={() => {
                        resetField('amount')
                        setBuyActive(true)
                      }}
                      className={`w-full items-baseline p-0 !text-sm transition-colors md:!text-base ${
                        buyActive
                          ? '!bg-green-500 dark:!bg-green-700'
                          : 'bg-color-secondary !text-color-secondary/50 hover:!text-color-secondary dark:border-neutral-700 dark:bg-color-secondary dark:hover:!text-white'
                      } `}>
                      Buy
                    </TerminalButton>

                    <TerminalButton
                      type="button"
                      onClick={() => {
                        resetField('amount')
                        setBuyActive(false)
                      }}
                      className={`w-full items-baseline p-0 !text-sm transition-colors md:!text-base ${
                        !buyActive
                          ? '!bg-red-500 dark:!bg-red-700'
                          : 'bg-color-secondary !text-color-secondary/50 hover:!text-color-secondary dark:border-neutral-700 dark:bg-color-secondary dark:hover:!text-white'
                      } `}>
                      Sell
                    </TerminalButton>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Controller
                    name="price"
                    control={control}
                    rules={{
                      required: watchedType === 'Limit' ? true : false,
                    }}
                    render={({ field }) => (
                      <InputText
                        keyfilter="pnum"
                        disabled={watchedType !== 'Limit' ? true : false}
                        className="h-10 w-1/2 text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                        placeholder={
                          watchedType !== 'Limit' ? 'Market Price' : 'Price'
                        }
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="amount"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <span className="p-input-icon-right w-1/2 gap-2">
                        <i className="pi ml-5 font-lato ">
                          {watchedSymbol.split('/')[0]}
                        </i>
                        <InputText
                          keyfilter="pnum"
                          min={0}
                          className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          placeholder="Amount"
                          value={
                            buyActive
                              ? Number(
                                  parseFloat(
                                    field.value / watchedPrice
                                  )?.toFixed(8)
                                ) || ''
                              : Number(parseFloat(field.value)?.toFixed(8)) ||
                                ''
                          }
                          onChange={(e) => {
                            const derivedValue = buyActive
                              ? parseFloat(e.target.value) * watchedPrice
                              : parseFloat(e.target.value)

                            field.onChange(derivedValue || 0)
                          }}
                        />
                      </span>
                    )}
                  />
                </div>
                <Controller
                  name="total"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <span className="p-input-icon-right hidden gap-2 lg:block">
                      <i className="pi ml-5 font-lato">
                        {watchedSymbol.split('/')[1]}
                      </i>
                      <InputText
                        keyfilter="pnum"
                        min={0}
                        className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                        placeholder="Total"
                        {...field}
                      />
                    </span>
                  )}
                />
                <div className="flex gap-2">
                  <Controller
                    name="step_amount"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <InputText
                        keyfilter="pnum"
                        min={0}
                        className="h-10 text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                        placeholder="Step Amount"
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="start_time"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <Calendar
                        id="calendar-12h"
                        showTime
                        hourFormat="12"
                        className="h-10 rounded-[6px] focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary  dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                        minDate={minDate}
                        readOnlyInput
                        placeholder="Start Time"
                        {...field}
                      />
                    )}
                  />
                  {activeType === 'Advanced' && (
                    <Controller
                      name="end_time"
                      control={control}
                      rules={{
                        required: true,
                      }}
                      render={({ field }) => (
                        <Calendar
                          id="calendar-12h"
                          showTime
                          hourFormat="12"
                          className="h-10 rounded-[6px] focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary  dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          minDate={minDate}
                          readOnlyInput
                          placeholder="End Time"
                          {...field}
                        />
                      )}
                    />
                  )}
                </div>
                <div className="flex gap-5">
                  <div className="flex items-center gap-2">
                    <span>Days</span>
                    <Controller
                      name="days"
                      control={control}
                      rules={{
                        required: true,
                        max: 90,
                      }}
                      render={({ field }) => (
                        <InputText
                          keyfilter="pnum"
                          max={90}
                          className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          // placeholder="Days"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Hours</span>
                    <Controller
                      name="hours"
                      control={control}
                      rules={{
                        required: true,
                        max: 24,
                      }}
                      render={({ field }) => (
                        <InputText
                          keyfilter="pnum"
                          max={24}
                          className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          // placeholder="Hours"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Minutes</span>
                    <Controller
                      name="minutes"
                      control={control}
                      rules={{
                        required: true,
                        max: 60,
                      }}
                      render={({ field }) => (
                        <InputText
                          keyfilter="pnum"
                          max={60}
                          className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          // placeholder="Minutes"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs md:text-base">
                    {(watchedAmount <= freeBalance &&
                      Math.round((watchedAmount / freeBalance) * 100)) ||
                      0}
                    %
                  </p>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{
                      required: true,
                      min: 0,
                    }}
                    render={({ field }) => (
                      <Slider
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.value)
                        }}
                        className="w-[90%]"
                        max={(watchedAmount <= freeBalance && freeBalance) || 0}
                        // TODO: figure out a way to have the step and the input working simultaneously
                        step={freeBalance * 0.01}
                      />
                    )}
                  />
                </div>

                {activeType === 'Advanced' && (
                  <div className="flex gap-2">
                    <Controller
                      name="stop_loss_price"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          keyfilter="pnum"
                          className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          placeholder="Stop loss price"
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="take_profit_price"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          keyfilter="pnum"
                          className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          placeholder="Take Profit price"
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="price_limit"
                      control={control}
                      render={({ field }) => (
                        <InputText
                          keyfilter="pnum"
                          className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                          placeholder="Price Limit"
                          {...field}
                        />
                      )}
                    />
                  </div>
                )}

                <div className="flex gap-1">
                  <TerminalButton
                    text={`${buyActive ? 'Buy' : 'Sell'} ${
                      watchedSymbol.split('/')[0] || ''
                    }`}
                    type="submit"
                    className={`w-full transition-all ${
                      isValid
                        ? buyActive
                          ? '!bg-green-500 hover:!bg-green-600 dark:!bg-green-700 dark:hover:!bg-green-700/80'
                          : '!bg-red-500 hover:!bg-red-600 dark:!bg-red-700 dark:hover:!bg-red-700/80'
                        : 'bg-neutral-400 hover:cursor-not-allowed dark:bg-neutral-800'
                    }`}
                  />
                </div>
              </form>
            </div>
            <div className="lg:w-2/3">
              <PreviewChart
                id="Preview"
                metricsData={metricsDataArray}
                orderCount={orderCount}
                //? here is the static data for the delay
                delayBetweenOrders={{
                  day: watchedDays,
                  hour: watchedHours,
                  minute: watchedMinutes,
                }}
                className="col-span-1 hidden sm:col-span-3 sm:block xl:col-span-4"
              />
            </div>
          </div>
          <ErrorBoundary FallbackComponent={Fallback}>
            <Suspense fallback={<Loader />}>
              <TabView>
                <TabPanel
                  header={<HeaderTemplate title="All Orders" badgeValue={0} />}
                  className="text-xs md:text-base">
                  <DataTable
                    value={[
                      {
                        avg_fill_price: null,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:51:02 GMT',
                        execution_delay: null,
                        execution_time: 0.28513097763061523,
                        fee_percent: 0.0001,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: null,
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0,
                        order_id: '65039c66eb794b0006299dce',
                        order_side: 'buy',
                        order_status: 'open',
                        order_type: 'limit',
                        price: 26526.6,
                        quantity: 0.00005464,
                        quantity_filled: 0,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                      {
                        avg_fill_price: 26526.5,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:50:52 GMT',
                        execution_delay: null,
                        execution_time: 0.27878594398498535,
                        fee_percent: 0.0001,
                        handledRollingMetrics: true,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: 'Fri, 15 Sep 2023 01:51:02 GMT',
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0.001439062625,
                        order_id: '65039c5b29b9ec0007d2f4d8',
                        order_side: 'sell',
                        order_status: 'closed',
                        order_type: 'limit',
                        price: 26526.5,
                        quantity: 0.00005425,
                        quantity_filled: 0.00005425,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                      {
                        avg_fill_price: null,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:50:52 GMT',
                        execution_delay: null,
                        execution_time: 0.270158052444458,
                        fee_percent: 0.0002,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: null,
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0,
                        order_id: '65039c5beb794b0006299499',
                        order_side: 'buy',
                        order_status: 'open',
                        order_type: 'limit',
                        price: 26526.5,
                        quantity: 0.00005425,
                        quantity_filled: 0,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                      {
                        avg_fill_price: null,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:50:43 GMT',
                        execution_delay: null,
                        execution_time: 0.3389930725097656,
                        fee_percent: 0.0002,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: null,
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0,
                        order_id: '65039c535f06e40007f1a6a5',
                        order_side: 'buy',
                        order_status: 'open',
                        order_type: 'limit',
                        price: 26526.1,
                        quantity: 0.00005475,
                        quantity_filled: 0,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                      {
                        avg_fill_price: 26526.1,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:50:43 GMT',
                        execution_delay: null,
                        execution_time: 0.3448302745819092,
                        fee_percent: 0.0001,
                        handledRollingMetrics: true,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: 'Fri, 15 Sep 2023 01:50:52 GMT',
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0.001452303975,
                        order_id: '65039c53eab587000764806c',
                        order_side: 'sell',
                        order_status: 'closed',
                        order_type: 'limit',
                        price: 26526.1,
                        quantity: 0.00005475,
                        quantity_filled: 0.00005475,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                    ]}
                    // filters={filters}
                    paginator
                    breakpoint="0"
                    paginatorTemplate={
                      width < 768
                        ? 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                        : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
                    }
                    sortField={'active_status'}
                    sortOrder={1}
                    rows={20}
                    rowsPerPageOptions={[20, 30, 40, 50]}
                    // totalRecords={strategies?.length}
                    className="text-[0.7rem] md:text-[0.75rem]">
                    <Column
                      header="#"
                      body={(data, options) => options.rowIndex + 1}
                      frozen
                      className={`max-w-[3rem] ${
                        width < 768 && 'max-w-[2rem] break-all'
                      }`}
                    />
                    <Column
                      sortable
                      field="exchange_account_id"
                      header="Exchange account"
                      className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
                    />
                    <Column
                      field="execution_date"
                      header="Execution Date"
                      // filter
                      style={{ padding: '0.9em' }}
                      // onFilter={handleFilter}
                      dataType="date"
                      filterElement={dateFilterTemplate}
                      showFilterOperator={false}
                      filterMatchModeOptions={dateFilterOptions}
                    />
                    <Column
                      sortable
                      field="market"
                      header="Market"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                      body={(order) => (
                        <div className="flex items-center">
                          <img
                            src={`/crypto-icons-webp/${
                              order.market.split('/')[0]
                            }.webp`}
                            className="h-6 w-6"
                            alt=""
                          />
                          <p className="text-[0.7rem] md:text-sm">
                            {order.market}
                          </p>
                        </div>
                      )}
                    />
                    <Column
                      field="order_side"
                      header="Order Side"
                      filter
                      style={{ padding: '0.9em' }}
                      body={(account) => (
                        <Tag
                          value={account.order_side}
                          style={{
                            backgroundColor: getSeverity(account.order_side),
                          }}
                          className="text-md"
                        />
                      )}
                      dataType="text"
                      showFilterOperator={false}
                      filterMatchModeOptions={equalsFilterOptions}
                      filterElement={orderSidesFilterTemplate}
                      className="max-w-[7rem]"
                    />
                    <Column
                      field="order_type"
                      header="Order Type"
                      filter
                      style={{ padding: '0.9em' }}
                      dataType="text"
                      showFilterOperator={false}
                      filterMatchModeOptions={equalsFilterOptions}
                      filterElement={orderTypesFilterTemplate}
                      className="max-w-[7rem]"
                    />
                    <Column
                      field="cost"
                      header="Cost"
                      style={{ padding: '0.9em' }}
                      dataType="text"
                      showFilterOperator={false}
                      body={costBodyTemplate}
                    />

                    <Column
                      field="avg_fill_price"
                      header="Avg fill price"
                      filter
                      style={{ padding: '0.9em' }}
                      dataType="text"
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={avgFillPriceBodyTemplate}
                    />
                    <Column
                      field="stop_loss_price_trigger"
                      header="Stop Loss"
                      filter
                      style={{ padding: '0.9em' }}
                      dataType="numeric"
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={stopLossBodyTemplate}
                    />
                    <Column
                      field="price"
                      header="Price"
                      style={{ padding: '0.9em' }}
                      filterField="price"
                      dataType="numeric"
                      filter
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={priceBodyTemplate}
                    />
                    <Column
                      field="quantity"
                      header="Quantity"
                      style={{ padding: '0.9em' }}
                      filterField="quantity"
                      dataType="numeric"
                      filter
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                    />
                    <Column
                      field="quantity_filled"
                      header="Quantity Filled"
                      filter
                      style={{ padding: '0.9em' }}
                      filterField="quantity_filled"
                      dataType="numeric"
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={quantityFilledBodyTemplate}
                    />
                    <Column
                      field="order_status"
                      header="Order Status"
                      filter
                      frozen
                      alignFrozen="right"
                      dataType="text"
                      style={{ padding: '0.9em' }}
                      body={(order) => (
                        <Tag
                          value={order.order_status}
                          style={{
                            backgroundColor: getSeverity(order.order_status),
                          }}
                          className="text-md"
                        />
                      )}
                      showFilterOperator={false}
                      filterMatchModeOptions={equalsFilterOptions}
                      filterElement={orderStatusFilterTemplate}
                      className="max-w-[6rem] shadow-[-5px_0px_5px_#00000022] md:max-w-[7rem] md:shadow-none lg:max-w-[10rem]"
                    />

                    <Column
                      className="max-w-[3.6rem]"
                      body={(row) => {
                        return (
                          <>
                            {row.order_status === 'open' && (
                              <i
                                onClick={(e) => {
                                  e.stopPropagation()
                                  //TODO: cancel the order here
                                }}
                                className="pi pi-trash text-[1.3rem] text-red-500 hover:text-red-700"></i>
                            )}
                          </>
                        )
                      }}
                    />
                  </DataTable>
                </TabPanel>
                <TabPanel
                  header={
                    <HeaderTemplate
                      title="Open Orders"
                      badgeValue={headerBadge.open}
                    />
                  }
                  className="text-xs md:text-base">
                  <DataTable
                    value={[
                      {
                        avg_fill_price: null,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:51:02 GMT',
                        execution_delay: null,
                        execution_time: 0.28513097763061523,
                        fee_percent: 0.0001,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: null,
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0,
                        order_id: '65039c66eb794b0006299dce',
                        order_side: 'buy',
                        order_status: 'open',
                        order_type: 'limit',
                        price: 26526.6,
                        quantity: 0.00005464,
                        quantity_filled: 0,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                      {
                        avg_fill_price: null,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:50:52 GMT',
                        execution_delay: null,
                        execution_time: 0.270158052444458,
                        fee_percent: 0.0002,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: null,
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0,
                        order_id: '65039c5beb794b0006299499',
                        order_side: 'buy',
                        order_status: 'open',
                        order_type: 'limit',
                        price: 26526.5,
                        quantity: 0.00005425,
                        quantity_filled: 0,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                      {
                        avg_fill_price: null,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:50:43 GMT',
                        execution_delay: null,
                        execution_time: 0.3389930725097656,
                        fee_percent: 0.0002,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: null,
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0,
                        order_id: '65039c535f06e40007f1a6a5',
                        order_side: 'buy',
                        order_status: 'open',
                        order_type: 'limit',
                        price: 26526.1,
                        quantity: 0.00005475,
                        quantity_filled: 0,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                    ]}
                    // filters={filters}
                    paginator
                    breakpoint="0"
                    paginatorTemplate={
                      width < 768
                        ? 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                        : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
                    }
                    sortField={'active_status'}
                    sortOrder={1}
                    rows={20}
                    rowsPerPageOptions={[20, 30, 40, 50]}
                    // totalRecords={strategies?.length}
                    className="text-[0.7rem] md:text-[0.75rem]">
                    <Column
                      header="#"
                      body={(data, options) => options.rowIndex + 1}
                      frozen
                      className={`max-w-[3rem] ${
                        width < 768 && 'max-w-[2rem] break-all'
                      }`}
                    />
                    <Column
                      sortable
                      field="exchange_account_id"
                      header="Exchange account"
                      className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
                    />
                    <Column
                      field="execution_date"
                      header="Execution Date"
                      // filter
                      style={{ padding: '0.9em' }}
                      // onFilter={handleFilter}
                      dataType="date"
                      filterElement={dateFilterTemplate}
                      showFilterOperator={false}
                      filterMatchModeOptions={dateFilterOptions}
                    />
                    <Column
                      sortable
                      field="market"
                      header="Market"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                      body={(order) => (
                        <div className="flex items-center">
                          <img
                            src={`/crypto-icons-webp/${
                              order.market.split('/')[0]
                            }.webp`}
                            className="h-6 w-6"
                            alt=""
                          />
                          <p className="text-[0.7rem] md:text-sm">
                            {order.market}
                          </p>
                        </div>
                      )}
                    />
                    <Column
                      field="order_side"
                      header="Order Side"
                      filter
                      style={{ padding: '0.9em' }}
                      body={(account) => (
                        <Tag
                          value={account.order_side}
                          style={{
                            backgroundColor: getSeverity(account.order_side),
                          }}
                          className="text-md"
                        />
                      )}
                      dataType="text"
                      showFilterOperator={false}
                      filterMatchModeOptions={equalsFilterOptions}
                      filterElement={orderSidesFilterTemplate}
                      className="max-w-[7rem]"
                    />
                    <Column
                      field="order_type"
                      header="Order Type"
                      filter
                      style={{ padding: '0.9em' }}
                      dataType="text"
                      showFilterOperator={false}
                      filterMatchModeOptions={equalsFilterOptions}
                      filterElement={orderTypesFilterTemplate}
                      className="max-w-[7rem]"
                    />
                    <Column
                      field="cost"
                      header="Cost"
                      style={{ padding: '0.9em' }}
                      dataType="text"
                      showFilterOperator={false}
                      body={costBodyTemplate}
                    />

                    <Column
                      field="avg_fill_price"
                      header="Avg fill price"
                      filter
                      style={{ padding: '0.9em' }}
                      dataType="text"
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={avgFillPriceBodyTemplate}
                    />
                    <Column
                      field="stop_loss_price_trigger"
                      header="Stop Loss"
                      filter
                      style={{ padding: '0.9em' }}
                      dataType="numeric"
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={stopLossBodyTemplate}
                    />
                    <Column
                      field="price"
                      header="Price"
                      style={{ padding: '0.9em' }}
                      filterField="price"
                      dataType="numeric"
                      filter
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={priceBodyTemplate}
                    />
                    <Column
                      field="quantity"
                      header="Quantity"
                      style={{ padding: '0.9em' }}
                      filterField="quantity"
                      dataType="numeric"
                      filter
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                    />
                    <Column
                      field="quantity_filled"
                      header="Quantity Filled"
                      filter
                      style={{ padding: '0.9em' }}
                      filterField="quantity_filled"
                      dataType="numeric"
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={quantityFilledBodyTemplate}
                    />
                    <Column
                      field="order_status"
                      header="Order Status"
                      filter
                      frozen
                      alignFrozen="right"
                      dataType="text"
                      style={{ padding: '0.9em' }}
                      body={(order) => (
                        <Tag
                          value={order.order_status}
                          style={{
                            backgroundColor: getSeverity(order.order_status),
                          }}
                          className="text-md"
                        />
                      )}
                      showFilterOperator={false}
                      filterMatchModeOptions={equalsFilterOptions}
                      filterElement={orderStatusFilterTemplate}
                      className="max-w-[6rem] shadow-[-5px_0px_5px_#00000022] md:max-w-[7rem] md:shadow-none lg:max-w-[10rem]"
                    />
                    <Column
                      className="max-w-[3.6rem]"
                      body={(strategy) => {
                        return (
                          <i
                            onClick={(e) => {
                              e.stopPropagation()
                              //TODO: cancel the order here
                            }}
                            className="pi pi-trash text-[1.3rem] text-red-500 hover:text-red-700"></i>
                        )
                      }}
                    />
                  </DataTable>
                </TabPanel>
                <TabPanel
                  header={
                    <HeaderTemplate
                      title="Closed Orders"
                      badgeValue={headerBadge.closed}
                    />
                  }
                  className="text-xs md:text-base">
                  <DataTable
                    value={[
                      {
                        avg_fill_price: 26526.5,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:50:52 GMT',
                        execution_delay: null,
                        execution_time: 0.27878594398498535,
                        fee_percent: 0.0001,
                        handledRollingMetrics: true,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: 'Fri, 15 Sep 2023 01:51:02 GMT',
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0.001439062625,
                        order_id: '65039c5b29b9ec0007d2f4d8',
                        order_side: 'sell',
                        order_status: 'closed',
                        order_type: 'limit',
                        price: 26526.5,
                        quantity: 0.00005425,
                        quantity_filled: 0.00005425,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                      {
                        avg_fill_price: 26526.1,
                        exchange: 'kucoin',
                        exchange_account_id: 'kucoin-account',
                        execution_date: 'Fri, 15 Sep 2023 01:50:43 GMT',
                        execution_delay: null,
                        execution_time: 0.3448302745819092,
                        fee_percent: 0.0001,
                        handledRollingMetrics: true,
                        is_demo_trade: false,
                        is_retry: false,
                        is_settled: true,
                        last_traded_timestamp: 'Fri, 15 Sep 2023 01:50:52 GMT',
                        market: 'BTC/USDT',
                        obj_id: null,
                        order_fee: 0.001452303975,
                        order_id: '65039c53eab587000764806c',
                        order_side: 'sell',
                        order_status: 'closed',
                        order_type: 'limit',
                        price: 26526.1,
                        quantity: 0.00005475,
                        quantity_filled: 0.00005475,
                        stop_loss_price_trigger: null,
                        stop_loss_type: null,
                        strategy_id: 'STRATEGY_NAME',
                        trade_signal_id: null,
                      },
                    ]}
                    // filters={filters}
                    paginator
                    breakpoint="0"
                    paginatorTemplate={
                      width < 768
                        ? 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                        : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
                    }
                    sortField={'active_status'}
                    sortOrder={1}
                    rows={20}
                    rowsPerPageOptions={[20, 30, 40, 50]}
                    // totalRecords={strategies?.length}
                    className="text-[0.7rem] md:text-[0.75rem]">
                    <Column
                      header="#"
                      body={(data, options) => options.rowIndex + 1}
                      frozen
                      className={`max-w-[3rem] ${
                        width < 768 && 'max-w-[2rem] break-all'
                      }`}
                    />
                    <Column
                      sortable
                      field="exchange_account_id"
                      header="Exchange account"
                      className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
                    />
                    <Column
                      field="execution_date"
                      header="Execution Date"
                      // filter
                      style={{ padding: '0.9em' }}
                      // onFilter={handleFilter}
                      dataType="date"
                      filterElement={dateFilterTemplate}
                      showFilterOperator={false}
                      filterMatchModeOptions={dateFilterOptions}
                    />
                    <Column
                      sortable
                      field="market"
                      header="Market"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                      body={(order) => (
                        <div className="flex items-center">
                          <img
                            src={`/crypto-icons-webp/${
                              order.market.split('/')[0]
                            }.webp`}
                            className="h-6 w-6"
                            alt=""
                          />
                          <p className="text-[0.7rem] md:text-sm">
                            {order.market}
                          </p>
                        </div>
                      )}
                    />
                    <Column
                      field="order_side"
                      header="Order Side"
                      filter
                      style={{ padding: '0.9em' }}
                      body={(account) => (
                        <Tag
                          value={account.order_side}
                          style={{
                            backgroundColor: getSeverity(account.order_side),
                          }}
                          className="text-md"
                        />
                      )}
                      dataType="text"
                      showFilterOperator={false}
                      filterMatchModeOptions={equalsFilterOptions}
                      filterElement={orderSidesFilterTemplate}
                      className="max-w-[7rem]"
                    />
                    <Column
                      field="order_type"
                      header="Order Type"
                      filter
                      style={{ padding: '0.9em' }}
                      dataType="text"
                      showFilterOperator={false}
                      filterMatchModeOptions={equalsFilterOptions}
                      filterElement={orderTypesFilterTemplate}
                      className="max-w-[7rem]"
                    />
                    <Column
                      field="cost"
                      header="Cost"
                      style={{ padding: '0.9em' }}
                      dataType="text"
                      showFilterOperator={false}
                      body={costBodyTemplate}
                    />

                    <Column
                      field="avg_fill_price"
                      header="Avg fill price"
                      filter
                      style={{ padding: '0.9em' }}
                      dataType="text"
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={avgFillPriceBodyTemplate}
                    />
                    <Column
                      field="stop_loss_price_trigger"
                      header="Stop Loss"
                      filter
                      style={{ padding: '0.9em' }}
                      dataType="numeric"
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={stopLossBodyTemplate}
                    />
                    <Column
                      field="price"
                      header="Price"
                      style={{ padding: '0.9em' }}
                      filterField="price"
                      dataType="numeric"
                      filter
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={priceBodyTemplate}
                    />
                    <Column
                      field="quantity"
                      header="Quantity"
                      style={{ padding: '0.9em' }}
                      filterField="quantity"
                      dataType="numeric"
                      filter
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                    />
                    <Column
                      field="quantity_filled"
                      header="Quantity Filled"
                      filter
                      style={{ padding: '0.9em' }}
                      filterField="quantity_filled"
                      dataType="numeric"
                      showFilterOperator={false}
                      filterMatchModeOptions={numericFilterOptions}
                      body={quantityFilledBodyTemplate}
                    />
                    <Column
                      field="order_status"
                      header="Order Status"
                      filter
                      frozen
                      alignFrozen="right"
                      dataType="text"
                      style={{ padding: '0.9em' }}
                      body={(order) => (
                        <Tag
                          value={order.order_status}
                          style={{
                            backgroundColor: getSeverity(order.order_status),
                          }}
                          className="text-md"
                        />
                      )}
                      showFilterOperator={false}
                      filterMatchModeOptions={equalsFilterOptions}
                      filterElement={orderStatusFilterTemplate}
                      className="max-w-[6rem] shadow-[-5px_0px_5px_#00000022] md:max-w-[7rem] md:shadow-none lg:max-w-[10rem]"
                    />
                  </DataTable>
                </TabPanel>
              </TabView>
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

export default Portfolio
