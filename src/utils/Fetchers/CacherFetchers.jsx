import { toast } from 'react-hot-toast'
import { CacherService } from '../../services'

export async function registerCacher(cacher) {
  const t = toast.loading('Registering Cacher')
  try {
    const res = await CacherService.registerCacher(cacher)
    if (res.status === 200) {
      toast.success(res.data.message, { id: t })
      return res
    }
  } catch (e) {
    toast.error(e.response.data.message, { id: t })
    return
  }
}

export async function fetchCachers(setCachers) {
  const t = toast.loading('Fetching Cachers')
  try {
    const activeRes = CacherService.getCachers('active')
    const pausedRes = CacherService.getCachers('paused')
    const newRes = CacherService.getCachers('new')
    const restartRes = CacherService.getCachers('restart')

    const [activeData, pausedData, newData, restartData] = await Promise.all([
      activeRes,
      pausedRes,
      newRes,
      restartRes,
    ])

    if (
      activeData.status === 200 &&
      pausedData.status === 200 &&
      newData.status === 200 &&
      restartData.status === 200
    ) {
      toast.success('Successfully fetched Cachers', { id: t })

      const combinedData = [
        ...activeData.data.data,
        ...newData.data.data,
        ...pausedData.data.data,
        ...restartData.data.data,
      ]

      setCachers(combinedData)
    }
  } catch (e) {
    toast.error(e.response.data.message, { id: t })
    return
  }
}

export async function pauseCacher(cacher) {
  const t = toast.loading('Pausing Cacher')
  try {
    const res = await CacherService.pauseCacher(cacher)

    if (res.status === 200) {
      toast.success(res.data.message, { id: t })
      return res
    }
  } catch (e) {
    toast.error(e.response.data.message, { id: t })
    return
  }
}

export async function deleteCacher(name) {
  const t = toast.loading('Deleting Cacher')
  try {
    const res = await CacherService.deleteCacher(name)

    if (res.status === 200) {
      toast.success('Successfully deleted Cacher', { id: t })
      return res
    }
  } catch (e) {
    toast.error(e.response.data.message, { id: t })
    return
  }
}
