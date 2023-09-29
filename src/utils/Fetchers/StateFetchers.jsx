import { StateService } from '../../services'

/**
 * Get the rolling metrics for a certain strategy.
 * @param {*} strategyId
 * @returns
 */
export async function getRollingMetrics(strategyId) {
  const res = await StateService.getRollingMetrics(strategyId)
  if (res.status !== 200) {
    toast.error(res.response.data.message)
  } else {
    return res.data.data
  }
}

/**
 * Get the grouped metrics from the api
 * @param {*} strategyId
 * @param {*} interval in hours
 * @param {*} limitDate
 * @returns
 */
export async function getGroupedMetrics(strategyId, interval, limitDate) {
  const res = await StateService.getGroupedMetrics(
    strategyId,
    interval,
    limitDate
  )

  if (res.status !== 200) {
    toast.error(res.response.data.message)
  } else {
    return res.data.data
  }
}

/**
 * Fetch the rolling chart metrics for a strategy
 * @param {*} strategyId
 * @returns
 */
export async function getRollingChartMetrics(strategyId, limitDate) {
  const res = await StateService.getRollingChartMetrics(strategyId, limitDate)

  if (res.status !== 200) {
    toast.error(res.response.data.message)
  } else {
    return res.data.data
  }
}
