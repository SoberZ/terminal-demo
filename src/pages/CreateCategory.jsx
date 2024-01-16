import { useState, useEffect, useRef, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWindowSize } from '../hooks'

import { StrategiesService, UserService } from '../services'
import { getSeverity } from './Strategies'
import { Fallback, Loader, TerminalButton } from '../components'

import {
  demoModeFilterTemplate,
  statusFilterTemplate,
  strategyTypesFilterTemplate,
} from './addons/CategoriesAddons'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { FilterMatchMode, FilterOperator } from 'primereact/api'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { MultiSelect } from 'primereact/multiselect'
import { ErrorBoundary } from 'react-error-boundary'
import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'

import UsersData from '../data/users/usersData.json'

async function fetchStrategies() {
  const res = await StrategiesService.getAll()
  let serviceData = res.data

  if (!serviceData) {
    return
  }

  return serviceData
}

const strategyDemoModeBodyTemplate = (strategy) => {
  return (
    <Tag
      value={String(strategy.is_demo_strategy)}
      style={{ backgroundColor: getSeverity(strategy.is_demo_strategy) }}
      className="text-md"></Tag>
  )
}

const equalsFilterOptions = [{ label: 'Equals', value: FilterMatchMode.EQUALS }]

const CreateCategory = () => {
  const { width } = useWindowSize()
  const navigate = useNavigate()
  const [strategies, setStrategies] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedStrategies, setSelectedStrategies] = useState([])
  const [favoriteStrategies, setFavoriteStrategies] = useState([])

  const [visible, setVisible] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')

  const favLoaded = useRef(false)
  const username = UserService.getUsername()

  const [globalFilterValue, setGlobalFilterValue] = useState('')
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

  useEffect(() => {
    async function fetchFavorites() {
      const fetchedFavorites = await UserService.getFavorites(username)
      if (fetchedFavorites) {
        setFavoriteStrategies(fetchedFavorites)
      }
    }
    async function fetchStrategyData() {
      let serviceData = await fetchStrategies()
      setStrategies((_) => serviceData)
    }
    fetchFavorites()
    fetchStrategyData()

    const usersIDs = UsersData?.map((user) => user.username)
    setUsers(usersIDs)
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

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const selectedStrategiesIDs = selectedStrategies?.map(
    (strategy) => strategy.strategy_id
  )

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Create-a-Category page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              in this page you can create a category by{' '}
              <span className="font-bold">
                {' '}
                selecting a list of strategies{' '}
              </span>
            </h2>
            <h2>
              and then adding a name + to
              <span className="font-bold"> assigning different users </span>
              this category{' '}
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

      <div className="space-y-5 rounded-lg bg-color-secondary p-3.5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:p-5">
        <p className="text-sm font-light">Create a category here</p>
        <div className="flex gap-5">
          <TerminalButton
            disabled={selectedStrategies?.length <= 0 ? true : false}
            onClick={() => setVisible(true)}
            className={
              selectedStrategies?.length > 0
                ? ''
                : 'bg-neutral-400 hover:cursor-not-allowed dark:bg-neutral-800'
            }>
            New Category
          </TerminalButton>
          <InputText
            className="border-[#757575] py-2 text-black dark:bg-color-secondary dark:text-white md:w-1/3"
            placeholder="Search for a Strategy"
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
          />
          <ErrorBoundary FallbackComponent={Fallback}>
            <Suspense fallback={<Loader />}>
              <Dialog
                className="w-[20rem]"
                header="Create Category"
                visible={visible}
                draggable={false}
                onHide={() => {
                  setCategoryName('')
                  setCategoryDescription('')
                  setSelectedUsers([])
                  setVisible(false)
                }}>
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 ">
                    <InputText
                      className="border-[#757575] py-2 text-black dark:bg-color-secondary dark:text-white "
                      placeholder="Category Name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                    <InputTextarea
                      className="border-[#757575]"
                      autoResize
                      placeholder="Category Description"
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      rows={1}
                      cols={10}
                    />
                    <MultiSelect
                      value={selectedUsers}
                      onChange={(e) => setSelectedUsers(e.value)}
                      options={users}
                      placeholder="Select Users"
                      maxSelectedLabels={1}
                      className="md:w-20rem w-full !border-[#757575]"
                    />
                  </div>
                  <p>{selectedStrategies?.length} Selected Strategies</p>
                  <TerminalButton
                    className={`w-full ${
                      categoryName.length >= 3
                        ? ''
                        : 'bg-neutral-400 hover:cursor-not-allowed dark:bg-neutral-800'
                    }`}
                    onClick={() => {
                      setVisible(false)
                      navigate(`/users/categories/${categoryName}`)
                    }}>
                    Create {categoryName}
                  </TerminalButton>
                </div>
              </Dialog>
            </Suspense>
          </ErrorBoundary>
        </div>
        <p>{selectedStrategies?.length} Selected Strategies</p>
        <ErrorBoundary FallbackComponent={Fallback}>
          <Suspense fallback={<Loader />}>
            <DataTable
              dataKey="strategy_id"
              value={sortedStrategies}
              filters={filters}
              paginator
              breakpoint="0"
              scrollable
              dragSelection
              metaKeySelection={true}
              selectionMode="multiple"
              selection={selectedStrategies}
              onSelectionChange={(e) => setSelectedStrategies(e.value)}
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
              className="text-[0.7rem] md:text-[0.75rem]">
              <Column
                selectionMode="multiple"
                className="max-w-[0.5rem] md:max-w-[3rem]"></Column>
              <Column
                sortable
                field="strategy_id"
                header="Strategy"
                className="break-anywhere min-w-[5rem] md:min-w-[15rem] lg:min-w-[18rem]"
              />
              <Column
                sortable
                field="type"
                header="Type"
                filter
                className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                filterMatchModeOptions={equalsFilterOptions}
                showFilterOperator={false}
                filterElement={strategyTypesFilterTemplate}
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
                className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
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
                sortFunction={statusSortingFunction}
                body={(strategy) => (
                  <Tag
                    value={strategy.active_status}
                    style={{
                      backgroundColor: getSeverity(strategy.active_status),
                    }}
                    className="text-md"
                  />
                )}
                filter
                filterMatchModeOptions={equalsFilterOptions}
                showFilterOperator={false}
                filterElement={statusFilterTemplate}
              />
            </DataTable>
          </Suspense>
        </ErrorBoundary>
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

export default CreateCategory
