import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import 'element-ui/lib/theme-chalk/index.css'
import Element from 'element-ui'
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import request from '@/utils/request'
import '@/icons' // icon
import * as filters from './filters'
// 添加Vue实例方法
Vue.prototype.$post = request.post
Vue.prototype.$get = request.get
Vue.prototype.$put = request.put
Vue.prototype.$delete = request.delete
Vue.prototype.$login = request.login
// 自定义权限指令
Vue.directive('hasPermission', {
  bind: function(el, binding, vnode) {
    const permission = vnode.context.$store.state.account.permissions
    const value = binding.value
    let flag = true
    for (const v of value) {
      if (!permission.includes(v)) {
        flag = false
      }
    }
    if (!flag) {
      if (!el.parentNode) {
        el.style.display = 'none'
      } else {
        el.parentNode.removeChild(el)
      }
    }
  }
})
Vue.directive('hasNoPermission', {
  bind: function(el, binding, vnode) {
    const permission = vnode.context.$store.state.account.permissions
    const value = binding.value
    let flag = true
    for (const v of value) {
      if (permission.includes(v)) {
        flag = false
      }
    }
    if (!flag) {
      if (!el.parentNode) {
        el.style.display = 'none'
      } else {
        el.parentNode.removeChild(el)
      }
    }
  }
})
Vue.directive('hanAnyPermission', {
  bind: function(el, binding, vnode) {
    const permission = vnode.context.$store.state.account.permissions
    const value = binding.value
    let flag = false
    for (const v of value) {
      if (permission.includes(v)) {
        flag = true
      }
    }
    if (!flag) {
      if (!el.parentNode) {
        el.style.display = 'none'
      } else {
        el.parentNode.removeChild(el)
      }
    }
  }
})
// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
Vue.use(Element)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
