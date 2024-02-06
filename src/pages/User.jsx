import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Checkbox } from 'primereact/checkbox'
import { TerminalButton } from '../components'
import { Controller, useForm } from 'react-hook-form'
import { InputText } from 'primereact/inputtext'
import { toast } from 'react-hot-toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { MultiSelect } from 'primereact/multiselect'

import UserData from '../data/users/userData.json'
import RolesData from '../data/users/rolesData.json'
import MappingsData from '../data/users/mappingsData.json'
import AvailableRolesData from '../data/users/availableRolesData.json'
import CategoriesData from '../data/categories/allCategories.json'
import Exchangess from '../data/exchanges.json'

import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'

const AssignRoles = ({ roles, control }) => {
  return roles.allRoles.map((role, i) => {
    let containRole = roles.userRoles.some((e) => e.name === role.name)
    if (!['analyst', 'trader', 'admin'].includes(role.name)) {
      return
    }
    return (
      <div className="flex flex-row-reverse gap-1 " key={i}>
        <Controller
          name={role.name}
          defaultValue={containRole}
          control={control}
          render={({ field }) => {
            return (
              <Checkbox
                onChange={(e) => field.onChange(e.checked)}
                checked={field.value}
                {...field}
              />
            )
          }}
        />
        <p>{role.name}</p>
      </div>
    )
  })
}

const User = () => {
  const { userId } = useParams()
  const [roles, setRoles] = useState({})
  const [user, setUser] = useState({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    emailVerified: '',
    enabled: '',
  })

  const [categories, setCategories] = useState([])
  const [exchangeAccounts, setExchangeAccounts] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [accessibleExchangeAccounts, setAccessibleExchangeAccounts] = useState(
    []
  )
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedExchange, setSelectedExchange] = useState('')
  const [visible, setVisible] = useState(false)
  const [exchangeVisible, setExchangeVisible] = useState(false)
  const menuRight = useRef(null)

  const { handleSubmit, control, register } = useForm({
    shouldUnregister: true,
  })

  async function getAllRoles() {
    setRoles((prev) => ({
      ...prev,
      allRoles: RolesData,
    }))
  }

  async function getUser() {
    setUser((_) => ({ ...UserData }))
  }

  async function getUserRoles() {
    setRoles((prev) => ({ ...prev, userRoles: MappingsData }))
  }

  async function getAvailableRoles() {
    setRoles((prev) => ({ ...prev, availableRoles: AvailableRolesData }))
  }

  useEffect(() => {
    toast.dismiss()
    getAllRoles()
    getUser()
    setCategories(CategoriesData)
    setAllCategories(CategoriesData)
    setAccessibleExchangeAccounts(Exchangess)
    setExchangeAccounts(Exchangess)
  }, [])

  useEffect(() => {
    if (user.id) {
      getAvailableRoles()
      getUserRoles()
    }
  }, [user])

  const userEditFields = async (data) => {
    confirmDialog({
      message: 'Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {},
      reject: () => {},
    })
  }

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>User page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              in this page you can{' '}
              <span className="font-bold">
                reset the password for a certain user
              </span>
              , as well as{' '}
              <span className="font-bold">
                assigning different roles for them{' '}
              </span>
            </h2>
          </div>
        ),
        placement: 'center',
        target: 'body',
        styles: {
          options: {
            width: 450,
          },
        },
      },
      {
        title: <strong>User page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              you can also{' '}
              <span className="font-bold">
                give access to a certain category
              </span>
              , and <span className="font-bold">an exchange account</span>
              <br />
              <span>
                which would give them access to strategies that're housed in
                that exchange account
              </span>
            </h2>
          </div>
        ),
        placement: 'center',
        target: 'body',
        styles: {
          options: {
            width: 450,
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
  const categoriesNames = categories.map((category) => category[1])

  const allCategoriesNames = allCategories
    .map((category) => category[1])
    .filter((category) => !categoriesNames.includes(category))

  const exchangesNames = exchangeAccounts.map(
    (exchange) => exchange.exchange_account_id
  )

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
      <ConfirmDialog />
      <div className="space-y-5 rounded-lg bg-color-secondary p-3.5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:p-5">
        <div className="flex flex-col items-center space-y-2 md:flex md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-3xl font-semibold text-autowhale-blue dark:text-color-secondary">
            {userId}
          </h1>
          <h1 className="pt-1 text-xl text-autowhale-blue dark:text-white md:pt-0 md:text-xl">
            User ID: {user?.id}
          </h1>
        </div>
        <p className="text-sm font-light">
          Find the user details of each user here. You can assign roles such as
          admin, trader, analyst and new_user here as well as resetting the
          password for a user
        </p>

        {user && (
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <label
                className={`relative block rounded-md border border-gray-200 !text-black/40 shadow transition-all dark:border-neutral-800 dark:bg-color-secondary dark:!text-white/40`}>
                <input
                  value={user.email}
                  disabled={true}
                  placeholder="Email"
                  className={`peer border-none bg-transparent placeholder-transparent hover:cursor-not-allowed focus:border-transparent focus:outline-none focus:ring-0`}
                />
                <span
                  className={`pointer-events-none absolute left-2.5 top-0 -translate-y-1/2 bg-color-secondary p-0.5 text-xs transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs `}>
                  Email
                </span>
              </label>
              <label
                className={`relative block rounded-md border border-gray-200 !text-black/40 shadow transition-all dark:border-neutral-800 dark:bg-color-secondary dark:!text-white/40`}>
                <input
                  value={user.firstName}
                  disabled={true}
                  placeholder="First Name"
                  className={`peer border-none bg-transparent placeholder-transparent hover:cursor-not-allowed focus:border-transparent focus:outline-none focus:ring-0`}
                />
                <span
                  className={`pointer-events-none absolute left-2.5 top-0 -translate-y-1/2 bg-color-secondary p-0.5 text-xs transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs `}>
                  First Name
                </span>
              </label>
              <label
                className={`relative block rounded-md border border-gray-200 !text-black/40 shadow transition-all dark:border-neutral-800 dark:bg-color-secondary dark:!text-white/40`}>
                <input
                  value={user.lastName}
                  disabled={true}
                  placeholder="Last Name"
                  className={`peer border-none bg-transparent placeholder-transparent hover:cursor-not-allowed focus:border-transparent focus:outline-none focus:ring-0`}
                />
                <span
                  className={`pointer-events-none absolute left-2.5 top-0 -translate-y-1/2 bg-color-secondary p-0.5 text-xs transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs `}>
                  Last Name
                </span>
              </label>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <div className={`flex items-center justify-start gap-5 `}>
                <p
                  className={`mb-1 text-xs font-semibold !text-black/40 dark:border-neutral-800 dark:bg-color-secondary dark:!text-white/40`}>
                  Email Verified
                </p>
                <Checkbox
                  className="hover:cursor-not-allowed"
                  disabled
                  checked={user.emailVerified}
                />
              </div>
              <div className={`flex items-center justify-start gap-5 `}>
                <p
                  className={`mb-1 text-xs font-semibold !text-black/40 dark:border-neutral-800 dark:bg-color-secondary dark:!text-white/40`}>
                  Account Enabled
                </p>
                <Checkbox
                  className="hover:cursor-not-allowed"
                  disabled
                  checked={user.enabled}
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-5">
          <TerminalButton className="h-11" onClick={() => setVisible(true)}>
            Add access to category
          </TerminalButton>
          <Dialog
            className="w-[20rem]"
            header="Give access to Category"
            visible={visible}
            draggable={false}
            onHide={() => {
              setVisible(false)
            }}>
            <div className="space-y-3">
              <MultiSelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.value)}
                options={categoriesNames}
                placeholder={`Select a Category`}
                maxSelectedLabels={1}
                selectionLimit={1}
                showSelectAll={false}
                className="md:w-20rem w-full !border-[#757575]"
              />
              <TerminalButton
                disabled={selectedCategory.length > 0 ? false : true}
                className={`w-full ${
                  selectedCategory.length > 0
                    ? ''
                    : 'bg-neutral-400 hover:cursor-not-allowed dark:bg-neutral-800'
                }`}
                onClick={() => {
                  setVisible(false)
                  setSelectedCategory('')
                }}>
                Submit User
              </TerminalButton>
            </div>
          </Dialog>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {categories?.map((category, idx) => (
              <div key={`${category[1]}${idx}`}>
                <div
                  onClick={() => {
                    navigate(`/users/categories/${category[1]}`)
                  }}
                  className="flex h-36 flex-col gap-3 rounded-md border p-5 shadow-soft-lg transition-colors hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 hover:dark:border-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">{category[1]}</span>
                    <span
                      className="pi pi-fw pi-times-circle flex items-center justify-center rounded py-0.5 px-3 text-red-500 transition-colors hover:cursor-pointer hover:bg-autowhale-blue/10 hover:text-red-700 hover:dark:bg-neutral-700/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDialog({
                          message: `Are you sure you want to proceed?`,
                          header: 'Confirmation',
                          icon: 'pi pi-exclamation-triangle',
                          accept: () => {},
                          reject: () => {},
                        })

                        menuRight?.current?.toggle(e)
                      }}></span>
                  </div>
                  {/* //? description here */}
                  <p className="line-clamp-3" title={category[2]}>
                    {category[2]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <TerminalButton
            className="h-11 w-fit"
            onClick={() => setExchangeVisible(true)}>
            Add access to Exchange account
          </TerminalButton>
          <Dialog
            className="w-[20rem]"
            header="Give access to exchange account"
            visible={exchangeVisible}
            draggable={false}
            onHide={() => {
              setExchangeVisible(false)
            }}>
            <div className="space-y-3">
              <MultiSelect
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(e.value)}
                options={exchangesNames}
                placeholder={`Select an exchange account`}
                maxSelectedLabels={1}
                selectionLimit={1}
                showSelectAll={false}
                className="md:w-20rem w-full !border-[#757575]"
              />
              <TerminalButton
                disabled={selectedExchange.length > 0 ? false : true}
                className={`w-full ${
                  selectedExchange.length > 0
                    ? ''
                    : 'bg-neutral-400 hover:cursor-not-allowed dark:bg-neutral-800'
                }`}
                onClick={async () => {
                  await giveAccessToExchangeAccount(userId, selectedExchange)
                  setExchangeVisible(false)
                  setSelectedExchange('')
                }}>
                Submit User
              </TerminalButton>
            </div>
          </Dialog>

          {/* we can add other metadata here to show it nicely, who created it,
          when, etc */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {accessibleExchangeAccounts?.map((exchangeAccount, idx) => (
              <div key={`${exchangeAccount.exchange_account_id}${idx}`}>
                <div
                  onClick={() => {
                    navigate(
                      `/exchanges/${exchangeAccount.exchange_account_id}`
                    )
                  }}
                  className="flex flex-col gap-3 rounded-md border p-5 shadow-soft-lg transition-colors hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 hover:dark:border-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">
                      {exchangeAccount.exchange_account_id}
                    </span>
                    <span
                      className="pi pi-fw pi-times-circle hover:bg-autowhale-blue/00 flex items-center justify-center rounded py-0.5 px-3 text-red-500 transition-colors hover:cursor-pointer hover:text-red-700 hover:dark:bg-neutral-700/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDialog({
                          message: `Are you sure you want to proceed?`,
                          header: 'Confirmation',
                          icon: 'pi pi-exclamation-triangle',
                          accept: () => {},
                          reject: () => {},
                        })

                        menuRight?.current?.toggle(e)
                      }}></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 md:items-start">
          <h1 className="text-lg font-bold">User Roles</h1>
          <form
            onSubmit={handleSubmit(userEditFields)}
            id="userEditForm"
            className="flex flex-col items-center gap-5 md:items-start">
            <div className="flex gap-3">
              {roles.allRoles && roles.userRoles && (
                <AssignRoles roles={roles} control={control} />
              )}
            </div>
            <div>
              <Controller
                name={'password'}
                defaultValue={''}
                control={control}
                render={({ field }) => {
                  return (
                    <InputText
                      className="h-10 border-[#757575] text-black focus-within:border-blue-600 focus-within:!ring-2 focus-within:ring-blue-300 dark:bg-color-secondary dark:text-white dark:focus-within:!border-blue-900 dark:focus-within:!ring-blue-500 "
                      placeholder="Reset Password"
                      id={field.name}
                      {...field}
                    />
                  )
                }}
              />
            </div>
            <TerminalButton text="Save" type="submit" form="userEditForm" />
          </form>
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
      </div>
    </>
  )
}

export default User
