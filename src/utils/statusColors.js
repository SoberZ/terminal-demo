const green = '#22C55E'
const red = '#EF4444'
const orange = '#F59E0B'
const blue = '#6366F1'

export const statusColors = {
  //strategies
  true: green,
  false: red,
  active: green,
  new: blue,
  pausing: 'DarkViolet',
  starting: 'DarkViolet',
  paused: 'SlateGray',
  pausedErr: red,
  stop: 'DarkSlateGray',
  //Orders
  buy: green,
  sell: red,
  open: green,
  closed: blue,
  paraFilled: '#63AAF1',
  abandoned: orange,
  canceled: 'red',
  //exchanges,
  restart: blue,
  running: green,
  stopped: 'DarkSlateGray',
  err: red,
  authFailed: red,
}
