import { useEffect, useState } from 'react'
import UserService from '../services/UserService'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { FilterMatchMode } from 'primereact/api'
import { InputText } from 'primereact/inputtext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import UsersData from '../data/users/usersData.json'

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
  return (
    <div className="space-y-5 rounded-lg bg-color-secondary p-3.5 pb-5 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800 sm:p-5">
      <div className="w-full space-y-5 text-sm">
        <p className="text-sm font-light">
          As an admin you have access to this page. Edit, view and assign roles
          to users here. By clicking on an individual user you are directed to
          their corresponding details page.
        </p>
        <InputText
          className="h-10 border-[#757575]  text-black dark:bg-color-secondary dark:text-white md:w-1/3"
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
          <Column style={{ fontSize: '0.9rem' }} field="email" header="Email" />
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
      </div>
    </div>
  )
}

export default Users
