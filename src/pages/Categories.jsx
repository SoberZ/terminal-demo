import { useRef, useState } from 'react'
import { Menu } from 'primereact/menu'
import { TerminalButton } from '../components'
import { InputText } from 'primereact/inputtext'
import { Link } from 'react-router-dom'
import { FilterMatchMode } from 'primereact/api'

const Categories = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  })
  // TODO: need to grab the texts via the req somehow
  const [text, setText] = useState('Category Name')
  const menuRight = useRef(null)

  const items = [
    {
      label: 'REname',
      icon: 'pi pi-fw pi-pencil',
      command: () => {
        setIsEditing(true)
      },
    },
    { label: 'Duplicate', icon: 'pi pi-fw pi-copy' },
    { label: 'Delete', icon: 'pi pi-fw pi-trash' },
  ]

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleChange = (event) => {
    setText(event.target.value)
  }

  const handleBlur = () => {
    setIsEditing(false)
    //TODO: we'll save the new name here
  }

  return (
    <>
      <div className="flex gap-5">
        <TerminalButton>
          <Link to="/users/create-category">
            <h1 className="text-sm font-semibold text-white">
              Create a Category
            </h1>
          </Link>
        </TerminalButton>

        <InputText
          className="border-[#757575] py-2 text-black dark:bg-color-secondary dark:text-white md:w-1/3"
          placeholder="Search for a category"
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
      <div className="grid grid-cols-6 gap-4">
        <div className="flex h-48 flex-col justify-between rounded-md border p-5 shadow-soft-lg transition-colors  hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 hover:dark:border-neutral-300">
          <div
            className="flex items-center justify-between"
            onDoubleClick={handleDoubleClick}>
            {isEditing ? (
              <span
                className="break-anywhere px-1 text-xl font-bold"
                contentEditable
                onInput={handleChange}
                onBlur={handleBlur}>
                {text}
              </span>
            ) : (
              <span className="text-xl font-bold">{text}</span>
            )}

            <Menu model={items} popup ref={menuRight} popupAlignment="right" />
            <span
              className="pi pi-fw pi-ellipsis-h hover:cursor-pointer"
              onClick={(e) => menuRight?.current?.toggle(e)}></span>
          </div>
          <div className="space-y-2">
            <h3>4 strategies</h3>
            <h3>3 exchanges connected</h3>
          </div>
          <h3>Created At December 25th</h3>
        </div>
      </div>
    </>
  )
}

export default Categories
