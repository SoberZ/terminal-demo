import { toast } from 'react-hot-toast'
import {
  ExchangesService,
  StateService,
  StrategiesService,
} from '../../services'

import { constants } from '../constants'

/**
 * Fetch all active strategies and set them
 * into the setter.
 * @param {*} setHomeData
 */
export async function fetchActiveStrategies(setHomeData) {
  const res = await StrategiesService.getAll()

  if (res.statusCode === 200) {
    if (res.data.length) {
      let running = res.data.filter((strategy) => {
        return (
          strategy.active_status === 'active' ||
          strategy.active_status === 'new' ||
          strategy.active_status === 'restart'
        )
      })
      setHomeData((prev) => ({
        ...prev,
        strategiesRunning: running.length,
        activeStrategies: running,
      }))
    }
  } else {
    toast.error('Could fetch active strategies')
  }
}

/**
 * Fetch all exchange accounts.
 * @param {*} setHomeData
 */
export async function fetchExchangeAccounts(setHomeData) {
  const res = await ExchangesService.getAll()
  if (res.status === 200) {
    let running = res.data.data.filter(
      (exchange) => exchange.status === 'running'
    ).length
    setHomeData((prev) => ({ ...prev, liveExchangeAccounts: running }))
  } else {
    toast.error('Could fetch live exchange accounts')
  }
}

export async function fetchTradingVolume(setHomeData) {
  const res = await StateService.getTotalVolume(
    constants.timeFrames.DAY,
    'USDT'
  )

  if (res.status === 200) {
    setHomeData((prev) => ({
      ...prev,
      tradingVolume: Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: '1',
      }).format(res.data.data),
    }))
  } else {
    toast.error('Could fetch trading volume')
  }
}

export async function fetchPnL(setHomeData) {
  const res = await StateService.getTotalPnL(constants.timeFrames.DAY)
  if (res.status === 200) {
    setHomeData((prev) => ({
      ...prev,
      pnl:
        Intl.NumberFormat('en-US', {
          notation: 'standard',
          maximumFractionDigits: '1',
        })
          .format(res.data.data)
          .toString() + '$',
    }))
  } else {
    toast.error('Could fetch PnL')
  }
}

export async function fetchOrdersAndTrades(setHomeData) {
  // Get date of yesterday
  let date = new Date(Date.now() - constants.timeFrames.DAY * 1000)
  date = date.toISOString().replace('T', ' ').replace('Z', '').split('.')[0]
  const res = await StateService.getNumOrdersAndTrades(date)

  if (res.status == 200) {
    setHomeData((prev) => ({
      ...prev,
      ordersPlaced: res.data.data.num_of_orders,
      tradesExecuted: res.data.data.num_of_trades,
    }))
  } else {
    toast.error('Could not fetch number of trades and orders')
  }
}

export async function fetchOrdersPlaced(
  page,
  per_page,
  setHomeData,
  setHasMoreData
) {
  const res = await StateService.getAllOrders(
    page,
    per_page,
    constants.timeFrames.HOUR * 4
  )

  if (res.status === 200) {
    if (res.data.data.length > 0) {
      // flatten res.data to 1d array
      const fetchedData = res.data.data.reduce(
        (acc, val) => acc.concat(val),
        []
      )
      setHomeData((prev) => ({
        ...prev,
        orders: fetchedData,
        ordersPlaced: fetchedData.length,
      }))
      setHasMoreData(fetchedData.length === per_page)
    } else {
      setHasMoreData(false)
    }
  } else {
    toast.error('Could fetch orders')
  }
}

export async function fetchTradesPlaced(
  page,
  per_page,
  setHomeData,
  setHasMoreData
) {
  const res = await StateService.getAllTrades(
    page,
    per_page,
    constants.timeFrames.HOUR * 4
  )

  if (res.status === 200) {
    if (res.data.data.length > 0) {
      // flatten res.data to 1d array
      const fetchedData = res.data.data.reduce(
        (acc, val) => acc.concat(val),
        []
      )
      setHomeData((prev) => ({
        ...prev,
        trades: fetchedData,
        tradesPlaced: fetchedData.length,
      }))
      setHasMoreData(fetchedData.length === per_page)
    } else {
      setHasMoreData(false)
    }
  } else {
    toast.error('Could fetch trades')
  }
}

export async function fetchFundingRates(pair, setHomeData) {
  const res = await StateService.getFundingRates(pair)
  if (res.status !== 200) {
    toast.error("Couldn't fetch funding rates")
    return
  }

  const obj = res.data

  const labels = (() => {
    for (let i = 0; i < obj.data.length; i++) {
      const fundingRates = obj.data[i].fundingRates
      if (fundingRates.every((item) => item.funding_datetime !== null)) {
        return fundingRates.map((item) => item.funding_datetime)
      }
    }
    return []
  })()

  const datas = obj.data.map((exch) => {
    return {
      label: exch.exchange_id,
      data: exch.fundingRates.map((item) => item.fundingRate),
    }
  })

  setHomeData((prevState) => ({
    ...prevState,
    fundingRates: datas,
    fundingLabels: labels,
  }))
}
