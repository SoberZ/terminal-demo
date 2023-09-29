import { toast } from 'react-hot-toast'
import { StrategiesService, StateService } from '../../services'
import {
  getGroupedMetrics,
  getRollingChartMetrics,
  getRollingMetrics,
} from './StateFetchers'
import { formatNumber } from '../misc'
import { ExchangesService } from '../../services'

export async function fetchStrategy(setStrategyData, strategy_id) {
  const res = await StrategiesService.getStrategy(strategy_id)

  if (res.status != 200) {
    toast.error('Failed to fetch strategy')
  }

  setStrategyData((_) => res.data.data)
}

export async function fetchExecutionRatio(
  strategyId,
  timeframe,
  setFetchedData
) {
  const res = await StrategiesService.getExecutionRatio(strategyId, timeframe)

  if (res.status !== 200) {
    toast.error('Failed to fetch execution ratio')
  } else {
    if (res.data.data.length > 0) {
      const allData = res.data.data
      const labels = allData.map((item) => item.time)
      const data = allData.map((item) => item.execution_ratio)

      setFetchedData((prev) => ({
        ...prev,
        executionRatios_labels: labels,
        executionRatios_data: [{ data: data, label: 'Execution Ratio' }],
        executionRatio: allData.at(-1)['execution_ratio'].toFixed(2),
      }))
    }
  }
}

export async function fetchPnLGranularity(
  strategyId,
  granularity,
  setFetchedData
) {
  const res = await StrategiesService.getPnlByGranularity(
    strategyId,
    granularity
  )

  if (res.status !== 200) {
    toast.error('Failed to fetch Pnl')
    return false
  } else if (res.data.data.length === 0) {
    return false
  } else if (typeof res.data.data === 'string') {
    return false
  }

  const PnLs = res.data.data
  let labels = PnLs.map((item) => item.time)
  let data = PnLs.map((item) => item.pnl)

  setFetchedData((prev) => ({
    ...prev,
    pnl_data: [{ data: data, label: 'PnL' }],
    pnl_labels: labels,
    PnLIncl: Intl.NumberFormat('en-US', {
      notation: 'standard',
      maximumFractionDigits: '2',
    }).format(PnLs.at(-1).pnl),
  }))

  return PnLs
}

export async function fetchPnLFees(
  strategyId,
  PnLs,
  granularity,
  setFetchedData
) {
  const feesRes = await StrategiesService.getFeesPaid(strategyId, granularity)

  if (feesRes.status !== 200) {
    toast.error('Failed to fetch Pnl fees')
  } else if (feesRes.data.data.length > 0) {
    const item = feesRes.data.data.at(-1).fees_paid
    setFetchedData((prev) => ({
      ...prev,
      PnLExcl: Intl.NumberFormat('en-US', {
        notation: 'standard',
        maximumFractionDigits: '2',
      }).format(Number(PnLs.at(-1).pnl + item)),
    }))
  }
}

export async function fetchSuppliedLiquidity(
  strategyId,
  granularity,
  setFetchedData
) {
  const res = await StrategiesService.getSuppliedLiquidity(
    strategyId,
    granularity
  )
  if (res.status != 200) {
    toast.error('Failed to fetch supplied liquidity')
    return false
  }
  if (res.data.data.length === 0) {
    return false
  }

  const allData = res.data.data
  let labels = allData.map((item) => item.time)
  let buy_data = allData.map((item) => item.buy_liquidity)
  let sell_data = allData.map((item) => item.sell_liquidity)
  const item = allData.at(-1)

  setFetchedData((prev) => ({
    ...prev,
    suppliedLiquidity_data: [
      { data: buy_data, label: 'Buy Liquidity' },
      { data: sell_data, label: 'Sell Liquidity' },
    ],
    suppliedLiquidity_labels: labels,
    buyLiquidity: item.buy_liquidity.toFixed(2),
    sellLiquidity: item.sell_liquidity.toFixed(2),
  }))
  return res.data.data
}

export async function fetchNumOrders(strategyId, timeframe, setFetchedData) {
  const numOrders = await StrategiesService.getNumOrdersOfStrategy(
    strategyId,
    timeframe
  )

  if (numOrders.status != 200) {
    toast.error('Failed to fetch number of orders')
  } else {
    if (numOrders.data.data.length > 0) {
      const num = numOrders.data.data.at(-1).num_of_trades
      fetchRecentOrders(strategyId, 0, num, setFetchedData)
    }
  }
}

export async function fetchRecentOrders(
  strategyId,
  page,
  per_page,
  setFetchedData
) {
  const res = await StrategiesService.getOrdersOfStrategy(
    strategyId,
    page,
    per_page
  )

  if (res.status != 200) {
    toast.error('Failed to fetch all orders')
  } else {
    setFetchedData((prev) => ({ ...prev, orders: res.data.data }))
  }
}

export async function fetchSharpeRatio(
  strategyId,
  strategyData,
  setFetchedData,
  timeframe
) {
  const res = await StrategiesService.getSharpeRatio(
    strategyId,
    strategyData.exchange,
    strategyData.market,
    timeframe
  )

  if (res.status != 200) {
    toast.error('Failed to fetch sharpe ratio')
  } else {
    const ratio = res.data.data

    if (typeof ratio == 'object') {
      return
    }

    setFetchedData((prev) => ({
      ...prev,
      sharpeRatio: ratio ? ratio.toFixed(2) : 0,
    }))
  }
}

export async function fetchAvgExecutionTime(
  strategyId,
  timeframe,
  setFetchedData
) {
  const res = await StrategiesService.getAvgExecutionTime(strategyId, timeframe)

  if (res.status !== 200) {
    toast.error('Failed to fetch avg execution time')
  } else {
    if (res.data.data[0] === -1) return
    if (res.data.data.length > 0) {
      const allData = res.data.data
      const labels = allData.map((item) => item.time)
      const data = allData.map((item) => item.execution_time)

      setFetchedData((prev) => ({
        ...prev,
        executionTimes_labels: labels,
        executionTimes_data: [{ data: data, label: 'Execution Time' }],
        avgExecution: res.data.data.at(-1)['execution_time'].toFixed(2),
      }))
    }
  }
}

export async function setStrategyStatus(strategyId, status) {
  const res = await StrategiesService.setStrategyStatus(strategyId, status)
  return res.status
}

export async function deleteStrategy(strategyId) {
  const res = await StrategiesService.deleteStrategy(strategyId)

  if (res.status !== 200) {
    toast.error('Failed to delete strategy')
  }

  return res.status
}

export async function fetchVolume(strategyId, timeframe, setFetchedData) {
  const res = await StrategiesService.getStrategyVolume(strategyId, timeframe)
  if (res.status !== 200) {
    toast.error(res.response.data.message)
  } else {
    if (res.data.data.length > 0) {
      const allData = res.data.data
      const labels = allData.map((item) => item.time)
      const data = allData.map((item) => item.volume)

      const item = res.data.data.at(-1)

      setFetchedData((prev) => ({
        ...prev,
        volumes_labels: labels,
        volumes_data: [{ data: data, label: 'Execution Time' }],
        volume: `${Intl.NumberFormat('en-US', {
          notation: 'standard',
          maximumFractionDigits: '1',
        }).format(item['volume'])} ${item['quote_symbol']}`,
      }))
    }
  }
}

export async function fetchBuysSellsRatio(
  strategyId,
  market,
  exchange,
  timeframe,
  setFetchedData
) {
  const res = await StrategiesService.getStrategyBuysSells(
    strategyId,
    market,
    exchange,
    timeframe
  )

  if (res.status !== 200) {
    toast.error(res.response.data.message)
  } else {
    if (res.data.data.length > 0) {
      const item = res.data.data.at(-1)

      const allData = res.data.data
      const labels = allData.map((item) => item.time)
      const data = allData.map((item) => item.buy_vs_sell_ratio)

      setFetchedData((prev) => ({
        ...prev,
        buySellExecRatio_labels: labels,
        buySellExecRatio_data: [{ data: data, label: 'Buy/Sell ratio' }],
        buySellExecRatio: `${item.buy_vs_sell_ratio.toFixed(2)}`,
      }))
    }
  }
}

export async function fetchMaxDrawDownItem(PnLs) {
  let maxDrawDown = Math.min(...(() => PnLs.map((i) => i.pnl))())
  setFetchedData((prev) => ({
    ...prev,
    maxDrawDown: Intl.NumberFormat('en-US', {
      notation: 'standard',
      maximumFractionDigits: '1',
    }).format(maxDrawDown),
  }))
}

export async function fetchLastTradedPrice(market, exchange, setFetchedData) {
  const t = toast.loading('Fetching last traded price')
  const res = await StateService.getTicker(market, exchange)

  if (res.status !== 200) {
    toast.error(res.response.data.message, { id: t })
  } else {
    if (res.data.data) {
      const item = res.data.data.last
      setFetchedData((prev) => ({
        ...prev,
        lastPrice: Intl.NumberFormat('en-US', {
          notation: 'standard',
          maximumFractionDigits: '6',
        }).format(item),
      }))
      toast.success('Successfully fetched last traded price', { id: t })
    }
  }
}

export async function fetchTotalPnl(strategyId, setFetchedData) {
  try {
    const res = await StrategiesService.getPnl(strategyId)
    if (typeof res.data === 'object') return
    let number = res.data.split(' ')
    number[0] = Intl.NumberFormat('en-US', {
      notation: 'standard',
      maximumFractionDigits: '2',
    }).format(number[0])
    setFetchedData((prev) => ({
      ...prev,
      totalPnl: `${number[0]} ${number[1]}`,
    }))
  } catch (e) {
    toast.error('Failed to fetch total pnl')
    return
  }
}

export async function fetchRequiredParams(
  setFetchedData,
  setStrategyInstances
) {
  try {
    const res = await StrategiesService.getRequiredParams()

    if (res.status === 200) {
      setFetchedData((prev) => ({
        ...prev,
        requiredParams: res.data.data,
      }))
      setStrategyInstances((_) =>
        res.data.data.map((i) => ({
          value: i.strategy_type,
          label: i.strategy_type,
        }))
      )
    } else {
      toast.error(res.response.data.message)
    }
  } catch (e) {
    toast.error('Failed params')
    return
  }
}
//? the new function to create a strategy
export async function createStrategy(strategyType, params) {
  const t = toast.loading('Creating your strategy')
  try {
    const res = await StrategiesService.createStrategy(strategyType, params)

    if (res.status === 200) {
      toast.success('Successfully created strategy', { id: t })
      return res
    } else {
      toast.error(res.response.data.message, { id: t })
      return res
    }
  } catch (e) {
    toast.error('Failed to create strategy', { id: t })
    return
  }
}
export async function fetchChartData(setChartData, strategyId) {
  const fetching = toast.loading('Fetching Chart data')

  const strategyRollingChartMetrics = await getRollingChartMetrics(strategyId)

  if (strategyRollingChartMetrics) {
    const labels = strategyRollingChartMetrics.map((item) => item.date)

    const total_pnl = strategyRollingChartMetrics.map((item) => item.total_pnl)
    const realized_pnl = strategyRollingChartMetrics.map(
      (item) => item.realized_pnl
    )
    const unrealized_pnl = strategyRollingChartMetrics.map(
      (item) => item.unrealized_pnl
    )
    const volume = strategyRollingChartMetrics.map((item) => item.volume)
    const open_position_size = strategyRollingChartMetrics.map(
      (item) => item.open_position_size
    )
    const open_position_cost = strategyRollingChartMetrics.map(
      (item) => item.open_position_cost
    )
    const sell_liquidity_supplied = strategyRollingChartMetrics.map(
      (item) => item.sell_liquidity_supplied
    )
    const buy_liquidity_supplied = strategyRollingChartMetrics.map(
      (item) => item.buy_liquidity_supplied
    )

    const num_of_orders = strategyRollingChartMetrics.map(
      (item) => item.num_of_orders
    )
    const fees = strategyRollingChartMetrics.map((item) => item.fees)
    const execution_time = strategyRollingChartMetrics.map(
      (item) => item.execution_time
    )
    const execution_ratio = strategyRollingChartMetrics.map(
      (item) => item.execution_ratio
    )
    const executed_buy_sell_ratio = strategyRollingChartMetrics.map(
      (item) => item.executed_buy_sell_ratio
    )
    const open_position_break_even_price = strategyRollingChartMetrics.map(
      (item) => item.open_position_break_even_price
    )
    const bought_quantity = strategyRollingChartMetrics.map(
      (item) => item.bought_quantity
    )
    const sold_quantity = strategyRollingChartMetrics.map(
      (item) => item.sold_quantity
    )
    const bought_cost = strategyRollingChartMetrics.map(
      (item) => item.bought_cost
    )
    const sold_cost = strategyRollingChartMetrics.map((item) => item.sold_cost)

    setChartData((prev) => ({
      ...prev,
      labels: labels,
      total_pnl: [{ data: total_pnl, label: 'Total Pnl' }],
      realized_pnl: [{ data: realized_pnl, label: 'Realized PnL' }],
      unrealized_pnl: [{ data: unrealized_pnl, label: 'unrealized PnL' }],
      volume: [{ data: volume, label: 'Volume' }],
      open_position_size: [
        { data: open_position_size, label: 'Open position size' },
      ],
      open_position_cost: [
        { data: open_position_cost, label: 'Open position cost' },
      ],
      sell_liquidity_supplied: [
        {
          data: sell_liquidity_supplied,
          label: 'Sell Liquidity Supplied',
        },
      ],
      buy_liquidity_supplied: [
        {
          data: buy_liquidity_supplied,
          label: 'Buy Liquidity Supplied',
        },
      ],
      num_of_orders: [{ data: num_of_orders, label: 'Number of orders' }],
      fees: [{ data: fees, label: 'fees' }],
      execution_time: [{ data: execution_time, label: 'Execution time' }],
      execution_ratio: [{ data: execution_ratio, label: 'Execution ratio' }],
      executed_buy_sell_ratio: [
        {
          data: executed_buy_sell_ratio,
          label: 'Executed buy/sell ratio',
        },
      ],
      open_position_break_even_price: [
        {
          data: open_position_break_even_price,
          label: 'Open position break even price',
        },
      ],
      inventory_cost: [
        {
          label: 'Bought cost',
          data: bought_cost,
        },
        {
          label: 'Sold cost',
          data: sold_cost,
        },
      ],
      inventory_size: [
        {
          label: 'Bought quantity',
          data: bought_quantity,
        },
        {
          label: 'Sold quantity',
          data: sold_quantity,
        },
      ],
    }))
    toast.success('Chart data fetched', { id: fetching })
  }
}

export async function fetchGroupedMetrics(setFetchedData, strategyId) {
  const fetching = toast.loading('Fetching Last 24h metrics')
  let strategyGroupedMetrics = await getGroupedMetrics(strategyId, 60 * 24)
  strategyGroupedMetrics =
    strategyGroupedMetrics[strategyGroupedMetrics.length - 1]

  setFetchedData((prev) => ({
    ...prev,
    totalPnl: strategyGroupedMetrics?.metrics?.total_pnl?.toFixed(4) ?? 0,
    unrealizedPnl:
      strategyGroupedMetrics?.metrics?.unrealized_pnl?.toFixed(2) ?? 0,
    realizedPnl: strategyGroupedMetrics?.metrics?.realized_pnl?.toFixed(2) ?? 0,
    sellLiquidity:
      strategyGroupedMetrics?.metrics?.sell_liquidity_supplied?.toFixed(2) ?? 0,
    buyLiquidity:
      strategyGroupedMetrics?.metrics?.buy_liquidity_supplied?.toFixed(2) ?? 0,
    executionRatio:
      strategyGroupedMetrics?.metrics?.execution_ratio?.toFixed(4) ?? 0,
    exceedingInventory:
      strategyGroupedMetrics?.metrics?.exceeding_inventory?.toFixed(4) ?? 0,
    excessInventoryCost:
      strategyGroupedMetrics?.metrics?.excess_inventory_cost?.toFixed(4) ?? 0,
    avgExecution:
      strategyGroupedMetrics?.metrics?.execution_time?.toFixed(4) ?? 0,
    volume: strategyGroupedMetrics?.metrics?.volume?.toFixed(4) ?? 0,
    buySellExecRatio:
      strategyGroupedMetrics?.metrics?.executed_buy_sell_ratio?.toFixed(4) ?? 0,
    fees: strategyGroupedMetrics?.metrics?.fees?.toFixed(4) ?? 0,
    numOfOrders: strategyGroupedMetrics?.metrics?.num_of_orders ?? 0,
    paidFees: strategyGroupedMetrics?.metrics?.fees_paid ?? 0,
  }))

  toast.success('Last 24h metrics Fetched', { id: fetching })
}

export async function fetchRollingMetrics(setFetchedData, strategyId) {
  const fetching = toast.loading('Fetching Total metrics')
  const strategyMetrics = await getRollingMetrics(strategyId)

  setFetchedData((prev) => ({
    ...prev,
    totalPnl: strategyMetrics?.total_pnl?.toFixed(4) ?? 0,
    unrealizedPnl: strategyMetrics?.unrealized_pnl?.toFixed(2) ?? 0,
    realizedPnl: strategyMetrics?.realized_pnl?.toFixed(2) ?? 0,
    sellLiquidity: strategyMetrics?.sell_liquidity_supplied?.toFixed(2) ?? 0,
    buyLiquidity: strategyMetrics?.buy_liquidity_supplied?.toFixed(2) ?? 0,
    executionRatio: strategyMetrics?.execution_ratio?.toFixed(4) ?? 0,
    avgExecution: strategyMetrics?.execution_time?.toFixed(4) ?? 0,
    volume: strategyMetrics?.volume?.toFixed(4) ?? 0,
    buySellExecRatio: strategyMetrics?.executed_buy_sell_ratio?.toFixed(4) ?? 0,
    openPositionBreakeven: strategyMetrics?.open_position_break_even_price
      ? formatNumber(strategyMetrics?.open_position_break_even_price)
      : 0,
    openPositionCost: strategyMetrics?.open_position_cost?.toFixed(3) ?? 0,
    openPositionSize: strategyMetrics?.open_position_size?.toFixed(3) ?? 0,
    fees: strategyMetrics?.fees?.toFixed(4) ?? 0,
  }))
  toast.success('Total metrics fetched', { id: fetching })
}

export async function fetchChartGroupedMetrics(setChartData, strategyId) {
  const handleToast = toast.loading('Fetching 24h Grouped Charts')
  const strategyChartGroupedMetrics = await getGroupedMetrics(strategyId, 1440)
  if (strategyChartGroupedMetrics) {
    const labels = strategyChartGroupedMetrics.map(
      (item) => item.insertion_datetime
    )

    const metrics = strategyChartGroupedMetrics.map((item) => item.metrics)

    const total_pnl = metrics.map((metric) => metric.total_pnl)
    const realized_pnl = metrics.map((metric) => metric.realized_pnl)
    const unrealized_pnl = metrics.map((metric) => metric.unrealized_pnl)
    const volume = metrics.map((metric) => metric.volume)
    const buy_liquidity_supplied = metrics.map(
      (metric) => metric.buy_liquidity_supplied
    )
    const sell_liquidity_supplied = metrics.map(
      (metric) => metric.sell_liquidity_supplied
    )
    const exceeding_inventory = metrics.map(
      (metric) => metric.exceeding_inventory
    )
    const excess_inventory_cost = metrics.map(
      (metric) => metric.excess_inventory_cost
    )
    const fees_paid = metrics.map((metric) => metric.fees_paid)
    const num_of_orders = metrics.map((metric) => metric.num_of_orders)
    const fees = metrics.map((metric) => metric.fees)
    const execution_time = metrics.map((metric) => metric.execution_time)
    const execution_ratio = metrics.map((metric) => metric.execution_ratio)
    const executed_buy_sell_ratio = metrics.map(
      (metric) => metric.executed_buy_sell_ratio
    )

    setChartData((prev) => ({
      ...prev,
      total_pnl_labels: labels,
      realized_pnl_labels: labels,
      unrealized_pnl_labels: labels,
      volume_labels: labels,
      sell_liquidity_supplied_labels: labels,
      buy_liquidity_supplied_labels: labels,
      exceeding_inventory_labels: labels,
      excess_inventory_cost_labels: labels,
      fees_paid_labels: labels,
      num_of_orders_labels: labels,
      fees_labels: labels,
      execution_time_labels: labels,
      execution_ratio_labels: labels,
      executed_buy_sell_ratio_labels: labels,
      total_pnl: [{ data: total_pnl, label: 'Total Pnl' }],
      realized_pnl: [{ data: realized_pnl, label: 'Realized PnL' }],
      unrealized_pnl: [{ data: unrealized_pnl, label: 'unrealized PnL' }],
      volume: [{ data: volume, label: 'Volume' }],
      sell_liquidity_supplied: [
        {
          data: sell_liquidity_supplied,
          label: 'Sell Liquidity Supplied',
        },
      ],
      buy_liquidity_supplied: [
        {
          data: buy_liquidity_supplied,
          label: 'Buy Liquidity Supplied',
        },
      ],
      exceeding_inventory: [
        { data: exceeding_inventory, label: 'Exceeding inventory' },
      ],
      excess_inventory_cost: [
        { data: excess_inventory_cost, label: 'Excess inventory cost' },
      ],
      fees_paid: [{ data: fees_paid, label: 'Fees paid' }],
      num_of_orders: [{ data: num_of_orders, label: 'Number of orders' }],
      fees: [{ data: fees, label: 'fees' }],
      execution_time: [{ data: execution_time, label: 'Execution time' }],
      execution_ratio: [{ data: execution_ratio, label: 'Execution ratio' }],
      executed_buy_sell_ratio: [
        {
          data: executed_buy_sell_ratio,
          label: 'Executed buy/sell ratio',
        },
      ],
    }))
    toast.success('Finished loading 24h Grouped Charts', { id: handleToast })
  }
}

export async function fetchExchangeStatus(exchangeID, setStrategyData) {
  const res = await ExchangesService.getAccount(exchangeID)
  if (res.status === 200) {
    setStrategyData((prev) => {
      return {
        ...prev,
        exchange_account_status: res.data.data.status,
      }
    })
  } else {
    toast.error('Failed to fetch exchange status')
  }
}
