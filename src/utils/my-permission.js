// // 自定义权限控制指令,包含列出的所有权限才显示
// export const hasPermission = {
//   install(Vue) {
//     Vue.directive('hasPermission', {
//       bind: function(el, binding, vnode) {
//         const permission = vnode.context.$store.state.permissions
//         const value = binding.value
//         let flag = true
//         for (const v of value) {
//           if (!permission.includes(v)) {
//             flag = false
//           }
//         }
//         if (!flag) {
//           if (!el.parentNode) {
//             el.style.display = 'none'
//           } else {
//             el.parentNode.removeChild(el)
//           }
//         }
//       }
//     })
//   }
// }
// // 当不包含列出权限时显示
// export const hasNoPermission = {
//   install(Vue) {
//     Vue.directive('hasNoPermission', {
//       bind: function(el, binding, vnode) {
//         const permission = vnode.context.$store.state.permissions
//         const value = binding.value
//         let flag = true
//         for (const v of value) {
//           if (permission.includes(v)) {
//             flag = false
//           }
//         }
//         if (!flag) {
//           if (!el.parentNode) {
//             el.style.display = 'none'
//           } else {
//             el.parentNode.removeChild(el)
//           }
//         }
//       }
//     })
//   }
// }
//
// // 当包含任意列出权限时显示
// export const hasAnyPermission = {
//   install(Vue) {
//     Vue.directive('hanAnyPermission', {
//       bind: function(el, binding, vnode) {
//         const permission = vnode.context.$store.state.permissions
//         const value = binding.value
//         let flag = false
//         for (const v of value) {
//           if (permission.includes(v)) {
//             flag = true
//           }
//         }
//         if (!flag) {
//           if (!el.parentNode) {
//             el.style.display = 'none'
//           } else {
//             el.parentNode.removeChild(el)
//           }
//         }
//       }
//     })
//   } }
//
