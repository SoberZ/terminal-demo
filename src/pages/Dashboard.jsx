import { useEffect, useState, useLayoutEffect } from 'react'
import { toast } from 'react-hot-toast'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useNavigate } from 'react-router-dom'
import { Tag } from 'primereact/tag'
import { Accordion, AccordionTab } from 'primereact/accordion'

import {
  Tile,
  TerminalButton,
  FundingRatesLineChart,
  AllOrders,
  AllTrades,
  Spotlight,
} from '../components'

import {
  fetchActiveStrategies,
  fetchExchangeAccounts,
  fetchFundingRates,
} from '../utils/Fetchers/DashboardFetchers'

import { getRollingMetrics } from '../utils/Fetchers/StateFetchers'

import { useWindowSize } from '../hooks'

import { statusColors } from '../utils/statusColors'

const Dashboard = () => {
  const navigate = useNavigate()
  const [homeData, setHomeData] = useState({
    strategiesRunning: '0',
    pnl: '0 USD',
    liveExchangeAccounts: '0',
    tradingVolume: '0',
    tradesExecuted: '0',
    ordersPlaced: '0',
    activeStrategies: [],
    orders: [],
    pnls: [],
    fundingRates: [],
    fundingLabels: [],
  })
  const { width } = useWindowSize()

  const getSeverity = (input) => {
    switch (input) {
      case 'active':
        return statusColors.active
      case 'paused':
        return statusColors.paused
      case 'new':
        return statusColors.new
      case 'stop':
        return statusColors.stop
      case 'paused_err':
        return statusColors.pausedErr
      case 'starting':
        return statusColors.starting
      case 'pausing':
        return statusColors.pausing
      default:
        return 'MidnightBlue'
    }
  }
  // https://api.autowhale.net/data/market-data/get-fundingrates-for-pair?pair=BTC/USDT:USDT
  useLayoutEffect(() => {
    toast.dismiss()
    const fetchData = async () => {
      await fetchFundingRates('BTC/USDT:USDT', setHomeData)
    }
    fetchData()
  }, [])

  useEffect(() => {
    toast.dismiss()
    const fetchData = async () => {
      let res = await getRollingMetrics('global')

      setHomeData((item) => ({
        ...item,
        tradingVolume: `${res.total_volume.toFixed(2)} $`,
        tradesExecuted: res.total_num_of_trades,
        ordersPlaced: res.total_num_of_orders,
        pnl: `${res.total_pnl.toFixed(2)} $`,
      }))

      await fetchActiveStrategies(setHomeData)
      await fetchExchangeAccounts(setHomeData)
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col space-y-10">
      {width > 768 ? (
        <Spotlight className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6 group">
          <Tile
            dashboard
            data={homeData.strategiesRunning}
            title="Strategies running"
            redirect="/strategies"
          />
          <Tile
            dashboard
            data={homeData.pnl}
            title="PnL"
            description={'Today'}
          />
          <Tile
            dashboard
            data={homeData.liveExchangeAccounts}
            title="Live exchange accounts"
            redirect="/exchanges"
          />
          <Tile
            dashboard
            data={homeData.tradingVolume}
            title="Trading volume"
            description="Today"
          />
          <Tile
            dashboard
            data={homeData.tradesExecuted}
            title="Trades executed"
            description="Today"
          />
          <Tile
            dashboard
            data={homeData.ordersPlaced}
            title="Orders placed"
            description="Today"
          />
        </Spotlight>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
          <Tile
            dashboard
            data={homeData.strategiesRunning}
            title="Strategies running"
            redirect="/strategies"
          />
          <Tile
            dashboard
            data={homeData.pnl}
            title="PnL"
            description={'Today'}
          />
          <Tile
            dashboard
            data={homeData.liveExchangeAccounts}
            title="Live exchange accounts"
            redirect="/exchanges"
          />
          <Tile
            dashboard
            data={homeData.tradingVolume}
            title="Trading volume"
            description="Today"
          />
          <Tile
            dashboard
            data={homeData.tradesExecuted}
            title="Trades executed"
            description="Today"
          />
          <Tile
            dashboard
            data={homeData.ordersPlaced}
            title="Orders placed"
            description="Today"
          />
        </div>
      )}

      <div className="p-5 pb-48 sm:pb-40 md:pb-32 lg:pb-24 bg-color-secondary text-color-secondary dark:border dark:border-neutral-800 rounded-lg shadow-soft-xl">
        <div className="h-96">
          <div className="flex flex-row items-center space-x-2">
            <h6 className="font-semibold text-secondary text-md">
              Bitcoin Funding Rates
            </h6>
          </div>
          <p className="text-sm font-light">
            Find an example usage of data casher here where funding rates for
            some BTCUSD futures markets are cashed. Per default data casher,
            cashes all markets of strategies and some large markets including
            BTCUSD, ETHUSD, BTCETH, BNBUSD, etc.{' '}
          </p>
          <FundingRatesLineChart
            data={homeData.fundingRates}
            labels={homeData.fundingLabels}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1">
        <div className="p-5 pb-5 bg-color-secondary text-color-secondary dark:border dark:border-neutral-800 rounded-lg shadow-soft-xl space-y-7">
          <div className="">
            <h6 className="font-semibold text-color-secondary text-md">
              Active Strategy Instances
            </h6>
            <p className="text-sm font-light">
              List of active strategies running, find more details on the
              strategies page or by clicking load more
            </p>
          </div>
          {/* //! Active strategies has a limit of 15 instances, collapsible when more than 10 and in mobile view */}
          {homeData.activeStrategies.length > 10 || width < 768 ? (
            <Accordion>
              <AccordionTab>
                <DataTable
                  value={homeData.activeStrategies}
                  sortField="active_status"
                  sortOrder={1}
                  breakpoint="0"
                  scrollable
                  onRowClick={(e) => {
                    navigate(`/strategies/${e.data.strategy_id}`)
                  }}
                  className="text-[0.75rem]">
                  <Column
                    header="#"
                    body={(data, options) => options.rowIndex + 1}
                    frozen
                    className="max-w-[0.5rem] md:min-w-[2rem] md:max-w-[3rem]"
                  />
                  <Column
                    field="strategy_id"
                    header="ID"
                    frozen
                    className="min-w-[8rem] md:min-w-[15rem] lg:min-w-[18rem] shadow-[5px_0px_5px_#00000022] xl:shadow-none break-all"
                  />
                  <Column
                    field="exchange"
                    header="Exchange"
                    className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
                  />
                  <Column
                    field="market"
                    header="Market"
                    className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                  />
                  <Column
                    sortable
                    field="active_status"
                    header="Status"
                    body={(account) => (
                      <Tag
                        value={account.active_status}
                        style={{
                          backgroundColor: getSeverity(account.active_status),
                        }}
                        className="text-md"
                      />
                    )}
                    className="min-w-[8rem] lg:min-w-[10rem]"
                  />
                </DataTable>
              </AccordionTab>
            </Accordion>
          ) : (
            <DataTable
              value={homeData.activeStrategies}
              sortField="active_status"
              sortOrder={1}
              breakpoint="0"
              scrollable
              onRowClick={(e) => {
                navigate(`/strategies/${e.data.strategy_id}`)
              }}
              className="text-[0.75rem]">
              <Column
                header="#"
                body={(data, options) => options.rowIndex + 1}
                frozen
                className="max-w-[0.5rem] md:min-w-[2rem] md:max-w-[3rem]"
              />
              <Column
                field="strategy_id"
                header="ID"
                frozen
                className="min-w-[8rem] md:min-w-[15rem] lg:min-w-[18rem] shadow-[5px_0px_5px_#00000022] xl:shadow-none break-all"
              />
              <Column
                field="exchange"
                header="Exchange"
                className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
              />
              <Column
                field="market"
                header="Market"
                className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
              />
              <Column
                sortable
                field="active_status"
                header="Status"
                body={(account) => (
                  <Tag
                    value={account.active_status}
                    style={{
                      backgroundColor: getSeverity(account.active_status),
                    }}
                    className="text-md"
                  />
                )}
                className="min-w-[8rem] lg:min-w-[10rem]"
              />
            </DataTable>
          )}

          <TerminalButton
            text={'Load more'}
            styles="w-28"
            onClick={() => navigate(`/strategies`)}
          />
        </div>
      </div>

      <div className="p-5 pb-5 space-y-5 bg-color-secondary text-color-secondary dark:border dark:border-neutral-800 rounded-lg shadow-soft-xl">
        <h1>Recent orders</h1>
        <p className="text-sm font-light">
          List of orders of all strategies where you can sort them by attribute.
        </p>
        <AllOrders totalRecords={0} />
      </div>

      <div className="p-5 pb-5 space-y-5 bg-color-secondary text-color-secondary dark:border dark:border-neutral-800 rounded-lg shadow-soft-xl">
        <h1>Recent trades</h1>
        <p className="text-sm font-light">
          List of trades of all strategies where you can sort them by attribute.
        </p>
        <AllTrades totalRecords={0} />
      </div>
    </div>
  )
}

export default Dashboard
