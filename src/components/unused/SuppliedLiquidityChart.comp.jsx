import React, { useEffect, useRef, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    defaults,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler
);

defaults.font.family = "'Open-Sans', sans-serif";
defaults.font.size = 12;
defaults.color = "#777f8fbf";
defaults.elements.point.pointStyle = false;
defaults.hover.intersect = false;

const SuppliedLiquidityChart = ({ labels, data, title }) => {
    const [chartData, setChartData] = useState({
        labels,
        datasets: [
            {
                data: data,
                borderColor: "rgb(23, 109, 210)",
                backgroundColor: "rgba(23, 109, 210, 0.5)",
                tension: 0.3,
            },
        ],
    });

    // Update the chart with the filled gradient
    useEffect(() => {
        var ctx = document.getElementById("canvas").getContext("2d");
        var gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "rgba(23, 109, 210, 0.5)");
        gradient.addColorStop(1, "rgba(23, 109, 210, 0)");

        setChartData((prevState) => {
            return {
                ...prevState,
                datasets: [
                    {
                        ...prevState.datasets[0],
                        backgroundColor: gradient,
                        fill: "origin",
                    },
                ],
            };
        });
    }, []);

    return (
        <Line
            id="canvas"
            options={{
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        border: {
                            display: false,
                        },
                    },
                    y: {
                        border: {
                            display: false,
                            dash: [5, 5],
                        },
                        grid: {
                            tickLength: 1,
                        },
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                    },
                    tooltip: {
                        mode: "index",
                        intersect: false,
                    },
                },
            }}
            data={chartData}
        />
    );
};

export default SuppliedLiquidityChart;
