import toast from 'react-hot-toast'
import { ExchangesService } from '../../services'

import ExchangesData from '../../data/createStrategy/exchanges.json'
import Markets from '../../data/createStrategy/markets.json'
import ExchangeAccounts from '../../data/createStrategy/exchangeAccounts.json'

/**
 * Fetch the exchanges from the data cacher.
 * @param {*} setExchanges
 */
export async function fetchExchanges(setExchanges) {
  setExchanges(ExchangesData)
}

/**
 * Fetch exchange accounts from the backend.
 * @param {*} setExchangeAccounts
 */
export async function fetchExchangeAccounts(exchange, setExchangeAccounts) {
  const res = await ExchangesService.getAll()
  if (res.status === 200) {
    setExchangeAccounts(
      res.data.data
        .map((item) => {
          if (item['exchange'] === exchange) {
            return {
              value: item['exchange_account_id'],
              label: item['exchange_account_id'],
            }
          }
        })
        .filter((item) => item !== undefined)
    )
  } else {
    toast.error(res.response.data.message)
  }
}

/**
 * Fetch exchange accounts from the backend.
 * @param {*} setExchangeAccounts
 */
export async function fetchActiveExchangeAccounts(
  exchange,
  setExchangeAccounts
) {
  if (exchange == "kucoin") {
    setExchangeAccounts(ExchangeAccounts)
  } else {
    toast.error('No Active Exchange Accounts found with this exchange')
  }
}

/**
 * Fetch markets for a certain exchange.
 * @param {*} exchange
 * @param {*} setMarkets
 */
export async function fetchMarkets(exchange, setMarkets) {
  setMarkets(Markets)
}
