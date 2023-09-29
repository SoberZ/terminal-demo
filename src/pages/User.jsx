import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import UserService from '../services/UserService'
import { Checkbox } from 'primereact/checkbox'
import { TerminalButton } from '../components'
import { Controller, useForm } from 'react-hook-form'
import { InputText } from 'primereact/inputtext'
import { toast } from 'react-hot-toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'

const AssignRoles = ({ roles, control }) => {
  return roles.allRoles.map((role, i) => {
    let containRole = roles.userRoles.some((e) => e.name === role.name)
    if (!['analyst', 'trader', 'admin'].includes(role.name)) {
      return
    }
    return (
      <div className="flex space-x-2" key={i}>
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
  const [user, setUser] = useState({})
  const { handleSubmit, control, register } = useForm({
    shouldUnregister: true,
  })

  async function getAllRoles() {
    let res = await UserService.getAllRoles()
    setRoles((prev) => ({
      ...prev,
      allRoles: res,
    }))
  }

  async function getUser() {
    let res = await UserService.getUser(userId)
    setUser((_) => ({ ...res.data[0] }))
  }

  async function getUserRoles() {
    let res = await UserService.getUserRoles(user.id)
    setRoles((prev) => ({ ...prev, userRoles: res.data.realmMappings }))
  }

  async function getAvailableRoles() {
    let res = await UserService.getAvailableRoles(user.id)
    setRoles((prev) => ({ ...prev, availableRoles: res.data }))
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
      accept: async () => {
        // Assign user roles
        let addRoles = Object.keys(data).filter(
          (i) => i !== 'password' && data[i]
        )
        addRoles = roles.availableRoles
          .filter((role) => addRoles.includes(role.name))
          .map((role) => ({ id: role.id, name: role.name }))

        // Remove unchecked roles
        let oldRoles = Object.keys(data).filter(
          (i) => i !== 'password' && !data[i]
        )

        oldRoles = roles.allRoles
          .filter((role) => oldRoles.includes(role.name))
          .map((role) => ({ id: role.id, name: role.name }))

        const assignRes = await UserService.setUserRoles(user.id, addRoles)
        let oldRes = await UserService.removeUserRoles(user.id, oldRoles)

        if (assignRes.status === 204 && oldRes.status === 204) {
          toast.success('Successfully changed roles!')
        } else {
          toast.error('Something went wrong editing user roles')
        }

        if (data.password.length > 0) {
          const passwordRes = await UserService.resetPassword(
            user.id,
            data.password
          )
          if (passwordRes.status === 204) {
            toast.success('Successfully changed password!')
          } else {
            toast.error('Something went wrong changing the password')
          }
        }
      },
      reject: () => {},
    })
  }

  return (
    <>
      <ConfirmDialog />
      <div className="bg-white p-10 space-y-5 text-sm">
        <h1 className="text-2xl font-semibold bg-gradient-to-r bg-autowhale-gradient from-blue-900 to-blue-500 inline-block text-transparent bg-clip-text">
          {userId}
        </h1>

        <p className="font-light text-sm">
          Find the user details of each user here. You can assign roles such as
          admin, trader, analyst and new_user here as well as resetting the
          password for a user
        </p>

        {user && (
          <div className="grid grid-cols-4">
            <div className="flex-col">
              <p>User id: </p>
              <p>Email: </p>
              <p>First name: </p>
              <p>Last name: </p>
              <p>Email verified: </p>
              <p>Enabled: </p>
            </div>
            <div className="flex-col">
              <p className="font-light">{user.id}</p>
              <p className="font-light">{user.email}</p>
              <p className="font-light">{user.firstName}</p>
              <p className="font-light">{user.lastName}</p>
              <p className="font-light">{String(user.emailVerified)}</p>
              <p className="font-light">{String(user.enabled)}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(userEditFields)}
          id="userEditForm"
          className="flex space-y-10 flex-col">
          <div className="">
            <h1>User Roles</h1>
            {roles.allRoles && roles.userRoles && (
              <AssignRoles roles={roles} control={control} />
            )}
          </div>
          <div>
            <h1>Reset password</h1>
            <Controller
              name={'password'}
              defaultValue={''}
              control={control}
              render={({ field }) => {
                return <InputText className="p-1" id={field.name} {...field} />
              }}
            />
          </div>
          <TerminalButton text="Save" type="submit" form="userEditForm" />
        </form>
      </div>
    </>
  )
}

export default User
