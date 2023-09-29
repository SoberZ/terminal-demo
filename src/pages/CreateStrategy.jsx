import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Input, Select, Checkbox } from '../components'
import { Tooltip } from 'primereact/tooltip'

import { delay } from '../utils/misc'
import {
  fetchRequiredParams,
  createStrategy,
} from '../utils/Fetchers/StrategyFetchers'

import {
  fetchExchanges,
  fetchMarkets,
  fetchActiveExchangeAccounts,
} from '../utils/Fetchers/DataFetchers'

function removeUnderscoresAndCapitalize(str) {
  const words = str.split('_') // split the string by underscores to get an array of words
  const capitalizedWords = words.map((word) => {
    const firstLetter = word.charAt(0).toUpperCase() // get the first letter of the word and capitalize it
    const restOfWord = word.slice(1) // get the rest of the word
    return `${firstLetter}${restOfWord}` // concatenate the first letter and the rest of the word
  })
  return capitalizedWords.join(' ') // join the words back together with a space
}

const CreateStrategy = () => {
  const [strategyMode, setStrategyMode] = useState('')
  const [strategyState, setStrategyState] = useState({})
  const {
    register,
    watch,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    shouldUnregister: true,
  })
  const navigate = useNavigate()
  const [exchangeAccounts, setExchangeAccounts] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [markets, setMarkets] = useState([])
  //? i'll use this to show the required params for each strategy
  const [defaultRequiredParams, setDefaultRequiredParams] = useState({})
  const [requiredParams, setRequiredParams] = useState([])
  const [strategyInstances, setStrategyInstances] = useState([])

  useEffect(() => {
    toast.dismiss()
    fetchExchanges(setExchanges)
    fetchRequiredParams(setDefaultRequiredParams, setStrategyInstances)
  }, [])

  useEffect(() => {
    if (strategyMode) {
      const filter = defaultRequiredParams.requiredParams?.filter(
        (param) => param.strategy_type === strategyMode
      )
      setRequiredParams(filter)
    }
  }, [strategyMode])

  const onSubmit = async () => {
    let res = await createStrategy(strategyMode, strategyState)
    if (res.status === 200) {
      toast.loading('Redirecting to strategy page')
      await delay(4000)
      navigate(`/strategies/${strategyState.strategy_id}`)
    }
  }

  const handleStrategyMode = useCallback((value) => {
    setStrategyMode(value)
  }, [])

  // Update right panel on each form update
  useEffect(() => {
    const subscription = watch((value) => {
      if (strategyMode === 'SpreadStrategy') {
        value['Profitable?'] = value.order_distance > 2 * value.fee_percentage
      }
      setStrategyState(value)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  useEffect(() => {
    if (strategyState.exchange) {
      fetchMarkets(strategyState.exchange, setMarkets)
      fetchActiveExchangeAccounts(strategyState.exchange, setExchangeAccounts)
    }
  }, [strategyState.exchange])

  return (
    <div className="bg-color-secondary text-color-secondary dark:border dark:border-neutral-800 rounded-lg p-10 space-y-5 shadow-soft-lg">
      <h1 className="text-2xl font-semibold text-primary dark:text-white inline-block text-transparent bg-clip-text">
        Create a new strategy
      </h1>
      <p className="font-light text-sm">
        Use this form to create a new strategy. The form will change depending
        on the type of strategy selected in the “strategy instance” dropdown.
        Select an exchange account that you previously registered on the{' '}
        <a className="text-blue-500" href="/exchanges">
          exchange accounts page
        </a>{' '}
        and choose the right exchange, market and whether it's in demo mode.
      </p>

      {requiredParams?.length > 0 &&
        requiredParams.map(({ strategy_type, params }, idx) => {
          if (strategy_type === strategyMode) {
            return (
              <div className="space-y-2" key={idx}>
                {Object.entries(params).map(([key, value], idx) => {
                  return (
                    <p className="font-light text-sm" key={idx}>
                      {key === 'explaination' && value.text}
                    </p>
                  )
                })}
              </div>
            )
          }
        })}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 md:space-x-5">
          <div className="max-w-xs space-y-5 my-2 md:my-0">
            <Select
              label="Strategy instance"
              options={strategyInstances}
              id="type"
              control={control}
              useMode
              setMode={handleStrategyMode}
            />
            <Input
              id={'strategy_id'}
              title={'Strategy name'}
              register={register}
              placeholder={'Custom ID/Name'}
              inputString
              optional={false}
            />
            {requiredParams?.length > 0 &&
              requiredParams.map(({ strategy_type, params }, idx) => {
                if (strategy_type === strategyMode) {
                  return (
                    <div className="space-y-2" key={idx}>
                      <Tooltip target=".inputTooltip" />
                      {Object.entries(params).map(([key, value], idx) => {
                        const {
                          optional,
                          type,
                          min_value,
                          max_value,
                          placeholder,
                          isPercentage,
                        } = value
                        if (
                          key === 'exchange' ||
                          key === 'market' ||
                          key === 'type' ||
                          key === 'exchange_account_id' ||
                          key === 'strategy_id'
                        ) {
                          return
                        }
                        return (
                          <div key={idx}>
                            {type === 'decimal' && (
                              <Input
                                id={key}
                                title={removeUnderscoresAndCapitalize(key)}
                                placeholder={placeholder}
                                register={register}
                                min={min_value}
                                max={max_value}
                                inputDecimal
                                optional={optional}
                                tooltip={
                                  isPercentage
                                    ? '0 = 0%, 0.1 = 10%, -1 = 1 = -100%'
                                    : null
                                }
                              />
                            )}{' '}
                            {type === 'integer' && (
                              <Input
                                id={key}
                                title={removeUnderscoresAndCapitalize(key)}
                                placeholder={placeholder}
                                register={register}
                                min={min_value}
                                max={max_value}
                                inputNumber
                                optional={optional}
                              />
                            )}{' '}
                            {type === 'string' && (
                              <Input
                                id={key}
                                title={removeUnderscoresAndCapitalize(key)}
                                placeholder={placeholder}
                                register={register}
                                inputString
                                optional={optional}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                }
              })}
          </div>

          <div className="max-w-xs space-y-5">
            <Select
              label="Exchange"
              options={exchanges}
              id="exchange"
              control={control}
            />
            <Select
              label="Exchange Account"
              options={exchangeAccounts}
              id="exchange_account_id"
              control={control}
            />
            <Select
              label="Market"
              options={markets}
              id="market"
              control={control}
            />

            {requiredParams?.length > 0 &&
              requiredParams.map(({ strategy_type, params }, idx) => {
                if (strategy_type === strategyMode) {
                  return (
                    <div className="space-y-2" key={idx}>
                      {Object.entries(params).map(([key, value], idx) => {
                        const { optional, type } = value
                        return (
                          <div key={idx}>
                            {type === 'boolean' && (
                              <Checkbox
                                label={removeUnderscoresAndCapitalize(key)}
                                id={key}
                                register={register}
                                optional={optional}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                }
              })}
          </div>

          {/* //? so this checks the state, and there's this watch method, which is adding the other states regardless*/}
          <div className="max-w-lg space-y-5 text-sm">
            <div className="bg-color-secondary text-color-secondary dark:border dark:border-neutral-800 p-4 space-y-1 rounded-md shadow-soft-xl">
              {Object.keys(strategyState).map((key) => {
                return (
                  <div className="flex space-x-3" key={key}>
                    <p className="font-semibold">
                      {String(key).charAt(0).toUpperCase() +
                        String(key).slice(1)}
                    </p>
                    <p>{String(strategyState[key])}</p>
                  </div>
                )
              })}
            </div>
            <button
              type="submit"
              className="border bg-autowhale-blue font-semibold text-white px-5 py-3 rounded-md">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateStrategy
