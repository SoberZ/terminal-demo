import { useEffect, useRef, useState } from 'react'
import { useDarkMode, useWindowSize } from '../../hooks'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  defaults,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
)

defaults.font.family = "'Open-Sans', sans-serif"
defaults.font.size = 12
defaults.color = '#777f8fbf'
defaults.elements.point.pointStyle = false
defaults.hover.intersect = false

const LineChart = ({ labels, data, title }) => {
  const chartRef = useRef(null)
  const [chartKey, setChartKey] = useState(0)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  })

  const [darkMode] = useDarkMode()
  const { width } = useWindowSize()

  // Update the chart with the filled gradient
  useEffect(() => {
    var ctx = document.getElementById('canvas').getContext('2d')
    var gradient = ctx.createLinearGradient(0, 0, 0, 200)
    gradient.addColorStop(0, 'rgba(23, 109, 210, 0.5)')
    gradient.addColorStop(1, 'rgba(23, 109, 210, 0)')

    if (data) {
      setChartData((_) => {
        return {
          labels: labels,
          datasets:
            data &&
            data.map((item, index) => ({
              label: item.label ?? '',
              data: item.data,
              borderColor: 'rgb(23, 109, 210)',
              backgroundColor: gradient,
              tension: 0.3,
              fill: 'origin',
              key: index,
            })),
        }
      })
    }
  }, [])

  useEffect(() => {
    setChartData((prev) => ({
      labels: labels,
      datasets: data
        ? data.map((item, index) => {
            const prevItem = prev.datasets.find((x) => x.key === index)
            return {
              label: item.label ?? '',
              data: item.data,
              borderColor: 'rgb(23, 109, 210)',
              backgroundColor: prevItem
                ? prevItem.backgroundColor
                : 'rgba(23, 109, 210, 0.5)',
              tension: 0.3,
              fill: 'origin',
              key: index,
              borderWidth: width < 768 ? 2 : 3,
            }
          })
        : [],
    }))
  }, [data, labels])

  useEffect(() => {
    setChartKey((prevKey) => prevKey + 1)
  }, [chartData])

  return (
    <Line
      // redraw
      key={chartKey}
      ref={(ref) => (chartRef.current = ref)}
      id="canvas"
      options={{
        scales: {
          x: {
            display: false,
          },
          y: {
            border: {
              display: false,
              dash: [5, 5],
            },
            grid: {
              tickLength: 1,
              color: darkMode ? '#777f8fbf' : '#E7E7E7',
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
      }}
      data={chartData}
    />
  )
}

export default LineChart
