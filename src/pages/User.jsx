import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Checkbox } from 'primereact/checkbox'
import { TerminalButton } from '../components'
import { Controller, useForm } from 'react-hook-form'
import { InputText } from 'primereact/inputtext'
import { toast } from 'react-hot-toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'

import UserData from '../data/users/userData.json'
import RolesData from '../data/users/rolesData.json'
import MappingsData from '../data/users/mappingsData.json'
import AvailableRolesData from '../data/users/availableRolesData.json'

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
          <div className="flex flex-col  gap-5 md:flex-row">
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

export default User
