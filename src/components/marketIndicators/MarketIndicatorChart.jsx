import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode } from '../../hooks'
import Loader from '../shared/Loader.shared'

const marketIndicators = {
  Volatility: 'volatility',
  'Buys and Sells': 'buys-and-sells',
  "Trades' Liquidity": 'trades-liquidity',
}

const fixText = (ob, newText) => {
  const fixedOb = structuredClone(ob)

  fixedOb.title.text = newText

  return fixedOb
}

const MarketIndicatorChart = ({
  id,
  market = 'BTC/USDT',
  exchange = 'binance',
  loading,
}) => {
  const [darkModeState] = useDarkMode()
  const [darkMode, setDarkMode] = useState(darkModeState)
  const [liveChartData, setLiveChartData] = useState([])

  let websocket
  let buysWebsocketData = []
  let sellsWebsocketData = []
  let buyLiqWebsocketData = []
  let sellLiqWebsocketData = []
  let liqWebsocketData = []

  useEffect(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.close()
    }

    let origin = import.meta.env.VITE_API_BASE_URL.replace(/.+?(?=:)/i, 'wss')

    websocket = new WebSocket(
      `${origin}/data/live-data/live-${marketIndicators[id]}?exchange=${exchange}&symbol=${market}`
    )

    websocket.onmessage = (data) => {
      if (data.data == 'ping') {
        websocket.send('pong')
      } else {
        setLiveChartData((prev) => {
          const newData = JSON.parse(data.data)
          const updatedData = [...prev, newData]

          const dataLimit = 30

          if (updatedData.length > dataLimit) {
            updatedData.shift()
          }

          return updatedData
        })
      }
    }
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
      if (websocket && websocket.readyState == websocket.OPEN) {
        websocket.close()
      }
      window.removeEventListener('storage', checkDarkModeStatus)
    }
  }, [market])

  const data = useMemo(() => {
    if (liveChartData?.length > 0) {
      //? volatility would be dynamic here

      if (id === 'Volatility') {
        return liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.volatility]
        })
      } else if (id === 'Buys and Sells') {
        buysWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.buys]
        })

        sellsWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.sells]
        })
      } else if (id === "Trades' Liquidity") {
        buyLiqWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.buy_liquidity]
        })

        sellLiqWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.sell_liquidity]
        })
        liqWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.liquidity]
        })
      }
    }
    return []
  }, [liveChartData])

  const sharedOptions = {
    chart: {
      type: 'area',
      group:
        id === 'Buys and Sells'
          ? 'buys-sells'
          : id === "Trades' Liquidity"
          ? 'liquidity'
          : '',
      zoom: {
        autoScaleYaxis: true,
      },
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 500,
        },
      },
      toolbar: {
        show: false,
        autoSelected: 'pan',
      },
    },
    title: {
      text: '',
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
      show: false,
      forceNiceScale: true,
      decimalsInFloat: 10,
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
        // formatter: (value) => {
        //   return numberFormatting(value)
        // },
      },
    },
    legend: {
      labels: {
        colors: darkMode ? '#939393' : '#8e8da4',
      },
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
  }

  const hardcodedSeries = {
    volatility: [{ name: id, data: data ?? [] }],
    buysSells: {
      buySeries: [{ name: 'Buys', data: buysWebsocketData ?? [] }],
      sellSeries: [{ name: 'Sells', data: sellsWebsocketData ?? [] }],
    },
    liquidity: {
      //? need data here
      buyLiqSeries: [
        { name: 'Buy Liquidity', data: buyLiqWebsocketData ?? [] },
      ],
      sellLiqSeries: [
        { name: 'Sell Liquidity', data: sellLiqWebsocketData ?? [] },
      ],
      liqSeries: [{ name: 'Liquidity', data: liqWebsocketData ?? [] }],
    },
  }

  return (
    <div
      className={`relative rounded-lg border bg-color-secondary p-2 dark:border-neutral-700 dark:bg-color-primary`}>
      {loading ? (
        <Loader />
      ) : (
        <>
          {id === 'Buys and Sells' ? (
            <>
              <ReactApexChart
                options={fixText(sharedOptions, 'Buys')}
                series={hardcodedSeries.buysSells.buySeries}
                type="line"
                height={300}
              />
              <ReactApexChart
                options={fixText(sharedOptions, 'Sells')}
                series={hardcodedSeries.buysSells.sellSeries}
                type="line"
                height={300}
              />
            </>
          ) : id === "Trades' Liquidity" ? (
            <>
              <ReactApexChart
                options={fixText(sharedOptions, 'Liquidity')}
                series={hardcodedSeries.liquidity.liqSeries}
                type="area"
                height={300}
              />
              <ReactApexChart
                options={fixText(sharedOptions, 'Buy Liquidity')}
                series={hardcodedSeries.liquidity.buyLiqSeries}
                type="area"
                height={300}
              />
              <ReactApexChart
                options={fixText(sharedOptions, 'Sell Liquidity')}
                series={hardcodedSeries.liquidity.sellLiqSeries}
                type="area"
                height={300}
              />
            </>
          ) : (
            <ReactApexChart
              options={fixText(sharedOptions, 'Volatility')}
              series={hardcodedSeries.volatility}
              type="area"
              height={300}
            />
          )}
        </>
      )}
    </div>
  )
}

export default MarketIndicatorChart
