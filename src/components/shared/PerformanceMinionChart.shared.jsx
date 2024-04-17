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
  toggleFavoriteStrategy,
  favStrategies,
}) => {
  const handleChange = (selectedOption) => {
    handler(selectedOption, id)
  }

  const [darkModeState] = useDarkMode()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const [isForbidden, setIsForbidden] = useState(false)
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
    if (metricsData?.length > 0 && metricsTime?.length > 0) {
      const dateTime = metricsTime.map((item) => new Date(item).getTime())
      const chartData = metricsData.map((item) => item?.toFixed(4))
      return dateTime.map((time, index) => [time, Number(chartData[index])])
    }
    setIsForbidden(true)
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
        offsetX: 20,
        offsetY: 8,
        margin: -10,
        style: {
          color: darkMode ? '#D4D4D4' : '#4432e2',
          fontSize: width > 1024 ? '17px' : '18px',
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
      onClick={isForbidden ? null : handleChange}
      className={`relative rounded-lg border-2 bg-color-primary p-2 transition-colors ease-in ${
        isForbidden
          ? 'hover:cursor-not-allowed hover:border-neutral-700 hover:bg-color-primary dark:border-neutral-700 hover:dark:bg-color-primary'
          : 'hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 hover:dark:border-neutral-300'
      } dark:bg-color-secondary `}>
      {loading ? (
        <Loader />
      ) : (
        <>
          {isForbidden ? null : (
            <div
              className="absolute top-3 left-2 z-10"
              onClick={(e) => {
                e.stopPropagation()
                toggleFavoriteStrategy(id)
              }}>
              <button className="favorite-icon">
                {favStrategies.includes(id) ? (
                  <i
                    className="pi pi-star-fill color-gradient-to-r from-blue-900 to-blue-500 "
                    style={{
                      fontSize: width < 1024 ? '1.2rem' : '1.4rem',
                      color: '#c6a907',
                    }}
                  />
                ) : (
                  <i
                    className="pi pi-star "
                    style={{
                      fontSize: width < 1024 ? '1.2rem' : '1.4rem',
                      color: '#c6a907',
                    }}
                  />
                )}
              </button>
            </div>
          )}
          <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type="area"
            height={300}
          />
        </>
      )}
    </div>
  )
}

export default PerformanceMinionChart
