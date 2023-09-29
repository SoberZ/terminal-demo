import {
  UsersIcon,
  ChartIcon,
  HomeIcon,
  KeyIcon,
  StatsIcon,
} from '../assets/icons'

export const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export function getBase(market) {
  const marketArray = market.split('/')
  return marketArray[0]
}
export function getQuote(market) {
  const marketArray = market.split('/')
  return marketArray[1]
}

export function formatNumber(number) {
  if (Number.isNaN(number)) {
    return NaN // Return NaN for invalid numbers
  }

  let numStr = number.toString()

  if (numStr.includes('.')) {
    if (numStr.split('.')[0].replace(/[^0-9]/g, '').length > 5) {
      return parseFloat(number).toFixed(3)
    } else {
      return parseFloat(number).toFixed(10)
    }
  } else {
    return parseFloat(number)
  }
}

export function commaSeparator(number) {
  let numStr = number.toString()

  let [integerPart, decimalPart] = numStr.split('.')

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  let formattedNumber = decimalPart
    ? `${integerPart}.${decimalPart}`
    : integerPart

  return formattedNumber
}
export function formatDate(inputDate) {
  if (inputDate === '') return false
  const date = new Date(inputDate)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeIcon,
  },
  {
    path: '/strategies',
    name: 'Strategies',
    component: ChartIcon,
  },
  {
    path: '/exchanges',
    name: 'Exchange Accounts',
    component: KeyIcon,
  },
  {
    path: '/cachers',
    name: 'Cachers',
    component: StatsIcon,
  },
]
