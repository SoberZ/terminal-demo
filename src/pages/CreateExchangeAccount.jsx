import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Password } from 'primereact/password'
import { useNavigate } from 'react-router-dom'
import { Input, Select, TerminalButton } from '../components'
import { ExchangesService } from '../services'
import { exchangeParams } from '../utils/constants'
import { delay } from '../utils/misc'

const ParamsField = ({ handleChange, id, paramName }) => {
  return (
    <div className="text-sm">
      <label className="font-semibold">{'Parameter'}</label>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <input
          className="border p-inputtext border-gray-300 p-2.5 shadow-sm rounded-lg text-color-secondary"
          placeholder={'Parameter Name'}
          name="paramName"
          {...(paramName && { value: paramName })}
          onChange={handleChange}
          data-index={id}
          required
        />
        <Password
          className="border  border-gray-300 shadow-sm rounded-lg text-color-secondary"
          placeholder={'Parameter Value'}
          name="paramValue"
          data-index={id}
          onChange={handleChange}
          feedback={false}
          toggleMask
          required
        />
      </div>
    </div>
  )
}

const CreateExchangeAccount = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, control } = useForm()
  const [paramComponents, setParamComponents] = useState([])
  const [nParams, setNParams] = useState(0)
  const params = useRef([])
  const [exchanges, setExchanges] = useState([])
  const [currentExchange, setCurrentExchange] = useState()

  useEffect(() => {
    // Clean params
    cleanParamsState()

    // Add params
    if (Object.keys(exchangeParams).includes(currentExchange)) {
      let paramList = exchangeParams[currentExchange]
      for (let param in paramList) {
        onAddParamClick(paramList[param])
      }
    }
  }, [currentExchange])

  const onSubmit = async (data) => {
    let postData = { ...data, params: {} }

    // Add all params to the post data
    Object.keys(params.current).forEach((param) => {
      let item = params.current[param]
      postData['params'][item[0]] = item[1]
    })

    const notif = toast.loading('Creating an exchange account')
    const res = await ExchangesService.registerExchangeAccount(postData)

    if (res.isError) {
      toast.error(res.message, { id: notif })
    } else {
      toast.success('Exchange account created!', { id: notif })
      toast.loading('Redirecting to strategy page')
      await delay(2000)
      navigate(`/exchanges/${data.exchangeAccount}`)
    }
  }

  // Change param values on each param field change.
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

  // Add a param on button click, increase the params state.
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

  // Fetch exchanges
  const fetchExchanges = async () => {
    const t = toast.loading('Fetching exchanges')
    const res = await ExchangesService.getExchanges()

    if (res.status === 200) {
      setExchanges(
        res.data.data.map((exchange) => ({
          label: exchange.id,
          value: exchange.id,
        }))
      )
      toast.success('Successfully fetched Exchanges', { id: t })
    } else {
      toast.error("Couldn't fetch exchanges", { id: t })
    }
  }

  useEffect(() => {
    toast.dismiss()
    fetchExchanges()
  }, [])

  return (
    <div className="bg-color-secondary text-color-secondary dark:border dark:border-neutral-800 rounded-lg p-10 space-y-5 shadow-soft-lg">
      <h1 className="text-2xl font-semibold text-primary dark:text-white inline-block text-transparent bg-clip-text">
        Create an exchange account
      </h1>
      <p className="font-light text-sm">{`To register a new exchange account assign an ID and select the corresponding exchange from the dropdown. As each exchange may have different authentication parameters, you can add new params by clicking “add param” and input a key value pair such as <apiKey>:<XYZ>. Here is a list of frequently used exchanges and their params: \n`}</p>

      <ul className="font-light text-sm">
        <li>Kucoin: apiKey, secret, password</li>
        <li>Binance: apiKey, secret</li>
        <li>Gate (use gateio): apiKey, secret</li>
        <li>Bitmart: apiKey, secret, uid</li>
      </ul>

      <p className="font-light text-sm">
        Also note that when trying out a new exchange, test strategies in demo
        mode first and when starting live trading test with little capital to
        ensure proper functioning of the system as exchange endpoints and
        responses may different sometimes which might require little adjustments
        to the system.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col md:w-[30rem] space-y-5">
        <Input
          id="exchangeAccount"
          title="Exchange account id"
          placeholder={'e.g. binance_account_1'}
          register={register}
        />
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

export default CreateExchangeAccount
