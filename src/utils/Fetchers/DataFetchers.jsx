import toast from 'react-hot-toast'
import { ExchangesService } from '../../services'

/**
 * Fetch the exchanges from the data cacher.
 * @param {*} setExchanges
 */
export async function fetchExchanges(setExchanges) {
  const t = toast.loading('Fetching Exchanges')
  const res = await ExchangesService.getExchanges()

  if (res.status === 200) {
    setExchanges(
      res.data.data.map((exchange) => ({
        label: exchange.id,
        value: exchange.id,
      }))
    )
    toast.success('Successfully fetched Exchanges', { id: t })
  } else {
    toast.error(res.response.data.message, { id: t })
  }
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
  const t = toast.loading('Fetching Exchange Accounts')
  const res = await ExchangesService.getActiveAccounts()
  if (res.status === 200) {
    const placeholder = res.data.data
      .map((item) => {
        if (item['exchange'] === exchange) {
          toast.success('Successfully fetched Exchange Accounts', { id: t })
          return {
            value: item['exchange_account_id'],
            label: item['exchange_account_id'],
          }
        }
      })
      .filter((item) => item !== undefined)
    if (placeholder.length === 0) {
      toast.error('No Active Exchange Accounts found with this exchange', {
        id: t,
      })
    }
    setExchangeAccounts(placeholder)
  } else {
    toast.error(res.response.data.message, { id: t })
  }
}

/**
 * Fetch markets for a certain exchange.
 * @param {*} exchange
 * @param {*} setMarkets
 */
export async function fetchMarkets(exchange, setMarkets) {
  const t = toast.loading('Fetching Markets')
  const res = await ExchangesService.getExchangeMarkets(exchange)

  if (res.status === 200) {
    setMarkets(
      res.data.data.map((market) => {
        return {
          label: market.symbol,
          value: market.symbol,
        }
      })
    )
    toast.success('Successfully fetched Markets', { id: t })
  } else {
    toast.error(res.response.data.message, { id: t })
  }
}
