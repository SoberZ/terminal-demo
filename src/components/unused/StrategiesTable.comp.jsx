import React from 'react'
import { useNavigate } from 'react-router-dom'
import checkIcon from '../assets/check-mark.png'
import closeIcon from '../assets/close.png'

const TableRow = ({ strategyData }) => {
  const navigate = useNavigate()

  return (
    <tr
      className="border-y font-light transition duration-150 hover:cursor-pointer hover:bg-gray-50"
      onClick={() => navigate(`/strategies/${strategyData.strategy_id}`)}>
      <td className="p-3">{strategyData.strategy_id}</td>
      <td className="p-3">{strategyData.type}</td>
      <td className="p-3">{strategyData.market}</td>
      <td className="p-3">{strategyData.exchange_account_id}</td>
      <td className="p-3">{strategyData.pnl}</td>
      <td className="flex p-3">
        {strategyData.is_demo_strategy ? (
          <img src={checkIcon} className="h-6" />
        ) : (
          <img src={closeIcon} className="h-6" />
        )}
      </td>
      <td className="p-3">{strategyData.active_status}</td>
    </tr>
  )
}
const StrategiesTable = ({ strategiesData }) => {
  const headerData = [
    'Strategy Name',
    'Type',
    'Market',
    'Exchange Account',
    '24h PnL',
    'Demo mode',
    'Status',
  ]

  return (
    <div className="flex w-full items-center justify-center rounded-lg bg-white p-5 shadow-soft-lg">
      <table className="w-full table-auto text-left text-sm">
        <thead>
          <tr>
            {headerData.map((val) => (
              <th className="p-3 font-semibold" key={val}>
                {val}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="">
          {strategiesData.map((value, index) => (
            <TableRow key={index} strategyData={value} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StrategiesTable
