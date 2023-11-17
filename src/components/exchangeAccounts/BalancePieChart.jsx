import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode, useWindowSize } from '../../hooks'

const BalancePieChart = ({ balances, labels }) => {
  const [darkModeState] = useDarkMode()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const { width } = useWindowSize()
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      labels: [],
      chart: {
        type: 'donut',
      },
      // colors: ['#4432e2'],
      // theme: {
      //   monochrome: {
      //     enabled: true,
      //     color: '#4432e2',
      //   },
      // },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
                formatter: function (w) {
                  return `${w.globals.seriesTotals.reduce((a, b) => {
                    return a + b
                  }, 0)} USDT`
                },
              },
              value: {
                formatter: function (val) {
                  return `${val} USDT`
                },
              },
            },
          },
        },
      },
      // responsive: [
      //   {
      //     breakpoint: 480,
      //     options: {
      //       chart: {
      //         width: 200,
      //       },
      //       legend: {
      //         position: 'bottom',
      //       },
      //     },
      //   },
      // ],
    },
  })

  useEffect(() => {
    if (balances?.length > 0) {
      setChartData((prevData) => ({
        ...prevData,
        series: [...balances],
        options: {
          ...prevData.chart,
          labels: [...labels],
        },
      }))
    }
  }, [balances])

  return (
    <ReactApexChart
      options={chartData.options}
      series={chartData.series}
      type="donut"
      height={width > 1024 ? 450 : 350}
    />
  )
}

export default BalancePieChart
