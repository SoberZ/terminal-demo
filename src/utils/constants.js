const constants = {
  timeFrames: {
    MINUTE: 60,
    HOUR: 60 * 60,
    DAY: 60 * 60 * 24,
    WEEK: 60 * 60 * 24 * 7,
    MONTH: 60 * 60 * 24 * 7 * 4,
    YEAR: 60 * 60 * 24 * 7 * 4 * 12,
    TEN_YEARS: 60 * 60 * 24 * 7 * 4 * 12 * 10,
  },

  timeSymbols: {
    month: 'M',
    year: 'Y',
    day: 'D',
    hour: 'H',
  },
}

const exchangeParams = {
  kucoin: ['apiKey', 'secret', 'password'],
  binance: ['apiKey', 'secret'],
  bitmart: ['apiKey', 'secret', 'uid'],
  gateio: ['apiKey', 'secret'],
}

const timeFrames = [
  { label: '5 Minutes', value: 5 },
  { label: '15 Minutes', value: 15 },
  { label: '1 Hour', value: 60 },
  { label: '4 Hours', value: 240 },
  { label: '24 hours', value: 1440 },
]

const marketTimeframes = [
  { label: '1 second', value: '1s' },
  { label: '1 minute', value: '1m' },
  { label: '3 minutes', value: '3m' },
  { label: '5 minutes', value: '5m' },
  { label: '15 minutes', value: '15m' },
  { label: '30 minutes', value: '30m' },
  { label: '1 hour', value: '1h' },
  { label: '2 hours', value: '2h' },
  { label: '4 hours', value: '4h' },
  { label: '6 hours', value: '6h' },
  { label: '8 hours', value: '8h' },
  { label: '12 hours', value: '12h' },
  { label: '1 day', value: '1d' },
  { label: '3 days', value: '3d' },
  { label: '1 week', value: '1w' },
  { label: '1 month', value: '1M' },
]

const orderBookDepthLevels = [
  { label: '5', value: 5 },
  {
    label: '10',
    value: 10,
  },
  {
    label: '25',
    value: 25,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
  {
    label: '200',
    value: 200,
  },
  {
    label: '500',
    value: 500,
  },
  {
    label: '1000',
    value: 1000,
  },
]

export {
  constants,
  exchangeParams,
  timeFrames,
  marketTimeframes,
  orderBookDepthLevels,
}
