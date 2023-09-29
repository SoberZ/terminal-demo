import HttpService from './HttpService'

const axiosClient = HttpService.getAxiosClient()

const StrategiesService = {
  getStrategy: async function (strategy_id) {
    try {
      const res = await axiosClient.get('/delegation/strategies/get-strategy', {
        params: {
          strategy_id: strategy_id,
        },
      })
      return res
    } catch (error) {
      return error
    }
  },
  getPnl: async function (strategy_id) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/pnl',
        {
          params: {
            strategy: strategy_id,
          },
        }
      )
      return res.data
    } catch (error) {
      return error
    }
  },

  getFeesPaid: async function (strategy_id, timeframe) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/fees-of-strategy',
        {
          params: {
            strategy: strategy_id,
            timeframe: timeframe,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  getPnlByGranularity: async function (strategy_id, granularity) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/pnl_grouped',
        {
          params: {
            strategy: strategy_id,
            granularity: granularity,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  getSharpeRatio: async function (strategy_id, exchange, market, time_symbol) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/get-sharpe-ratio-of-strategy',
        {
          params: {
            strategy: strategy_id,
            exchange: exchange,
            market: market,
            time_symbol: time_symbol,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  getExecutionRatio: async function (strategy_id, granularity) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/execution-ratio-in-timeframe',
        {
          params: {
            strategy: strategy_id,
            granularity: granularity,
          },
        }
      )
      return res
    } catch (error) {
      return error.response
    }
  },

  getAll: async function () {
    try {
      const res = await axiosClient.get(
        '/delegation/strategies/get-all-strategies',
        {}
      )
      return res.data
    } catch (error) {
      return error
    }
  },

  getSuppliedLiquidity: async function (strategy_id, granularity) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/supplied-liquidity-in-timeframe',
        {
          params: {
            strategy: strategy_id,
            granularity: granularity,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  getOrdersOfStrategy: async function (strategy_id, page, per_page) {
    try {
      const res = await axiosClient.get(
        '/state-management/trade-data/orders-of-strategy',
        {
          params: {
            strategy: strategy_id,
            page: page,
            per_page: per_page,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  getOrdersOfStrategyFiltered: async function (
    strategy_id,
    page,
    per_page,
    props
  ) {
    try {
      const res = await axiosClient.get(
        '/state-management/trade-data/orders-of-strategy',
        {
          params: {
            strategy: strategy_id,
            page: page,
            per_page: per_page,
            ...props,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  getNumOrdersOfStrategy: async function (strategy_id, granularity) {
    try {
      const res = await axiosClient.get(
        '/state-management/trade-data/num-of-orders-of-strategy',
        {
          params: {
            strategy: strategy_id,
            timeframe: granularity,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  getAllOpenOrders: async function () {
    try {
      const res = await axiosClient.get(
        '/state-management/trade-data/all-open-trades',
        {
          params: {
            page: page,
            per_page: per_page,
          },
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  getOpenOrders: async function (strategy_id, page, per_page) {
    try {
      const res = await axiosClient.get(
        '/state-management/trade-data/open-orders-of-strategy',
        {
          params: {
            strategy: strategy_id,
            page: page,
            per_page: per_page,
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  createSpread: async function (params) {
    try {
      const res = await axiosClient.post(
        '/delegation/strategies/register-spread-strategy',
        {
          ...params,
          stop_loss_percentage: params['stop_loss_percentage'] / 100,
          order_distance: params['order_distance'] / 100,
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  createDepth: async function (params) {
    try {
      const res = await axiosClient.post(
        '/delegation/strategies/register-depth-strategy',
        {
          ...params,
          stop_loss_percentage: params['stop_loss_percentage'] / 100,
          buy_order_distance: params['buy_order_distance'] / 100,
          sell_order_distance: params['sell_order_distance'] / 100,
          target_inventory_base_percentage:
            params['target_inventory_base_percentage'] / 100,
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  createGeneric: async function (params) {
    try {
      const res = await axiosClient.post(
        '/delegation/strategies/register-generic-strategy',
        {
          ...params,
        }
      )
      return res
    } catch (error) {
      return error
    }
  },

  setStrategyStatus: async function (strategy_id, status) {
    try {
      const res = await axiosClient.post(
        '/delegation/strategies/set-strategy-status',
        {
          uid: strategy_id,
          status: status,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  getAvgExecutionTime: async function (strategy_id, timeframe) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/avg-execution-time',
        {
          params: {
            strategy: strategy_id,
            timeframe: timeframe,
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  getStrategyVolume: async function (strategy_id, timeframe) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/volume-of-strategy',
        {
          params: {
            strategy: strategy_id,
            timeframe: timeframe,
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  getStrategyBuysSells: async function (
    strategy_id,
    market,
    exchange,
    timeframe
  ) {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/buys-sells-of-strategy',
        {
          params: {
            strategy: strategy_id,
            market: market,
            exchange: exchange,
            timeframe: timeframe,
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  getMaxDrawDown: async function () {
    try {
      const res = await axiosClient.get(
        '/state-management/performance-data/buys-sells-of-strategy',
        {
          params: {
            strategy: strategy_id,
            market: market,
            exchange: exchange,
            timeframe: timeframe,
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  modifyStrategy: async function (params) {
    try {
      const res = await axiosClient.post(
        '/delegation/strategies/modify-strategy',
        {
          ...params,
        }
      )

      return res
    } catch (error) {
      return error
    }
  },
  deleteStrategy: async function (strategyId) {
    try {
      const res = await axiosClient.get(
        `/delegation/strategies/delete-strategy?strategy_id=${strategyId}`
      )

      return res
    } catch (error) {
      return error
    }
  },
  //? the new endpoint for creating strategies
  createStrategy: async function (strategy_type, params) {
    try {
      const res = await axiosClient.post(
        '/delegation/strategies/create-strategy',
        {
          strategy_type: strategy_type,
          kwargs: {
            ...params,
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  getRequiredParams: async function () {
    try {
      const res = await axiosClient.get(
        `/delegation/strategies/get-required-params`
      )

      return res
    } catch (error) {
      return error
    }
  },
}

export default StrategiesService
