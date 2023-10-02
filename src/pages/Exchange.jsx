import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'

import { TerminalButton } from '../components'
import { ExchangesService } from '../services'

import ExchangeAccount from '../data/exchange/exchange.json'
import Balances from '../data/exchange/balances.json'

const Exchange = () => {
  const { exchangeId } = useParams()
  const [accountData, setAccountData] = useState(null)
  const [balances, setBalances] = useState()

  const handleOnConfirm = async () => {
    confirmDialog({
      message: 'Are you sure you want to delete this account?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        const handler = toast.loading('Pausing exchange account')
        setAccountData((prev) => ({ ...prev, status: 'paused' }))
        toast.success('Successfully paused exchange account', {
          id: handler,
        })
      },
      reject: () => {},
    })
  }

  const handleRestartOnConfirm = () => {
    confirmDialog({
      message: 'Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        const handler = toast.loading('Restarting exchange account')
        setAccountData((prev) => ({ ...prev, status: 'active' }))
        toast.success('Restarted exchange account', {
          id: handler,
        })
      },
      reject: () => {},
    })
  }

  async function fetchBalances() {
    const t = toast.loading('Fetching Account Balances')
    setBalances((_) => Balances)
    toast.success('Fetched Account Balances', { id: t })
  }

  async function fetchExchangeAccount() {
    if (!exchangeId) return
    setAccountData((_) => ExchangeAccount)
  }

  useEffect(() => {
    toast.dismiss()
    fetchExchangeAccount()
    fetchBalances()
  }, [])

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-10 rounded-lg bg-color-secondary p-10 text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800">
        {accountData && (
          <div className="flex flex-col space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <p>Exchange account id: </p>
              <p className="font-bold">{exchangeId}</p>
            </div>
            <div className="flex space-x-2">
              <p>Exchange:</p>
              <p className="font-bold">{accountData.exchange}</p>
            </div>

            <div className="flex space-x-2">
              <p>Status:</p>
              <p className="font-bold">{accountData.status}</p>
            </div>

            {balances && Object.keys(balances).length > 0 ? (
              <div className="space-y-1">
                {Object.keys(balances).map((value, index) => (
                  <div className="flex space-x-2" key={index}>
                    <p className="font-bold">{value}</p>
                    <p>{balances[value].total}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>No available balances</div>
            )}
          </div>
        )}

        <div className="space-y-5 md:space-y-0 md:space-x-5">
          <TerminalButton
            onClick={handleOnConfirm}
            data-modal-target="defaultModal"
            data-modal-toggle="defaultModal"
            styles={`${
              accountData && accountData.status !== 'running'
                ? '!from-gray-800 !to-gray-500 pointer-events-none'
                : ''
            }`}>
            <h1 className={`text-sm font-semibold text-white`}>
              Pause Exchange Account
            </h1>
          </TerminalButton>

          <TerminalButton
            onClick={handleRestartOnConfirm}
            data-modal-target="defaultModal"
            data-modal-toggle="defaultModal"
            styles={`${
              accountData && accountData.status === 'running'
                ? 'from-gray-800 to-gray-500 pointer-events-none'
                : ''
            }`}>
            <h1 className={`text-sm font-semibold text-white`}>
              Restart Exchange Account
            </h1>
          </TerminalButton>
        </div>
      </div>
    </>
  )
}

export default Exchange
