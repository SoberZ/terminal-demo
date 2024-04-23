import { FilterMatchMode, FilterOperator } from 'primereact/api'
import { formatDate } from '../../utils/misc'
import { statusColors } from '../../utils/statusColors'
import { Badge } from 'primereact/badge'
import { Dropdown } from 'primereact/dropdown'

export const orderTypes = ['limit', 'market']
export const orderSides = ['buy', 'sell']
export const orderStatus = [
  'open',
  'closed',
  'partially_filled',
  'abandoned',
  'canceled',
]

export const numericFilterOptions = [
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
  { label: 'Not equals', value: 'ne' },
]

export const stringFilterOptions = [
  { label: 'Contains', value: FilterMatchMode.CONTAINS },
  { label: 'Equals', value: 'eq' },
]

export const equalsFilterOptions = [{ label: 'Equals', value: 'eq' }]

export const dateFilterOptions = [
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

export const stopLossBodyTemplate = (order) => {
  return (
    <span>
      {order.stop_loss_price_trigger ? order.stop_loss_price_trigger : '—'}{' '}
    </span>
  )
}
export const priceBodyTemplate = (order) => {
  return <span>{order.price ?? '-'} </span>
}
export const quantityFilledBodyTemplate = (order) => {
  return <span>{order.quantity_filled ? order.quantity_filled : '—'} </span>
}
export const avgFillPriceBodyTemplate = (order) => {
  return <span>{order.avg_fill_price ? order.avg_fill_price : '—'} </span>
}

export const costBodyTemplate = (order) => {
  return (
    <span>
      {order.avg_fill_price && order.quantity_filled
        ? order.avg_fill_price * order.quantity_filled
        : order.price * order.quantity}
    </span>
  )
}

export const dateFilterTemplate = (options) => {
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

export const orderSidesFilterTemplate = (options) => {
  return (
    <Dropdown
      value={options.value}
      options={orderSides}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => (
        <Tag value={option} style={{ backgroundColor: getSeverity(option) }} />
      )}
      placeholder="Select an Order Side"
      showClear
    />
  )
}

export const orderTypesFilterTemplate = (options) => {
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

export const orderStatusFilterTemplate = (options) => {
  return (
    <Dropdown
      value={options.value}
      options={orderStatus}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => (
        <Tag value={option} style={{ backgroundColor: getSeverity(option) }} />
      )}
      placeholder="Select an Order Status"
      showClear
    />
  )
}

export const rowsPerPageOptions = [10, 20, 30, 40, 50]

export function HeaderTemplate({ badgeValue, title }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className={`${badgeValue > 0 ? '' : 'p-1.5 md:p-1'}`}>{title}</span>
      {badgeValue > 0 ? (
        <Badge value={badgeValue} className="bg-autowhale-blue" />
      ) : null}
    </span>
  )
}

export const getSeverity = (input) => {
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
