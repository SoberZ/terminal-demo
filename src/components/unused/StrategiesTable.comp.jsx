import React from "react";
import { useNavigate } from "react-router-dom";
import checkIcon from "../assets/check-mark.png";
import closeIcon from "../assets/close.png";

const TableRow = ({ strategyData }) => {
    const navigate = useNavigate();

    return (
        <tr
            className="font-light border-y hover:bg-gray-50 hover:cursor-pointer transition duration-150"
            onClick={() => navigate(`/strategies/${strategyData.strategy_id}`)}
        >
            <td className="p-3">{strategyData.strategy_id}</td>
            <td className="p-3">{strategyData.type}</td>
            <td className="p-3">{strategyData.market}</td>
            <td className="p-3">
                {strategyData.exchange_account_id}
            </td>
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
    );
};
const StrategiesTable = ({ strategiesData }) => {
    const headerData = [
        "Strategy Name",
        "Type",
        "Market",
        "Exchange Account",
        "24h PnL",
        "Demo mode",
        "Status",
    ];

    return (
        <div className="w-full flex items-center justify-center bg-white shadow-soft-lg p-5 rounded-lg">
            <table className="table-auto w-full text-left text-sm">
                <thead>
                    <tr>
                        {headerData.map((val) => (
                            <th className="font-semibold p-3" key={val}>
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
    );
};

export default StrategiesTable;
