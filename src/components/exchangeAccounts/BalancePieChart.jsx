import ReactECharts from 'echarts-for-react'
import { twMerge } from 'tailwind-merge'
import { useDarkMode, useWindowSize } from '../../hooks'
import { useEffect, useState } from 'react'

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

const BalancePieChart = ({ balances, labels, styling, className }) => {
  const { width } = useWindowSize()
  const [darkModeState] = useDarkMode()
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

  const data = labels?.map((name, index) => ({
    value: balances[index],
    name: name,
  }))

  const totalSum = balances?.reduce((a, b) => {
    b = isNaN(b) ? 0 : b
    return a + b
  }, 0)

  const options = {
    darkMode: darkMode ? true : false,
    tooltip: {
      trigger: 'item',
      formatter: (params) =>
        `${params.seriesName} <br />
        <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${
          params.color
        };"></span>${params.name}: ${Intl.NumberFormat('en-US', {
          notation: 'standard',
        }).format(params.value)} USDT (${params.percent}%)`,
    },
    legend: {
      bottom: 'bottom',
      left: 'center',
      textStyle: {
        color: darkMode ? '#D4D4D4' : '#000',
      },
    },
    toolbox: {
      show: false,
      feature: {
        saveAsImage: { show: true },
      },
    },
    //? Per Default it's like this, i need a good color scheme
    color: darkMode ? defaultDarkColors : defaultColors,
    title: {
      text: `Total Balance:\n ${Intl.NumberFormat('en-US', {
        notation: 'standard',
      }).format(totalSum ? totalSum : 0)} USDT`,
      fontSize: 20,
      fontWeight: 'bold',
      textStyle: {
        color: darkMode ? '#D4D4D4' : '#344767',
      },
      // top: 'center',
      // right: 'center',
      top: width < 1024 ? '10px' : 'center',
      right: width < 1024 ? 'center' : 'center',
    },
    series: [
      {
        name: 'Exchange Account balance',
        type: 'pie',
        radius: ['40%', '70%'],
        labelLine: {
          showAbove: true,
        },
        tooltip: {
          valueFormatter: (value) =>
            `${Intl.NumberFormat('en-US', {
              notation: 'standard',
            }).format(value)} USDT`,
        },
        data: data,
      },
    ],
  }

  return (
    <ReactECharts
      className={twMerge(
        'relative rounded-lg border bg-color-secondary dark:border-neutral-700 dark:bg-color-primary md:p-2',
        className
      )}
      style={{
        width: width > 1024 ? '60rem' : '100%',
        height: width > 1024 ? '550px' : '450px',
        ...styling,
      }}
      option={options}
    />
  )
}

export default BalancePieChart
