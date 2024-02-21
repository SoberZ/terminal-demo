import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Menu } from 'primereact/menu'
import { InputText } from 'primereact/inputtext'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'

import { ErrorBoundary } from 'react-error-boundary'
import { Fallback, Loader, TerminalButton } from '../components'

import CategoriesData from '../data/categories/allCategories.json'

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Helmet } from 'react-helmet'

const Categories = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [currentCategory, setCurrentCategory] = useState([])
  const menuRight = useRef(null)

  const [visible, setVisible] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')

  const items = [
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pencil',
      command: () => {
        setVisible(true)
      },
    },
    //? does nothing currently, until the UUID idea is fixed
    // { label: 'Duplicate', icon: 'pi pi-fw pi-copy' },
    {
      label: 'Delete',
      icon: 'pi pi-fw pi-trash',
      command: deletingCategory,
    },
  ]

  useEffect(() => {
    setCategories(CategoriesData)
  }, [])

  function deletingCategory() {
    if (!currentCategory) return
    confirmDialog({
      message: `Are you sure you want to proceed?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {},
      reject: () => {},
    })
  }

  return (
    <>
      <ConfirmDialog />
      <div className="flex gap-5">
        <TerminalButton>
          <Link to="/users/create-category">Create a Category</Link>
        </TerminalButton>
      </div>
      <Helmet>
        <title>Categories</title>
      </Helmet>
      <ErrorBoundary FallbackComponent={Fallback}>
        <Suspense fallback={<Loader />}>
          <Dialog
            className="w-[20rem]"
            header="Edit Category"
            visible={visible}
            draggable={false}
            onHide={() => {
              setVisible(false)
              setCategoryName('')
              setCategoryDescription('')
            }}>
            <div className="space-y-3">
              <div className="flex flex-col gap-3 ">
                <InputText
                  className="border-[#757575] py-2 text-black dark:bg-color-secondary dark:text-white "
                  placeholder={currentCategory[1]}
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
                <InputTextarea
                  className="border-[#757575]"
                  autoResize
                  placeholder="Update your description here"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  rows={1}
                  cols={10}
                />
              </div>
              <TerminalButton
                disabled={categoryName.length >= 3 ? false : true}
                className={`w-full ${
                  categoryName.length >= 3
                    ? ''
                    : 'bg-neutral-400 hover:cursor-not-allowed dark:bg-neutral-800'
                }`}
                onClick={() => {
                  setVisible(false)
                  setCategoryName('')
                  setCategoryDescription('')
                }}>
                Edit {categoryName}
              </TerminalButton>
            </div>
          </Dialog>
        </Suspense>
      </ErrorBoundary>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <ErrorBoundary FallbackComponent={Fallback}>
          <Suspense fallback={<Loader />}>
            <Menu model={items} popup ref={menuRight} popupAlignment="right" />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary FallbackComponent={Fallback}>
          <Suspense fallback={<Loader />}>
            {categories?.map((category, idx) => (
              <div key={`${category[1]}${idx}`}>
                <div
                  onClick={(e) => {
                    navigate(`categories/${category[1]}`)
                  }}
                  className="flex h-32 flex-col gap-3 rounded-md border p-5 shadow-soft-lg transition-colors hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 hover:dark:border-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">{category[1]}</span>
                    <span
                      className="pi pi-fw pi-ellipsis-h flex items-center justify-center rounded py-0.5 px-3 transition-colors hover:cursor-pointer hover:bg-autowhale-blue/10 hover:dark:bg-neutral-700/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentCategory(category)
                        menuRight?.current?.toggle(e)
                      }}></span>
                  </div>
                  {/* //? description here, needs the actual tailwind update */}
                  <p className="line-clamping" title={category[2]}>
                    {category[2]}
                  </p>
                </div>
              </div>
            ))}
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  )
}

export default Categories
