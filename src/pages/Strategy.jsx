import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useParams } from 'react-router-dom'

import { UserService } from '../services'
import {
  fetchChartData,
  fetchChartGroupedMetrics,
  fetchExchangeStatus,
  fetchGroupedMetrics,
  fetchLastTradedPrice,
  fetchRollingMetrics,
  fetchStrategy,
  setStrategyStatus,
} from '../utils/Fetchers/StrategyFetchers'
import { getGroupedMetrics } from '../utils/Fetchers/StateFetchers'

import { Tooltip } from 'primereact/tooltip'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Tag } from 'primereact/tag'

import {
  TerminalButton,
  Orders,
  Tile,
  SelectChart,
  EditStrategy,
} from '../components'
import { getSeverity } from './Strategies'
import { getSeverity as getSeverityExchange } from './Exchanges'

import { timeFrames } from '../utils/constants'
import { getBase, getQuote } from '../utils/misc'
import { Message } from 'primereact/message'

const Strategy = () => {
  const { strategyId } = useParams()
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
    toast.dismiss()
    async function fetchAllData() {
      await fetchStrategy(setStrategyData, strategyId)
    }
    fetchAllData()
    isLoaded.current = true
  }, [])

  const handleSetStrategyStatus = async (status) => {
    confirmDialog({
      message: 'Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        const t = toast.loading(`Changing strategy status`)
        const resStatus = await setStrategyStatus(strategyId, status)

        if (resStatus === 200) {
          await fetchStrategy(setStrategyData, strategyId)
          toast.success(`Successfully changed strategy status to ${status}`, {
            id: t,
          })
        } else {
          toast.error(`Failed to change strategy status to ${status}`, {
            id: t,
          })
        }
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
      toast.success('Finished loading Grouped Charts', { id: handleToast })
    } else if (res.status !== 200) {
      toast.error(res.response.data.message, { id: handleToast })
    }
  }
  //? wrapper here to send in the select and the value key
  const handleWrapper = (select, valueKey) => {
    handleSelect(select, valueKey)
  }
  useEffect(() => {
    if (isLoaded.current) {
      ;(async () => {
        if (strategyData.market) {
          const base = getBase(strategyData.market)
          const quote = getQuote(strategyData.market)
          setMarket({ base, quote })
          fetchExchangeStatus(strategyData.exchange_account_id, setStrategyData)
          fetchLastTradedPrice(
            strategyData.market,
            strategyData.exchange,
            setFetchedData
          )
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

  useEffect(() => {
    ;(async () => {
      if (last24MetricsActive) {
        await fetchGroupedMetrics(setFetchedData, strategyId)
      } else if (last24MetricsActive === false) {
        await fetchRollingMetrics(setFetchedData, strategyId)
      }
    })()
  }, [last24MetricsActive])

  useEffect(() => {
    ;(async () => {
      if (totalChartMetricsActive) {
        await fetchChartData(setChartData, strategyId)
      } else if (totalChartMetricsActive === false) {
        await fetchChartGroupedMetrics(setChartData, strategyId)
      }
    })()
  }, [totalChartMetricsActive])

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
          <h1 className="pt-1 text-xl md:pt-0 md:text-3xl">
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
                  ? 'rounded-md bg-[#1F3B8C] text-white hover:bg-[#162963] dark:bg-color-tertiary dark:text-white dark:hover:bg-[#787878]'
                  : ''
              } `}>
              <span>Total performance</span>
            </button>
            <button
              onClick={() => setLast24MetricsActive(true)}
              className={`items-center rounded-r-md px-4 py-2 transition-colors ease-in ${
                last24MetricsActive
                  ? 'rounded-md bg-[#1F3B8C] text-white hover:bg-[#162963] dark:bg-color-tertiary dark:text-white dark:hover:bg-[#787878]'
                  : ''
              } `}>
              <span>Last 24h performance</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-10">
          <div className="flex justify-center space-x-4">
            <div className="col-span-2 mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:mt-0 xl:grid-cols-4 ">
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
          <div className="flex justify-center overflow-y-hidden py-2">
            <EditStrategy
              strategyData={strategyData}
              editMode={editMode}
              setEditMode={setEditMode}
            />
          </div>
          <Tooltip target=".tooltip" />
          {UserService.hasRole(['trader']) && (
            <div className="space-y-2 text-center sm:space-x-4">
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
                      ? '!from-gray-800 !to-gray-500 pointer-events-none'
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
                      ? '!from-gray-800 !to-gray-500 pointer-events-none'
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
                      ? '!from-gray-800 !to-gray-500 pointer-events-none'
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
                    ? '!from-gray-800 !to-gray-500 pointer-events-none'
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
                  onClick={() => setEditMode(!editMode)}
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
                      ? '!from-gray-800 !to-gray-500 pointer-events-none'
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
                      ? '!from-gray-800 !to-gray-500 pointer-events-none'
                      : ''
                  }`}
                  onClick={() => handleSetStrategyStatus('stop')}
                />
              )}
            </div>
          )}
          <div className="flex w-full justify-center md:justify-start">
            <div className="flex w-fit rounded-md border-2 leading-none shadow-soft-lg dark:border-neutral-800">
              <button
                onClick={() => setTotalChartMetricsActive(true)}
                className={`items-center rounded-l-md px-4 py-2 transition-colors ease-in ${
                  totalChartMetricsActive
                    ? 'rounded-md bg-[#1F3B8C] text-white hover:bg-[#162963] dark:bg-color-tertiary dark:text-white dark:hover:bg-[#787878]'
                    : ''
                } `}>
                <span>Total performance</span>
              </button>
              <button
                onClick={() => setTotalChartMetricsActive(false)}
                className={`items-center rounded-r-md px-4 py-2 transition-colors ease-in ${
                  !totalChartMetricsActive
                    ? 'rounded-md bg-[#1F3B8C] text-white hover:bg-[#162963] dark:bg-color-tertiary dark:text-white dark:hover:bg-[#787878]'
                    : ''
                } `}>
                <span>Grouped performance</span>
              </button>
            </div>
          </div>
          <div className="mb-5 grid grid-cols-1 xl:grid-cols-2">
            <SelectChart
              title="Total Profit & loss (PnL)"
              LineChartData={chartData.total_pnl}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.total_pnl_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="total_pnl"
              handler={handleWrapper}
            />
            <SelectChart
              title="Realized Profit & Loss (PnL)"
              LineChartData={chartData.realized_pnl}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.realized_pnl_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="realized_pnl"
              handler={handleWrapper}
            />
            <SelectChart
              title="Unrealized Profit & Loss (PnL)"
              LineChartData={chartData.unrealized_pnl}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.unrealized_pnl_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="unrealized_pnl"
              handler={handleWrapper}
            />
            <SelectChart
              title="Volume"
              LineChartData={chartData.volume}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.volume_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="volume"
              handler={handleWrapper}
            />
            {totalChartMetricsActive ? (
              <SelectChart
                title="Open position size"
                LineChartData={chartData.open_position_size}
                LineChartLabel={chartData.labels}
              />
            ) : null}
            {totalChartMetricsActive ? (
              <SelectChart
                title="Open position cost"
                LineChartData={chartData.open_position_cost}
                LineChartLabel={chartData.labels}
              />
            ) : null}
            {totalChartMetricsActive ? (
              <SelectChart
                title="Open position break even price"
                LineChartData={chartData.open_position_break_even_price}
                LineChartLabel={chartData.labels}
              />
            ) : null}

            <SelectChart
              title="Buy Liquidity Supplied"
              LineChartData={chartData.buy_liquidity_supplied}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.buy_liquidity_supplied_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="buy_liquidity_supplied"
              handler={handleWrapper}
            />
            <SelectChart
              title="Sell Liquidity Supplied"
              LineChartData={chartData.sell_liquidity_supplied}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.sell_liquidity_supplied_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="sell_liquidity_supplied"
              handler={handleWrapper}
            />
            <SelectChart
              title="Number of orders"
              LineChartData={chartData.num_of_orders}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.num_of_orders_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="num_of_orders"
              handler={handleWrapper}
            />
            {totalChartMetricsActive ? (
              <SelectChart
                title="Inventory Cost"
                LineChartData={chartData.inventory_cost}
                LineChartLabel={chartData.labels}
              />
            ) : null}
            {totalChartMetricsActive ? (
              <SelectChart
                title="Inventory Size"
                LineChartData={chartData.inventory_size}
                LineChartLabel={chartData.labels}
              />
            ) : null}
            <SelectChart
              title="Execution time"
              LineChartData={chartData.execution_time}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.execution_time_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="execution_time"
              handler={handleWrapper}
            />
            <SelectChart
              title="Execution ratio"
              LineChartData={chartData.execution_ratio}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.execution_ratio_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="execution_ratio"
              handler={handleWrapper}
            />
            <SelectChart
              title="Executed buy/sell ratio"
              LineChartData={chartData.executed_buy_sell_ratio}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.executed_buy_sell_ratio_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              handler={handleWrapper}
            />
            {!totalChartMetricsActive ? (
              <SelectChart
                title="Exceeding inventory"
                LineChartData={chartData.exceeding_inventory}
                LineChartLabel={chartData.exceeding_inventory_labels}
                selectable={true}
                timeFrames={timeFrames}
                value="exceeding_inventory"
                handler={handleWrapper}
              />
            ) : null}
            {!totalChartMetricsActive ? (
              <SelectChart
                title="Excess inventory cost"
                LineChartData={chartData.excess_inventory_cost}
                LineChartLabel={chartData.excess_inventory_cost_labels}
                selectable={true}
                timeFrames={timeFrames}
                value="excess_inventory_cost"
                handler={handleWrapper}
              />
            ) : null}
            <SelectChart
              title="fees"
              LineChartData={chartData.fees}
              LineChartLabel={
                totalChartMetricsActive
                  ? chartData.labels
                  : chartData.fees_labels
              }
              selectable={!totalChartMetricsActive}
              timeFrames={timeFrames}
              value="fees"
              handler={handleWrapper}
            />
            {!totalChartMetricsActive ? (
              <SelectChart
                title="Fees paid"
                LineChartData={chartData.fees_paid}
                LineChartLabel={chartData.fees_paid_labels}
                selectable={true}
                timeFrames={timeFrames}
                handler={handleWrapper}
              />
            ) : null}
          </div>
          <Orders strategyId={strategyId} />
        </div>
      </div>
    </>
  )
}

export default Strategy
