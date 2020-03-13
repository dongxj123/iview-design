import axios from '@/libs/api.request'
import { getToken } from '@/libs/util'
export const getRouterReq = (access) => {
  return axios.request({
    url: 'get_router',
    params: {
      access
    },
    method: 'get'
  })
}
export const getDepts = () => {
  return axios.request({
    headers: { 'Authorization': getToken() },
    url: '/sys/depts',
    method: 'get'
  })
}