import HttpService from './HttpService'

const axiosClient = HttpService.getAxiosClient()

const CacherService = {
  registerCacher: async function (cacher) {
    //! cacher = {
    //!     exchange : "bitget",
    //!     market:'ABBC/USDT',
    //!     endpoint : "screener",
    //! }
    try {
      const res = axiosClient.post('/data/casher/register-casher', cacher)
      return res
    } catch (error) {
      return error
    }
  },
  getCachers: async function (status) {
    try {
      const res = axiosClient.get('/data/casher/get-casher', {
        params: { status },
      })
      return res
    } catch (error) {
      return error
    }
  },
  pauseCacher: async function (cacher) {
    try {
      const res = axiosClient.post('/data/casher/pause-casher', cacher)
      return res
    } catch (error) {
      return error
    }
  },
  deleteCacher: async function (name) {
    try {
      const res = axiosClient.get('/data/casher/delete-casher', name)
      return res
    } catch (error) {
      return error
    }
  },
}

export default CacherService
