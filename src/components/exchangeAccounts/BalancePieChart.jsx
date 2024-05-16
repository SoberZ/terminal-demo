import ReactECharts from 'echarts-for-react'
import { twMerge } from 'tailwind-merge'
import { useDarkMode, useWindowSize } from '../../hooks'
import { useEffect, useState } from 'react'

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

const BalancePieChart = ({
  balances,
  labels,
  styling,
  className,
  portfolio,
}) => {
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
      top: width < 1024 ? '2px' : 'center',
      right: width < 1024 ? 'center' : 'center',
    },
    series: [
      {
        name: 'Exchange Account balance',
        type: 'pie',
        radius: ['40%', portfolio ? '60%' : '70%'],
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
