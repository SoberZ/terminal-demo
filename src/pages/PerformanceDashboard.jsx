import { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Fallback,
  Loader,
  PerformancePrimaryChart,
  PerformanceMinionChart,
} from '../components'

import { Paginator } from 'primereact/paginator'
import { snakeCaseToTitleCase } from '../utils/misc'
import { UserService } from '../services'

import { ErrorBoundary } from 'react-error-boundary'

import { ListBox } from 'primereact/listbox'
import { useWindowSize } from '../hooks'

import PerformanceData from '../data/performanceDashboard/performanceChartData.json'

const metricsLists = [
  { name: 'Total Pnl', value: 'total_pnl' },
  { name: 'Realized Pnl', value: 'realized_pnl' },
  { name: 'Unrealized Pnl', value: 'unrealized_pnl' },
  { name: 'Volume', value: 'volume' },
  { name: 'Open Position Size', value: 'open_position_size' },
  { name: 'Open Position Cost', value: 'open_position_cost' },
  {
    name: 'Open Position Break Even Price',
    value: 'open_position_break_even_price',
  },
  { name: 'Buy Liquidity Supplied', value: 'buy_liquidity_supplied' },
  { name: 'Sell Liquidity Supplied', value: 'sell_liquidity_supplied' },
  { name: 'Bought Quantity', value: 'bought_quantity' },
  { name: 'Sold Quantity', value: 'sold_quantity' },
  { name: 'Bought Cost', value: 'bought_cost' },
  { name: 'Sold Cost', value: 'sold_cost' },
  { name: 'Number of Orders', value: 'num_of_orders' },
  { name: 'Number of Trades', value: 'num_of_trades' },
  { name: 'Executed Buy/Sell Ratio', value: 'executed_buy_sell_ratio' },
  { name: 'Execution Ratio', value: 'execution_ratio' },
  { name: 'Execution Time', value: 'execution_time' },
  { name: 'Fees Paid', value: 'fees_paid' },
  // { name: 'Inactive', value: 'inactive' },
]

const PerformanceDashboard = () => {
  const { width } = useWindowSize()
  const [primaryChartData, setPrimaryChartData] = useState([])
  const [chartData, setChartData] = useState([])
  const [sortedData, setSortedData] = useState([])
  const [metric, setMetric] = useState('total_pnl')

  const [loading, setLoading] = useState(false)
  const rowsPerPageOptions = [8, 16, 32, 64]
  const [totalRecords, setTotalRecords] = useState(64)
  const [lazyState, setLazyState] = useState({
    first: 1,
    rows: rowsPerPageOptions[0],
    page: 1,
  })

  const handleClick = (e, chartID) => {
    e.stopPropagation()

    const dataEntry = chartData.find((item) => item.strategy_id === chartID)

    const transformedDataEntry = {
      strategy_id: dataEntry.strategy_id,
      data: dataEntry.data.map((item) => item[metric]),
      date: dataEntry.data.map((item) => item.date),
    }

    setPrimaryChartData(transformedDataEntry)
  }

  useEffect(() => {
    setChartData(() => PerformanceData.data)
    setTotalRecords(() => PerformanceData.total_result)
  }, [])

  // TODO: replace the useEffect here
  useEffect(() => {
    if (chartData?.length > 0) {
      const transformedArray = chartData.map((strategy) => {
        const strategyData = {
          strategy_id: strategy.strategy_id,
          data: strategy.data.map((item) => item[metric]),
          date: strategy.data.map((item) => item.date),
        }
        return strategyData
      })

      setPrimaryChartData(transformedArray[0])
      setSortedData(transformedArray)
    }
  }, [chartData])

  const onPageChange = (event) => {}

  const handleRefresh = () => {
    console.log('refreshing')
  }
  return (
    <div className="space-y-4 rounded-lg bg-color-secondary p-3.5 text-sm text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800 md:p-10">
      <div className="flex items-center gap-5 ">
        <h2 className="text-2xl font-bold">Performance Metrics Dashboard</h2>
        <button className="mx-1" onClick={handleRefresh}>
          <i className="pi pi-refresh text-xl"></i>
        </button>
      </div>
      <p>
        in the Performance Metrics dashboard you can select a certain metric
        which you'll be getting charts for all the strategies you have in the
        system, the mini charts at the bottom can be clicked to change the data
        on the big chart to the right
      </p>
      <ErrorBoundary FallbackComponent={Fallback}>
        <Suspense fallback={<Loader />}>
          <div className="grid grid-cols-1 space-y-3 lg:grid-cols-3 lg:space-y-0 xl:grid-cols-5 xl:gap-5">
            <ListBox
              filter
              value={metric}
              onChange={(e) => {
                if (e.value === null) {
                  setMetric('total_pnl')
                } else {
                  setMetric('total_pnl')
                }
              }}
              options={metricsLists}
              optionLabel="name"
              optionValue="value"
              filterPlaceholder="Search for a Performance Metric"
              listStyle={{ maxHeight: width > 1024 ? '600px' : '300px' }}
            />
            <PerformancePrimaryChart
              id={primaryChartData?.strategy_id}
              tooltip={snakeCaseToTitleCase(metric)}
              metricsData={primaryChartData?.data}
              metricsTime={primaryChartData?.date}
              loading={loading}
              className="col-span-1 hidden md:col-span-4 md:block"
            />
          </div>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={Fallback}>
        <Suspense fallback={<Loader />}>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:gap-5 xl:grid-cols-4">
            {sortedData?.map((strategy, idx) => {
              return (
                <PerformanceMinionChart
                  key={`${strategy.strategy_id}-${idx}`}
                  id={strategy.strategy_id}
                  tooltip={snakeCaseToTitleCase(metric)}
                  metricsData={strategy.data}
                  metricsTime={strategy.date}
                  handler={handleClick}
                  loading={loading}
                />
              )
            })}
          </div>
        </Suspense>
      </ErrorBoundary>
      <Paginator
        first={lazyState.first}
        rows={lazyState.rows}
        totalRecords={totalRecords}
        rowsPerPageOptions={rowsPerPageOptions}
        onPageChange={onPageChange}
      />
    </div>
  )
}

export default PerformanceDashboard
