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
import { MultiSelect } from 'primereact/multiselect'

import {
  demoModeFilterTemplate,
  statusFilterTemplate,
  strategyTypesFilterTemplate,
} from './addons/CategoriesAddons'

import { Fallback, Loader, TerminalButton } from '../components'

import AllStrategiesInCategoryData from '../data/categories/allStrategiesInCategory.json'
import UsersData from '../data/users/usersData.json'

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
    setUsers(usersIDs)
    setStrategies(AllStrategiesInCategoryData)
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

  return (
    <div className="flex flex-col space-y-5 rounded-lg bg-color-secondary p-3.5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:p-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-primary break-anywhere text-2xl font-semibold dark:text-white md:inline md:text-left">
          {categoryId}
        </h1>
        <p className="text-primary dark:text-white md:inline md:text-left">
          this is the description
        </p>
      </div>
      <div className="flex justify-between">
        <TerminalButton onClick={() => setVisible(true)}>
          Edit Category
        </TerminalButton>
        <InputText
          className="border-[#757575] py-2 text-black dark:bg-color-secondary dark:text-white md:w-1/3"
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
              setSelectedUsers([])
            }}>
            <div className="space-y-3">
              <div className="flex flex-col gap-3 ">
                <InputText
                  className="border-[#757575] py-2 text-black dark:bg-color-secondary dark:text-white "
                  placeholder={categoryId}
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <InputTextarea
                  className="border-[#757575]"
                  autoResize
                  placeholder={currentCategory[2]}
                  //? when i figure out fetching the description, we'll use this
                  // value={categoryDescription}
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
              <TerminalButton
                className={`w-full ${
                  categoryName.length >= 3
                    ? ''
                    : 'bg-neutral-400 hover:cursor-not-allowed dark:bg-neutral-800'
                }`}
                onClick={() => {
                  //TODO: to send the users list with the create category request
                  // updateCategoryData(
                  //   categoryId,
                  //   currentCategory[1],
                  //   categoryDescription,
                  //   selectedUsers
                  // )
                  console.log(
                    categoryName,
                    categoryId,
                    categoryDescription,
                    selectedUsers
                  )
                  setVisible(false)
                  setCategoryName('')
                  setCategoryDescription('')
                  setSelectedUsers([])
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
              className="break-anywhere min-w-[5rem] md:min-w-[15rem] lg:min-w-[18rem]"
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
  )
}

export default Category
