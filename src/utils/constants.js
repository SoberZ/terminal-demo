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
  { label: '5 Minute', value: 5 },
  { label: '15 Minutes', value: 15 },
  { label: '1 Hour', value: 60 },
  { label: '4 Hours', value: 240 },
  { label: '24 hours', value: 1440 },
]

export { constants, exchangeParams, timeFrames }
