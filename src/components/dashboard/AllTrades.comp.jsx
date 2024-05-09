import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { FilterMatchMode, FilterOperator } from 'primereact/api'
import { Tag } from 'primereact/tag'
import { Calendar } from 'primereact/calendar'

import { StateService } from '../../services'
import { useWindowSize } from '../../hooks'

import { constants } from '../../utils/constants'
import { statusColors } from '../../utils/statusColors'
import { formatDate } from '../../utils/misc'

const AllTradesComponent = ({ records }) => {
  // TODO whole component is similar to the other 2 components, can be made into a skeleton and add a few stuff to it

  const { width } = useWindowSize()
  const [tradesData, setTradesData] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [totalRecords, setTotalRecords] = useState(records ? records : 100)
  const rowsPerPageOptions = [10, 20, 30, 40, 50]
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: rowsPerPageOptions[0],
    page: 0,
    sortField: null,
    sortOrder: null,
    filters: {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      strategy_id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      exchange_account_id: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      exchange: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      market: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      order_side: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: 'eq' }],
      },
      execution_date: {
        operator: FilterOperator.AND,
        constraints: [{ value: '', matchMode: 'lt' }],
      },
      order_type: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: 'eq' }],
      },
      stop_loss_price_trigger: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: 'eq' }],
      },
      avg_fill_price: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: 'eq' }],
      },
      order_status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: 'eq' }],
      },
      price: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: 'eq' }],
      },
      quantity: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: 'eq' }],
      },
      quantity_filled: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: 'eq' }],
      },
    },
  })

  const [orderTypes] = useState(['limit', 'market'])
  const [orderSides] = useState(['buy', 'sell'])

  const numericFilterOptions = [
    { label: 'Greater than', value: FilterMatchMode.GREATER_THAN },
    {
      label: 'Greater than or equal',
      value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
    },
    { label: 'Less than', value: FilterMatchMode.LESS_THAN },
    {
      label: 'Less than or equal',
      value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
    },
    { label: 'Equals', value: 'eq' },
    { label: 'Not equals', value: 'neq' },
  ]

  const stringFilterOptions = [
    { label: 'Contains', value: FilterMatchMode.CONTAINS },
    { label: 'Equals', value: 'eq' },
  ]

  const equalsFilterOptions = [{ label: 'Equals', value: 'eq' }]

  const dateFilterOptions = [
    { label: 'Date before', value: FilterMatchMode.LESS_THAN },
    {
      label: 'Date before or equal',
      value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
    },
    { label: 'Date after', value: FilterMatchMode.GREATER_THAN },
    {
      label: 'Date after or equal',
      value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
    },
  ]

  const getSeverity = (input) => {
    switch (input) {
      case 'open':
        return statusColors.open
      case 'closed':
        return statusColors.closed
      case 'partially_filled':
        return statusColors.paraFilled
      case 'canceled':
        return statusColors.canceled
      case 'abandoned':
        return statusColors.abandoned
      case 'buy':
        return statusColors.buy
      case 'sell':
        return statusColors.sell
      default:
        return statusColors.new
    }
  }

  const orderSideBodyTemplate = (account) => {
    return (
      <Tag
        value={account.order_side}
        severity={getSeverity(account.order_side)}
        className="text-md"></Tag>
    )
  }
  const isDemoTradeBodyTemplate = (order) => {
    return order.is_demo_trade ? (
      <i className="pi pi-check-circle" style={{ color: '#00d600' }}></i>
    ) : (
      <i className="pi pi-times-circle" style={{ color: 'red' }}></i>
    )
  }

  // Get the operator and limit keys
  function getFilterKeys(type, filter, value) {
    switch (type) {
      case 'price':
        return { price_operator: filter, price_limit: value }
      case 'quantity':
        return {
          quantity_operator: filter,
          quantity_limit: value,
        }
      case 'quantity_filled':
        return {
          quantity_filled_operator: filter,
          quantity_filled_limit: value,
        }
      case 'order_type':
        return { order_type_operator: filter, order_type_value: value }
      case 'avg_fill_price':
        return {
          avg_fill_price_operator: filter,
          avg_fill_price_limit: value,
        }
      case 'stop_loss_price_trigger':
        return {
          stop_loss_price_trigger_operator: filter,
          stop_loss_price_trigger_limit: value,
        }
      case 'order_side':
        return { order_side_operator: filter, order_side_value: value }
      case 'order_status':
        return {
          order_status_operator: filter,
          order_status_value: value,
        }
      case 'execution_date':
        return {
          execution_date_operator: filter,
          execution_date_limit: formatDate(value),
        }
      case 'strategy_id':
        return {
          strategy_id_operator: filter,
          strategy_id_value: value,
        }
      case 'exchange_account_id':
        return {
          exchange_account_operator: filter,
          exchange_account_value: value,
        }
      case 'exchange':
        return { exchange_operator: filter, exchange_value: value }
      case 'market':
        return { market_operator: filter, market_value: value }
    }
  }

  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="mm/dd/yy"
        placeholder="mm/dd/yyyy"
        mask="99/99/9999"
      />
    )
  }
  const stopLossBodyTemplate = (order) => {
    return (
      <span>
        {order.stop_loss_price_trigger ? order.stop_loss_price_trigger : '—'}{' '}
      </span>
    )
  }
  const priceBodyTemplate = (order) => {
    return <span>{order.price ?? '-'} </span>
  }
  const avgFillPriceBodyTemplate = (order) => {
    return <span>{order.avg_fill_price ? order.avg_fill_price : '—'} </span>
  }
  const quantityFilledBodyTemplate = (order) => {
    return <span>{order.quantity_filled ? order.quantity_filled : '—'} </span>
  }
  const costBodyTemplate = (order) => {
    return (
      <span>
        {order.avg_fill_price && order.quantity_filled
          ? order.avg_fill_price * order.quantity_filled
          : order.price * order.quantity}
      </span>
    )
  }

  const loadOrdersData = useCallback(async (newLazyState) => {
    let { first, page, rows, sortField, sortOrder, filters } = newLazyState
    first = (page - 1) * rows // Calculate the first value based on page and rows
    const filterDict = {} // Create an empty filter dictionary

    // Loop through the filters and get the filter keys
    for (const [field, filter] of Object.entries(filters)) {
      if (filter.constraints && filter.constraints.length > 0) {
        let { value, matchMode } = filter.constraints[0]

        if (matchMode !== 'contains') {
          matchMode = `$${matchMode}`
        }

        Object.assign(filterDict, getFilterKeys(field, matchMode, value))
      }
    }
    // Call the StrategiesService.getOrdersOfStrategyFiltered method
    setIsLoading(true)
    const res = await StateService.getAllTrades(
      page,
      rows,
      constants.timeFrames.TEN_YEARS,
      filterDict
    )
    if (res.status == 200) {
      setTradesData(res.data.data)
      setIsLoading(false)
      setTotalRecords((_) => res.data.total_results)
    } else {
      toast.error('Something went wrong, please try again.')
    }
  }, [])

  const handleFilter = (event) => {
    const newLazyState = { ...lazyState, filters: event.filters }
    setLazyState((_) => newLazyState)
    loadOrdersData(newLazyState)
  }

  const handlePage = (event) => {
    const newLazyState = {
      ...lazyState,
      page: event.page,
      rows: event.rows,
      first: event.first,
    }
    setLazyState((_) => newLazyState)
    loadOrdersData(newLazyState)
  }

  useEffect(() => {
    loadOrdersData(lazyState)
  }, [])

  const orderSidesFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={orderSides}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={(option) => (
          <Tag
            value={option}
            style={{ backgroundColor: getSeverity(option) }}
          />
        )}
        placeholder="Select an Order Side"
        showClear
      />
    )
  }

  const orderTypesFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={orderTypes}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        placeholder="Select an Order Type"
        showClear
      />
    )
  }

  return (
    <div className="!md:text-base !text-xs">
      <DataTable
        value={tradesData}
        totalRecords={totalRecords}
        paginator
        breakpoint="0"
        scrollable={width < 768 ? true : false}
        tableStyle={{ minWidth: `${width < 768 ? '140rem' : 'none'}` }}
        paginatorTemplate={
          width < 768
            ? 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
            : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
        }
        lazy
        sortMode="multiple"
        className="text-xs"
        filters={lazyState.filters}
        rows={lazyState.rows}
        removableSort
        onFilter={handleFilter}
        onPage={handlePage}
        loading={isLoading}
        first={lazyState.page * lazyState.rows} // Calculate the first value based on page and rows
        rowsPerPageOptions={rowsPerPageOptions}
        globalFilterFields={['price']}>
        <Column
          header="#"
          body={(data, options) => options.rowIndex + 1}
          frozen
          className={`${width < 768 && 'max-w-[3rem]  break-all'}`}
        />
        <Column
          field="strategy_id"
          header="Strategy"
          filterField="strategy_id"
          style={{ padding: '0.9em' }}
          filter
          dataType="text"
          showFilterOperator={false}
          filterMatchModeOptions={stringFilterOptions}
          frozen
          className={` ${
            width < 768 && 'max-w-[7rem] break-all md:max-w-[10rem]'
          } shadow-[5px_0px_5px_#00000022] xl:shadow-none `}
        />
        <Column
          field="exchange_account_id"
          header="Exchange Account"
          style={{ padding: '0.9em' }}
          dataType="text"
          filter
          showFilterOperator={false}
          filterMatchModeOptions={stringFilterOptions}
        />
        <Column
          field="exchange"
          header="Exchange"
          style={{ padding: '0.9em' }}
          dataType="text"
          filter
          showFilterOperator={false}
          filterMatchModeOptions={stringFilterOptions}
        />
        <Column
          field="execution_date"
          header="Execution Date"
          style={{ padding: '0.9em' }}
          dataType="date"
          filter
          showFilterOperator={false}
          onFilter={handleFilter}
          filterMatchModeOptions={dateFilterOptions}
          filterElement={dateFilterTemplate}
        />
        <Column
          field="market"
          header="Market"
          filter
          dataType="text"
          style={{ padding: '0.9em' }}
          showFilterOperator={false}
          filterMatchModeOptions={stringFilterOptions}
          className="min-w-[5rem] md:min-w-[7rem]"
          body={(strategy) => (
            <div className="flex items-center">
              <img
                src={`/crypto-icons-webp/${
                  strategy.market.split('/')[0] || 'generic'
                }.webp`}
                className="h-5 w-5"
                alt=""
              />
              <p className="text-[0.7rem] md:text-sm">{strategy.market}</p>
            </div>
          )}
        />
        <Column
          field="order_side"
          header="Order Side"
          filter
          style={{ padding: '0.9em' }}
          body={(account) => (
            <Tag
              value={account.order_side}
              style={{ backgroundColor: getSeverity(account.order_side) }}
              className="text-md"
            />
          )}
          dataType="text"
          showFilterOperator={false}
          filterMatchModeOptions={equalsFilterOptions}
          filterElement={orderSidesFilterTemplate}
          className="max-w-[7rem]"
        />
        <Column
          field="is_demo_trade"
          header="Demo Trade"
          style={{ padding: '0.9em' }}
          dataType="text"
          body={isDemoTradeBodyTemplate}
          className="max-w-[7rem]"
        />
        <Column
          field="order_type"
          header="Order Type"
          filter
          style={{ padding: '0.9em' }}
          dataType="text"
          showFilterOperator={false}
          filterMatchModeOptions={equalsFilterOptions}
          filterElement={orderTypesFilterTemplate}
          className="max-w-[7rem]"
        />
        <Column
          field="cost"
          header="Cost"
          style={{ padding: '0.9em' }}
          dataType="text"
          showFilterOperator={false}
          body={costBodyTemplate}
        />
        <Column
          field="avg_fill_price"
          header="Avg fill price"
          filter
          style={{ padding: '0.9em' }}
          dataType="numeric"
          showFilterOperator={false}
          filterMatchModeOptions={numericFilterOptions}
          body={avgFillPriceBodyTemplate}
        />
        <Column
          field="stop_loss_price_trigger"
          header="Stop Loss"
          style={{ padding: '0.9em' }}
          filterField="stop_loss_price_trigger"
          filter
          dataType="numeric"
          showFilterOperator={false}
          filterMatchModeOptions={numericFilterOptions}
          body={stopLossBodyTemplate}
        />
        <Column
          field="price"
          header="Price"
          style={{ padding: '0.9em' }}
          filterField="price"
          dataType="numeric"
          filter
          showFilterOperator={false}
          filterMatchModeOptions={numericFilterOptions}
          body={priceBodyTemplate}
        />
        <Column
          field="quantity"
          header="Quantity"
          style={{ padding: '0.9em' }}
          filterField="quantity"
          dataType="numeric"
          filter
          showFilterOperator={false}
          filterMatchModeOptions={numericFilterOptions}
        />
        <Column
          field="quantity_filled"
          header="Quantity Filled"
          filter
          style={{ padding: '0.9em' }}
          filterField="quantity_filled"
          dataType="numeric"
          showFilterOperator={false}
          filterMatchModeOptions={numericFilterOptions}
          body={quantityFilledBodyTemplate}
        />
        <Column
          field="order_status"
          header="Order Status"
          style={{ padding: '0.9em' }}
          body={(order) => (
            <Tag
              value={order.order_status}
              style={{ backgroundColor: getSeverity(order.order_status) }}
              className="text-md"
            />
          )}
          className="max-w-[7rem]"
        />
      </DataTable>
    </div>
  )
}

export default AllTradesComponent
