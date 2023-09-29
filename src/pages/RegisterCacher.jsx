import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Select, TerminalButton } from '../components'
import { registerCacher } from '../utils/Fetchers/CacherFetchers'

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
      <div className="flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <input
          className="border p-inputtext border-gray-300 p-2.5 shadow-sm rounded-lg text-color-secondary"
          placeholder={'Parameter Name'}
          name="paramName"
          {...(paramName && { value: paramName })}
          onChange={handleChange}
          data-index={id}
          required
        />
        <input
          className="border p-inputtext border-gray-300 p-2.5 shadow-sm rounded-lg text-color-secondary"
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

    // //? grab cachers state
    let res = await registerCacher(cacherData)

    if (res.status !== 200) {
      toast.error('Cacher registration failed')
    }
  }

  return (
    <div className="bg-color-secondary text-color-secondary dark:border dark:border-neutral-800 rounded-lg p-10 space-y-5 shadow-soft-lg">
      <h1 className="text-2xl font-semibold text-primary dark:text-white inline-block text-transparent bg-clip-text">
        Register a Cacher
      </h1>
      <p className="font-light text-sm">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Esse qui sequi
        deleniti hic soluta velit magnam animi, perspiciatis beatae ratione
        doloremque voluptate. Magni iusto deleniti id voluptates sit at porro.
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col md:w-[30rem] space-y-5">
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
        <TerminalButton
          onClick={onAddParamClick}
          type="button"
          text={'Add param'}
        />
        <TerminalButton
          onClick={onRemoveParamClick}
          type="button"
          text={'Remove param'}
        />
        <TerminalButton type="submit" text={'Submit'}></TerminalButton>
      </form>
    </div>
  )
}

export default RegisterCacher
