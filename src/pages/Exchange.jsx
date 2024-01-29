import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { Avatar } from 'primereact/avatar'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { BiPause, BiRevision } from 'react-icons/bi'
import {
  BalancesLineChart,
  TerminalButton,
  BalancePieChart,
  Fallback,
  Loader,
} from '../components'

import FakeLineChartData from '../data/exchangeChart.json'
import FakePieChartData from '../data/exchangePiechart.json'
import FakeTableData from '../data/exchangeTable.json'

import { ErrorBoundary } from 'react-error-boundary'
import ExchangeAccount from '../data/exchange/exchange.json'
import Balances from '../data/exchange/balances.json'
import { FilterMatchMode } from 'primereact/api'
import { getSeverity } from './Exchanges'
import { isObjectEmpty, numberFormatting } from '../utils/misc'

import Joyride, { STATUS } from 'react-joyride'
import { BiInfoCircle } from 'react-icons/bi'
import { DataTable } from 'primereact/datatable'
import { Tag } from 'primereact/tag'
import { Column } from 'primereact/column'
import { useWindowSize } from '../hooks'

const Exchange = () => {
  const { exchangeId } = useParams()
  const [accountData, setAccountData] = useState(null)
  const [balances, setBalances] = useState()
  const [pieChartData, setPieChartData] = useState({})
  const [singleChart, setSingleChart] = useState(null)
  const [lineChartData, setLineChartData] = useState({})
  const { width } = useWindowSize()

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
    setLineChartData(() => FakeLineChartData)
    setPieChartData(() => FakePieChartData)
  }, [])

  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        title: <strong>Exchange Page</strong>,
        content: (
          <div className="flex flex-col gap-2">
            <h2>
              this contains relevant information about the exchange account you
              connected,{' '}
              <span className="font-bold">
                {' '}
                like the status, some balances, and the exchange it’s connected
                to,{' '}
              </span>
              You can also see different kind of charts
              <span className="font-bold"> (fake data here) </span> to follow
              their progress over time
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

  const result = FakeTableData.data

  function handleWidgetClick(ticker) {
    if (singleChart === ticker) {
      setSingleChart(null)
    } else {
      setSingleChart(ticker)
    }
  }

  return (
    <>
      <ConfirmDialog />
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
      <div className="space-y-4 rounded-lg bg-color-secondary p-3.5 text-sm text-color-secondary shadow-soft-lg dark:border dark:border-neutral-800 md:p-10">
        {accountData && (
          <div className="flex flex-col  text-sm">
            <div className="flex w-full flex-col items-center justify-center gap-3 md:flex-row md:justify-between">
              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                <h1 className="text-primary break-anywhere text-2xl font-semibold dark:text-white md:inline md:text-left">
                  {exchangeId}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Tag
                    value={accountData.status}
                    style={{
                      backgroundColor: getSeverity(accountData.status),
                    }}
                    className="text-sm md:text-lg"
                  />
                  <Tag
                    value={accountData.exchange}
                    className="text-sm md:text-lg"
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <TerminalButton
                  onClick={handleOnConfirm}
                  text="Pause"
                  data-modal-target="defaultModal"
                  data-modal-toggle="defaultModal"
                  className={`flex w-fit flex-row-reverse items-center justify-center gap-2 ${
                    accountData &&
                    (accountData.status === 'running' ||
                      accountData.status === 'restart')
                      ? ''
                      : 'pointer-events-none bg-neutral-400 dark:bg-neutral-800'
                  }`}>
                  <BiPause color="white" size={20} />
                </TerminalButton>

                <TerminalButton
                  onClick={handleRestartOnConfirm}
                  text="Restart"
                  data-modal-target="defaultModal"
                  data-modal-toggle="defaultModal"
                  className={`flex w-fit flex-row-reverse items-center justify-center gap-2 ${
                    accountData &&
                    (accountData.status === 'running' ||
                      accountData.status === 'stopped' ||
                      accountData.status === 'paused' ||
                      accountData.status === 'paused_err' ||
                      accountData.status === 'err' ||
                      accountData.status === 'auth_failed' ||
                      accountData.status === 'restart')
                      ? ''
                      : 'pointer-events-none bg-neutral-400 dark:bg-neutral-800'
                  }`}>
                  <BiRevision color="white" size={20} />
                </TerminalButton>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 lg:flex-row lg:justify-start">
          <ErrorBoundary FallbackComponent={Fallback}>
            <Suspense fallback={<Loader />}>
              <BalancePieChart
                balances={pieChartData.data}
                labels={pieChartData.labels}
              />
            </Suspense>
          </ErrorBoundary>
          <div className="w-full space-y-2">
            <ErrorBoundary FallbackComponent={Fallback}>
              <Suspense fallback={<Loader />}>
                <BalancesLineChart
                  id="Balances"
                  metricsData={lineChartData.data}
                  singleChart={singleChart}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-5">
          {result?.map((balance, idx) => (
            <div
              key={idx}
              onClick={() => handleWidgetClick(balance.ticker)}
              className={`flex items-center gap-2 rounded border bg-color-secondary py-2 px-3 transition-colors ease-in hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 hover:dark:border-neutral-300 md:gap-3 ${
                singleChart === balance.ticker
                  ? 'border-autowhale-blue/40 dark:border-neutral-300'
                  : ''
              }`}>
              <Avatar
                label={balance.ticker}
                size="normal"
                shape="circle"
                image={balance.thumb}
              />
              <div className="flex flex-col">
                <h2 className="font-bold">{balance.tokenName}</h2>
                <h3 className="flex gap-1">
                  {numberFormatting(balance.total)}
                  <span className="">{` ${balance.ticker}`}</span>
                </h3>
              </div>
            </div>
          ))}
        </div>
        <DataTable
          value={result}
          paginator
          breakpoint="0"
          scrollable
          paginatorTemplate={
            width < 768
              ? 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
              : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
          }
          sortOrder={1}
          rows={20}
          rowsPerPageOptions={[20, 30, 40, 50]}
          className="text-[0.7rem] md:text-base">
          <Column
            sortable
            field="name"
            header="Token"
            className="min-w-[5rem]"
            body={(balance) => (
              <div className="flex gap-3">
                <img
                  src={balance.thumb}
                  alt={balance.ticker}
                  className="h-6 w-6 rounded-full"
                />
                <span>{balance.ticker}</span>
              </div>
            )}
          />
          <Column
            sortable
            field="total"
            header="Total"
            className="break-anywhere min-w-[7rem]"
            body={(balance) => (
              <span>
                {numberFormatting(balance.total)} {balance.ticker}
              </span>
            )}
          />
          <Column
            sortable
            field="used"
            header="Used"
            className="break-anywhere min-w-[7rem]"
            body={(balance) => (
              <span>
                {numberFormatting(balance.used)} {balance.ticker}
              </span>
            )}
          />
          <Column
            sortable
            field="free"
            header="Free"
            className="break-anywhere min-w-[7rem]"
            body={(balance) => (
              <span>
                {numberFormatting(balance.free)} {balance.ticker}
              </span>
            )}
          />
        </DataTable>
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

export default Exchange
