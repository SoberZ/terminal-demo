import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode, useWindowSize } from '../../hooks'

const MinionChart = ({
  id,
  metricsData,
  metricsTime,
  className,
  value,
  handler,
}) => {
  const handleChange = (selectedOption) => {
    handler(selectedOption, value)
  }
  const [darkModeState] = useDarkMode()
  const { width } = useWindowSize()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const [chartData, setChartData] = useState({
    series: [{ name: id, data: [] }],
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
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        show: false,
      },
      tooltip: {
        x: {
          format: 'hh:mm tt dd MMM yyyy',
        },
      },
      grid: {
        strokeDashArray: 7,
        padding: {
          left: 20,
        },
      },
      stroke: {
        curve: 'smooth',
        colors: ['#4133da'],
        opacity: 1,
      },
      fill: {
        type: 'solid',
        colors: ['#4133da'],
        opacity: 0.3,
      },
      markers: {
        colors: ['#4133da'],
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
    if (metricsData.length > 0 && metricsTime.length > 0) {
      const dateTime = metricsTime.map((item) => new Date(item).getTime())
      const chartData = metricsData[0].data.map((item) => item?.toFixed(4))
      return dateTime.map((time, index) => [time, Number(chartData[index])])
    }
    return []
  }, [metricsData, metricsTime])

  useEffect(() => {
    if (data.length > 0) {
      setChartData((prevData) => ({
        ...prevData,
        series: [{ name: id, data: data }],
      }))
    }
  }, [metricsData, metricsTime])

  useEffect(() => {
    setChartData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        grid: {
          ...prevData.options.grid,
          borderColor: darkMode ? '#505050' : '#e0e6ed',
        },
        xaxis: {
          ...prevData.options.yaxis,
          labels: {
            ...prevData.options.yaxis.labels,
            style: {
              colors: darkMode ? '#939393' : '#8e8da4',
            },
          },
        },
        tooltip: {
          ...prevData.options.tooltip,
          theme: darkMode ? 'dark' : 'light',
        },
        fill: {
          colors: ['#4133da'],
        },
        title: {
          ...prevData.options.title,
          style: {
            color: darkMode ? '#D4D4D4' : '#4133da',
            fontSize: '17px',
            fontFamily: 'inherit',
          },
        },
      },
    }))
  }, [darkMode])

  return (
    <div
      onClick={handleChange}
      className={`relative rounded-lg border-2 bg-color-primary p-2 transition-colors ease-in hover:cursor-pointer hover:border-autowhale-blue/40 dark:border-neutral-700 dark:bg-color-secondary hover:dark:border-neutral-300 ${className}`}>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="area"
        height={width > 1024 ? 350 : 280}
      />
    </div>
  )
}

export default MinionChart
