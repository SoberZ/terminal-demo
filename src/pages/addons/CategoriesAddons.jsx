import { Dropdown } from 'primereact/dropdown'
import { getSeverity } from '../Strategies'
import { Tag } from 'primereact/tag'

const statuses = [
  'active',
  'new',
  'stop',
  'paused',
  'pausing',
  'paused_err',
  'starting',
]

const demoMode = ['true', 'false']
const types = [
  'Depth Strategy',
  'Spread Strategy',
  'Avellaneda Strategy',
  'Volume Strategy',
  'Matrix Strategy',
  'Generic Strategy',
  'Demo MM Strategy',
]

export const strategyDemoModeBodyTemplate = (strategy) => {
  return (
    <Tag
      value={String(strategy.is_demo_strategy)}
      style={{ backgroundColor: getSeverity(strategy.is_demo_strategy) }}
      className="text-md"></Tag>
  )
}

export const strategyTypesFilterTemplate = (options) => {
  return (
    <Dropdown
      value={options.value}
      options={types}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      placeholder="Select a Strategy Type"
      showClear
    />
  )
}

export const demoModeFilterTemplate = (options) => {
  return (
    <Dropdown
      value={options.value}
      options={demoMode}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => (
        <Tag value={option} style={{ backgroundColor: getSeverity(option) }} />
      )}
      placeholder="Select a Demo Mode"
      showClear
    />
  )
}

export const statusFilterTemplate = (options) => {
  return (
    <Dropdown
      value={options.value}
      options={statuses}
      onChange={(e) => options.filterCallback(e.value, options.index)}
      itemTemplate={(option) => (
        <Tag value={option} style={{ backgroundColor: getSeverity(option) }} />
      )}
      placeholder="Select a status"
      showClear
    />
  )
}
