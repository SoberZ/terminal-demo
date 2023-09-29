import LineChart from './LineChart.shared'
import SelectInput from './SelectInput.shared'

const SelectChart = ({
  title,
  LineChartData,
  LineChartLabel,
  timeFrames,
  handler,
  selectable,
  value,
}) => {
  return (
    <div className="p-5">
      <h1>{title}</h1>

      {selectable ? (
        <SelectInput options={timeFrames} value={value} handler={handler} />
      ) : null}
      <div className="h-72">
        <LineChart data={LineChartData} labels={LineChartLabel} />
      </div>
    </div>
  )
}

export default SelectChart
