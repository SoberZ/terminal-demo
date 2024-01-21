import { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { FilterMatchMode } from 'primereact/api'
import { InputText } from 'primereact/inputtext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { TabView, TabPanel } from 'primereact/tabview'
import Categories from './Categories'
import UsersData from '../data/users/usersData.json'

import { TerminalButton } from '../components'
import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'

export const Users = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  useEffect(() => {
    toast.dismiss()
    setUsers(UsersData)
  }, [])

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Users page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this page is{' '}
              <span className="font-bold">
                {' '}
                only available for admin users,{' '}
              </span>
              <br /> and shows all users and their roles
            </h2>
            <h2>
              and you can search and filter users by their email, first name and
              last name
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
      {
        title: <strong>Categories Section</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              in this section, you can see all the categories you created, and
              you can search/filter them as well as creating a category <br />
            </h2>
            <span className="font-bold">
              {' '}
              you can also duplicate a category and rename a category by double
              clicking it's name,{' '}
            </span>
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
        <div className="w-full space-y-5 text-sm">
          <p className="text-sm font-light">
            As an admin you have access to this page. Edit, view and assign
            roles to users here. By clicking on an individual user you are
            directed to their corresponding details page.
          </p>
          <TabView>
            <TabPanel header="Users" leftIcon="pi pi-fw pi-user mr-1">
              <div className="flex items-center gap-5">
                <InputText
                  className="h-12 border-[#757575] text-black dark:bg-color-secondary dark:text-white md:w-1/3"
                  placeholder="Search for a user"
                  onInput={(e) =>
                    setFilters({
                      global: {
                        value: e.target.value,
                        matchMode: FilterMatchMode.CONTAINS,
                      },
                    })
                  }
                />
              </div>
              <DataTable
                value={users}
                filters={filters}
                onRowClick={(e) => {
                  navigate(`/users/${e.data.username}`)
                }}>
                <Column
                  style={{ fontSize: '0.9rem' }}
                  field="username"
                  header="Username"
                />
                <Column
                  style={{ fontSize: '0.9rem' }}
                  field="email"
                  header="Email"
                />
                <Column
                  style={{ fontSize: '0.9rem' }}
                  field="firstName"
                  header="First Name"
                />
                <Column
                  style={{ fontSize: '0.9rem' }}
                  field="lastName"
                  header="Last Name"
                />
              </DataTable>
            </TabPanel>
            <TabPanel
              header="Categories"
              leftIcon="pi pi-fw pi-folder mr-1"
              className="space-y-5">
              <Categories />
            </TabPanel>
          </TabView>
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

export default Users
