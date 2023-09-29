import HttpService from './HttpService'

const axiosClient = HttpService.getAxiosClient()

const StateService = {
  /**
   * Get all orders within the given timeframe.
   * @param {*} page
   * @param {*} per_page
   * @param {*} timeframe
   * @returns
   */
  getAllOrders: async function (page, per_page, timeframe, filter_dict) {
    try {
      const res = await axiosClient.get(
        '/state-management/trade-data/all-orders',
        {
          params: {
            page,
            per_page,
            timeframe,
            ...filter_dict,
          },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Get the ticker price for a given market
   * at a given exchange.
   * @param {*} market
   * @param {*} exchange
   * @returns ticker price
   */
  getTicker: async function (market, exchange) {
    try {
      const res = await axiosClient.get('/model/market-data/get-ticker', {
        params: {
          market: market,
          exchange: exchange,
        },
      })
      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Get the total volume that has been
   * traded.
   * @param {*} timeframe
   * @param {*} quote_asset
   * @returns total volume
   */
  getTotalVolume: async function (timeframe, quote_asset) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/total-volume',
        {
          params: {
            timeframe: timeframe,
            quote_asset: quote_asset,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Get the total PnL in a given timeframe.
   * @param {*} timeframe
   * @returns total Pnl
   */
  getTotalPnL: async function (timeframe) {
    try {
      const res = await axiosClient({
        method: 'get',
        url: '/state-management/performance-data/total-pnl',
        timeout: 20000,
        params: {
          timeframe: timeframe,
        },
      })

      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Get num of orders and trades.
   * @param {*} limitdate
   * @returns total num or orders and trades
   */
  getNumOrdersAndTrades: async function (limitdate) {
    try {
      const res = await axiosClient({
        method: 'get',
        url: '/state-management/trade-data/num-of-orders-and-trades',
        timeout: 20000,
        params: {
          limitdate: limitdate,
        },
      })

      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Get the funding rates for a certain pair.
   * @param {*} pair
   * @returns
   */
  getFundingRates: async function (pair) {
    try {
      const res = await axiosClient({
        method: 'get',
        url: '/data/market-data/get-fundingrates-for-pair',
        timeout: 20000,
        params: {
          pair: pair,
        },
      })

      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Get all trades within the given timeframe.
   * @param {*} page
   * @param {*} per_page
   * @param {*} timeframe
   * @returns
   */
  getAllTrades: async function (page, per_page, timeframe, filter_dict) {
    try {
      const res = await axiosClient.get(
        '/state-management/trade-data/all-trades',
        {
          params: {
            page,
            per_page,
            timeframe,
            ...filter_dict,
          },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  getGroupedMetrics: async function (strategy_id, interval, limitDate) {
    try {
      const res = await axiosClient.get(
        `/state-management/grouped-metrics/get-grouped-metrics`,
        {
          params: {
            strategy_id: strategy_id,
            interval: interval || 60,
            limitDate: limitDate || null,
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  getRollingMetrics: async function (strategy_id) {
    try {
      const res = await axiosClient.get(
        `/state-management/rolling-metrics/get-total-rolling-metrics`,
        {
          params: {
            strategy_id: strategy_id,
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },
  getRollingChartMetrics: async function (strategy_id, limitDate) {
    try {
      const res = await axiosClient.get(
        `/state-management/rolling-metrics/get-chart-rolling-metrics-for-strategy`,
        {
          params: {
            strategy_id: strategy_id,
            limitDate: limitDate,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },
}

export default StateService
