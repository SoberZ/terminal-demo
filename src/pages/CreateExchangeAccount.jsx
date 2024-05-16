import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Password } from 'primereact/password'
import { useNavigate } from 'react-router-dom'
import { Input, Select, TerminalButton } from '../components'
import { ExchangesService } from '../services'
import { exchangeParams } from '../utils/constants'
import { delay } from '../utils/misc'

import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'
import { Helmet } from 'react-helmet'

const ParamsField = ({ handleChange, id, paramName }) => {
  return (
    <div className="w-full text-sm">
      <label className="font-semibold">{'Parameter'}</label>
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <input
          className="p-inputtext rounded-lg border border-gray-300 p-2.5 text-color-secondary shadow-sm"
          placeholder={'Parameter Name'}
          name="paramName"
          {...(paramName && { value: paramName })}
          onChange={handleChange}
          data-index={id}
          required
        />
        <Password
          className="rounded-lg border border-gray-300 text-color-secondary shadow-sm"
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

    // const notif = toast.loading('Creating an exchange account')
    const res = await ExchangesService.registerExchangeAccount(postData)

    if (res.isError) {
      // toast.error(res.message, { id: notif })
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
    const res = await ExchangesService.getExchanges()

    setExchanges(
      res.map((exchange) => ({
        label: exchange.label,
        value: exchange.value,
      }))
    )
  }

  useEffect(() => {
    toast.dismiss()
    fetchExchanges()
  }, [])
  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Create Exchange account Page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this page contains the form that you'll use to{' '}
              <span className="font-bold">
                {' '}
                connect to your preferable exchange
              </span>
              , as well as the ability to add other params for lesser known
              exchanges
            </h2>
            <h2>
              You can also{' '}
              <span className="font-bold">
                {' '}
                create multiple exchange accounts
              </span>{' '}
              for the same exchange.
            </h2>
          </div>
        ),
        placement: 'center',
        target: 'body',
        styles: {
          options: {
            width: 650,
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
        <title>Create Exchange Account</title>
      </Helmet>
      <div className="mx-auto max-w-[2200px] space-y-5 rounded-lg bg-color-secondary p-10 text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800">
        <h1 className="inline-block bg-clip-text text-2xl font-semibold text-color-secondary  dark:text-white">
          Create an exchange account
        </h1>
        <p className="text-sm font-light">{`To register a new exchange account assign an ID and select the corresponding exchange from the dropdown. As each exchange may have different authentication parameters, you can add new params by clicking “add param” and input a key value pair such as <apiKey>:<XYZ>. Here is a list of frequently used exchanges and their params: \n`}</p>

        <ul className="text-sm font-light">
          <li>Kucoin: apiKey, secret, password</li>
          <li>Binance: apiKey, secret</li>
          <li>Gate (use gateio): apiKey, secret</li>
          <li>Bitmart: apiKey, secret, uid</li>
        </ul>

        <p className="text-sm font-light">
          Also note that when trying out a new exchange, test strategies in demo
          mode first and when starting live trading test with little capital to
          ensure proper functioning of the system as exchange endpoints and
          responses may different sometimes which might require little
          adjustments to the system.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-5 md:w-[30rem]">
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

export default CreateExchangeAccount
