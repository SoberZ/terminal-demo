import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode, useWindowSize } from '../../hooks'
import { numberFormatting } from '../../utils/misc'
import Loader from './Loader.shared'

const PerformanceMinionChart = ({
  id,
  metricsData,
  metricsTime,
  tooltip,
  loading,
  handler,
}) => {
  const handleChange = (selectedOption) => {
    handler(selectedOption, id)
  }

  const [darkModeState] = useDarkMode()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const { width } = useWindowSize()

  // function subscribe(callback) {
  //   window.addEventListener('storage', callback)
  //   return () => {
  //     window.removeEventListener('storage', callback)
  //   }
  // }

  // const darkModeStatus = useSyncExternalStore(subscribe, () =>
  //   window.localStorage.getItem('dark-mode-enabled')
  // )

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
    if (metricsData?.length > 0 && metricsTime?.length > 0) {
      const dateTime = metricsTime.map((item) => new Date(item).getTime())
      const chartData = metricsData.map((item) => item?.toFixed(4))
      return dateTime.map((time, index) => [time, Number(chartData[index])])
    }
    return []
  }, [metricsData, metricsTime])

  const chartData = {
    series: [{ name: tooltip, data: data ?? [] }],
    options: {
      chart: {
        id: id,
        type: 'area',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      title: {
        text: id,
        style: {
          color: darkMode ? '#D4D4D4' : '#4432e2',
          fontSize: '20px',
          fontFamily: 'inherit',
        },
      },
      colors: ['#4432e2'],
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
      // yaxis: {
      //   forceNiceScale: true,
      //   decimalsInFloat: 5,
      //   axisBorder: {
      //     show: false,
      //   },
      //   axisTicks: {
      //     show: false,
      //   },
      //   labels: {
      //     style: {
      //       colors: darkMode ? '#939393' : '#8e8da4',
      //     },
      //     formatter: (value) => {
      //       return numberFormatting(value)
      //     },
      //   },
      // },
      yaxis: {
        show: false,
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
        strokeDashArray: 7,
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
  }

  return (
    <div
      onClick={handleChange}
      className={`relative rounded-lg border-2 bg-color-primary p-2 transition-colors ease-in hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 dark:bg-color-secondary hover:dark:border-neutral-300`}>
      {loading ? (
        <Loader />
      ) : (
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="area"
          height={300}
        />
      )}
    </div>
  )
}

export default PerformanceMinionChart
