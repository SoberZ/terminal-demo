import { useEffect, useState } from 'react'
import {
  fetchStrategy,
  setStrategyStatus,
} from '../../utils/Fetchers/StrategyFetchers'

import { confirmDialog } from 'primereact/confirmdialog'
import { ExchangesService } from '../../services'

async function fetchExchangeStatus(setExchangeStatus) {
  const res = await ExchangesService.getAll()
  if (res.status === 200) {
    setExchangeStatus(res.data.data)
  }
}

export default function useStrategyData(strategyId, isLoaded, toast) {
  const [strategyData, setStrategyData] = useState({
    active_status: '-',
    balance_exchange_account: false,
    buy_order_distance: 0,
    check_for_order_consistency: false,
    enable_balancing: false,
    exchange: '',
    exchange_account_id: '-',
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
  })

  const [exchangeStatus, setExchangeStatus] = useState([])

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
  useEffect(() => {
    toast.dismiss()
    async function fetchAllData() {
      await fetchStrategy(setStrategyData, strategyId)
    }
    fetchAllData()
    fetchExchangeStatus(setExchangeStatus)
    isLoaded.current = true
  }, [])

  return [strategyData, handleSetStrategyStatus, exchangeStatus]
}
