import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Dropdown } from 'primereact/dropdown'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { FilterMatchMode, FilterOperator } from 'primereact/api'

import { TerminalButton } from '../components'
import { ExchangesService, UserService } from '../services'

import { useWindowSize } from '../hooks'
import { statusColors } from '../utils/statusColors'

export const getSeverity = (status) => {
  switch (status) {
    case 'running':
      return statusColors.running
    case 'restart':
      return statusColors.restart
    case 'stopped':
      return statusColors.stopped
    case 'auth_failed':
      return statusColors.authFailed
    case 'err':
      return statusColors.err
    case 'paused':
      return statusColors.paused
    case 'paused_err':
      return statusColors.pausedErr
    default:
      return 'danger'
  }
}

const Exchanges = () => {
  const { width } = useWindowSize()
  const [exchangeAccounts, setExchangeAccounts] = useState([])
  const { state } = useLocation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  })
  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  async function fetchExchangeAccounts() {
    const fetchToast = toast.loading('Fetching Exchanges')

    const res = await ExchangesService.getAll()
    if (res.status === 200) {
      setExchangeAccounts(res.data.data)
      toast.success('Fetched all exchange accounts', { id: fetchToast })
    } else {
      toast.error("Couldn't fetch exchange accounts", { id: fetchToast })
    }
  }

  useEffect(() => {
    toast.dismiss()
    fetchExchangeAccounts()
  }, [])

  useEffect(() => {
    // On navigate back show an alert.
    if (state) {
      toast.success(state.message)
    }
  }, [state])

  const [statuses] = useState([
    'running',
    'restart',
    'stopped',
    'auth_failed',
    'paused_err',
    'paused',
    'err',
  ])

  //? these are the filter options for the status column
  const statusFilterOptions = [
    { label: 'Equals', value: FilterMatchMode.EQUALS },
  ]

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={(option) => {
          return (
            <Tag
              value={option}
              style={{ backgroundColor: getSeverity(option) }}
            />
          )
        }}
        placeholder="Select a status"
        showClear
      />
    )
  }

  const statusSortingFunction = ({ field, data, order }) => {
    const statusOrder = ['running', 'restart', 'stopped', 'auth_failed']

    data.sort((a, b) => {
      const statusA = a[field]
      const statusB = b[field]

      if (statusOrder.includes(statusA) && statusOrder.includes(statusB)) {
        return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB)
      }

      if (statusOrder.includes(statusA)) {
        return -1
      }

      if (statusOrder.includes(statusB)) {
        return 1
      }

      return 0
    })
    if (order === -1) {
      data.reverse()
    }

    return data
  }
  //? these are the filter options for the status column

  return (
    <div className="space-y-10">
      {UserService.hasRole(['trader']) && (
        <TerminalButton>
          <Link to="/exchanges/create">
            <h1 className="text-sm font-semibold text-white">
              Create Exchange Account
            </h1>
          </Link>
        </TerminalButton>
      )}

      <div className="p-5 space-y-5 rounded-lg bg-color-secondary text-color-secondary dark:border dark:border-neutral-800 shadow-soft-lg">
        <p className="text-sm font-light ">
          Find on overview of all exchange accounts in the system. By clicking
          on an individual account you can pause or restart exchange accounts
          and get the balance of the respective exchange accounts. Note that
          only active exchange accounts can be used for strategies. If you need
          to use an exchange account that is paused, restart it but keep in mind
          that any strategy associated to that exchange account that is not
          paused or stopped will restart as well.
        </p>
        <InputText
          className="h-10 w-full md:w-1/3 border-[#757575] text-black dark:bg-color-secondary dark:text-white"
          placeholder="Global search for a exchange account (status, exchange, account, etc.)"
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
        />
        <DataTable
          value={exchangeAccounts}
          filters={filters}
          rows={20}
          sortField={'status'}
          sortOrder={1}
          rowsPerPageOptions={[20, 30, 40, 50]}
          totalRecords={exchangeAccounts.length}
          paginator
          breakpoint="0"
          scrollable
          paginatorTemplate={
            width < 768
              ? 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
              : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
          }
          onRowClick={(e) => {
            navigate(`/exchanges/${e.data.exchange_account_id}`)
          }}>
          <Column
            sortable
            style={{ fontSize: '0.9rem' }}
            field="exchange_account_id"
            header="Account"
          />
          <Column
            sortable
            style={{ fontSize: '0.9rem' }}
            field="exchange"
            header="Exchange"
          />
          <Column
            sortable
            style={{ fontSize: '0.9rem' }}
            field="status"
            header="Status"
            filter
            body={(account) => {
              return (
                <Tag
                  value={account.status}
                  style={{ backgroundColor: getSeverity(account.status) }}
                  className="text-md"
                />
              )
            }}
            sortFunction={statusSortingFunction}
            filterMatchModeOptions={statusFilterOptions}
            showFilterOperator={false}
            filterElement={statusFilterTemplate}
          />
        </DataTable>
      </div>
    </div>
  )
}

export default Exchanges
