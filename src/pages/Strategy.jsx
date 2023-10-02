import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useParams } from 'react-router-dom'

import { UserService } from '../services'
import { getGroupedMetrics } from '../utils/Fetchers/StateFetchers'

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
import { getBase, getQuote } from '../utils/misc'

const Strategy = () => {
  const { strategyId } = useParams()
  const { width } = useWindowSize()
  const isLoaded = useRef(false)
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
    setChartData(ChartData)
    setFetchedData(MetricData)
    setStrategyData(StrategyData)

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
    const res = await getGroupedMetrics(strategyId, select.value)
    if (res) {
      const labels = res.map((item) => item.insertion_datetime)
      const metrics = res.map((item) => item.metrics)
      const data = metrics.map((item) => item[valueKey])

      setChartData((prev) => ({
        ...prev,
        [`${valueKey}_labels`]: labels,
        [valueKey]: [{ data: data, label: valueKey }],
      }))
      setLast24MetricsActive(true)
      toast.success('Finished loading Grouped Charts', { id: handleToast })
    } else if (res.status !== 200) {
      toast.error(res.response.data.message, { id: handleToast })
    }
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

  return (
    <>
      <ConfirmDialog />

      <div className="space-y-4 rounded-lg bg-color-secondary p-3.5 text-sm text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800 md:p-10">
        <div className="flex flex-col items-center space-y-2 md:flex md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <h1 className="text-primary break-all  text-2xl font-semibold dark:text-white md:inline md:text-left">
              {strategyId}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Tag
                value={strategyData?.active_status}
                style={{
                  backgroundColor: getSeverity(strategyData?.active_status),
                }}
                className="text-sm md:text-lg"
              />
              <Tag value={strategyData?.type} className="text-sm md:text-lg" />
              <Tag
                value={strategyData?.exchange_account_id}
                style={{
                  backgroundColor: getSeverityExchange(
                    strategyData?.exchange_account_status
                  ),
                }}
                className="text-sm md:text-lg"
              />
            </div>
          </div>
          <h1 className="pt-1 text-xl text-autowhale-blue dark:text-white md:pt-0 md:text-3xl">
            {`${strategyData?.market} - ${strategyData?.exchange}`}
          </h1>
        </div>

        {strategyData?.err_msg && (
          <div className="w-fit">
            <p className="font-semibold">Last error message</p>
            <Message
              severity={
                strategyData?.active_status === 'paused_err' ? 'error' : 'info'
              }
              text={`${strategyData?.err_msg}`}
            />
          </div>
        )}

        <div className="flex w-full justify-center md:justify-start">
          <div className="flex w-fit rounded-md border-2 leading-none shadow-soft-lg dark:border-neutral-800">
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
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:justify-center">
            <div className="space-y-3 lg:w-2/4">
              <div
                className={`mt-5 grid grid-cols-2 gap-3  xl:mt-0 ${
                  width > 1024 ? 'automaticGridTiles' : ''
                } `}>
                <Tile
                  description={`${last24MetricsActive ? 'Last 24h' : 'Total'}`}
                  title={'Total PnL'}
                  data={`${fetchedData.totalPnl} ${market?.quote ?? '-'}`}
                />
                <Tile
                  description={`${last24MetricsActive ? 'Last 24h' : 'Total'}`}
                  title={'Realized PnL'}
                  data={`${fetchedData.realizedPnl} ${market?.quote ?? '-'}`}
                />
                <Tile
                  description={`${last24MetricsActive ? 'Last 24h' : 'Total'}`}
                  title={'Unrealized PnL'}
                  data={`${fetchedData.unrealizedPnl} ${market?.quote ?? '-'} `}
                />
                <Tile
                  description={''}
                  title={'Last traded price'}
                  data={`${fetchedData.lastPrice} ${market?.quote ?? '-'}`}
                />
                <Tile
                  description={`${last24MetricsActive ? 'Last 24h' : 'Total'}`}
                  title={'Avg. execution time'}
                  data={`${fetchedData.avgExecution}s`}
                />
                <Tile
                  description={`${last24MetricsActive ? 'Last 24h' : 'Total'}`}
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
                  description={`${last24MetricsActive ? 'Last 24h' : 'Total'}`}
                  title={'Buy/sell execution ratio'}
                  data={fetchedData.buySellExecRatio}
                />
                <Tile
                  description={`${last24MetricsActive ? 'Last 24h' : 'Total'}`}
                  title={'Volume of strategy'}
                  data={`${fetchedData.volume} ${market?.quote ?? '-'}`}
                />
                <Tile
                  description={`${last24MetricsActive ? 'Last 24h' : 'Total'}`}
                  title={'Supplied Buy liquidity'}
                  data={`${fetchedData.buyLiquidity} ${market?.base ?? '-'}`}
                />
                <Tile
                  description={`${last24MetricsActive ? 'Last 24h' : 'Total'}`}
                  title={'Supplied Sell liquidity'}
                  data={`${fetchedData.sellLiquidity} ${market?.base ?? '-'}`}
                />
                {!last24MetricsActive ? (
                  <Tile
                    description={'Total'}
                    title={'Open position break even'}
                    data={`${fetchedData.openPositionBreakeven} ${
                      market?.quote ?? '-'
                    }`}
                  />
                ) : null}
                {!last24MetricsActive ? (
                  <Tile
                    description={'Total'}
                    title={'Open position cost'}
                    data={`${fetchedData.openPositionCost} ${
                      market?.quote ?? '-'
                    }`}
                  />
                ) : null}
                {!last24MetricsActive ? (
                  <Tile
                    description={'Total'}
                    title={'Open position size'}
                    data={`${fetchedData.openPositionSize} ${
                      market?.base ?? '-'
                    }`}
                  />
                ) : null}
                {!last24MetricsActive ? (
                  <Tile
                    description={`Total`}
                    title={'Fees'}
                    data={`${fetchedData.fees} ${market?.quote ?? '-'}`}
                  />
                ) : null}
              </div>
            </div>
            <div className="space-y-2 lg:w-2/4">
              <PrimaryChart
                id={bigChart.id}
                metricsData={bigChart.data}
                metricsTime={chartData.labels}
              />
              <div className="flex justify-center overflow-y-hidden py-2">
                <EditStrategy
                  strategyData={strategyData}
                  editMode={editMode}
                  setEditMode={setEditMode}
                />
              </div>
              <Tooltip target=".tooltip" />
              {UserService.hasRole(['trader']) && (
                <div className="flex flex-wrap justify-center gap-2 text-center">
                  {editMode && (
                    <TerminalButton
                      data-pr-tooltip="Pauses the strategy and cancels all open orders in next iteration of the bot. Terminates after next iteration."
                      data-pr-position="top"
                      data-pr-my="center bottom-10"
                      text={'Pause strategy'}
                      styles={`w-full md:w-40 tooltip ${
                        strategyData &&
                        (strategyData['active_status'] === 'paused' ||
                          strategyData['active_status'] === 'stopped' ||
                          strategyData['active_status'] === 'pausing' ||
                          strategyData['active_status'] === 'paused_err' ||
                          strategyData['active_status'] === 'stop' ||
                          strategyData['is_streaming_strategy'] === true)
                          ? 'bg-neutral-500 dark:bg-neutral-800 pointer-events-none'
                          : ''
                      }`}
                      onClick={() => handleSetStrategyStatus('pausing')}
                    />
                  )}

                  {editMode && (
                    <TerminalButton
                      data-pr-tooltip="Starts the strategy after it’s stopped"
                      data-pr-position="top"
                      data-pr-my="center bottom-10"
                      text={'Start strategy'}
                      styles={`w-full sm:w-40 tooltip ${
                        strategyData &&
                        (strategyData['active_status'] === 'active' ||
                          strategyData['active_status'] === 'new' ||
                          strategyData['active_status'] === 'pausing' ||
                          strategyData['active_status'] === 'stopped')
                          ? 'bg-neutral-500 dark:bg-neutral-800 pointer-events-none'
                          : ''
                      }`}
                      onClick={() => handleSetStrategyStatus('new')}
                    />
                  )}

                  {editMode && (
                    <TerminalButton
                      text={'Continue strategy'}
                      data-pr-tooltip="Starts the strategy again after it was paused"
                      data-pr-position="top"
                      data-pr-my="center bottom-10"
                      styles={`w-full sm:w-40 tooltip ${
                        strategyData &&
                        (strategyData['active_status'] === 'active' ||
                          strategyData['active_status'] === 'new' ||
                          strategyData['active_status'] === 'stop' ||
                          strategyData['active_status'] === 'pausing' ||
                          strategyData['active_status'] === 'stopped' ||
                          strategyData['is_streaming_strategy'] === true)
                          ? 'bg-neutral-500 dark:bg-neutral-800 pointer-events-none'
                          : ''
                      } `}
                      onClick={() => handleSetStrategyStatus('new')}
                    />
                  )}

                  <TerminalButton
                    data-pr-tooltip="Edit the strategy's parameters, editing is only possible in paused state"
                    data-pr-position="top"
                    data-pr-my="center bottom-10"
                    text={editMode ? 'Edit strategy' : 'Save strategy'}
                    styles={`w-full sm:w-40 tooltip ${
                      (strategyData &&
                        strategyData['active_status'] === 'stopped') ||
                      strategyData['active_status'] === 'active' ||
                      strategyData['active_status'] === 'pausing' ||
                      strategyData['active_status'] === 'new'
                        ? 'bg-neutral-500 dark:bg-neutral-800 pointer-events-none'
                        : ''
                    }`}
                    type="submit"
                    form="editForm"
                  />

                  {!editMode && (
                    <TerminalButton
                      data-pr-tooltip="Cancel the strategy's changes"
                      data-pr-position="top"
                      data-pr-my="center bottom-10"
                      text={'Cancel'}
                      styles={`w-full sm:w-40 tooltip`}
                      onClick={() => {
                        setEditMode(!editMode)
                        setResetForm(true)
                      }}
                    />
                  )}

                  {editMode && (
                    <TerminalButton
                      data-pr-tooltip="Pauses the strategy in the next iteration and archives it. Cannot be rerun again. Archive also works for strategies in STOP."
                      data-pr-position="top"
                      data-pr-my="center bottom-10"
                      text={'Archive strategy'}
                      styles={`w-full sm:w-40 tooltip ${
                        strategyData['active_status'] === 'stopped' ||
                        strategyData['active_status'] === 'pausing' ||
                        strategyData['active_status'] === 'active' ||
                        strategyData['active_status'] === 'new'
                          ? 'bg-neutral-500 dark:bg-neutral-800 pointer-events-none'
                          : ''
                      }`}
                      onClick={() => handleSetStrategyStatus('stopped')}
                    />
                  )}
                  {editMode && (
                    <TerminalButton
                      data-pr-tooltip="Stops the strategy and immediately cancels all open orders of the strategy; can be restarted"
                      data-pr-position="top"
                      data-pr-my="center bottom-10"
                      text={'Stop strategy'}
                      styles={`w-full sm:w-40 tooltip ${
                        strategyData['active_status'] === 'paused' ||
                        strategyData['active_status'] === 'stopped' ||
                        strategyData['active_status'] === 'stop'
                          ? 'bg-neutral-500 dark:bg-neutral-800 pointer-events-none'
                          : ''
                      }`}
                      onClick={() => handleSetStrategyStatus('stop')}
                    />
                  )}
                </div>
              )}
            </div>
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
          <div
            className={`relative mb-5 rounded-lg border px-5 pb-5 ${
              !totalChartMetricsActive ? 'pt-20' : 'pt-5'
            }  dark:border-neutral-700 dark:bg-neutral-900`}>
            {!totalChartMetricsActive ? (
              <SelectInput
                options={timeFrames}
                handler={handleSelectWrapper}
                className="!absolute !top-5 !left-5 !z-10 w-80 xl:w-96"
              />
            ) : null}

            <div className="flex gap-5 overflow-x-scroll lg:pb-5">
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
                    value="open_position_size"
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
          <Orders strategyId={strategyId} />
        </div>
      </div>
    </>
  )
}

export default Strategy
