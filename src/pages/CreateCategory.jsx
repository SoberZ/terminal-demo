import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { StrategiesService, UserService } from '../services'
import { useWindowSize } from '../hooks'
import { Tag } from 'primereact/tag'
import { getSeverity } from './Strategies'
import { Menu } from 'primereact/menu'
import { FilterMatchMode } from 'primereact/api'
import { InputText } from 'primereact/inputtext'
import { ContextMenu } from 'primereact/contextmenu'
import { ListBox } from 'primereact/listbox'
import { TerminalButton } from '../components'

import { Dialog } from 'primereact/dialog'

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

const CreateCategory = () => {
  const { width } = useWindowSize()
  const [strategies, setStrategies] = useState([])
  const [selectedStrategies, setSelectedStrategies] = useState([])
  const [favoriteStrategies, setFavoriteStrategies] = useState([])

  const [visible, setVisible] = useState(false)
  const [collectionName, setCollectionName] = useState('')

  const cm = useRef(null)
  const favLoaded = useRef(false)
  const username = UserService.getUsername()

  const [globalFilterValue, setGlobalFilterValue] = useState('')
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  const [selectedMenuStrategy, setSelectedMenuStrategy] = useState(null)

  const items = [
    {
      template: (item, options) => {
        return (
          <ListBox
            filter
            value={selectedMenuStrategy}
            onChange={(e) => setSelectedMenuStrategy(e.value)}
            options={selectedStrategies}
            optionLabel="strategy_id"
            listStyle={{ height: '250px' }}
          />
        )
      },
    },
    {
      label: 'Log it baby',
      icon: 'pi pi-fw pi-pencil',
      command: () => {
        console.log(selectedStrategies)
      },
    },

    { label: 'Duplicate', icon: 'pi pi-fw pi-copy' },
    { label: 'Delete', icon: 'pi pi-fw pi-trash' },
  ]

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

  //TODO: i need to put the filters too
  return (
    <div className="space-y-5 rounded-lg bg-color-secondary p-3.5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:p-5">
      <p className="text-sm font-light">Create a Category here</p>
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

        <Dialog
          header="Create Collection"
          visible={visible}
          draggable={false}
          onHide={() => setVisible(false)}>
          <div className="space-y-3">
            <InputText
              className="border-[#757575] py-2 text-black dark:bg-color-secondary dark:text-white "
              placeholder="Collection Name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />
            <p>{selectedStrategies?.length} Selected Strategies</p>
          </div>
        </Dialog>
      </div>

      <p>{selectedStrategies?.length} Selected Strategies</p>
      <ContextMenu
        model={items}
        ref={cm}
        onHide={() => setSelectedStrategies(null)}
        className="w-[20rem]"
      />
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
        contextMenuSelection={selectedStrategies}
        onContextMenu={(e) => cm?.current?.show(e.originalEvent)}
        //? this here is the problem with the context menu
        // onContextMenuSelectionChange={(e) => console.log(e)}
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
        className="text-[0.7rem] md:text-[0.75rem]"
        // onRowClick={(e) => {
        // }}
      >
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
          className="min-w-[8rem] md:min-w-[10rem] lg:min-w-[14rem]"
        />
        <Column
          sortable
          field="is_demo_strategy"
          header="Demo mode"
          body={strategyDemoModeBodyTemplate}
          style={{ minWidth: '7rem' }}
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
        />
      </DataTable>
    </div>
  )
}

export default CreateCategory
