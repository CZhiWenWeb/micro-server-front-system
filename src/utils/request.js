// 通过Vue.prototype将以下方法添加为Vue实例方法
import axios from 'axios'
import { Message } from 'element-ui'
import { authorizationValue } from '@/settings'
import store from '@/store/index'
import { getToken, getRefreshToken, getExpireTime } from '@/utils/auth'

const requestTimeOut = 10 * 1000
const success = 200
const checkRegion = 5 * 60 * 1000
const messageDuration = 5 * 1000
axios.defaults.baseURL = 'http://192.168.15.192:8301/'
// 请求对象
const service = axios.create({
  timeout: requestTimeOut,
  responseType: 'json',
  validateStatus(status) {
    return status === success
  }
})
// 拦截器：在请求发送前判断令牌过期时间和当前时间间隔是否小于5分钟
service.interceptors.request.use(
  config => {
    let _config = config
    try {
      const expireTime = getExpireTime()
      if (expireTime) {
        const left = expireTime - new Date().getTime()
        const refreshToken = getRefreshToken()
        if (left < checkRegion && refreshToken) {
          _config = queryRefreshToken(_config, refreshToken)
        } else {
          if (getToken()) {
            _config.headers['Authorization'] = 'bearer' + getToken()
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
    return _config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  config => {
    return config
  },
  error => {
    if (error.response) {
      const errorMessage = error.response.data === null ? '系统异常' : error.response.data.message
      switch (error.response.status) {
        case 404:
          Message({
            message: '资源未找到',
            type: 'error',
            duration: messageDuration
          })
          break
        case 403:
          Message({
            message: '无操作权限',
            type: 'error',
            duration: messageDuration
          })
          break
        case 401:
          Message({
            message: '认证失效，请重新登入',
            type: 'error',
            duration: messageDuration
          })
          break
        default:
          Message({
            message: errorMessage,
            type: 'error',
            duration: messageDuration
          })
          break
      }
    }
    return Promise.reject(error)
  }
)

const request = {
  refresh(url, params) {
    params['grant_type'] = 'refresh_token'
    return service.post(url, params, {
      transformRequest: [params => {
        return tansParams(params)
      }],
      headers: { 'Authorization': authorizationValue, 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  login(url, params) {
    params['grant_type'] = 'password'
    return service.post(url, params, {
      transformRequest: [params => {
        return tansParams(params)
      }],
      headers: { 'Authorization': authorizationValue, 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  post(url, params) {
    return service.post(url, params, {
      transformRequest: [params => {
        return tansParams(params)
      }],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  put(url, params) {
    return service.put(url, params, {
      transformRequest: [params => {
        return tansParams(params)
      }],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  get(url, params) {
    params = checkParams(params)
    return service.get(`${url}${params}`)
  },
  delete(url, params) {
    params = checkParams(params)
    return service.delete(`${url}${params}`)
  }
}

function checkParams(params) {
  if (Object.is(params, undefined)) {
    params = ''
  } else {
    params = '?'
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key] !== null) {
        params += `${key}=${params[key]}&`
      }
    }
  }
  return params
}
// 异步刷新token
async function queryRefreshToken(config, refreshToken) {
  const result = await request.refresh('auth/oauth/token', {
    refresh_token: refreshToken
  })
  if (result.status === success) {
    saveData(result.data)
    config.headers['Authorization'] = 'bearer' + getToken()
  }
  return config
}

function saveData(data) {
  store.commit('account/setAccessToken', data.access_token)
  store.commit('account/setRefreshToken', data.refresh_token)
  const current = new Date()
  const expireTime = current.setTime(current.getTime() + 1000 * data.expires_in)
  store.commit('account/setExpireTime', expireTime)
}
// 将{username:**;password:**}转换&连接
function tansParams(params) {
  let result = ''
  Object.keys(params).forEach(key => {
    if (!Object.is(params[key], undefined) && !Object.is(params[key], null)) {
      result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
    }
  })
  return result
}
export default request

