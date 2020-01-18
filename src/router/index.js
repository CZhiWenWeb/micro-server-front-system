import Vue from 'vue'
import Router from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import db from '@/utils/localstorage'
import request from '@/utils/request'
import store from '@/store/index'
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  {
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'Example',
    meta: { title: 'Example', icon: 'example' },
    children: [
      {
        path: 'table',
        name: 'Table',
        component: () => import('@/views/table/index'),
        meta: { title: 'Table', icon: 'table' }
      },
      {
        path: 'tree',
        name: 'Tree',
        component: () => import('@/views/tree/index'),
        meta: { title: 'Tree', icon: 'tree' }
      }
    ]
  },

  {
    path: '/form',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Form',
        component: () => import('@/views/form/index'),
        meta: { title: 'Form', icon: 'form' }
      }
    ]
  },
  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1',
    name: 'Nested',
    meta: {
      title: 'Nested',
      icon: 'nested'
    },
    children: [
      {
        path: 'menu1',
        component: () => import('@/views/nested/menu1/index'), // Parent router-view
        name: 'Menu1',
        meta: { title: 'Menu1' },
        children: [
          {
            path: 'menu1-1',
            component: () => import('@/views/nested/menu1/menu1-1'),
            name: 'Menu1-1',
            meta: { title: 'Menu1-1' }
          },
          {
            path: 'menu1-2',
            component: () => import('@/views/nested/menu1/menu1-2'),
            name: 'Menu1-2',
            meta: { title: 'Menu1-2' },
            children: [
              {
                path: 'menu1-2-1',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                name: 'Menu1-2-1',
                meta: { title: 'Menu1-2-1' }
              },
              {
                path: 'menu1-2-2',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                name: 'Menu1-2-2',
                meta: { title: 'Menu1-2-2' }
              }
            ]
          },
          {
            path: 'menu1-3',
            component: () => import('@/views/nested/menu1/menu1-3'),
            name: 'Menu1-3',
            meta: { title: 'Menu1-3' }
          }
        ]
      },
      {
        path: 'menu2',
        component: () => import('@/views/nested/menu2/index'),
        meta: { title: 'menu2' }
      }
    ]
  },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

const whiteList = ['/login']

let asyncRouter
// 导航守卫，渲染动态路由
// to: Route:即将要进入的目标路由对象   from: Route 当前导航正要离开的路由
// next: Function:一定要调用该方法来resolve这个钩子，执行效果依赖next方法的参数
// next()：如果钩子执行完了，则导航状态就是confirmed next(false):中断当前的导航，如
// 果浏览器的URL改变了（可能是用户手动改或者浏览器后退按钮），那么URL地址会重置到from
// 路由对应的地址  next('/'): 跳转到一个不同的地址，当前的导航被中断，然后进行一个新
// 的导航，你可以向next传递任意位子对象 next(error): 如果终止且错误会被传递给
// router.onError()注册过的回调
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (whiteList.indexOf(to.path) !== -1) {
    next()
  } else {
    console.log(`触发导航,to:${to.path}--from:${from.path}`)
    const token = db.get('ACCESS_TOKEN')
    const user = db.get('USER')
    const userRouter = get('USER_ROUTER')
    if (token.length && user) {
      if (!asyncRouter) {
        if (!userRouter) {
          request.get(`system/menu/${user.username}`).then(res => {
            const permissions = res.data.data.permissions
            store.commit('account/setPermissions', permissions)
            asyncRouter = res.data.data.routes
            store.commit('account/setRoutes', asyncRouter)
            save('USER_ROUTER', asyncRouter)
            go(to, next)
          })
        } else {
          asyncRouter = userRouter
          go(to, next)
        }
      } else {
        next()
      }
    } else {
      next('/login')
    }
  }
})
router.afterEach(() => {
  NProgress.done()
})
// 构建routes
function filterAsyncRouter(routes) {
  return routes.filter((route) => {
    const component = route.component
    if (component) {
      if (route.component === 'Layout') {
        route.component = Layout
      } else {
        route.component = view(component)
      }
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children)
      }
      return true
    }
  })
}
function view(path) {
  return function(resolve) {
    import(`@/views/${path}.vue`).then(mod => {
      resolve(mod)
    })
  }
}
function go(to, next) {
  asyncRouter = filterAsyncRouter(asyncRouter)
  router.addRoutes(asyncRouter)
  // routes是非响应的，addRoutes后menu不会改变，用以下方式手动刷新;因为404必须放置在最后，所以用asyncRouter去连接routes
  router.options.routes = asyncRouter.concat(router.options.routes)
  next({ ...to, replace: true })
}
function save(name, data) {
  localStorage.setItem(name, JSON.stringify(data))
}

function get(name) {
  return JSON.parse(localStorage.getItem(name))
}
export default router
