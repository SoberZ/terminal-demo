import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Controller, useForm } from 'react-hook-form'

import { InputText } from 'primereact/inputtext'
import { Checkbox } from 'primereact/checkbox'
import { confirmDialog } from 'primereact/confirmdialog'

import { Accordion, AccordionTab } from 'primereact/accordion'

import { StrategiesService } from '../../services'
import { useWindowSize } from '../../hooks'

async function fetchRequiredParams(setFetchedData) {
  try {
    const res = await StrategiesService.getRequiredParams()

    if (res.status === 200) {
      setFetchedData(res.data.data)
    } else {
      toast.error(res.response.data.message)
    }
  } catch (e) {
    toast.error('Failed params')
    return
  }
}

export default function EditStrategyComponent({
  strategyData,
  editMode,
  setEditMode,
}) {
  const { handleSubmit, control, reset } = useForm({
    shouldUnregister: true,
  })

  const [strategy, setStrategy] = useState(strategyData)

  const { width } = useWindowSize()

  const submitEdit = async (data) => {
    if (editMode) {
      setEditMode(() => !editMode)
      return
    }

    data.strategy_id = strategyData.strategy_id

    // Confirm edit submission
    confirmDialog({
      message: 'Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        // Send data to backend
        const res = await StrategiesService.modifyStrategy(data)

        if (res.status !== 200) {
          toast.error(res.response.data.message)
        } else {
          toast.success('Successfully edited a strategy')
        }
        setEditMode(() => !editMode)
      },
      reject: () => {},
    })
  }
  const filteredStrategyData = Object.keys(strategyData)
    .filter(
      (key) =>
        key !== 'type' &&
        key !== 'market' &&
        key !== 'exchange' &&
        key !== 'err_msg' &&
        key !== 'base_asset_symbol' &&
        key !== 'quote_asset_symbol' &&
        key !== 'active_status' &&
        key !== 'strategy_id' &&
        key !== 'exchange_account_id' &&
        key !== 'exchange_account_status'
    )
    .reduce((obj, key) => {
      obj[key] = strategyData[key]
      return obj
    }, {})

  const sortedData = Object.entries(strategy)
    .sort(([keyA, valueA], [keyB, valueB]) => {
      if (typeof valueA === 'boolean' && keyA !== 'key' && keyA !== 'err_msg') {
        return -1
      }
      if (typeof valueB === 'boolean' && keyB !== 'key' && keyB !== 'err_msg') {
        return 1
      }
      return 0
    })
    .reduce((sorted, [key, value]) => {
      sorted[key] = value
      return sorted
    }, {})

  useEffect(() => {
    if (filteredStrategyData) {
      setStrategy(filteredStrategyData)
    }
    reset(strategyData)
  }, [strategyData, reset])

  return (
    <div>
      {width < 768 ? (
        <Accordion activeIndex={0}>
          <AccordionTab header="Strategy Parameters">
            <form
              onSubmit={handleSubmit(submitEdit)}
              id="editForm"
              className="flex flex-col gap-y-5 ">
              {strategy.active_status !== '-' &&
                Object.entries(sortedData).map(([key, value]) => {
                  let keyFormatted = key.replace(/\_/g, ' ')
                  return (
                    <div className={``} key={keyFormatted}>
                      <div>
                        {typeof value === 'boolean' &&
                        key !== 'key' &&
                        key !== 'err_msg' ? (
                          <div className="flex flex-col gap-1">
                            <p
                              className={` ${
                                editMode
                                  ? '!text-black/40 dark:border-neutral-800 dark:bg-color-secondary dark:!text-white/40'
                                  : ''
                              } text-xs font-semibold`}>
                              {keyFormatted.charAt(0).toUpperCase() +
                                keyFormatted.slice(1)}
                            </p>
                            <Controller
                              name={key}
                              control={control}
                              defaultValue={value}
                              render={({ field }) => {
                                return (
                                  <Checkbox
                                    disabled={editMode}
                                    className={`${
                                      editMode ? 'hover:cursor-not-allowed' : ''
                                    }`}
                                    onChange={(e) => field.onChange(e.checked)}
                                    checked={field.value}
                                    {...field}
                                  />
                                )
                              }}
                            />
                          </div>
                        ) : (
                          <Controller
                            name={key}
                            control={control}
                            defaultValue={value}
                            render={({ field }) => {
                              return (
                                <label
                                  className={`relative block rounded-md border border-gray-200 shadow transition-all
                                ${
                                  field.name == 'pid' || editMode
                                    ? '!text-black/40 dark:border-neutral-800 dark:bg-color-secondary dark:!text-white/40'
                                    : ' focus-within:border-autowhale-blue focus-within:ring-1 focus-within:ring-autowhale-blue focus-within:ring-opacity-40 hover:border-autowhale-blue dark:focus-within:border-blue-600 dark:focus-within:ring-blue-600 dark:focus-within:ring-opacity-60 dark:hover:border-blue-600'
                                }
                                `}>
                                  <input
                                    disabled={field.name == 'pid' || editMode}
                                    inputMode="decimal"
                                    id={field.name}
                                    value={strategy[key]}
                                    {...field}
                                    placeholder={
                                      keyFormatted.charAt(0).toUpperCase() +
                                      keyFormatted.slice(1)
                                    }
                                    className={`${
                                      field.name == 'pid' || editMode
                                        ? 'hover:cursor-not-allowed'
                                        : ''
                                    } peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0`}
                                  />
                                  <span
                                    className={`  pointer-events-none absolute left-2.5 top-0 -translate-y-1/2 bg-color-secondary p-0.5 text-xs transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs `}>
                                    {keyFormatted.charAt(0).toUpperCase() +
                                      keyFormatted.slice(1)}
                                  </span>
                                </label>
                              )
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
            </form>
          </AccordionTab>
        </Accordion>
      ) : (
        <form
          onSubmit={handleSubmit(submitEdit)}
          id="editForm"
          className="grid items-center justify-items-start gap-x-4 gap-y-5 lg:grid-cols-2 xl:grid-cols-4 ">
          {strategy.active_status !== '-' &&
            Object.entries(sortedData).map(([key, value]) => {
              let keyFormatted = key.replace(/\_/g, ' ')
              return (
                <div
                  className={`flex items-center justify-center gap-5 `}
                  key={keyFormatted}>
                  <div>
                    {typeof value === 'boolean' &&
                    key !== 'key' &&
                    key !== 'err_msg' ? (
                      <>
                        <p
                          className={` ${
                            editMode
                              ? '!text-black/40 dark:border-neutral-800 dark:bg-color-secondary dark:!text-white/40'
                              : ''
                          } text-xs font-semibold`}>
                          {keyFormatted.charAt(0).toUpperCase() +
                            keyFormatted.slice(1)}
                        </p>
                        <Controller
                          name={key}
                          control={control}
                          defaultValue={value}
                          render={({ field }) => {
                            return (
                              <Checkbox
                                disabled={editMode}
                                className={`${
                                  editMode ? 'hover:cursor-not-allowed' : ''
                                }`}
                                onChange={(e) => field.onChange(e.checked)}
                                checked={field.value}
                                {...field}
                              />
                            )
                          }}
                        />
                      </>
                    ) : (
                      <Controller
                        name={key}
                        control={control}
                        defaultValue={value}
                        render={({ field }) => {
                          return (
                            <label
                              className={`relative block rounded-md border border-gray-200 shadow transition-all
                            ${
                              field.name == 'pid' || editMode
                                ? '!text-black/40 dark:border-neutral-800 dark:bg-color-secondary dark:!text-white/40'
                                : ' focus-within:border-autowhale-blue focus-within:ring-1 focus-within:ring-autowhale-blue focus-within:ring-opacity-40 hover:border-autowhale-blue dark:focus-within:border-blue-600 dark:focus-within:ring-blue-600 dark:focus-within:ring-opacity-60 dark:hover:border-blue-600'
                            }
                            `}>
                              <input
                                disabled={field.name == 'pid' || editMode}
                                inputMode="decimal"
                                id={field.name}
                                value={strategy[key]}
                                {...field}
                                placeholder={
                                  keyFormatted.charAt(0).toUpperCase() +
                                  keyFormatted.slice(1)
                                }
                                className={`${
                                  field.name == 'pid' || editMode
                                    ? 'hover:cursor-not-allowed'
                                    : ''
                                } peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0`}
                              />
                              <span
                                className={`  pointer-events-none absolute left-2.5 top-0 -translate-y-1/2 bg-color-secondary p-0.5 text-xs transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs `}>
                                {keyFormatted.charAt(0).toUpperCase() +
                                  keyFormatted.slice(1)}
                              </span>
                            </label>
                          )
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
        </form>
      )}
    </div>
  )
}
