import { useState, useEffect, useMemo } from 'react'

import ReactApexChart from 'react-apexcharts'
import { useDarkMode } from '../../hooks'
import Loader from '../shared/Loader.shared'
import SelectInput from '../shared/SelectInput.shared'
import { marketTimeframes, orderBookDepthLevels } from '../../utils/constants'
import { numberFormatting } from '../../utils/misc'

import { BiInfoCircle } from 'react-icons/bi'
import { Tooltip } from 'primereact/tooltip'
import { Dialog } from 'primereact/dialog'

const marketIndicators = {
  Volatility: 'volatility',
  'Buys and Sells': 'buys-and-sells',
  "Trades' Volume": 'trades-volume',
  'Order Book Liquidity': 'order-book-liquidity',
}

const fixText = (ob, newText, newYAxisTitle) => {
  const fixedOb = {
    ...ob,
    title: {
      ...ob.title,
      text: newText,
    },
    yaxis: {
      ...ob.yaxis,
      title: {
        ...ob.yaxis.title,
        text: newYAxisTitle,
      },
      labels: {
        ...ob.yaxis.labels,
        formatter: ob.yaxis.labels.formatter,
      },
    },
    tooltip: {
      ...ob.tooltip,
      y: {
        ...ob.tooltip.y,
        formatter: ob.tooltip.y.formatter,
      },
    },
  }

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
  const [visible, setVisible] = useState(false)
  const [timeframe, setTimeframe] = useState('1m')
  const [levels, setLevels] = useState('10')

  let websocket
  let buysWebsocketData = []
  let sellsWebsocketData = []
  let buyLiqWebsocketData = []
  let sellLiqWebsocketData = []
  let volWebsocketData = []
  let buyVolWebsocketData = []
  let sellVolWebsocketData = []

  const volatilityTimeframes =
    marketIndicators[id] === 'volatility' ? `&timeframe=${timeframe}` : ''

  useEffect(() => {
    setLiveChartData([])
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.close()
    }

    let origin = 'wss://api.autowhale.net'

    websocket = new WebSocket(
      `${origin}/data/live-data/live-${marketIndicators[id]}?exchange=${exchange}&symbol=${market}${volatilityTimeframes}`
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
  }, [market, timeframe])

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
      } else if (id === "Trades' Volume") {
        //? change everything here to volume
        buyVolWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.buy_volume]
        })

        sellVolWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.sell_volume]
        })
        volWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.volume]
        })
      } else if (id === 'Order Book Liquidity') {
        buyLiqWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.buy_liquidity]
        })

        sellLiqWebsocketData = liveChartData.map((liveData) => {
          const dateTime = new Date(liveData.date).getTime()
          return [dateTime, liveData.sell_liquidity]
        })
      }
    }
    return []
  }, [liveChartData])

  const sharedOptions = {
    chart: {
      id: id,
      type: 'area',
      group:
        id === 'Buys and Sells'
          ? 'buys-sells'
          : id === "Trades' Volume"
          ? 'trades volume'
          : id === 'Order Book Liquidity'
          ? 'liquidity'
          : '',
      zoom: {
        autoScaleYaxis: true,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
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
    yaxis: {
      title: {
        text: '',
        style: {
          color: darkMode ? '#939393' : '#8e8da4',
        },
      },
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
        //? these crash the page
        formatter: (value) => {
          return numberFormatting(value)
        },
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
      //? these crash the page
      y: {
        formatter: function (
          value,
          { series, seriesIndex, dataPointIndex, w }
        ) {
          if (id === "Trades' Volume" || id === 'Order Book Liquidity') {
            return `${numberFormatting(value)} ${market.split('/')[1]}`
          } else if (id === 'Buys and Sells') {
            return `${numberFormatting(value)} Number of ${w.config.title.text}`
          } else {
            return `${numberFormatting(value)}%`
          }
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
  }

  const hardcodedSeries = {
    volatility: [{ name: id, data: data ?? [] }],
    buysSells: {
      buySeries: [{ name: 'Buys', data: buysWebsocketData ?? [] }],
      sellSeries: [{ name: 'Sells', data: sellsWebsocketData ?? [] }],
    },
    volume: {
      buyVolSeries: [{ name: 'Buy Volume', data: buyVolWebsocketData ?? [] }],
      sellVolSeries: [
        { name: 'Sell Volume', data: sellVolWebsocketData ?? [] },
      ],
      volSeries: [{ name: 'Volume', data: volWebsocketData ?? [] }],
    },
    liquidity: {
      buyLiqSeries: [
        { name: 'Buy Liquidity', data: buyLiqWebsocketData ?? [] },
      ],
      sellLiqSeries: [
        { name: 'Sell Liquidity', data: sellLiqWebsocketData ?? [] },
      ],
    },
  }

  const handleSelect = (select) => {
    setTimeframe(select.value)
  }

  const handleLevelSelect = (select) => {
    setLevels(select)
  }

  return (
    <>
      <div
        className={`relative rounded-lg border bg-color-secondary p-2 dark:border-neutral-700 dark:bg-color-primary`}>
        <Dialog
          className="w-[20rem]"
          visible={visible}
          draggable={false}
          header={id}
          dismissableMask
          onHide={() => setVisible(false)}>
          {id === 'Buys and Sells' ? (
            <p className="">
              number of incoming new trades per interval on buy vs sell side
            </p>
          ) : id === "Trades' Volume" ? (
            <p className="">
              The volume of the live incoming trades showing the amounts in
              quote currency
            </p>
          ) : id === 'Volatility' ? (
            <p className="">
              The volatility in percentages of an asset for a specified
              timeframe
            </p>
          ) : (
            <p className="">
              The amount of buy liquidity in the live order book updates given
              an order book depth
            </p>
          )}
        </Dialog>
        <Tooltip target=".tooltip" />
        {loading ? (
          <Loader />
        ) : (
          <>
            {id === 'Buys and Sells' ? (
              <>
                <div className="z absolute top-3 right-3 z-[1]">
                  {visible ? (
                    <BiInfoCircle size={30} className="hover:cursor-pointer" />
                  ) : (
                    <BiInfoCircle
                      className="md:tooltip hover:cursor-pointer"
                      size={30}
                      data-pr-tooltip="Total Buys/Sells: number of incoming new trades per interval on buy vs sell side"
                      data-pr-position="left"
                      onClick={() => {
                        setVisible(true)
                      }}
                    />
                  )}
                </div>
                <ReactApexChart
                  options={fixText(sharedOptions, 'Buys', 'Number of Buys')}
                  series={hardcodedSeries.buysSells.buySeries}
                  type="line"
                  height={300}
                />
                <ReactApexChart
                  options={fixText(sharedOptions, 'Sells', 'Number of Sells')}
                  series={hardcodedSeries.buysSells.sellSeries}
                  type="line"
                  height={300}
                />
              </>
            ) : id === "Trades' Volume" ? (
              <>
                <div className="absolute top-3 right-3 z-[1]">
                  {visible ? (
                    <BiInfoCircle size={30} className="hover:cursor-pointer" />
                  ) : (
                    <BiInfoCircle
                      className="md:tooltip hover:cursor-pointer"
                      size={30}
                      data-pr-tooltip="Trades & Buy/Sell volume: The volume of the live incoming trades showing the amounts in quote currency"
                      data-pr-position="left"
                      onClick={() => {
                        setVisible(true)
                      }}
                    />
                  )}
                </div>
                <ReactApexChart
                  options={fixText(
                    sharedOptions,
                    'Volume',
                    `Currency (${market.split('/')[1]})`
                  )}
                  series={hardcodedSeries.volume.volSeries}
                  type="area"
                  height={300}
                />
                <ReactApexChart
                  options={fixText(
                    sharedOptions,
                    'Buy Volume',
                    `Currency (${market.split('/')[1]})`
                  )}
                  series={hardcodedSeries.volume.buyVolSeries}
                  type="area"
                  height={300}
                />
                <ReactApexChart
                  options={fixText(
                    sharedOptions,
                    'Sell Volume',
                    `Currency (${market.split('/')[1]})`
                  )}
                  series={hardcodedSeries.volume.sellVolSeries}
                  type="area"
                  height={300}
                />
              </>
            ) : id === 'Order Book Liquidity' ? (
              <div className="flex flex-col md:flex-row md:gap-2">
                <div className="absolute top-3 right-3 z-[1] flex items-center gap-1 md:gap-3 xl:gap-5">
                  <SelectInput
                    options={orderBookDepthLevels}
                    handler={handleLevelSelect}
                    defaulted={{ label: '10', value: 10 }}
                    className="w-[6rem]"
                  />
                  {visible ? (
                    <BiInfoCircle size={30} className="hover:cursor-pointer" />
                  ) : (
                    <BiInfoCircle
                      className="md:tooltip hover:cursor-pointer"
                      size={30}
                      data-pr-tooltip="Buy/Sell Liquidity: The amount of buy liquidity in the live order book updates given an order book depth"
                      data-pr-position="left"
                      onClick={() => {
                        setVisible(true)
                      }}
                    />
                  )}
                </div>
                <div className="md:w-1/2">
                  <ReactApexChart
                    options={fixText(
                      sharedOptions,
                      'Buy Liquidity',
                      `Currency (${market.split('/')[1]})`
                    )}
                    series={hardcodedSeries.liquidity.buyLiqSeries}
                    type="area"
                    height={300}
                  />
                </div>
                <div className="md:w-1/2">
                  <ReactApexChart
                    options={fixText(
                      sharedOptions,
                      'Sell Liquidity',
                      `Currency (${market.split('/')[1]})`
                    )}
                    series={hardcodedSeries.liquidity.sellLiqSeries}
                    type="area"
                    height={300}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="absolute top-3 right-3 z-[1] flex items-center gap-1 md:gap-3 xl:gap-5">
                  <SelectInput
                    options={marketTimeframes}
                    handler={handleSelect}
                    defaulted={{ label: '1 minute', value: '1m' }}
                    //? fix these for mobile
                    className="w-[6rem] md:w-[8rem] xl:w-[15rem]"
                  />
                  {visible ? (
                    <BiInfoCircle size={30} className="hover:cursor-pointer" />
                  ) : (
                    <BiInfoCircle
                      className="md:tooltip hover:cursor-pointer"
                      size={30}
                      data-pr-tooltip="The volatility in percentages of an asset for a specified timeframe"
                      data-pr-position="top"
                      data-pr-my="center bottom-10"
                      onClick={() => {
                        setVisible(true)
                      }}
                    />
                  )}
                </div>
                <ReactApexChart
                  options={fixText(
                    sharedOptions,
                    'Volatility',
                    'Percentage (%)'
                  )}
                  series={hardcodedSeries.volatility}
                  type="area"
                  height={300}
                />
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default MarketIndicatorChart
