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

import ExchangesJson from '../data/exchanges.json'
import FakePieChartData from '../data/exchangePiechart.json'
import FakePortfolioChartData from '../data/portfolio/piechartsPortfolio.json'
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
      symbol: '',
      side: '',
      //? limit or something else
      type: '',
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

  const [value, setValue] = useState(0)
  const [balances, setBalances] = useState({})
  const [pieChartData, setPieChartData] = useState({})
  const [markets, setMarkets] = useState([])
  const watchedSymbol = watch('symbol')

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

  useEffect(() => {
    setPieChartData(FakePieChartData)
  }, [balances])

  useEffect(() => {
    async function fetchAndCombineBalances() {
      if (!activeExchangeAccount) {
        setActiveExchangeAccount(accessibleExchangeNames[0])
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
          setPieChartData(FakePieChartData)
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

  //TODO: markets fetch

  return (
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
            <div className="flex justify-start gap-2 overflow-x-auto px-2 pb-2 md:pb-0">
              <button
                type="button"
                onClick={() => {
                  setActiveExchangeAccount('all')
                }}
                className={`${
                  activeExchangeAccount === 'all'
                    ? 'border-autowhale-blue bg-autowhale-blue text-white dark:text-color-secondary'
                    : 'bg-color-secondary dark:border-neutral-800 dark:bg-color-primary hover:dark:border-autowhale-blue'
                } w-fit whitespace-nowrap rounded border px-2 py-1 text-color-secondary transition-colors `}>
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
                      : 'bg-color-secondary dark:border-neutral-800 dark:bg-color-primary hover:dark:border-autowhale-blue'
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
                  className="h-11 w-full !border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
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
            <div className="my-2 flex gap-3">
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
            </div>
            <div className="flex gap-2">
              <Controller
                name="symbol"
                control={control}
                rules={{
                  required: true,
                  min: { value: 1, message: 'Select an symbol' },
                }}
                render={({ field }) => (
                  <Dropdown
                    className="h-11 w-full !border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                    id={field.name}
                    value={field.value}
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
                name="price"
                control={control}
                rules={{
                  required: activeType === 'Limit' ? true : false,
                }}
                render={({ field }) => (
                  <InputText
                    keyfilter="pnum"
                    disabled={activeType !== 'Limit' ? true : false}
                    className={
                      'h-11 w-full border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500'
                    }
                    placeholder={
                      activeType !== 'Limit' ? 'Market Price' : 'Price'
                    }
                    {...field}
                  />
                )}
              />
            </div>
            <Controller
              name="amount"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field }) => (
                <span className="p-input-icon-right">
                  <i className="pi font-lato">
                    {watchedSymbol && watchedSymbol.split('/')[1]}
                  </i>
                  <InputText
                    keyfilter="pnum"
                    className="h-11 w-full border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                    placeholder="Amount"
                    // placeholder={`Amount ${
                    //   watchedSymbol && `(${watchedSymbol.split('/')[1]})`
                    // }`}
                    {...field}
                  />
                </span>
              )}
            />
            <div className="flex items-center justify-between gap-2">
              <p>{value}%</p>
              <Slider
                value={value}
                onChange={(e) => setValue(e.value)}
                className="w-[90%]"
                step={25}
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
                    className="h-11 w-full border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
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
                    className="h-11 w-full border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                    placeholder="Take Profit price"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="flex gap-1">
              <TerminalButton
                text={`Buy ${watchedSymbol.split('/')[0] || ''}`}
                type="submit"
                className={`w-full transition-all ${
                  isValid
                    ? '!bg-green-500 hover:!bg-green-600 dark:!bg-green-700 dark:hover:!bg-green-700/80'
                    : 'bg-neutral-400 hover:cursor-not-allowed dark:bg-neutral-800'
                }`}
              />
              <TerminalButton
                text={`Sell ${watchedSymbol.split('/')[0] || ''}`}
                type="submit"
                className={`w-full transition-all ${
                  isValid
                    ? '!bg-red-500 hover:!bg-red-600 dark:!bg-red-700 dark:hover:!bg-red-700/80'
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
  )
}

export default Portfolio
