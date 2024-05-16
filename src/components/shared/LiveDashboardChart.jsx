import { createChart, ColorType, CrosshairMode } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'

export const LiveDashboardChart = (props) => {
  const {
    data = [],
    colors: {
      backgroundColor = 'transparent',
      lineColor = '#4133da',
      textColor = 'white',
      areaTopColor = '#4133da',
      areaBottomColor = 'rgba(41, 98, 255, 0.28)',
    } = {},
  } = props

  const chartContainerRef = useRef()
  const [series, setSeries] = useState(null)

  useEffect(() => {
    const newChart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: 'transparent' },
        horzLines: { color: 'transparent' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 502,
      rightPriceScale: {
        scaleMargins: {
          top: 0.3, // leave some space for the legend
          bottom: 0.25,
        },
      },
    })

    const symbolName = 'BTC/USDT Binance'

    const legend = document.createElement('div')
    legend.style = `position: absolute; left: 12px; top: 12px; z-index: 1; font-size: 14px; font-family: sans-serif; line-height: 18px; font-weight: 300;`
    container.appendChild(legend)

    const firstRow = document.createElement('div')
    firstRow.innerHTML = symbolName
    firstRow.style.color = 'white'
    legend.appendChild(firstRow)

    newChart.subscribeCrosshairMove((param) => {
      let priceFormatted = ''
      if (param.time) {
        const data = param.seriesData.get(areaSeries)
        const price = data.value !== undefined ? data.value : data.close
        priceFormatted = price.toFixed(2)
      }
      firstRow.innerHTML = `${symbolName} <strong>${priceFormatted}</strong>`
    })

    const newSeries = newChart.addAreaSeries({
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    })

    newChart.timeScale().fitContent()
    setSeries(newSeries)

    return () => {
      newChart.remove()
    }
  }, [])

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade')

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      const { p: price, E: eventTime } = message
      const newDataPoint = {
        time: eventTime,
        value: parseFloat(price),
      }

      if (series) {
        series.update(newDataPoint)
      }
    }

    return () => ws.close()
  }, [series])

  useEffect(() => {
    const handleResize = () => {
      chartContainerRef.current &&
        series &&
        series.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [series])

  return (
    <div ref={chartContainerRef} className="relative" id="container">
      <div
        className="bg-contain"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.1,
          zIndex: 0,
          backgroundImage: 'url(/aw-logo-full-dark.png)',
          // backgroundSize: '700px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
    </div>
  )
}
