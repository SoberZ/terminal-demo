import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Input, Select, Checkbox, TerminalButton } from '../components'
import { Tooltip } from 'primereact/tooltip'
import { Slider } from 'primereact/slider'
import { Controller } from 'react-hook-form'

import { delay } from '../utils/misc'
import { fetchRequiredParams } from '../utils/Fetchers/StrategyFetchers'
import { Helmet } from 'react-helmet'

import {
  fetchExchanges,
  fetchMarkets,
  fetchActiveExchangeAccounts,
} from '../utils/Fetchers/DataFetchers'

import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'

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
    toast.loading('Redirecting to strategy page')
    await delay(4000)
    navigate(`/strategies/${strategyState.strategy_id}`)
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
  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Create Strategy Page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this page has the form to create a new strategy, it has{' '}
              <span className="font-bold"> all the strategy blueprints</span>{' '}
              that you can base your strategy on and{' '}
              <span className="font-bold">
                all the required parameters for each strategy instance
              </span>
            </h2>
            <h2>
              then you can choose the exchange, market and exchange account that
              you want to use for your strategy.{' '}
              <span className="font-bold">and you're set!</span>
            </h2>
          </div>
        ),
        placement: 'center',
        target: 'body',
        styles: {
          options: {
            width: 550,
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
            primaryColor: '#4133da',
            arrowColor: '#fff',
            backgroundColor: '#fff',
            textColor: '#171717',
          },
        }}
        // styles={{ overlay: { height: '100%' } }}
      />
      <Helmet>
        <title>Create Strategy</title>
      </Helmet>
      <div className="mx-auto min-h-[33rem] max-w-[2200px] space-y-5 rounded-lg bg-color-secondary p-10 text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800">
        <h1 className="inline-block  text-2xl font-semibold text-color-secondary dark:text-white">
          Create a new strategy
        </h1>
        <p className="text-sm font-light">
          Use this form to create a new strategy. The form will change depending
          on the type of strategy selected in the “strategy instance” dropdown.
          Select an exchange account that you previously registered on the{' '}
          <a className="text-blue-500" href="/exchanges">
            exchange accounts page
          </a>{' '}
          and choose the right exchange, market and whether it's in demo mode.
        </p>

        {/* {requiredParams?.length > 0 &&
        requiredParams.map(({ strategy_type, params }, idx) => {
          if (strategy_type === strategyMode) {
            return (
              <div className="space-y-2" key={idx}>
                {Object.entries(params).map(([key, value], idx) => {
                  return (
                    <p className="text-sm font-light" key={idx}>
                      {key === 'explaination' && parse(value.text)}
                    </p>
                  )
                })}
              </div>
            )
          }
        })} */}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 md:space-x-5 lg:grid-cols-3">
            <div className="my-1 max-w-xs space-y-3 md:my-0">
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
                      <div className="space-y-5" key={idx}>
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
                              {type === 'decimal' && !isPercentage && (
                                <Input
                                  id={key}
                                  title={removeUnderscoresAndCapitalize(key)}
                                  placeholder={placeholder ? placeholder : ''}
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
                              {isPercentage && (
                                <>
                                  <Controller
                                    name={key}
                                    control={control}
                                    register={register}
                                    rules={{ required: !optional }}
                                    render={({ field, value }) => (
                                      <div className="flex flex-col gap-2">
                                        <Input
                                          id={key}
                                          title={removeUnderscoresAndCapitalize(
                                            key
                                          )}
                                          placeholder={
                                            placeholder ? placeholder : ''
                                          }
                                          value={field.value}
                                          register={register}
                                          min={min_value * 100}
                                          max={max_value * 100}
                                          inputDecimal
                                          optional={optional}
                                          tooltip={
                                            isPercentage
                                              ? '0 = 0%, 0.1 = 10%, -1 = 1 = -100%'
                                              : null
                                          }
                                        />
                                        <Slider
                                          value={field.value}
                                          min={min_value * 100}
                                          max={max_value * 100}
                                          step={0.1}
                                          onChange={(e) => {
                                            field.onChange(e.value)
                                          }}
                                        />
                                      </div>
                                    )}
                                  />
                                </>
                              )}{' '}
                              {type === 'integer' && (
                                <Input
                                  id={key}
                                  title={removeUnderscoresAndCapitalize(key)}
                                  placeholder={placeholder ? placeholder : ''}
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
                                  placeholder={placeholder ? placeholder : ''}
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

            <div className="max-w-xs space-y-2">
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
                      <div className="space-y-3" key={idx}>
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

            <div className="max-w-lg space-y-3 text-sm">
              <div className="space-y-1 rounded-md bg-color-secondary p-4 text-color-secondary shadow-soft-xl dark:border dark:border-neutral-800">
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
                className="rounded-md border bg-autowhale-blue px-5 py-3 font-semibold text-white">
                Submit
              </button>
            </div>
          </div>
        </form>
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

export default CreateStrategy
