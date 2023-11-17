import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode, useWindowSize } from '../../hooks'
import { numberFormatting } from '../../utils/misc'

const defaultColors = [
  '#4432e2',
  '#5747e5',
  '#695be8',
  '#7c70eb',
  '#8f84ee',
  '#a299f1',
  '#b4adf3',
  '#c7c2f6',
  '#dad6f9',
]
const defaultDarkColors = [
  '#7c70eb',
  '#695be8',
  '#5747e5',
  '#4432e2',
  '#3d2dcb',
  '#3628b5',
  '#30239e',
  '#291e88',
  '#221971',
  '#1b145a',
]

const BalancesLineChart = ({ id, metricsData }) => {
  const [darkModeState] = useDarkMode()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const { width } = useWindowSize()
  const [chartData, setChartData] = useState({
    series: [{ name: id, data: [] }],
    options: {
      chart: {
        id: id,
        type: 'area',
        stacked: true,
        toolbar: {
          tools: {
            zoomin: false,
            zoomout: false,
            download: false,
          },
          autoSelected: 'pan',
        },
      },
      title: {
        text: id,
      },
      colors: darkMode ? defaultDarkColors : defaultColors,
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: 'datetime',
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            yaxis: {
              show: false,
            },
          },
        },
      ],
      yaxis: {
        decimalsInFloat: 5,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          formatter: (value) => {
            return numberFormatting(value)
          },
        },
      },
      tooltip: {
        x: {
          format: 'hh:mmtt dd MMM yyyy',
        },
        y: {
          formatter: function (
            value,
            { series, seriesIndex, dataPointIndex, w }
          ) {
            return numberFormatting(value)
          },
        },
      },
      grid: {
        padding: {
          left: 20,
        },
      },

      fill: {
        type: 'gradient',
        opacity: 0.8,
        gradient: {
          shade: 'dark',
          type: 'diagonal',
        },
      },
    },
  })
  useEffect(() => {
    function checkDarkModeStatus() {
      const darkModeStatus = window.localStorage.getItem('dark-mode-enabled')
      if (darkModeStatus === 'true') {
        setDarkMode(true)
      } else {
        setDarkMode(false)
      }
    }

    window.addEventListener('storage', checkDarkModeStatus)

    return () => {
      window.removeEventListener('storage', checkDarkModeStatus)
    }
  }, [])
  const data = useMemo(() => {
    if (metricsData) {
      const result = []
      const tokenData = {}

      metricsData.forEach((entry) => {
        //? to account for milliseconds
        const timestamp = entry.timestamp_unix
        for (const token in entry.balances) {
          const total = entry.balances[token].total
          if (!tokenData[token]) {
            tokenData[token] = {
              name: token,
              data: [],
            }
          }
          tokenData[token].data.push([timestamp, total])
        }
      })
      for (const token in tokenData) {
        result.push(tokenData[token])
      }
      return result
    }
    return []
  }, [metricsData])

  useEffect(() => {
    if (data.length > 0) {
      setChartData((prevData) => ({
        ...prevData,
        series: data,
      }))
    }
  }, [metricsData])

  useEffect(() => {
    setChartData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        grid: {
          ...prevData.options.grid,
          borderColor: darkMode ? '#505050' : '#e0e6ed',
        },
        colors: darkMode ? defaultDarkColors : defaultColors,
        yaxis: {
          ...prevData.options.yaxis,
          labels: {
            ...prevData.options.yaxis.labels,
            style: {
              colors: darkMode ? '#939393' : '#8e8da4',
            },
          },
        },
        legend: {
          ...prevData.options.legend,
          labels: {
            colors: darkMode ? '#939393' : '#8e8da4',
          },
        },
        tooltip: {
          ...prevData.options.tooltip,
          theme: darkMode ? 'dark' : 'light',
        },
        xaxis: {
          ...prevData.options.xaxis,
          labels: {
            style: {
              colors: darkMode ? '#939393' : '#8e8da4',
            },
          },
        },
        title: {
          ...prevData.options.title,
          style: {
            color: darkMode ? '#D4D4D4' : '#4432e2',
            fontSize: '20px',
            fontFamily: 'inherit',
          },
        },
        fill: {
          ...prevData.options.fill,
          gradient: {
            shade: darkMode ? 'dark' : 'light',
          },
        },
      },
    }))
  }, [darkMode])

  return (
    <div
      className={`relative rounded-lg border bg-color-secondary p-2 dark:border-neutral-700 dark:bg-color-primary  `}>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="area"
        height={width > 1024 ? 517.98 : 350}
      />
    </div>
  )
}

export default BalancesLineChart
