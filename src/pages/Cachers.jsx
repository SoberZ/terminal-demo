import { useState, useEffect, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { UserService } from '../services'

import { Dropdown } from 'primereact/dropdown'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { FilterMatchMode, FilterOperator } from 'primereact/api'

import {
  fetchCachers,
  registerCacher,
  pauseCacher,
} from '../utils/Fetchers/CacherFetchers'

import { TerminalButton } from '../components'

import { useWindowSize } from '../hooks/'
import { statusColors } from '../utils/statusColors'

const Cachers = () => {
  const { width } = useWindowSize()
  const [cachers, setCachers] = useState([])
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    endpoint: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    exchange: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
    market: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
  })

  useLayoutEffect(() => {
    toast.dismiss()
  }, [])

  useEffect(() => {
    //! i cant fetch them both at the same time, inactive will always supersede active
    fetchCachers(setCachers)
  }, [])

  const [globalFilterValue, setGlobalFilterValue] = useState('')

  const [statuses] = useState([
    'active',
    'new',
    'pausing',
    'paused_err',
    'paused',
    'stop',
  ])
  const [endpoints] = useState([
    'ticker',
    'open_interest',
    'trades',
    'fetchfundingrates',
    'orderbook',
    'screener',
  ])

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const stringFilterOptions = [
    { label: 'Contains', value: FilterMatchMode.CONTAINS },
  ]

  const marketBodyTemplate = (cacher) => {
    return <span>{!cacher.market ? '—' : cacher.market}</span>
  }

  const handlePause = (cacher) => {
    const { name, status, ...filteredCacher } = cacher
    const res = pauseCacher(filteredCacher)
  }

  const handleRestart = (cacher) => {
    const { name, status, ...filteredCacher } = cacher
    const res = registerCacher(filteredCacher)
  }

  //? can't refetch the data, i need to make it manual
  const handleRefresh = () => {
    fetchCachers(setCachers)
  }

  //* these are the filter options for the endpoint column
  const endpointsFilterOptions = [
    { label: 'Equals', value: FilterMatchMode.EQUALS },
  ]

  const endpointFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={endpoints}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={(option) => <Tag value={option} />}
        placeholder="Select an endpoint"
        showClear
      />
    )
  }
  //* these are the filter options for the endpoint column

  //? these are the filter options for the status column
  const statusFilterOptions = [
    { label: 'Equals', value: FilterMatchMode.EQUALS },
  ]

  const getSeverity = (input) => {
    switch (input) {
      case 'active':
        return statusColors.active
      case 'paused':
        return statusColors.paused
      case 'new':
        return statusColors.new
      case 'stopped':
        return statusColors.stopped
      case 'paused_err':
        return statusColors.pausedErr
      case 'restart':
        return statusColors.restart
      default:
        return 'MidnightBlue'
    }
  }

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={(option) => (
          <Tag
            value={option}
            style={{
              backgroundColor: getSeverity(option),
            }}
          />
        )}
        placeholder="Select a status"
        showClear
      />
    )
  }

  const statusSortingFunction = ({ field, data, order }) => {
    const statusOrder = [
      'active',
      'new',
      'pausing',
      'paused_err',
      'paused',
      'stop',
    ]

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
      <TerminalButton styles="ml-2 md:ml-0">
        <Link to="/cachers/create">
          <h1 className="text-sm font-semibold text-white">
            Register a new Cacher
          </h1>
        </Link>
      </TerminalButton>

      <div className="w-full space-y-5 rounded-lg bg-color-secondary p-5 text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800">
        <p className="text-sm font-light">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque quae
          repudiandae, sint officiis molestiae possimus nesciunt quos in autem
          voluptatem iure ex, aliquid dolor! In dolorum ratione ex sed esse!
        </p>
        <div className="flex items-center justify-between">
          <InputText
            className="h-10 w-full border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500 md:w-1/3"
            placeholder="Global search for a cacher (status, endpoint, market, etc.)"
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
          />
          <button className="mx-2" onClick={handleRefresh}>
            <i className="pi pi-refresh text-xl"></i>
          </button>
        </div>
        {cachers ? (
          <div className="!md:text-base !text-xs">
            <DataTable
              value={cachers}
              filters={filters}
              rows={20}
              sortField={'status'}
              sortOrder={1}
              rowsPerPageOptions={[20, 30, 40, 50]}
              totalRecords={cachers.length}
              paginator
              breakpoint="0"
              scrollable
              className="text-[0.75rem]"
              paginatorTemplate={
                width < 768
                  ? 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                  : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
              }
              // onRowClick={(e) => {
              //   navigate(`/exchanges/${e.data.exchange_account_id}`)
              // }}
            >
              <Column
                sortable
                style={{ fontSize: '0.9rem' }}
                field="name"
                header="Name"
                frozen
                className="min-w-[8rem] break-all shadow-[5px_0px_5px_#00000022] md:min-w-[15rem] lg:min-w-[18rem] xl:shadow-none"
              />
              <Column
                sortable
                style={{ fontSize: '0.9rem' }}
                field="exchange"
                header="Exchange"
                filter
                showFilterOperator={false}
                filterMatchModeOptions={stringFilterOptions}
                className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
              />
              <Column
                sortable
                style={{ fontSize: '0.9rem' }}
                field="status"
                header="Status"
                filter
                body={(cacher) => (
                  <Tag
                    value={cacher.status}
                    style={{
                      backgroundColor: getSeverity(cacher.status),
                    }}
                    className="text-md"
                  />
                )}
                sortFunction={statusSortingFunction}
                filterMatchModeOptions={statusFilterOptions}
                showFilterOperator={false}
                filterElement={statusFilterTemplate}
                className="min-w-[8rem] lg:min-w-[10rem]"
              />
              <Column
                sortable
                style={{ fontSize: '0.9rem' }}
                field="endpoint"
                header="Endpoint"
                filter
                showFilterOperator={false}
                filterElement={endpointFilterTemplate}
                filterMatchModeOptions={endpointsFilterOptions}
                className="min-w-[9rem] break-words lg:min-w-[10rem]"
              />
              <Column
                sortable
                style={{ fontSize: '0.9rem' }}
                field="market"
                header="Market"
                filter
                showFilterOperator={false}
                body={marketBodyTemplate}
                filterMatchModeOptions={stringFilterOptions}
                className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
              />
              <Column
                style={{ fontSize: '0.9rem' }}
                className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                body={(cacher) => {
                  return (
                    <i
                      className={`pi pi-${
                        cacher.status === 'active'
                          ? 'pause'
                          : cacher.status === 'paused' && 'play'
                      }
                      ${
                        cacher.status === 'paused' || cacher.status === 'active'
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed'
                      }
                      
                      `}
                      style={{
                        color:
                          cacher.status === 'paused' ||
                          cacher.status === 'active'
                            ? '#00d600'
                            : '#004C00',
                      }}
                      onClick={() => {
                        if (cacher.status === 'active') {
                          handlePause(cacher)
                        } else if (cacher.status === 'paused') {
                          handleRestart(cacher)
                        }
                      }}></i>
                  )
                }}
              />
            </DataTable>
          </div>
        ) : (
          <p className="text-sm font-light">No cachers found</p>
        )}
      </div>
    </div>
  )
}

export default Cachers
