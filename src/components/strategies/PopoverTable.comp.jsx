import { forwardRef, useEffect, useRef, useState } from 'react'
import { OverlayPanel } from 'primereact/overlaypanel'
import { DataTable } from 'primereact/datatable'
import { getSeverity } from '../../pages/Strategies'
import { useWindowSize } from '../../hooks'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Sidebar } from 'primereact/sidebar'

import { UserService } from '../../services'

const PopoverTable = forwardRef(
  ({ strategies, setPopover, visibleBottom, setSidebar, navigate }, ref) => {
    const { width } = useWindowSize()
    const [favoriteStrategies, setFavoriteStrategies] = useState([])
    const favLoaded = useRef(false)

    let username = UserService.getUsername()

    useEffect(() => {
      async function fetchFavorites() {
        const fetchedFavorites = await UserService.getFavorites(username)
        if (fetchedFavorites) {
          setFavoriteStrategies(fetchedFavorites)
        }
      }
      fetchFavorites()
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

    return width >= 768 ? (
      <OverlayPanel ref={ref} className="shadow-lg">
        <DataTable
          value={sortedStrategies}
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
          rows={8}
          rowsPerPageOptions={[20, 30, 40, 50]}
          totalRecords={strategies.length}
          className="text-[0.7rem] md:text-[0.75rem]"
          onRowClick={(e) => {
            setPopover(e.data.strategy_id)
            navigate(`/strategies/${e.data.strategy_id}`, {
              replace: true,
            })
            ref?.current?.hide()
          }}>
          <Column
            header=""
            frozen
            body={(data) => (
              <button className="favorite-icon">
                {favoriteStrategies.includes(data.strategy_id) ? (
                  <i
                    className="pi pi-star-fill color-gradient-to-r from-blue-900 to-blue-500 "
                    style={{
                      fontSize: width < 1024 ? '1rem' : '1.4rem',
                      color: '#c6a907',
                    }}
                  />
                ) : (
                  <i
                    className="pi pi-star "
                    style={{
                      fontSize: width < 1024 ? '1rem' : '1.4rem',
                      color: '#c6a907',
                    }}
                  />
                )}
              </button>
            )}
            className="max-w-[1rem] md:max-w-[3rem]"
          />
          <Column
            sortable
            field="strategy_id"
            header="Strategy"
            className="break-anywhere"
          />
          <Column sortable field="type" header="Type" />
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
      </OverlayPanel>
    ) : (
      <Sidebar
        visible={visibleBottom}
        position="bottom"
        fullScreen
        onHide={() => setSidebar(false)}>
        <DataTable
          value={sortedStrategies}
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
          rows={8}
          rowsPerPageOptions={[20, 30, 40, 50]}
          totalRecords={strategies.length}
          className="text-[0.7rem] md:text-[0.75rem]"
          onRowClick={(e) => {
            setPopover(e.data.strategy_id)
            navigate(`/strategies/${e.data.strategy_id}`, {
              replace: true,
            })
            setSidebar(false)
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
                    style={{
                      fontSize: width < 1024 ? '1rem' : '1.4rem',
                      color: '#c6a907',
                    }}
                  />
                ) : (
                  <i
                    className="pi pi-star "
                    style={{
                      fontSize: width < 1024 ? '1rem' : '1.4rem',
                      color: '#c6a907',
                    }}
                  />
                )}
              </button>
            )}
            className="max-w-[1rem] md:max-w-[3rem]"
          />
          <Column
            sortable
            field="strategy_id"
            header="Strategy"
            className="break-anywhere min-w-[5rem]"
          />
          <Column
            sortable
            field="type"
            header="Type"
            className="min-w-[5rem]"
          />
          <Column
            sortable
            field="active_status"
            header="Status"
            className="min-w-[4rem]"
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
      </Sidebar>
    )
  }
)

export default PopoverTable
