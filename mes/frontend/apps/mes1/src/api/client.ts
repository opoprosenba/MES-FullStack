import axios from 'axios'
import qs from 'qs'
import { message } from 'antd'

const client = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : '',
  withCredentials: true,
})

// Request interceptor: form-encode POST/PUT data, add AJAX header
client.interceptors.request.use((config) => {
  // Mark as AJAX so backend returns JSON on errors
  config.headers['X-Requested-With'] = 'XMLHttpRequest'
  if (config.method === 'post' || config.method === 'put') {
    const hasContentType =
      config.headers?.['Content-Type'] || config.headers?.['content-type']
    if (!hasContentType && config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
      config.data = qs.stringify(config.data, { skipNulls: false })
    }
  }
  return config
})

// Response interceptor: unwrap backend Result<T> wrapper
client.interceptors.response.use(
  (response) => {
    const res = response.data as { code: number; data: unknown; msg: string }
    if (res.code !== 0) {
      message.error(res.msg || '操作失败')
      return Promise.reject(response)
    }
    return res.data as any
  },
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    } else if (error.response?.data?.msg) {
      message.error(error.response.data.msg)
    } else {
      message.error(error.message || '请求失败')
    }
    return Promise.reject(error)
  },
)

export default client
