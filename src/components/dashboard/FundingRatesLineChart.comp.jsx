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

const FundingRatesLineChart = ({ labels, data, title }) => {
  const chartRef = useRef(null)
  const [chartKey, setChartKey] = useState(0)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  })
  const colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#EEAAFF',
    '#FF9F00',
    '#00FF00',
    '#0000FF',
    '#FF0000',
    '#00FFFF',
  ]

  const [darkMode] = useDarkMode()
  const { width } = useWindowSize()

  useEffect(() => {
    setChartData((prev) => ({
      labels: labels,
      datasets: data.map((item, index) => {
        return {
          label: item.label ?? '',
          data: item.data,
          borderColor: colors[index],
          backgroundColor: colors[index],
          tension: 0.2,
          fill: false,
          key: index,
          borderWidth: width < 768 ? 2 : 3,
        }
      }),
    }))
  }, [data])

  useEffect(() => {
    setChartKey((prevKey) => prevKey + 1)
  }, [chartData])
  return (
    <Line
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
        // maintainAspectRatio: width > 768 ? false : true,
        plugins: {
          title: {
            display: true,
            text: title,
          },
          tooltip: {
            mode: 'index',
            intersect: false,

            callbacks: {
              label: function (context) {
                const label = context.dataset.label || ''
                const value = context.parsed.y
                return (
                  label +
                  ': ' +
                  value.toLocaleString('en-US', {
                    minimumFractionDigits: 5,
                    maximumFractionDigits: 5,
                  })
                )
              },
            },
          },
        },
      }}
      data={chartData}
    />
  )
}

export default FundingRatesLineChart
