// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus' // 结合 Element Plus 做错误提示

// 1. 创建 axios 实例
const service = axios.create({
  baseURL: '/api', // 你的后端接口基础地址
  timeout: 5000 // 请求超时时间
})

// 2. 请求拦截器 (Request Interceptor)
// 发送请求前做些什么，比如携带 Token
service.interceptors.request.use(
  config => {
    // 假设你的 token 存在 localStorage 中
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器 (Response Interceptor)
// 接收响应后做些什么，比如统一处理错误码
service.interceptors.response.use(
  response => {
    const res = response.data
    console.log('res:', res)
    // 假设后端返回格式为 { code: 200, data: [...], message: "success" }
    if (res.code !== 200) {
      ElMessage.error(res.message || '系统错误')
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res.data // 直接返回核心数据，组件里不用再解构 res.data.data
    }
  },
  error => {
    // 处理 HTTP 网络错误 (如 401, 404, 500)
    let message = ''
    if (error.response && error.response.status) {
      switch (error.response.status) {
        case 401:
          message = 'Token 过期，请重新登录'
          // 这里可以加上跳转登录页的逻辑
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器端出错'
          break
        default:
          message = '网络请求错误'
      }
    } else {
      message = '网络连接异常'
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service