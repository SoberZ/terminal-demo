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
} from '../components'
import { toast } from 'react-hot-toast'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { DataTable } from 'primereact/datatable'
import { ErrorBoundary } from 'react-error-boundary'
import { Column } from 'primereact/column'
import { Badge } from 'primereact/badge'
import { TabView, TabPanel } from 'primereact/tabview'
import { isObjectEmpty, numberFormatting } from '../utils/misc'
import { Slider } from 'primereact/slider'
import { Tag } from 'primereact/tag'

import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'

import ExchangesJson from '../data/exchanges.json'
import FakePieChartData from '../data/exchangePiechart.json'
import FakePortfolioChartData from '../data/portfolio/piechartsPortfolio.json'
import FakePortfolioChartsData from '../data/portfolio/individualPiechartsPortfolio.json'
import { fetchMarkets } from '../utils/Fetchers/DataFetchers'

function HeaderTemplate({ badgeValue, title }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className={`${badgeValue > 0 ? '' : 'p-1'}`}>{title}</span>
      {badgeValue > 0 ? (
        <Badge value={badgeValue} className="bg-autowhale-blue" />
      ) : null}
    </span>
  )
}

const Portfolio = () => {
  const { width } = useWindowSize()
  const {
    handleSubmit,
    control,
    watch,
    resetField,
    trigger,
    formState: { isValid, isDirty },
  } = useForm({
    defaultValues: {
      //? fetch accessible exchange accounts
      exchange_account_id: '',
      //? fetch accessible symbols there ?
      symbol: 'BTC/USDT',
      side: '',
      //? limit or something else
      type: 'Limit',
      amount: '',
      //? don't know if it should be written by the user or something else
      price: '',
      stop_loss_price: '',
      take_profit_price: '',
    },
  })
  const [accessibleExchangeAccounts, setAccessibleExchangeAccounts] = useState(
    []
  )
  const [activeExchangeAccount, setActiveExchangeAccount] = useState('')
  const [activeType, setActiveType] = useState('Limit')
  const [headerBadge, setHeaderBadge] = useState({
    all: 4,
    open: 4,
    closed: 0,
  })

  const [balances, setBalances] = useState({})
  const [pieChartData, setPieChartData] = useState({})
  const [markets, setMarkets] = useState([])
  const [buyActive, setBuyActive] = useState(true)
  const watchedSymbol = watch('symbol')
  const watchedAmount = watch('amount')

  //? I'll only use the template if i need to access what's inside
  const headerTemplates = ({ titleElement, onClick }) => {
    return (
      <>
        {/* <a
          role="tab"
          class="p-tabview-nav-link"
          id="pr_id_23_header_1"
          aria-controls="pr_id_23_content_1"
          aria-selected="false"
          tabindex="0">
          <span class="p-tabview-title">Open Orders</span>
        </a> */}
        <div
          className="flex cursor-pointer items-center gap-2 p-3"
          onClick={onClick}>
          {/* <Avatar
          image="https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png"
          shape="circle"
        />
       
        */}
          <span className="white-space-nowrap font-bold">
            {titleElement.props.children}
          </span>
        </div>
      </>
    )
  }

  const submitHandler = (submittedData) => {
    const exchangeAccountList =
      activeExchangeAccount !== 'all'
        ? activeExchangeAccount
        : accessibleExchangeNames

    const processedData = {
      ...submittedData,
      type: activeType,
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
    setAccessibleExchangeAccounts(ExchangesJson)
  }, [])

  // useEffect(() => {
  //   FakePortfolioChartsData.forEach((data) => {
  //     if (data.exchange_account_id === activeExchangeAccount) {
  //       console.log(exchange_account_id)
  //       console.log(activeExchangeAccount)
  //       setPieChartData(data)
  //     }
  //   })
  // }, [balances])

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

          setBalances({})
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

          setBalances({})
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

  //? this can never return more than one exchange
  const selectedExchange = accessibleExchangeAccounts.filter(
    (exchange) =>
      exchange.exchange_account_id === activeExchangeAccount && exchange
  )[0]?.exchange

  useEffect(() => {
    if (selectedExchange !== undefined) {
      fetchMarkets(selectedExchange, setMarkets)
    }
  }, [selectedExchange])

  const maxBalance = FakePortfolioChartsData.filter(
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
        title: <strong>Exchange Page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this contains relevant information about the exchange account you
              connected,{' '}
              <span className="font-bold">
                {' '}
                like the status, some balances, and the exchange it’s connected
                to,{' '}
              </span>
              You can also see different kind of charts
              <span className="font-bold"> (fake data here) </span> to follow
              their progress over time
            </h2>
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
      <div className="space-y-10">
        <Helmet>
          <title>Portfolio</title>
        </Helmet>
        <div className="flex w-full flex-col gap-2 rounded-lg bg-color-secondary p-2 text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800 md:p-5">
          {/* <p className="text-sm font-light">PORTFOLIO PAGE LESSSGOOOOO</p> */}
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="lg:w-2/3">
              <TradingViewWidget
                activeExchange={selectedExchange || 'BINANCE'}
                activeSymbol={watchedSymbol || 'BTCUSDT'}
              />
            </div>
            <form
              onSubmit={handleSubmit(submitHandler)}
              className="flex flex-col gap-3 rounded-lg border bg-color-secondary p-2 dark:border-neutral-800 dark:bg-color-primary md:gap-2 md:p-5 lg:w-1/3">
              <div className="flex justify-start gap-2 overflow-x-auto pr-2 pb-2 md:pb-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveExchangeAccount('all')
                  }}
                  className={`${
                    activeExchangeAccount === 'all'
                      ? 'border-autowhale-blue bg-autowhale-blue text-white dark:text-color-secondary'
                      : 'bg-color-secondary dark:border-neutral-700 dark:bg-color-primary hover:dark:border-autowhale-blue'
                  } w-fit whitespace-nowrap rounded border p-2 py-1 text-color-secondary transition-colors `}>
                  All
                </button>
                {accessibleExchangeNames?.map((exchange) => (
                  <button
                    key={exchange}
                    type="button"
                    onClick={() => {
                      activeExchangeAccount === exchange
                        ? setActiveExchangeAccount('all')
                        : setActiveExchangeAccount(exchange)
                    }}
                    className={`${
                      activeExchangeAccount === exchange
                        ? 'border-autowhale-blue bg-autowhale-blue text-white dark:text-color-secondary'
                        : 'bg-color-secondary dark:border-neutral-700 dark:bg-color-primary hover:dark:border-autowhale-blue'
                    } break-anywhere w-fit whitespace-nowrap rounded border px-2 py-1 text-color-secondary transition-colors `}>
                    {exchange}
                  </button>
                ))}
              </div>
              <ErrorBoundary FallbackComponent={Fallback}>
                <Suspense fallback={<Loader />}>
                  <BalancePieChart
                    className="p-0"
                    balances={pieChartData.data}
                    labels={pieChartData.labels}
                    styling={{
                      height: width > 1024 ? '430px' : '420px',
                      width: '100%',
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
              {/* <Controller
              name="exchange_account_id"
              control={control}
              rules={{
                required: true,
                min: { value: 1, message: 'Select an exchange account' },
              }}
              render={({ field }) => (
                <Dropdown
                  className="h-10 w-full dark:!border-neutral-700 text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                  id={field.name}
                  value={field.value}
                  filter
                  focusInputRef={field.ref}
                  onChange={(e) => field.onChange(e.value)}
                  options={activeExchangeAccounts || []}
                  placeholder="Select an exchange account"
                />
              )}
            /> */}

              <div className="flex gap-2 ">
                <div className="flex h-10 w-full rounded-lg border dark:border-neutral-700 dark:bg-color-secondary">
                  <TerminalButton
                    text="Buy"
                    type="button"
                    onClick={() => {
                      resetField('amount')
                      setBuyActive(true)
                    }}
                    className={`w-full items-baseline p-0 transition-colors ${
                      buyActive
                        ? '!bg-green-500 dark:!bg-green-700'
                        : 'bg-color-secondary !text-color-secondary/50 hover:!text-color-secondary dark:border-neutral-700 dark:bg-color-secondary dark:hover:!text-white'
                    } `}
                  />

                  <TerminalButton
                    text="Sell"
                    type="button"
                    onClick={() => {
                      resetField('amount')
                      setBuyActive(false)
                    }}
                    className={`w-full items-baseline p-0 transition-colors ${
                      !buyActive
                        ? '!bg-red-500 dark:!bg-red-700'
                        : 'bg-color-secondary !text-color-secondary/50 hover:!text-color-secondary dark:border-neutral-700 dark:bg-color-secondary dark:hover:!text-white'
                    } `}
                  />
                </div>
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
                          setActiveType(e.value)
                          field.onChange(e.value)
                        }}
                        options={['Limit', 'Market']}
                        placeholder="Type"
                      />
                    )}
                  />
                </div>
              </div>

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

              <div className="flex gap-2">
                <Controller
                  name="price"
                  control={control}
                  rules={{
                    required: activeType === 'Limit' ? true : false,
                  }}
                  render={({ field }) => (
                    <InputText
                      keyfilter="pnum"
                      disabled={activeType !== 'Limit' ? true : false}
                      className="h-10 w-1/2 text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                      placeholder={
                        activeType !== 'Limit' ? 'Market Price' : 'Price'
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
                    max: maxBalance,
                    min: 0.0000001,
                  }}
                  render={({ field }) => (
                    <span className="p-input-icon-right w-1/2 gap-2">
                      <i className="pi ml-5 font-lato">
                        {watchedSymbol && buyActive
                          ? watchedSymbol.split('/')[1]
                          : watchedSymbol.split('/')[0]}
                      </i>
                      <InputText
                        keyfilter="pnum"
                        max={maxBalance || 0}
                        min={0}
                        className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                        placeholder="Amount"
                        // placeholder={`Amount ${
                        //   watchedSymbol && `(${watchedSymbol.split('/')[1]})`
                        // }`}
                        onChange={(e) => {
                          const value = Math.min(
                            maxBalance,
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                          field.onChange(value)
                        }}
                        {...field}
                      />
                    </span>
                  )}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <p>
                  {(watchedAmount <= maxBalance &&
                    Math.round((watchedAmount / maxBalance) * 100)) ||
                    0}
                  %
                </p>
                <Controller
                  name="amount"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <Slider
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.value)
                      }}
                      className="w-[90%]"
                      max={(watchedAmount <= maxBalance && maxBalance) || 0}
                      // step={maxBalance * 0.25 || maxBalance * 0.01}
                    />
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Controller
                  name="stop_loss_price"
                  control={control}
                  rules={{
                    required: true,
                  }}
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
                  rules={{
                    required: true,
                  }}
                  render={({ field }) => (
                    <InputText
                      keyfilter="pnum"
                      className="h-10 w-full text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:!border-neutral-700 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                      placeholder="Take Profit price"
                      {...field}
                    />
                  )}
                />
              </div>
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
          <ErrorBoundary FallbackComponent={Fallback}>
            <Suspense fallback={<Loader />}>
              <TabView>
                <TabPanel
                  header={
                    <HeaderTemplate
                      title="All Orders"
                      badgeValue={headerBadge.all}
                    />
                  }
                  className="text-xs md:text-base">
                  <DataTable
                    value={[
                      {
                        order_id: 'faae6901-d1ac-4f4f-8f88-cacd28429976',
                        type: 'Limit',
                        market: 'BTC/USDT',
                        exchange_account_id: 'kucoin-account',
                        amount: '56162',
                        active_status: 'Open',
                      },
                      {
                        order_id: '682ddb81-9a54-414e-90f1-1ac2bba7fcb6',
                        type: 'Limit',
                        market: 'BTC/USDT',
                        exchange_account_id: 'kucoin-account',
                        amount: '3541.3',
                        active_status: 'Open',
                      },
                      {
                        order_id: '453560c9-61e3-4aed-a131-31208fda0f8a',
                        type: 'Limit',
                        market: 'BTC/USDT',
                        exchange_account_id: 'kucoin-account',
                        amount: '8796',
                        active_status: 'Open',
                      },
                      {
                        order_id: '853958c4-85ff-40c7-8a1a-a63ffe3db511',
                        type: 'Limit',
                        market: 'BTC/USDT',
                        exchange_account_id: 'kucoin-account',
                        amount: '61379',
                        active_status: 'Open',
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
                      sortable
                      field="order_id"
                      header="Order ID"
                      className="break-anywhere min-w-[5rem] md:min-w-[15rem] lg:min-w-[18rem]"
                    />
                    <Column
                      sortable
                      field="amount"
                      header="Amount"
                      body={(order) => <p>{numberFormatting(order.amount)}</p>}
                      style={{ minWidth: '7rem' }}
                    />
                    <Column
                      sortable
                      field="type"
                      header="Type"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                      // filter
                    />
                    <Column
                      sortable
                      field="market"
                      header="Market"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                    />
                    <Column
                      sortable
                      field="exchange_account_id"
                      header="Exchange account"
                      className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
                    />

                    <Column
                      sortable
                      field="active_status"
                      header="Status"
                      body={(order) => (
                        <Tag
                          value={order.active_status}
                          style={{
                            backgroundColor: '#22C55E',
                          }}
                          className="text-md"
                        />
                      )}
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
                        order_id: 'faae6901-d1ac-4f4f-8f88-cacd28429976',
                        type: 'Limit',
                        market: 'BTC/USDT',
                        exchange_account_id: 'kucoin-account',
                        amount: '56162',
                        active_status: 'Open',
                      },
                      {
                        order_id: '682ddb81-9a54-414e-90f1-1ac2bba7fcb6',
                        type: 'Limit',
                        market: 'BTC/USDT',
                        exchange_account_id: 'kucoin-account',
                        amount: '3541.3',
                        active_status: 'Open',
                      },
                      {
                        order_id: '453560c9-61e3-4aed-a131-31208fda0f8a',
                        type: 'Limit',
                        market: 'BTC/USDT',
                        exchange_account_id: 'kucoin-account',
                        amount: '8796',
                        active_status: 'Open',
                      },
                      {
                        order_id: '853958c4-85ff-40c7-8a1a-a63ffe3db511',
                        type: 'Limit',
                        market: 'BTC/USDT',
                        exchange_account_id: 'kucoin-account',
                        amount: '61379',
                        active_status: 'Open',
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
                      sortable
                      field="order_id"
                      header="Order ID"
                      className="break-anywhere min-w-[5rem] md:min-w-[15rem] lg:min-w-[18rem]"
                    />
                    <Column
                      sortable
                      field="amount"
                      header="Amount"
                      body={(order) => <p>{numberFormatting(order.amount)}</p>}
                      style={{ minWidth: '7rem' }}
                    />
                    <Column
                      sortable
                      field="type"
                      header="Type"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                      // filter
                    />
                    <Column
                      sortable
                      field="market"
                      header="Market"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                    />
                    <Column
                      sortable
                      field="exchange_account_id"
                      header="Exchange account"
                      className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
                    />

                    <Column
                      sortable
                      field="active_status"
                      header="Status"
                      body={(order) => (
                        <Tag
                          value={order.active_status}
                          style={{
                            backgroundColor: '#22C55E',
                          }}
                          className="text-md"
                        />
                      )}
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
                    value={[]}
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
                      sortable
                      field="order_id"
                      header="Order ID"
                      className="break-anywhere min-w-[5rem] md:min-w-[15rem] lg:min-w-[18rem]"
                    />
                    <Column
                      sortable
                      field="amount"
                      header="Amount"
                      body={(order) => <p>{numberFormatting(order.amount)}</p>}
                      style={{ minWidth: '7rem' }}
                    />
                    <Column
                      sortable
                      field="type"
                      header="Type"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                      // filter
                    />
                    <Column
                      sortable
                      field="market"
                      header="Market"
                      className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                    />
                    <Column
                      sortable
                      field="exchange_account_id"
                      header="Exchange account"
                      className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
                    />

                    <Column
                      sortable
                      field="active_status"
                      header="Status"
                      body={(order) => (
                        <Tag
                          value={order.active_status}
                          style={{
                            backgroundColor: '#22C55E',
                          }}
                          className="text-md"
                        />
                      )}
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
