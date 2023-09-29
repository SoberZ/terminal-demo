import { AnimatePresence, motion } from 'framer-motion'
import { FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { InputText } from 'primereact/inputtext'
import { Checkbox } from 'primereact/checkbox'
import { StrategiesService } from '../../services'

const EditModal = ({
  isOpen,
  setIsOpen,
  strategyData,
  editMode,
  setEditMode,
}) => {
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
        key !== 'exchange_account_id'
    )
    .reduce((obj, key) => {
      obj[key] = strategyData[key]
      return obj
    }, {})

  const { handleSubmit, control, reset } = useForm({
    shouldUnregister: true,
  })
  const [strategy, setStrategy] = useState([])

  const submitEdit = async (data) => {
    if (editMode) {
      setEditMode(() => !editMode)
      return
    }

    data.strategy_id = strategyData.strategy_id

    const res = await StrategiesService.modifyStrategy(data)

    if (res.status !== 200) {
      toast.error(res.response.data.message)
    } else {
      toast.success('Successfully edited a strategy')
    }
    setEditMode(() => !editMode)
    setIsOpen(false)
  }

  useEffect(() => {
    if (filteredStrategyData) {
      setStrategy(filteredStrategyData)
    }
    reset(strategyData)
  }, [strategyData, reset])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setEditMode(!editMode)
            setIsOpen(false)
          }}
          className="bg-slate-900/20 backdrop-blur p-5 fixed inset-0 z-50 grid place-items-center  cursor-pointer">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6 rounded-lg w-full max-w-lg max-h-full md:h-auto shadow-xl cursor-default relative overflow-y-scroll md:overflow-y-hidden overflow-x-hidden">
            <div className="relative z-10 space-y-2">
              <h3 className="text-3xl font-bold text-center mb-2">
                Edit Strategy
              </h3>
              <form onSubmit={handleSubmit(submitEdit)} id="editForm">
                {strategy.active_status !== '-' &&
                  Object.entries(strategy).map(([key, value]) => {
                    let keyFormatted = key.replace(/\_/g, ' ')
                    return (
                      <div
                        className={`flex space-x-2 space-y-1 items-center `}
                        key={keyFormatted}>
                        <p className="font-semibold">
                          {keyFormatted.charAt(0).toUpperCase() +
                            keyFormatted.slice(1)}
                          :
                        </p>
                        <div>
                          {typeof value === 'boolean' &&
                          key !== 'key' &&
                          key !== 'err_msg' ? (
                            <Controller
                              name={key}
                              control={control}
                              defaultValue={value}
                              render={({ field }) => {
                                return (
                                  <Checkbox
                                    disabled={editMode}
                                    onChange={(e) => field.onChange(e.checked)}
                                    checked={field.value}
                                    {...field}
                                  />
                                )
                              }}
                            />
                          ) : (
                            <Controller
                              name={key}
                              control={control}
                              defaultValue={value}
                              render={({ field }) => {
                                return (
                                  <InputText
                                    className={`p-1 text-sm ${
                                      editMode ||
                                      key == 'type' ||
                                      key == 'market' ||
                                      key == 'exchange' ||
                                      key == 'err_msg' ||
                                      key == 'base_asset_symbol' ||
                                      key == 'quote_asset_symbol' ||
                                      key == 'active_status' ||
                                      key == 'exchange_account_id'
                                        ? 'dark:bg-[#0a0a0a] dark:text-white dark:border-[#0a0a0a]'
                                        : 'border-[#757575] text-black dark:bg-color-secondary dark:text-white'
                                    } `}
                                    id={field.name}
                                    value={strategy[key]}
                                    {...field}
                                  />
                                )
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
              </form>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditMode(!editMode)
                    setIsOpen(false)
                  }}
                  className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded">
                  Cancel
                </button>
                <button
                  type="submit"
                  form="editForm"
                  className="bg-white hover:opacity-90 transition-opacity text-indigo-600 font-semibold w-full py-2 rounded">
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EditModal
