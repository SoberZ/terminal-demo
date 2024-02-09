import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Select, TerminalButton } from '../components'
import { Helmet } from 'react-helmet'
import AllExchanges from '../data/exchange/exchange.json'

import { fetchExchanges, fetchMarkets } from '../utils/Fetchers/DataFetchers'
import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'
const endpointOptions = [
  { label: 'Ticker', value: 'ticker' },
  { label: 'Open Interest', value: 'open_interest' },
  { label: 'Trades', value: 'trades' },
  { label: 'Funding Rates', value: 'fetchfundingrates' },
  { label: 'Orderbook', value: 'orderbook' },
  { label: 'Screener', value: 'screener' },
]
const ParamsField = ({ handleChange, id, paramName }) => {
  return (
    <div className="text-sm">
      <label className="font-semibold">{'Parameter'}</label>
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 md:space-x-4">
        <input
          className="p-inputtext rounded-lg border border-gray-300 p-2.5 text-color-secondary shadow-sm"
          placeholder={'Parameter Name'}
          name="paramName"
          {...(paramName && { value: paramName })}
          onChange={handleChange}
          data-index={id}
          required
        />
        <input
          className="p-inputtext rounded-lg border border-gray-300 p-2.5 text-color-secondary shadow-sm"
          placeholder={'Parameter Value'}
          name="paramValue"
          onChange={handleChange}
          data-index={id}
          required
        />
      </div>
    </div>
  )
}

const RegisterCacher = () => {
  const {
    register,
    watch,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    shouldUnregister: true,
  })
  const navigate = useNavigate()
  const [exchanges, setExchanges] = useState([])
  const [markets, setMarkets] = useState([])
  const [currentExchange, setCurrentExchange] = useState()
  const [isParamRequired, setIsParamRequired] = useState(true)

  const [paramComponents, setParamComponents] = useState([])
  const [nParams, setNParams] = useState(0)
  const params = useRef([])
  //? watch for changes in the endpoint field
  const endpoint = watch('endpoint')

  useEffect(() => {
    toast.dismiss()
    fetchExchanges(setExchanges)
  }, [])

  useEffect(() => {
    if (endpoint === 'fetchfundingrates' || endpoint === 'open_interest') {
      setIsParamRequired(false)
    } else {
      setIsParamRequired(true)
    }
  }, [endpoint])

  useEffect(() => {
    if (currentExchange) fetchMarkets(currentExchange, setMarkets)
    //! Clean params
    cleanParamsState()
  }, [currentExchange])

  //? Change param values on each param field change.
  const handleParamChange = (e) => {
    e.preventDefault()

    const index = e.target.getAttribute('data-index')
    const name = e.target.name
    const elem = params.current[index]
    const value = e.target.value

    if (name === 'paramName') {
      elem[0] = value
    } else if (name === 'paramValue') {
      elem[1] = value
    }
  }

  const cleanParamsState = () => {
    setParamComponents((_) => [])
    params.current = []
    setNParams((_) => 0)
  }

  //? Add a param on button click, increase the params state.
  const onAddParamClick = (paramName) => {
    let indexString = `${paramName}-${nParams}`
    params.current[indexString] = [paramName ? paramName : '', '']

    setParamComponents((prev) =>
      prev.concat(
        <ParamsField
          handleChange={handleParamChange}
          id={indexString}
          key={indexString}
          paramName={typeof paramName === 'string' ? paramName : ''}
        />
      )
    )

    setNParams(nParams + 1)
  }

  //? Remove a param on button click, decrease the params state.
  const onRemoveParamClick = (paramName) => {
    const newParams = { ...params.current }

    const keys = Object.keys(params.current)
    const keyToRemove = keys[keys.length - 1]

    if (keyToRemove) {
      delete newParams[keyToRemove]
      params.current = newParams

      setParamComponents((prev) =>
        prev.filter((paramComponent) => {
          const id = paramComponent.props.id
          return id !== keyToRemove
        })
      )

      setNParams(nParams - 1)
    }
  }

  const onSubmit = async (data) => {
    toast.dismiss()
    let cacherData = { ...data }

    // Add all params to the post data if params.current is not empty
    if (Object.keys(params.current).length > 0) {
      cacherData.params = {}

      Object.keys(params.current).forEach((param) => {
        let item = params.current[param]
        cacherData.params[item[0]] = item[1]
      })
    }

    //! cacher = {
    //!     exchange : "bitget",
    //!     market:'ABBC/USDT',
    //!     endpoint : "screener",
    //! }

    toast.success('Registered Successfully !')

    // if (res.status !== 200) {
    //   toast.error('Cacher registration failed')
    // }
  }
  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Register Cacher Page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this page has a form to register a cacher, you can register a
              cacher for any exchange and any endpoint you select from the menu
              above
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
            primaryColor: '#4432e2',
            arrowColor: '#fff',
            backgroundColor: '#fff',
            textColor: '#171717',
          },
        }}
        // styles={{ overlay: { height: '100%' } }}
      />
      <Helmet>
        <title>Register Cacher</title>
      </Helmet>
      <div className="space-y-5 rounded-lg bg-color-secondary p-10 text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800">
        <h1 className="inline-block bg-clip-text text-2xl font-semibold text-color-secondary  dark:text-white">
          Register a Cacher
        </h1>
        <p className="text-sm font-light">
          Register a cacher to start caching data from exchanges. You can
          register a cacher for any exchange and any endpoint, market pairs are
          optional for different endpoints. You can also add parameters to the
          cacher,{' '}
          <span className="font-bold">
            Note that Parameters are optional and are used to name and filter
            the data
          </span>
        </p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-5 md:w-[30rem]">
          {exchanges && (
            <Select
              label="Exchange"
              options={exchanges}
              id="exchange"
              control={control}
              useMode
              setMode={setCurrentExchange}
            />
          )}
          <Select
            label="Endpoint"
            options={endpointOptions}
            id="endpoint"
            control={control}
          />
          {endpoint && (
            <Select
              label="Market"
              options={markets}
              id="market"
              control={control}
              optional={!isParamRequired}
            />
          )}
          {paramComponents}
          <div className="flex justify-between gap-2">
            <TerminalButton
              onClick={onAddParamClick}
              type="button"
              text={'Add param'}
              className="w-full"
            />
            <TerminalButton
              onClick={onRemoveParamClick}
              type="button"
              text={'Remove param'}
              className="w-full"
            />
          </div>
          <TerminalButton type="submit" text={'Submit'} className="w-full" />
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

export default RegisterCacher
