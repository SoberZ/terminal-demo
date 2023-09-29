import { useEffect, useState } from 'react'
import UserService from '../services/UserService'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { FilterMatchMode } from 'primereact/api'
import { InputText } from 'primereact/inputtext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export const Users = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })

  useEffect(() => {
    toast.dismiss()
    UserService.updateToken(async () => {
      const res = await UserService.getUsers()
      setUsers(res)
    })
  }, [])
  return (
    <div className="w-full flex bg-white shadow-soft-lg p-5 rounded-lg">
      <div className="w-full space-y-5 text-sm">
        <p className="font-light text-sm">
          As an admin you have access to this page. Edit, view and assign roles
          to users here. By clicking on an individual user you are directed to
          their corresponding details page.
        </p>
        <InputText
          className="h-10 md:w-1/3  border-[#757575] text-black dark:bg-color-secondary dark:text-white"
          placeholder="Search a user"
          onInput={(e) =>
            setFilters({
              global: {
                value: e.target.value,
                matchMode: FilterMatchMode.CONTAINS,
              },
            })
          }
        />
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
            field="firstName"
            header="First Name"
          />
          <Column
            style={{ fontSize: '0.9rem' }}
            field="lastName"
            header="Last Name"
          />
          <Column style={{ fontSize: '0.9rem' }} field="email" header="Email" />
        </DataTable>
      </div>
    </div>
  )
}

export default Users
