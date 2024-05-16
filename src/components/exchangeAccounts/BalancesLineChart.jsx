import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode, useWindowSize } from '../../hooks'
import { numberFormatting } from '../../utils/misc'

const defaultColors = [
  '#4133da',
  '#5447de',
  '#675ce1',
  '#7a70e5',
  '#8d85e9',
  '#a099ed',
  '#b3adf0',
  '#c6c2f4',
  '#d9d6f8',
]
const defaultDarkColors = [
  '#7a70e5',
  '#675ce1',
  '#5447de',
  '#4133da',
  '#3b2ec4',
  '#3429ae',
  '#2e2499',
  '#271f83',
  '#211a6d',
  '#1a1457',
]

const BalancesLineChart = ({ id, metricsData, singleChart }) => {
  const [darkModeState] = useDarkMode()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const { width } = useWindowSize()

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

  const reducedData = data.filter(
    (tokenObject) => tokenObject.name === singleChart
  )

  const chartData = {
    series: singleChart ? reducedData : data ?? [{ name: id, data: [] }],
    options: {
      chart: {
        id: id,
        type: 'area',
        zoom: {
          autoScaleYaxis: true,
        },
        stacked: true,
        toolbar: {
          tools: {
            zoom: singleChart ? true : false,
            zoomin: false,
            zoomout: false,
            download: false,
          },
          autoSelected: 'pan',
        },
      },
      title: {
        text: id,
        style: {
          color: darkMode ? '#D4D4D4' : '#4133da',
          fontSize: '20px',
          fontFamily: 'inherit',
        },
      },
      colors: darkMode ? defaultDarkColors : defaultColors,
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: darkMode ? '#939393' : '#8e8da4',
          },
        },
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
        forceNiceScale: true,
        decimalsInFloat: 5,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: darkMode ? '#939393' : '#8e8da4',
          },
          formatter: (value) => {
            return numberFormatting(value)
          },
        },
      },
      legend: {
        labels: {
          colors: darkMode ? '#939393' : '#8e8da4',
        },
        onItemClick: {
          toggleDataSeries: false,
        },
        onItemHover: {
          highlightDataSeries: false,
        },
      },
      tooltip: {
        theme: darkMode ? 'dark' : 'light',
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
        borderColor: darkMode ? '#505050' : '#e0e6ed',
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
          gradient: {
            shade: darkMode ? 'dark' : 'light',
          },
        },
      },
    },
  }

  return (
    <div
      className={`relative rounded-lg border bg-color-secondary p-2 dark:border-neutral-700 dark:bg-color-primary`}>
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
