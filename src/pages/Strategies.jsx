import { useEffect, useState, useLayoutEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { Tag } from 'primereact/tag'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode, FilterOperator } from 'primereact/api'

import { TerminalButton } from '../components'
import { StrategiesService, UserService, StateService } from '../services'

import { useWindowSize } from '../hooks'
import { statusColors } from '../utils/statusColors'

import StrategiesData from '../data/strategies/strategiesData.json'

import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'

//? these are the filter options for the status column
export const getSeverity = (input) => {
  switch (input) {
    case true:
      return statusColors.true
    case 'true':
      return statusColors.true
    case 'active':
      return statusColors.active
    case false:
      return statusColors.false
    case 'false':
      return statusColors.false
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

const Strategies = () => {
  const { width } = useWindowSize()
  const [favoriteStrategies, setFavoriteStrategies] = useState([])

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Strategies Page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this page contains{' '}
              <span className="font-bold">
                {' '}
                a Compact Overview of all strategies in the system
              </span>
            </h2>
            <h2>
              Showcasing which pairs and exchange accounts strategies are
              running with, their respective 24h PnL, status and if it’s a demo
              strategy{' '}
              <span className="font-bold">
                (i.E. paper trading strategies){' '}
              </span>
            </h2>
            <h2>
              you can also{' '}
              <span className="font-bold">
                search or sort/filter strategies
              </span>{' '}
              per the icons
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

  const [strategies, setStrategies] = useState([])
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    active_status: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    type: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    exchange_account_id: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
    is_demo_strategy: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  })
  const navigate = useNavigate()
  const { state } = useLocation()
  const [globalFilterValue, setGlobalFilterValue] = useState('')

  let username = UserService.getUsername()

  //! sadly can't prefetch them ahead of times since they require to be used in a useState, and that needs default values
  const [statuses] = useState([
    'active',
    'new',
    'stop',
    'paused',
    'pausing',
    'paused_err',
    'starting',
  ])
  const [demoMode] = useState(['true', 'false'])
  const [types] = useState([
    'spread-algo',
    'depth-algo',
    'demo-streaming-strategy',
    'VolumeStrategy',
    'MatrixStrategy',
  ])

  const favLoaded = useRef(false)

  useLayoutEffect(() => {
    toast.dismiss()
  }, [])

  useEffect(() => {
    setStrategies(() => StrategiesData.data.data)

    // async function fetchFavorites() {
    //   const fetchedFavorites = await UserService.getFavorites(username)
    //   if (fetchedFavorites) {
    //     setFavoriteStrategies(fetchedFavorites)
    //   }
    // }
    // fetchFavorites()

    if (state !== null) {
      if (state.isDeleted === true) {
        toast.success('Successfully deleted strategy')
      }
    }
  }, [])

  useEffect(() => {
    if (!favLoaded.current) {
      favLoaded.current = true
      return
    }

    async function setFavorites() {
      let user = await UserService.getUserId(username)
      UserService.setFavorites(user, favoriteStrategies)
    }
    setFavorites()
  }, [favoriteStrategies])

  const strategyDemoModeBodyTemplate = (strategy) => {
    return (
      <Tag
        value={String(strategy.is_demo_strategy)}
        style={{ backgroundColor: getSeverity(strategy.is_demo_strategy) }}
        className="text-md"></Tag>
    )
  }
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
  const equalsFilterOptions = [
    { label: 'Equals', value: FilterMatchMode.EQUALS },
  ]

  const strategyTypesFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={types}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        placeholder="Select a Strategy Type"
        showClear
      />
    )
  }

  const demoModeFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={demoMode}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={(option) => (
          <Tag
            value={option}
            style={{ backgroundColor: getSeverity(option) }}
          />
        )}
        placeholder="Select a Demo Mode"
        showClear
      />
    )
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
            style={{ backgroundColor: getSeverity(option) }}
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
      const isAFavorite = favoriteStrategies.includes(a.strategy_id)
      const isBFavorite = favoriteStrategies.includes(b.strategy_id)

      if (isAFavorite && !isBFavorite) {
        return -1
      } else if (!isAFavorite && isBFavorite) {
        return 1
      }

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
  const toggleFavoriteStrategy = (strategyId) => {
    if (favoriteStrategies.includes(strategyId)) {
      const updatedFavorites = favoriteStrategies.filter(
        (id) => id !== strategyId
      )
      setFavoriteStrategies(updatedFavorites)
    } else {
      const updatedFavorites = [...favoriteStrategies, strategyId]
      setFavoriteStrategies(updatedFavorites)
    }
  }
  const sortedStrategies = [...strategies].sort((a, b) => {
    const isAFavorite = favoriteStrategies.includes(a.strategy_id)
    const isBFavorite = favoriteStrategies.includes(b.strategy_id)

    if (isAFavorite && !isBFavorite) {
      return -1
    } else if (!isAFavorite && isBFavorite) {
      return 1
    }

    return 0
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
      <div className="flex flex-col space-y-10 overflow-y-hidden">
        <div
          id="step-0"
          className="space-y-5 rounded-lg bg-color-secondary p-3.5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:p-5">
          <div>
            <p className="text-sm font-light">
              Find an overview over all strategies in the system here. It gives
              a compact overview of which pairs and exchange accounts the
              strategies are running on as well as their respective 24h PnL,
              status and whether it’s a demo strategy, To create a new strategy
              the “Create new strategy” button will direct to the corresponding
              form.{' '}
              <span className="font-bold">
                Note that only traders can create or modify strategies
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <TerminalButton styles="ml-2 md:ml-0">
              <Link to="/strategies/create">
                <h1 className="text-sm font-semibold text-white">
                  Create a new strategy
                </h1>
              </Link>
            </TerminalButton>
            <InputText
              className="h-11 w-full border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500 md:w-1/3"
              placeholder="Search a strategy"
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
            />
          </div>
          <DataTable
            value={sortedStrategies}
            filters={filters}
            paginator
            breakpoint="0"
            scrollable
            paginatorTemplate={
              width < 768
                ? 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
            }
            sortField={'active_status'}
            sortOrder={1}
            rows={20}
            rowsPerPageOptions={[20, 30, 40, 50]}
            totalRecords={strategies.length}
            className="text-[0.75rem]"
            onRowClick={(e) => {
              navigate(`/strategies/${e.data.strategy_id}`)
            }}>
            <Column
              header=""
              frozen
              body={(data) => (
                <button
                  className="favorite-icon"
                  onClick={() => toggleFavoriteStrategy(data.strategy_id)}>
                  {favoriteStrategies.includes(data.strategy_id) ? (
                    <i
                      className="pi pi-star-fill color-gradient-to-r from-blue-900 to-blue-500 "
                      style={{ fontSize: '1.4rem', color: '#c6a907' }}
                    />
                  ) : (
                    <i
                      className="pi pi-star "
                      style={{ fontSize: '1.4rem', color: '#c6a907' }}
                    />
                  )}
                </button>
              )}
              className="max-w-[3rem]"
            />
            <Column
              sortable
              field="strategy_id"
              header="Strategy name"
              frozen
              className="min-w-[8rem] break-all shadow-[5px_0px_5px_#00000022] md:min-w-[15rem] lg:min-w-[18rem] xl:shadow-none"
              body={(data) => (
                <div className="flex flex-col">
                  <Link to={`/strategies/${data.strategy_id}`} className="">
                    <h1 className="text-sm font-semibold">
                      {data.strategy_id}
                    </h1>
                  </Link>
                </div>
              )}
            />
            <Column
              sortable
              field="type"
              header="Type"
              filter
              filterMatchModeOptions={equalsFilterOptions}
              showFilterOperator={false}
              filterElement={strategyTypesFilterTemplate}
              className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
            />
            <Column
              sortable
              field="market"
              header="Market"
              className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
            />
            <Column
              sortable
              field="exchange_account_id"
              header="Exchange account"
              filter
              filterMatchModeOptions={stringFilterOptions}
              showFilterOperator={false}
              className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
            />
            <Column
              sortable
              field="pnl"
              header="Total PnL"
              className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
            />
            <Column
              sortable
              field="realized_pnl"
              header="Realized PnL"
              className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
            />
            <Column
              sortable
              field="is_demo_strategy"
              header="Demo mode"
              body={strategyDemoModeBodyTemplate}
              style={{ minWidth: '7rem' }}
              filter
              filterMatchModeOptions={equalsFilterOptions}
              showFilterOperator={false}
              filterElement={demoModeFilterTemplate}
            />
            <Column
              sortable
              field="active_status"
              header="Status"
              filter
              body={(strategy) => (
                <Tag
                  value={strategy.active_status}
                  style={{
                    backgroundColor: getSeverity(strategy.active_status),
                  }}
                  className="text-md"
                />
              )}
              sortFunction={statusSortingFunction}
              filterMatchModeOptions={equalsFilterOptions}
              showFilterOperator={false}
              filterElement={statusFilterTemplate}
              className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
            />
          </DataTable>
        </div>
      </div>
      <div className="fixed bottom-5 right-9 z-20">
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

export default Strategies
