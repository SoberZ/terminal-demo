import { Suspense, useEffect, useRef, useState } from 'react'
import { useWindowSize } from '../hooks'
import { useNavigate } from 'react-router-dom'

import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Tag } from 'primereact/tag'
import { FilterMatchMode, FilterOperator } from 'primereact/api'
import { InputText } from 'primereact/inputtext'
import { useParams } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

import { getSeverity } from './Strategies'
import { UserService } from '../services'

import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'

import {
  demoModeFilterTemplate,
  statusFilterTemplate,
  strategyTypesFilterTemplate,
} from './addons/CategoriesAddons'

import { Fallback, Loader, TerminalButton } from '../components'

import AllStrategiesInCategoryData from '../data/categories/allStrategiesInCategory.json'
import UsersData from '../data/users/usersData.json'
import StrategiesData from '../data/strategies/strategiesData.json'

import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'
import { Helmet } from 'react-helmet'

const strategyDemoModeBodyTemplate = (strategy) => {
  return (
    <Tag
      value={String(strategy.is_demo_strategy)}
      style={{ backgroundColor: getSeverity(strategy.is_demo_strategy) }}
      className="text-md"></Tag>
  )
}

const equalsFilterOptions = [{ label: 'Equals', value: FilterMatchMode.EQUALS }]

const Category = () => {
  const navigate = useNavigate()
  const { categoryId } = useParams()
  const { width } = useWindowSize()
  const [strategies, setStrategies] = useState([])
  const [favoriteStrategies, setFavoriteStrategies] = useState([])
  const [allStrategies, setAllStrategies] = useState([])
  const [selectedStrategies, setSelectedStrategies] = useState([])

  const [currentCategory, setCurrentCategory] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
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
    const usersIDs = UsersData?.map((user) => user.username)
    setAllStrategies(StrategiesData.data.data)
    setStrategies(AllStrategiesInCategoryData)
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

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }

    _filters['global'].value = value

    setFilters(_filters)
    setGlobalFilterValue(value)
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
  const strategyIds = strategies.map((strategy) => strategy.strategy_id)

  const cleanedStrategies = allStrategies
    .filter((strategy) => !strategyIds.includes(strategy.strategy_id))
    .map((strategy) => strategy.strategy_id)

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Category page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this page is{' '}
              <span className="font-bold">
                {' '}
                only available for admin users,{' '}
              </span>
              <br /> and shows all strategies in this category,
            </h2>
            <h2>
              <span className="font-bold">
                {' '}
                the admin can add/remove strategies,{' '}
              </span>
              and edit the category's name and description
            </h2>
          </div>
        ),
        placement: 'center',
        target: 'body',
        styles: {
          options: {
            width: 400,
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
            primaryColor: '#4133da',
            arrowColor: '#fff',
            backgroundColor: '#fff',
            textColor: '#171717',
          },
        }}
        // styles={{ overlay: { height: '100%' } }}
      />
      <Helmet>
        <title>{categoryId}</title>
      </Helmet>
      <ConfirmDialog />
      <div className="mx-auto flex max-w-[2200px] flex-col space-y-5 rounded-lg bg-color-secondary p-3.5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:p-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-primary break-anywhere text-2xl font-semibold dark:text-white md:inline md:text-left">
            {categoryId}
          </h1>
          <p className="text-primary dark:text-white md:inline md:text-left">
            this is a generic description, don't worry about it
          </p>
        </div>
        <div className="flex flex-wrap justify-between gap-4">
          <TerminalButton className="h-11" onClick={() => setVisible(true)}>
            Edit Category
          </TerminalButton>
          <InputText
            className="h-11 w-full border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500 md:w-1/3"
            placeholder="Search for a Strategy"
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
          />
        </div>
        <ErrorBoundary FallbackComponent={Fallback}>
          <Suspense fallback={<Loader />}>
            <Dialog
              className="w-[20rem]"
              header="Edit Category"
              visible={visible}
              draggable={false}
              onHide={() => {
                setVisible(false)
                setCategoryName('')
                setCategoryDescription('')
              }}>
              <div className="space-y-3">
                <div className="flex flex-col gap-3 py-2">
                  <InputText
                    className="border-[#757575] py-2 text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                    placeholder={categoryId}
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                  <InputTextarea
                    className="border-[#757575] py-2 text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500"
                    autoResize
                    placeholder="update your description here"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    rows={1}
                    cols={10}
                  />
                </div>
                <TerminalButton
                  disabled={categoryName.length < 3}
                  className={`w-full ${
                    categoryName.length >= 3
                      ? ''
                      : 'bg-neutral-400 hover:cursor-not-allowed dark:bg-neutral-800'
                  }`}
                  onClick={async () => {
                    setVisible(false)
                    setCategoryName('')
                    setCategoryDescription('')
                  }}>
                  Edit {categoryName}
                </TerminalButton>
              </div>
            </Dialog>
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary FallbackComponent={Fallback}>
          <Suspense fallback={<Loader />}>
            <DataTable
              value={strategies}
              filters={filters}
              paginator
              breakpoint="0"
              paginatorTemplate={
                width < 768
                  ? 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                  : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
              }
              sortField={'active_status'}
              sortOrder={1}
              rows={20}
              rowsPerPageOptions={[20, 30, 40, 50]}
              totalRecords={strategies?.length}
              className="text-[0.7rem] md:text-[0.75rem]"
              onRowClick={(e) => {
                //? e.data is the strategy object from when david fixes it
                navigate(`/strategies/${e.data.strategy_id}`)
              }}>
              <Column
                sortable
                field="strategy_id"
                header="Strategy"
                className="break-anywhere min-w-[7rem] md:min-w-[15rem] lg:min-w-[18rem]"
              />
              <Column
                sortable
                field="type"
                header="Type"
                className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                filter
                filterMatchModeOptions={equalsFilterOptions}
                showFilterOperator={false}
                filterElement={strategyTypesFilterTemplate}
              />
              <Column
                field="exchange"
                header="Exchange"
                style={{ padding: '0.9em' }}
                dataType="text"
                className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                body={(strategy) => (
                  <div className="flex items-center gap-1">
                    <img
                      src={`/crypto-exchanges-webp/${
                        strategy.exchange || 'generic'
                      }.webp`}
                      className="h-6 w-6"
                      alt=""
                    />
                    <p className="text-[0.7rem] md:text-sm">
                      {strategy.exchange}
                    </p>
                  </div>
                )}
              />
              <Column
                sortable
                field="market"
                header="Market"
                className="min-w-[5rem] md:min-w-[7rem] lg:min-w-[10rem]"
                body={(strategy) => (
                  <div className="flex items-center">
                    <img
                      src={`/crypto-icons-webp/${
                        strategy.market.split('/')[0] || 'generic'
                      }.webp`}
                      className="h-6 w-6"
                      alt=""
                    />
                    <p className="text-[0.7rem] md:text-sm">
                      {strategy.market}
                    </p>
                  </div>
                )}
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
              <Column
                className="max-w-[3.6rem]"
                body={(strategy) => {
                  return (
                    <i
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDialog({
                          message: `Are you sure you want to proceed?`,
                          header: 'Confirmation',
                          icon: 'pi pi-exclamation-triangle',
                          accept: () => {},
                          reject: () => {},
                        })
                      }}
                      className="pi pi-trash text-[1.3rem] text-red-500 hover:text-red-700"></i>
                  )
                }}
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

export default Category
