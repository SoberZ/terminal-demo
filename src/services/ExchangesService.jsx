import HttpService from './HttpService'

const axiosInstance = HttpService.getAxiosClient()

const ExchangesService = {
  /**
   * Get balnces of an exchange account
   * @param {string} account_id
   * @returns
   */
  getBalance: async function (account_id) {
    try {
      const res = await axiosInstance.get(
        '/delegation/get-exchange-account-balance',
        {
          params: {
            exchange_account_id: account_id,
          },
        }
      )

      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Get data about one exchange account
   * @param {string} account_id
   * @returns
   */
  getAccount: async function (account_id) {
    try {
      const res = await axiosInstance.get(
        '/state-management/trade-data/get-exchange-account',
        { params: { exchange_account_id: account_id } }
      )
      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Fetch all exchange accounts
   * @returns exchange accounts
   */
  getAll: async function () {
    try {
      const res = await axiosInstance.get(
        '/state-management/trade-data/exchange-accounts'
      )
      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Fetch available exchanges to create
   * an exchange account with
   * @returns available exchanges
   */
  getExchanges: async function () {
    try {
      const res = await axiosInstance.get('/data/market-data/get-all-exchanges')
      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Get available markets on an exchange
   * @param {string} exchange
   * @returns
   */
  getExchangeMarkets: async function (exchange) {
    const res = await axiosInstance.get(
      '/data/market-data/get-all-markets-of-exchange',
      { params: { exchange: exchange } }
    )

    return res
  },

  /**
   * Get active exchange accounts
   * @returns active accounts
   */
  getActiveAccounts: async function () {
    try {
      const res = await axiosInstance.get(
        '/state-management/trade-data/active-exchange-accounts'
      )
      return res
    } catch (error) {
      return error
    }
  },

  /**
   * Register an exchange account
   * @param {*} params exchange account data
   * @returns
   */
  registerExchangeAccount: async function (params) {
    try {
      const res = await axiosInstance.post(
        '/delegation/register-exchange-account',
        {
          exchange_account_id: params['exchangeAccount'],
          exchange: params['exchange'],
          params: {
            ...params.params,
          },
        }
      )
      return res
    } catch (error) {
      return error.response.data
    }
  },

  /**
   * Restart an exchange account
   * @param {*} params exchange account id
   * @returns
   */
  restartExchangeAccount: async function (exchange_account_id) {
    try {
      const res = await axiosInstance.post(
        '/delegation/register-exchange-account',
        {
          exchange_account_id: exchange_account_id,
        }
      )
      return res
    } catch (error) {
      return error.response.data
    }
  },

  /**
   * Remove an exchange account, step the
   * status of an account to stopped
   * @param {string} id
   * @returns
   */
  removeAccount: async function (id) {
    try {
      const res = await axiosInstance.post(
        '/delegation/pause-exchange-account',
        {
          exchange_account_id: id,
          status: 'stopped',
        }
      )
      return res
    } catch (error) {
      return error
    }
  },
}

export default ExchangesService
