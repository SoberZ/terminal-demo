import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode, useWindowSize } from '../../hooks'
import { numberFormatting } from '../../utils/misc'
import Loader from '../shared/Loader.shared'

const PerformancePrimaryChart = ({
  id,
  metricsData,
  metricsTime,
  tooltip,
  loading,
  className,
}) => {
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
        id: tooltip,
        type: 'area',
        zoom: {
          autoScaleYaxis: true,
        },
        toolbar: {
          tools: {
            reset: false,
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
        type: 'solid',
        opacity: 0.3,
      },
    },
    seriesYears: [
      {
        name: tooltip,
        data: data ?? [],
      },
    ],
    optionsYears: {
      chart: {
        id: `${id} options`,
        height: 150,
        type: 'area',
        background: darkMode ? 'transparent' : '#fff',
        toolbar: {
          autoSelected: 'selection',
        },
        zoom: {
          enabled: false,
        },
        brush: {
          enabled: true,
          target: tooltip,
        },
        selection: {
          enabled: true,
          fill: {
            color: darkMode ? '#fff' : '#4432e2',
            opacity: 0.1,
          },
        },
      },
      grid: {
        borderColor: darkMode ? '#505050' : '#e0e6ed',
      },
      yaxis: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'solid',
        opacity: 1,
        colors: ['#4432e2'],
      },
      stroke: {
        show: false,
      },
      legend: {
        show: false,
        position: 'top',
        horizontalAlign: 'left',
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: darkMode ? '#939393' : '#8e8da4',
          },
        },
      },
    },
  }

  return (
    <div
      className={`relative rounded-lg border bg-color-secondary p-2 dark:border-neutral-700 dark:bg-color-primary ${className}`}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type="area"
            height={width > 1024 ? 450 : 350}
          />
          {width > 1024 && (
            <ReactApexChart
              options={chartData.optionsYears}
              series={chartData.seriesYears}
              type="area"
              height={150}
            />
          )}
        </>
      )}
    </div>
  )
}

export default PerformancePrimaryChart
