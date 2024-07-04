import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode, useWindowSize } from '../../hooks'
import { delayInUNIX } from '../../utils/misc'

const generateTimestamps = (count, delay, startTime = Date.now()) => {
  const { day, hour, minute } = delay

  const delayInMs =
    day * delayInUNIX.d + hour * delayInUNIX.h + minute * delayInUNIX.m

  const timestamps = []
  let currentTime = new Date(startTime).getTime()

  for (let i = 0; i < count; i++) {
    timestamps.push(currentTime)
    currentTime += delayInMs
  }

  return timestamps
}

const chartTime = [
  'Mon, 07 Aug 2023 17:00:00 GMT',
  'Mon, 07 Aug 2023 18:00:00 GMT',
  'Mon, 07 Aug 2023 19:00:00 GMT',
  'Mon, 07 Aug 2023 20:00:00 GMT',
  'Mon, 07 Aug 2023 21:00:00 GMT',
  'Mon, 07 Aug 2023 22:00:00 GMT',
  'Mon, 07 Aug 2023 23:00:00 GMT',
  'Mon, 07 Aug 2023 23:00:00 GMT',
  'Tue, 08 Aug 2023 00:00:00 GMT',
  'Tue, 08 Aug 2023 01:00:00 GMT',
  'Tue, 08 Aug 2023 02:00:00 GMT',
  'Tue, 08 Aug 2023 03:00:00 GMT',
  'Tue, 08 Aug 2023 04:00:00 GMT',
  'Tue, 08 Aug 2023 05:00:00 GMT',
  'Tue, 08 Aug 2023 06:00:00 GMT',
  'Tue, 08 Aug 2023 07:00:00 GMT',
  'Tue, 08 Aug 2023 08:00:00 GMT',
  'Tue, 08 Aug 2023 09:00:00 GMT',
  'Tue, 08 Aug 2023 10:00:00 GMT',
  'Tue, 08 Aug 2023 11:00:00 GMT',
]

//? no metrics time since we're gonna make those timestamps on our own
const PreviewChart = ({
  id,
  metricsData = [],
  orderCount = 1,
  delayBetweenOrders,
  className,
}) => {
  const [darkModeState] = useDarkMode()
  const { width } = useWindowSize()
  const [darkMode, setDarkMode] = useState(darkModeState)

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

  const unixTimestamps = generateTimestamps(orderCount, delayBetweenOrders)

  const data = useMemo(() => {
    if (metricsData.length > 0 && chartTime.length > 0) {
      // const dateTime = chartTime.map((item) => new Date(item).getTime())
      return unixTimestamps.map((time, index) => [
        time,
        Number(metricsData[index]),
      ])
    }
    return []
  }, [metricsData, chartTime])

  const chartData = {
    series: [{ name: id, data: data ?? [] }],
    options: {
      chart: {
        id: id,
        type: 'bar',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      title: {
        text: id,
        offsetX: 20,
        offsetY: 8,
        margin: -10,
        style: {
          color: darkMode ? '#D4D4D4' : '#4133da',
          fontSize: width > 1024 ? '17px' : '18px',
          fontFamily: 'inherit',
        },
      },
      colors: ['#4133da'],
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
        // y: {
        //   formatter: function (
        //     value,
        //     { series, seriesIndex, dataPointIndex, w }
        //   ) {
        //     return numberFormatting(value)
        //   },
        // },
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
      className={`relative rounded-lg border bg-color-primary p-2 dark:border-neutral-700 dark:bg-color-primary ${className}`}>
      <ReactApexChart
        series={chartData.series}
        options={chartData.options}
        type="bar"
        height={width > 1024 ? 450 : 280}
      />
    </div>
  )
}

export default PreviewChart
