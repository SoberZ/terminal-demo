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
import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'

import { useWindowSize } from '../hooks'
import { statusColors } from '../utils/statusColors'

import Exchangess from '../data/exchanges.json'

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
    setExchangeAccounts(Exchangess)
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
  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Exchanges Page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this page has all the exchange accounts in the system that you've
              connected using your API keys inside the Create Exchange Account
              page. <span className="font-bold"> (with the button above) </span>
            </h2>
          </div>
        ),
        placement: 'center',
        target: 'body',
        styles: {
          options: {
            width: 550,
          },
        },
      },
    ],
  })

  const handleJoyrideCallback = (data) => {
    const { status } = data
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setState((prev) => ({ ...prev, run: false }))
    }
  }
  return (
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        disableOverlay
        disableScrollParentFix
        // spotlightPadding={5}
        // disableOverlayClose
        // spotlightClicks
        styles={{
          options: {
            zIndex: 1000,
            primaryColor: '#4432e2',
            arrowColor: '#fff',
            backgroundColor: '#fff',
            textColor: '#171717',
          },
        }}
        // styles={{ overlay: { height: '100%' } }}
      />
      <div className="space-y-10">
        <Link to="/exchanges/create">
          <TerminalButton>
            <h1 className="text-sm font-semibold text-white">
              Create Exchange Account
            </h1>
          </TerminalButton>
        </Link>

        <div className="space-y-5 rounded-lg bg-color-secondary p-5 text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800">
          <p className="text-sm font-light ">
            Find on overview of all exchange accounts in the system. By clicking
            on an individual account you can pause or restart exchange accounts
            and get the balance of the respective exchange accounts. Note that
            only active exchange accounts can be used for strategies. If you
            need to use an exchange account that is paused, restart it but keep
            in mind that any strategy associated to that exchange account that
            is not paused or stopped will restart as well.
          </p>
          <InputText
            className="h-10 w-full border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500 md:w-1/3"
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
      <div className="absolute bottom-5 right-9 z-20">
        <TerminalButton
          text="Start Tour"
          textSize="text-base"
          onClick={() => {
            setState((prev) => ({ ...prev, run: true }))
          }}
          className="flex !w-auto items-center justify-center gap-2 text-white ">
          <BiInfoCircle size={25} />
        </TerminalButton>
      </div>
    </>
  )
}

export default Exchanges
