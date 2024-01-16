import { useRef, useState } from 'react'
import { Menu } from 'primereact/menu'
import { TerminalButton } from '../components'
import { InputText } from 'primereact/inputtext'
import { Link } from 'react-router-dom'
import { FilterMatchMode } from 'primereact/api'

const Categories = () => {
  const [isEditing, setIsEditing] = useState(false)

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
      </div>
      <div className="grid grid-cols-6 gap-4">
        <div className="flex h-48 flex-col justify-between rounded-md border p-5 shadow-soft-lg transition-colors  hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 hover:dark:border-neutral-300">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{text}</span>
            <Menu model={items} popup ref={menuRight} popupAlignment="right" />
            <span
              className="pi pi-fw pi-ellipsis-h hover:cursor-pointer"
              onClick={(e) => menuRight?.current?.toggle(e)}></span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Categories
