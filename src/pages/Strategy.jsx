import { useEffect, useRef, useState, Suspense } from 'react'
import { toast } from 'react-hot-toast'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { ErrorBoundary } from 'react-error-boundary'

import {
  BiArchiveIn,
  BiPause,
  BiSolidRightArrow,
  BiStop,
  BiEdit,
  BiXCircle,
  BiChevronDownCircle,
  BiInfoCircle,
} from 'react-icons/bi'

import { Tooltip } from 'primereact/tooltip'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Tag } from 'primereact/tag'

import {
  TerminalButton,
  Orders,
  Tile,
  EditStrategy,
  PrimaryChart,
  MinionChart,
  SelectInput,
  Fallback,
  PopoverTable,
  Loader,
} from '../components'
import { getSeverity } from './Strategies'
import { getSeverity as getSeverityExchange } from './Exchanges'

import { timeFrames } from '../utils/constants'
import { useWindowSize } from '../hooks'
import { Message } from 'primereact/message'

import ChartData from '../data/strategyData/charts.json'
import MetricData from '../data/strategyData/metrics.json'
import StrategyData from '../data/strategyData/strategy.json'
import GroupedChart from '../data/strategyData/groupedCharts.json'
import StrategiesData from '../data/strategies/strategiesData.json'
import { getBase, getQuote } from '../utils/misc'

import Joyride, { STATUS } from 'react-joyride'

const Strategy = () => {
  const { strategyId } = useParams()
  const navigate = useNavigate()
  const { width } = useWindowSize()
  const isLoaded = useRef(false)
  const popoverRef = useRef(null)
  const [visibleBottom, setVisibleBottom] = useState(false)
  const [strategies, setStrategies] = useState([])
  const [strategyPopover, setStrategyPopover] = useState('')
  const [strategyData, setStrategyData] = useState({
    active_status: '-',
    balance_exchange_account: false,
    buy_order_distance: 0,
    check_for_order_consistency: false,
    enable_balancing: false,
    exchange: '',
    exchange_account_id: '',
    init_quantity: 0,
    is_demo_strategy: false,
    is_recovered: false,
    keep_inventory_in_equilibrium: false,
    linear_buy_order_size_increase: 0,
    linear_sell_order_size_increase: 0,
    maker_fee_percentage: 0,
    market: '',
    num_of_orders: 0,
    order_renewal_time: 0,
    sell_order_distance: 0,
    strategy_id: '-',
    taker_fee_percentage: 0,
    target_inventory_base_percentage: 0,
    type: '-',
    exchange_account_status: '',
  })
  const [market, setMarket] = useState({
    base: '',
    quote: '',
  })
  const [editMode, setEditMode] = useState(true)
  const [bigChart, setBigChart] = useState({
    id: '',
    data: [],
    labels: [],
  })
  const [last24MetricsActive, setLast24MetricsActive] = useState(null)
  const [totalChartMetricsActive, setTotalChartMetricsActive] = useState(null)
  const [fetchedData, setFetchedData] = useState({
    PnLIncl: '0',
    PnLExcl: '0',
    avgExecution: '0',
    marketVolatility: '0',
    liveLiquidity: '0',
    executionRatio: '0',
    executionRatios_data: [],
    executionRatios_labels: [],
    executionTimes_data: [],
    executionTimes_labels: [],
    buySellExecRatio_labels: [],
    buySellExecRatio_data: [],
    volumes_labels: [],
    volumes_data: [],
    volume: '0',
    maxDrawDown: '0',
    lastPrice: '-',
    buySellExecRatio: '0',
    sharpeRatio: '0',
    buyLiquidity: 0,
    sellLiquidity: 0,
    totalPnl: 0,
    openOrders: [],
    orders: [],
    pnl_labels: [],
    pnl_data: [],
    suppliedBuyLiquidity_data: [],
    suppliedSellLiquidity_data: [],
    suppliedLiquidity_labels: [],
    fees: 0,
    paidFees: 0,
    unrealizedPnl: 0,
    realizedPnl: 0,
    numOfOrders: 0,
    inventoryCost: 0,
    inventorySize: 0,
    openPositionBreakeven: 0,
    openPositionCost: 0,
    openPositionSize: 0,
    exceedingInventory: 0,
    excessInventoryCost: 0,
    exchange: null,
  })
  const [chartData, setChartData] = useState({
    total_pnl: [],
    total_pnl_labels: [],
    realized_pnl: [],
    realized_pnl_labels: [],
    unrealized_pnl: [],
    unrealized_pnl_labels: [],
    volume: [],
    volume_labels: [],
    open_position_size: [],
    open_position_size_labels: [],
    open_position_cost: [],
    open_position_cost_labels: [],
    sell_liquidity_supplied: [],
    sell_liquidity_supplied_labels: [],
    buy_liquidity_supplied: [],
    buy_liquidity_supplied_labels: [],
    num_of_orders: [],
    num_of_orders_labels: [],
    fees: [],
    fees_labels: [],
    execution_time: [],
    execution_time_labels: [],
    execution_ratio: [],
    execution_ratio_labels: [],
    executed_buy_sell_ratio: [],
    executed_buy_sell_ratio_labels: [],
    exceeding_inventory: [],
    exceeding_inventory_labels: [],
    excess_inventory_cost: [],
    excess_inventory_cost_labels: [],
    fees_paid: [],
    fees_paid_labels: [],
    inventory_cost: [],
    inventory_size: [],
    labels: [],
  })

  useEffect(() => {
    setStrategyPopover(strategyId)
    setChartData(() => ChartData)
    setFetchedData(() => MetricData)
    setStrategyData(() => StrategyData)
    setStrategies(() => StrategiesData.data.data)
    isLoaded.current = true
  }, [])

  const handleSetStrategyStatus = async (status) => {
    confirmDialog({
      message: 'Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        const t = toast.loading(`Changing strategy status`)
        setStrategyData((prev) => ({
          ...prev,
          active_status: status,
        }))
        toast.success(`Successfully changed strategy status to ${status}`, {
          id: t,
        })
      },
      reject: () => {},
    })
  }
  const handleSelect = async (select, valueKey) => {
    const handleToast = toast.loading('Fetching Grouped Charts')
    setLast24MetricsActive(true)
    toast.success('Finished loading Grouped Charts', { id: handleToast })
  }

  const handleSelectWrapper = (select) => {
    handleSelect(select)
  }
  //? wrapper here to send in the select and the value key
  const handleWrapper = (select, valueKey) => {
    handleClick(select, valueKey)
  }
  const handleClick = (e, valueKey) => {
    e.stopPropagation()
    const fixedId = valueKey
      .split('_')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ')

    setBigChart({
      id: fixedId,
      data: chartData[valueKey],
      labels: chartData.labels,
    })
  }

  useEffect(() => {
    ;(async () => {
      if (totalChartMetricsActive) {
        setChartData(GroupedChart)
      } else if (totalChartMetricsActive === false) {
        setChartData(GroupedChart)
      }
    })()
  }, [totalChartMetricsActive])

  useEffect(() => {
    if (isLoaded.current) {
      ;(async () => {
        setBigChart({
          id: 'Total Pnl',
          data: [{ data: chartData.total_pnl[0].data, label: 'Total Pnl' }],
          labels: chartData.labels,
        })

        if (strategyData.market) {
          const base = getBase(strategyData.market)
          const quote = getQuote(strategyData.market)
          setMarket({ base, quote })
        }
        if (last24MetricsActive == null) {
          setLast24MetricsActive(false)
        }
        if (totalChartMetricsActive == null) {
          setTotalChartMetricsActive(true)
        }
      })()
    }
  }, [strategyData.active_status])

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Strategy Details Page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this page contains all kinds of{' '}
              <span className="font-bold">
                {' '}
                KPIs relevant for your strategy
              </span>
              , status of the strategy and the exchange account{' '}
              <span className="font-bold">
                (indicated with the color of the tag)
              </span>
              , State controllers and Performance Charts and Metrics
            </h2>
            <h2></h2>
            <h2></h2>
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
      {
        title: <strong>Action Buttons</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              These are action buttons to change the status of the strategy, you
              can <span className="font-bold">pause</span>,{' '}
              <span className="font-bold">stop</span>,{' '}
              <span className="font-bold">continue</span> or{' '}
              <span className="font-bold">archive</span> the strategy from here,
              with some tooltips for more info
            </h2>
          </div>
        ),
        locale: {
          back: (
            <span className="rounded bg-autowhale-blue py-[4.8px] px-2 text-white">
              Back
            </span>
          ),
        },
        placement: 'left',
        target: '#step-3',
        styles: {
          options: {
            width: 450,
          },
        },
      },
      {
        title: <strong>Performance Metrics Widgets</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              these widgets represent{' '}
              <span className="font-bold"> the aggregated metrics</span> for
              this strategy, you can toggle above to check for the Last 24h
              Metrics,
            </h2>
            <h2>
              {' '}
              Some Widgets can be clicked to
              <span className="font-bold">
                {' '}
                change the chart on the right
              </span>{' '}
              to the Metric it represents
            </h2>
          </div>
        ),
        locale: {
          back: (
            <span className="rounded bg-autowhale-blue py-[4.8px] px-2 text-white">
              Back
            </span>
          ),
        },
        placement: 'auto',
        target: '#step-0',
        styles: {
          options: {
            width: 400,
          },
        },
      },
      {
        title: <strong>Performances Chart</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              This chart represents{' '}
              <span className="font-bold"> the performance of the Widget</span>{' '}
              that was clicked on the right, or one of the mini charts
              <span className="font-bold"> (found below)</span>
            </h2>
          </div>
        ),
        locale: {
          back: (
            <span className="rounded bg-autowhale-blue py-[4.8px] px-2 text-white">
              Back
            </span>
          ),
        },
        placement: 'auto',
        target: '#step-1',
        styles: {
          options: {
            width: 550,
          },
        },
      },
      {
        title: <strong>Strategy Parameters Controller</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              these inputs would be used to{' '}
              <span className="font-bold"> control and fine-tune</span> the
              strategy's parameters
            </h2>
          </div>
        ),
        locale: {
          back: (
            <span className="rounded bg-autowhale-blue py-[4.8px] px-2 text-white">
              Back
            </span>
          ),
        },
        placement: 'left',
        target: '#step-4',
      },
      {
        title: <strong>Behind-the-Scenes</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              these Performance metrics are fetched from our service, that{' '}
              <span className="font-bold">
                calculates them in a unified fashion
              </span>
              , they're also <span className="font-bold">pre-cached</span> in
              the backend for <span className="font-bold">fast loading!</span>
            </h2>
          </div>
        ),
        locale: {
          back: (
            <span className="rounded bg-autowhale-blue py-[4.8px] px-2 text-white">
              Back
            </span>
          ),
        },
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
      <ConfirmDialog />
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
      <div className="space-y-4 rounded-lg bg-color-secondary py-3.5 px-2 text-sm text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800 md:p-10">
        <div className="flex flex-col items-center space-y-2 md:flex md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <div
              className="flex items-center justify-center gap-2 hover:cursor-pointer"
              onMouseEnter={(e) => popoverRef?.current?.toggle(e)}
              onClick={(e) => {
                setVisibleBottom(true)
              }}>
              <h1 className="text-primary break-anywhere tooltip-button text-2xl font-semibold dark:text-white md:inline md:text-left">
                {strategyPopover}
              </h1>
              <BiChevronDownCircle
                size={30}
                className="fill-autowhale-blue dark:fill-white"
              />
            </div>
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <PopoverTable
                  strategies={strategies}
                  navigate={navigate}
                  ref={popoverRef}
                  setPopover={setStrategyPopover}
                  visibleBottom={visibleBottom}
                  setSidebar={setVisibleBottom}
                />
              </Suspense>
            </ErrorBoundary>
            <div className="flex flex-wrap gap-2">
              <Tag
                value={strategyData?.active_status}
                style={{
                  backgroundColor: getSeverity(strategyData?.active_status),
                }}
                className="text-sm md:text-lg"
              />
              <Tag value={strategyData?.type} className="text-sm md:text-lg" />
              <Link to={`/exchanges/${strategyData?.exchange_account_id}`}>
                <Tag
                  value={strategyData?.exchange_account_id}
                  style={{
                    backgroundColor: getSeverityExchange(
                      strategyData?.exchange_account_status
                    ),
                  }}
                  className="text-sm md:text-lg"
                />
              </Link>
            </div>
          </div>
          <h1 className="pt-1 text-xl text-autowhale-blue dark:text-white md:pt-0 md:text-3xl">
            {`${strategyData?.market} - ${strategyData?.exchange}`}
          </h1>
        </div>
        <ErrorBoundary FallbackComponent={Fallback}>
          <Suspense fallback={<Loader />}>
            {strategyData?.err_msg &&
            (strategyData?.active_status === 'paused_err' ||
              strategyData?.active_status === 'stop') ? (
              <div className="w-fit">
                <p className="font-semibold">Last error message</p>
                <Message
                  severity={
                    strategyData?.active_status === 'paused_err'
                      ? 'error'
                      : 'info'
                  }
                  text={`${strategyData?.err_msg}`}
                />
              </div>
            ) : null}
          </Suspense>
        </ErrorBoundary>
        <div className="flex w-full flex-col items-center justify-center gap-3 md:flex-row md:justify-between">
          <div className="flex h-fit w-fit rounded-md border-2 leading-none shadow-soft-lg dark:border-neutral-800">
            <button
              onClick={() => setLast24MetricsActive(false)}
              className={`items-center rounded-l-md px-4 py-2 transition-colors ease-in ${
                !last24MetricsActive
                  ? 'rounded-md bg-[#4432e2] text-white hover:bg-[#162963] dark:bg-color-tertiary dark:text-neutral-800 dark:hover:bg-[#787878]'
                  : ''
              } `}>
              <span>Total performance</span>
            </button>
            <button
              onClick={() => setLast24MetricsActive(true)}
              className={`items-center rounded-r-md px-4 py-2 transition-colors ease-in ${
                last24MetricsActive
                  ? 'rounded-md bg-[#4432e2] text-white hover:bg-[#162963] dark:bg-color-tertiary dark:text-neutral-800 dark:hover:bg-[#787878]'
                  : ''
              } `}>
              <span>Last 24h performance</span>
            </button>
          </div>
          <div id="step-3" className="flex flex-wrap justify-center gap-2">
            <TerminalButton
              text="Start"
              data-pr-tooltip="Starts/Continues the strategy after it's stopped"
              data-pr-position="top"
              data-pr-my="center bottom-10"
              className={`tooltip inline-flex w-fit flex-row-reverse items-center justify-center gap-2 px-4 ${
                strategyData &&
                (!editMode ||
                  strategyData['active_status'] === 'active' ||
                  strategyData['active_status'] === 'new' ||
                  strategyData['active_status'] === 'pausing' ||
                  strategyData['active_status'] === 'stopped' ||
                  strategyData['is_streaming_strategy'] === true)
                  ? 'pointer-events-none bg-neutral-400 dark:bg-neutral-800'
                  : ''
              }`}
              onClick={() => handleSetStrategyStatus('new')}>
              <BiSolidRightArrow color="white" size={20} />
            </TerminalButton>
            <TerminalButton
              text="Pause"
              data-pr-tooltip="Pauses the strategy and cancels all open orders in next iteration of the bot. Terminates after next iteration."
              data-pr-position="top"
              data-pr-my="center bottom-10"
              className={`tooltip inline-flex w-fit flex-row-reverse items-center justify-center gap-2 px-4 ${
                strategyData &&
                (!editMode ||
                  strategyData['active_status'] === 'paused' ||
                  strategyData['active_status'] === 'stopped' ||
                  strategyData['active_status'] === 'pausing' ||
                  strategyData['active_status'] === 'paused_err' ||
                  strategyData['active_status'] === 'stop' ||
                  strategyData['is_streaming_strategy'] === true)
                  ? 'pointer-events-none bg-neutral-400 dark:bg-neutral-800'
                  : ''
              }`}
              onClick={() => handleSetStrategyStatus('pausing')}>
              <BiPause color="white" size={20} />
            </TerminalButton>
            <TerminalButton
              text="Stop"
              data-pr-tooltip="Stops the strategy and immediately cancels all open orders of the strategy; can be restarted"
              data-pr-position="top"
              data-pr-my="center bottom-10"
              className={`tooltip inline-flex w-fit flex-row-reverse items-center justify-center gap-2 px-4 ${
                !editMode ||
                strategyData['active_status'] === 'paused' ||
                strategyData['active_status'] === 'stopped' ||
                strategyData['active_status'] === 'stop'
                  ? 'pointer-events-none bg-neutral-400 dark:bg-neutral-800'
                  : ''
              }`}
              onClick={() => handleSetStrategyStatus('stop')}>
              <BiStop color="white" size={20} />
            </TerminalButton>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:justify-center">
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <div className="space-y-3 lg:w-2/4">
                  <div
                    id="step-0"
                    className={`mt-5 grid grid-cols-2 gap-3  xl:mt-0 ${
                      width > 1024 ? 'automaticGridTiles' : ''
                    } `}>
                    <Tile
                      description={`${
                        last24MetricsActive ? 'Last 24h' : 'Total'
                      }`}
                      title={'Total PnL'}
                      data={`${fetchedData.totalPnl} ${market?.quote ?? '-'}`}
                      className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                      onClick={(e) => {
                        handleClick(e, 'total_pnl')
                      }}
                    />
                    <Tile
                      description={`${
                        last24MetricsActive ? 'Last 24h' : 'Total'
                      }`}
                      title={'Realized PnL'}
                      className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                      onClick={(e) => {
                        handleClick(e, 'realized_pnl')
                      }}
                      data={`${fetchedData.realizedPnl} ${
                        market?.quote ?? '-'
                      }`}
                    />
                    <Tile
                      description={`${
                        last24MetricsActive ? 'Last 24h' : 'Total'
                      }`}
                      title={'Unrealized PnL'}
                      className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                      onClick={(e) => {
                        handleClick(e, 'unrealized_pnl')
                      }}
                      data={`${fetchedData.unrealizedPnl} ${
                        market?.quote ?? '-'
                      } `}
                    />
                    <Tile
                      description={''}
                      title={'Last traded price'}
                      data={`${fetchedData.lastPrice} ${market?.quote ?? '-'}`}
                    />
                    <Tile
                      description={`${
                        last24MetricsActive ? 'Last 24h' : 'Total'
                      }`}
                      title={'Avg. execution time'}
                      className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                      onClick={(e) => {
                        handleClick(e, 'execution_time')
                      }}
                      data={`${fetchedData.avgExecution}s`}
                    />
                    <Tile
                      description={`${
                        last24MetricsActive ? 'Last 24h' : 'Total'
                      }`}
                      title={'Execution ratio'}
                      data={fetchedData.executionRatio}
                    />
                    {last24MetricsActive ? (
                      <Tile
                        description={`Last 24h`}
                        title={'Exceeding Inventory'}
                        data={`${fetchedData.exceedingInventory} ${
                          market?.quote ?? '-'
                        }`}
                      />
                    ) : null}
                    {last24MetricsActive ? (
                      <Tile
                        description={`Last 24h`}
                        title={'Excess Inventory Cost'}
                        data={`${fetchedData.excessInventoryCost} ${
                          market?.base ?? '-'
                        }`}
                      />
                    ) : null}
                    {last24MetricsActive ? (
                      <Tile
                        description={`Last 24h`}
                        title={'Num of Orders'}
                        className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                        onClick={(e) => {
                          handleClick(e, 'num_of_orders')
                        }}
                        data={fetchedData.numOfOrders}
                      />
                    ) : null}
                    {last24MetricsActive ? (
                      <Tile
                        description={`Last 24h`}
                        title={'Paid Fees'}
                        data={fetchedData.paidFees}
                      />
                    ) : null}
                    <Tile
                      description={`${
                        last24MetricsActive ? 'Last 24h' : 'Total'
                      }`}
                      title={'Buy/sell execution ratio'}
                      className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                      onClick={(e) => {
                        handleClick(e, 'executed_buy_sell_ratio')
                      }}
                      data={fetchedData.buySellExecRatio}
                    />
                    <Tile
                      description={`${
                        last24MetricsActive ? 'Last 24h' : 'Total'
                      }`}
                      title={'Volume of strategy'}
                      className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                      onClick={(e) => {
                        handleClick(e, 'volume')
                      }}
                      data={`${fetchedData.volume} ${market?.quote ?? '-'}`}
                    />
                    <Tile
                      description={`${
                        last24MetricsActive ? 'Last 24h' : 'Total'
                      }`}
                      title={'Supplied Buy liquidity'}
                      className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                      onClick={(e) => {
                        handleClick(e, 'buy_liquidity_supplied')
                      }}
                      data={`${fetchedData.buyLiquidity} ${
                        market?.base ?? '-'
                      }`}
                    />
                    <Tile
                      description={`${
                        last24MetricsActive ? 'Last 24h' : 'Total'
                      }`}
                      title={'Supplied Sell liquidity'}
                      className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                      onClick={(e) => {
                        handleClick(e, 'sell_liquidity_supplied')
                      }}
                      data={`${fetchedData.sellLiquidity} ${
                        market?.base ?? '-'
                      }`}
                    />
                    {!last24MetricsActive ? (
                      <Tile
                        description={'Total'}
                        title={'Open position break even'}
                        className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                        onClick={(e) => {
                          handleClick(e, 'open_position_break_even_price')
                        }}
                        data={`${fetchedData.openPositionBreakeven} ${
                          market?.quote ?? '-'
                        }`}
                      />
                    ) : null}
                    {!last24MetricsActive ? (
                      <Tile
                        description={'Total'}
                        title={'Open position cost'}
                        className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                        onClick={(e) => {
                          handleClick(e, 'open_position_cost')
                        }}
                        data={`${fetchedData.openPositionCost} ${
                          market?.quote ?? '-'
                        }`}
                      />
                    ) : null}
                    {!last24MetricsActive ? (
                      <Tile
                        description={'Total'}
                        title={'Open position size'}
                        className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                        onClick={(e) => {
                          handleClick(e, 'open_position_size')
                        }}
                        data={`${fetchedData.openPositionSize} ${
                          market?.base ?? '-'
                        }`}
                      />
                    ) : null}
                    {!last24MetricsActive ? (
                      <Tile
                        description={`Total`}
                        title={'Fees'}
                        className="hover:cursor-pointer hover:border-autowhale-blue/40 hover:dark:border-neutral-300"
                        onClick={(e) => {
                          handleClick(e, 'fees')
                        }}
                        data={`${fetchedData.fees} ${market?.quote ?? '-'}`}
                      />
                    ) : null}
                  </div>
                </div>
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <div id="step-1" className="space-y-2 lg:w-2/4">
                  <PrimaryChart
                    id={bigChart.id}
                    metricsData={bigChart.data}
                    metricsTime={chartData.labels}
                  />
                  <div
                    id="step-4"
                    className="flex justify-center overflow-y-hidden py-2">
                    <EditStrategy
                      strategyData={strategyData}
                      editMode={editMode}
                      setEditMode={setEditMode}
                    />
                  </div>
                  <Tooltip target=".tooltip" />

                  <div className="flex flex-wrap justify-center gap-2 text-center">
                    <TerminalButton
                      text={editMode ? 'Edit' : 'Save'}
                      data-pr-tooltip="Edit the strategy's parameters, editing is only possible in paused state"
                      data-pr-position="top"
                      data-pr-my="center bottom-10"
                      className={`tooltip inline-flex w-[8rem] flex-row-reverse items-center justify-center gap-2 px-4  ${
                        (strategyData &&
                          strategyData['active_status'] === 'stopped') ||
                        strategyData['active_status'] === 'active' ||
                        strategyData['active_status'] === 'pausing' ||
                        strategyData['active_status'] === 'new'
                          ? 'pointer-events-none bg-neutral-400 dark:bg-neutral-800'
                          : ''
                      }`}
                      type="submit"
                      form="editForm">
                      <BiEdit color="white" size={23} />
                    </TerminalButton>
                    {!editMode && (
                      <TerminalButton
                        data-pr-tooltip="Cancel the strategy's changes"
                        data-pr-position="top"
                        data-pr-my="center bottom-10"
                        text={'Cancel'}
                        className={`tooltip inline-flex w-[8rem] flex-row-reverse items-center justify-center gap-2 px-4`}
                        onClick={() => {
                          setEditMode(!editMode)
                          setResetForm(true)
                        }}>
                        <BiXCircle color="white" size={20} />
                      </TerminalButton>
                    )}
                    {editMode && (
                      <TerminalButton
                        text="Archive"
                        data-pr-tooltip="Pauses the strategy in the next iteration and archives it. Cannot be rerun again. Archive also works for strategies in STOP."
                        data-pr-position="top"
                        data-pr-my="center bottom-10"
                        className={`tooltip inline-flex w-[8rem] flex-row-reverse items-center justify-center gap-2 px-4 ${
                          strategyData['active_status'] === 'stopped' ||
                          strategyData['active_status'] === 'pausing' ||
                          strategyData['active_status'] === 'active' ||
                          strategyData['active_status'] === 'new'
                            ? 'pointer-events-none bg-neutral-400 dark:bg-neutral-800'
                            : ''
                        }`}
                        onClick={() => handleSetStrategyStatus('stopped')}>
                        <BiArchiveIn color="white" size={20} />
                      </TerminalButton>
                    )}
                  </div>
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>

          <div className="flex w-full justify-center md:justify-start">
            <div className="flex w-fit rounded-md border-2 leading-none shadow-soft-lg dark:border-neutral-800">
              <button
                onClick={() => setTotalChartMetricsActive(true)}
                className={`items-center rounded-l-md px-4 py-2 transition-colors ease-in ${
                  totalChartMetricsActive
                    ? 'rounded-md bg-[#4432e2] text-white hover:bg-[#162963] dark:bg-color-tertiary dark:text-neutral-800 dark:hover:bg-[#787878]'
                    : ''
                } `}>
                <span>Total performance</span>
              </button>
              <button
                onClick={() => setTotalChartMetricsActive(false)}
                className={`items-center rounded-r-md px-4 py-2 transition-colors ease-in ${
                  !totalChartMetricsActive
                    ? 'rounded-md bg-[#4432e2] text-white hover:bg-[#162963] dark:bg-color-tertiary dark:text-neutral-800 dark:hover:bg-[#787878]'
                    : ''
                } `}>
                <span>Grouped performance</span>
              </button>
            </div>
          </div>

          {/* //? the Charts, no charts is better performance for the big chart  */}
          <ErrorBoundary FallbackComponent={Fallback}>
            <Suspense fallback={<Loader />}>
              <div
                className={`relative mb-5 rounded-lg border md:px-5 md:pb-5 ${
                  !totalChartMetricsActive ? 'pt-20' : 'pt-2 md:pt-5'
                }  dark:border-neutral-700 dark:bg-neutral-900`}>
                {!totalChartMetricsActive ? (
                  <SelectInput
                    options={timeFrames}
                    handler={handleSelectWrapper}
                    className="!absolute !top-5 !left-5 !z-10 w-80 xl:w-96"
                  />
                ) : null}

                <div className="flex gap-3 overflow-x-scroll pb-2 md:gap-5 md:pb-5">
                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="Total Pnl"
                      value="total_pnl"
                      metricsData={chartData.total_pnl}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>
                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="Realized Pnl"
                      value="realized_pnl"
                      metricsData={chartData.realized_pnl}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>
                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="Unrealized Profit & Loss (PnL)"
                      value="unrealized_pnl"
                      metricsData={chartData.unrealized_pnl}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>
                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="Volume"
                      value="volume"
                      metricsData={chartData.volume}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>

                  {totalChartMetricsActive ? (
                    <div
                      className="w-72 hover:cursor-pointer xl:w-[40rem]"
                      onClick={handleClick}>
                      <MinionChart
                        id="Open position size"
                        value="open_position_size"
                        metricsData={chartData.open_position_size}
                        metricsTime={chartData.labels}
                        className="w-72 xl:w-[40rem]"
                        handler={handleWrapper}
                      />
                    </div>
                  ) : null}

                  {totalChartMetricsActive ? (
                    <div
                      className="w-72 hover:cursor-pointer xl:w-[40rem]"
                      onClick={handleClick}>
                      <MinionChart
                        id="Open position cost"
                        value="open_position_cost"
                        metricsData={chartData.open_position_cost}
                        metricsTime={chartData.labels}
                        className="w-72 xl:w-[40rem]"
                        handler={handleWrapper}
                      />
                    </div>
                  ) : null}

                  {totalChartMetricsActive ? (
                    <div
                      className="w-72 hover:cursor-pointer xl:w-[40rem]"
                      onClick={handleClick}>
                      <MinionChart
                        id="Open position break even price"
                        value="open_position_break_even_price"
                        metricsData={chartData.open_position_break_even_price}
                        metricsTime={chartData.labels}
                        className="w-72 xl:w-[40rem]"
                        handler={handleWrapper}
                      />
                    </div>
                  ) : null}
                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="Buy Liquidity Supplied"
                      value="buy_liquidity_supplied"
                      metricsData={chartData.buy_liquidity_supplied}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>
                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="Sell Liquidity Supplied"
                      value="sell_liquidity_supplied"
                      metricsData={chartData.sell_liquidity_supplied}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>
                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="Number of orders"
                      value="num_of_orders"
                      metricsData={chartData.num_of_orders}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>

                  {totalChartMetricsActive ? (
                    <div
                      className="w-72 hover:cursor-pointer xl:w-[40rem]"
                      onClick={handleClick}>
                      <MinionChart
                        id="Inventory Cost"
                        value="inventory_cost"
                        metricsData={chartData.inventory_cost}
                        metricsTime={chartData.labels}
                        className="w-72 xl:w-[40rem]"
                        handler={handleWrapper}
                      />
                    </div>
                  ) : null}
                  {totalChartMetricsActive ? (
                    <div
                      className="w-72 hover:cursor-pointer xl:w-[40rem]"
                      onClick={handleClick}>
                      <MinionChart
                        id="Inventory Size"
                        value="inventory_size"
                        metricsData={chartData.inventory_size}
                        metricsTime={chartData.labels}
                        className="w-72 xl:w-[40rem]"
                        handler={handleWrapper}
                      />
                    </div>
                  ) : null}
                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="Execution time"
                      value="execution_time"
                      metricsData={chartData.execution_time}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>
                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="Executed buy/sell ratio"
                      value="executed_buy_sell_ratio"
                      metricsData={chartData.executed_buy_sell_ratio}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>
                  {!totalChartMetricsActive ? (
                    <div
                      className="w-72 hover:cursor-pointer xl:w-[40rem]"
                      onClick={handleClick}>
                      <MinionChart
                        id="Exceeding inventory"
                        value="exceeding_inventory"
                        metricsData={chartData.exceeding_inventory}
                        metricsTime={chartData.exceeding_inventory_labels}
                        className="w-72 xl:w-[40rem]"
                        handler={handleWrapper}
                      />
                    </div>
                  ) : null}
                  {!totalChartMetricsActive ? (
                    <div
                      className="w-72 hover:cursor-pointer xl:w-[40rem]"
                      onClick={handleClick}>
                      <MinionChart
                        id="Excess inventory cost"
                        value="excess_inventory_cost"
                        metricsData={chartData.excess_inventory_cost}
                        metricsTime={chartData.excess_inventory_cost_labels}
                        className="w-72 xl:w-[40rem]"
                        handler={handleWrapper}
                      />
                    </div>
                  ) : null}

                  <div
                    className="w-72 hover:cursor-pointer xl:w-[40rem]"
                    onClick={handleClick}>
                    <MinionChart
                      id="fees"
                      value="fees"
                      metricsData={chartData.fees}
                      metricsTime={chartData.labels}
                      className="w-72 xl:w-[40rem]"
                      handler={handleWrapper}
                    />
                  </div>
                  {!totalChartMetricsActive ? (
                    <div
                      className="w-72 hover:cursor-pointer xl:w-[40rem]"
                      onClick={handleClick}>
                      <MinionChart
                        id="Fees paid"
                        value="fees_paid"
                        metricsData={chartData.fees_paid}
                        metricsTime={chartData.fees_paid_labels}
                        className="w-72 xl:w-[40rem]"
                        handler={handleWrapper}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary FallbackComponent={Fallback}>
            <Suspense fallback={<Loader />}>
              <Orders strategyId={strategyId} />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="absolute bottom-5 right-9 z-20">
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
      </div>
    </>
  )
}

export default Strategy
