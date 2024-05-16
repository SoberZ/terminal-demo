import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode, useWindowSize } from '../../hooks'

const PrimaryChart = ({ id, metricsData, metricsTime, className }) => {
  const [darkModeState] = useDarkMode()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const { width } = useWindowSize()
  const [chartData, setChartData] = useState({
    series: [{ name: id, data: [] }],
    options: {
      chart: {
        id: 'Total Pnl',
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
        text: 'Total Pnl',
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        forceNiceScale: true,
        decimalsInFloat: 5,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      tooltip: {
        x: {
          format: 'hh:mm tt dd MMM yyyy',
        },
        // followCursor: true,
        // fillSeriesColor: true,
      },
      grid: {
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
    seriesYears: [
      {
        data: [],
      },
    ],
    optionsYears: {
      chart: {
        id: `${id} options`,
        height: 150,
        type: 'area',
        toolbar: {
          autoSelected: 'selection',
        },
        zoom: {
          enabled: false,
        },
        brush: {
          enabled: true,
          target: 'Total Pnl',
        },
        selection: {
          enabled: true,
          // ? premade selection, not good tbh
          // xaxis: {
          //   min: new Date('01 Aug 2023').getTime(),
          //   max: new Date('15 Sep 2023').getTime(),
          // },
        },
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
        colors: ['#4133da'],
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
      const chartData = metricsData[0].data.map((item) => item)
      return dateTime.map((time, index) => [time, Number(chartData[index])])
    }
    return []
  }, [metricsData, metricsTime])

  useEffect(() => {
    if (data.length > 0) {
      setChartData((prevData) => ({
        ...prevData,
        series: [{ name: id, data: data }],
        seriesYears: [{ name: id, data: data }],
        options: {
          ...prevData.options,
          chart: {
            ...prevData.options.chart,
            id: id,
          },
          title: {
            text: id,
          },
        },
        optionsYears: {
          ...prevData.optionsYears,
          chart: {
            ...prevData.optionsYears.chart,
            id: `${id} options`,
          },
          brush: {
            ...prevData.optionsYears.brush,
            target: id,
          },
        },
      }))
    }
  }, [id, data])

  useEffect(() => {
    setChartData((prevData) => ({
      ...prevData,
      options: {
        ...prevData.options,
        grid: {
          ...prevData.options.grid,
          borderColor: darkMode ? '#505050' : '#e0e6ed',
        },
        yaxis: {
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
        xaxis: {
          ...prevData.options.xaxis,
          labels: {
            ...prevData.options.xaxis.labels,
            style: {
              colors: darkMode ? '#939393' : '#8e8da4',
            },
          },
        },
        fill: {
          colors: ['#4133da'],
        },
        title: {
          ...prevData.options.title,
          style: {
            color: darkMode ? '#D4D4D4' : '#4133da',
            fontSize: '20px',
            fontFamily: 'inherit',
          },
        },
      },
      optionsYears: {
        ...prevData.optionsYears,
        grid: {
          ...prevData.optionsYears.grid,
          borderColor: darkMode ? '#505050' : '#e0e6ed',
        },
        chart: {
          ...prevData.optionsYears.chart,
          background: darkMode ? 'transparent' : '#F6F8FA',
          selection: {
            ...prevData.optionsYears.selection,
            fill: {
              color: darkMode ? '#fff' : '#4133da',
              opacity: 0.1,
            },
          },
        },
        xaxis: {
          ...prevData.options.xaxis,
          labels: {
            ...prevData.options.xaxis.labels,
            style: {
              colors: darkMode ? '#939393' : '#8e8da4',
            },
          },
        },
      },
    }))
  }, [darkMode])

  return (
    <div
      className={`relative rounded-lg border bg-color-primary p-2 dark:border-neutral-700 dark:bg-color-primary ${className}`}>
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
    </div>
  )
}

export default PrimaryChart
