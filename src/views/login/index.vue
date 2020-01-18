<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">Ms Cloud系统登入</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="off"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="passwordType"
          ref="password"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          auto-complete="off"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      <el-form-item>
        <el-input
          ref="code"
          v-model="loginForm.code"
          :placeholder="'验证码'"
          type="text"
          tabindex="3"
          name="code"
          auto-complete="off"
          @keyup.enter.native="handleLogin"
        />
      </el-form-item>
      <img :src="imageCode" alt="codeImage" @click="getCodeImage">
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">Login</el-button>

      <div class="tips">
        <span style="margin-right:20px;">测试账号: MrBird</span>
        <span> 密码: 1234qwer</span>
      </div>

    </el-form>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import db from '@/utils/localstorage'
import axios from 'axios'
import { getKey } from '@/utils/index'
import { getToken, getRefreshToken, getExpireTime } from '@/utils/auth'
export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: 'MrBird',
        password: '1234qwer',
        code: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      codeUrl: `auth/captcha`,
      codeKey: getKey(),
      imageCode: ''
    }
  },
  // watch: {
  //   $route: {
  //     handler: function(route) {
  //       this.redirect = route.query && route.query.redirect
  //     },
  //     immediate: true
  //   }
  // },
  // 创建vm.$el 并用其替换 "el"
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  // 创建vm.$el 并用其替换 "el"
  mounted() {
    db.clear()
    this.getCodeImage()
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    // 不能删，删了el-input不能输入
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      if (this.loginForm.username && this.loginForm.password && this.loginForm.code) {
        this.loading = true
        this.$login(`auth/oauth/token`, {
          ...this.loginForm,
          key: this.codeKey
        }).then(res => {
          const data = res.data
          // 存储token以及过期时间
          this.$store.commit('account/setAccessToken', data.access_token)
          this.$store.commit('account/setRefreshToken', data.refresh_token)
          const current = new Date()
          const expiresTime = current.setTime(current.getTime() + 1000 * data.expires_in)
          console.log(`存储的db信息：${getToken()}--${getRefreshToken()}--${getExpireTime()}`)
          this.$store.commit('account/setExpiresTime', expiresTime)
          //  获取用户信息
          this.getUserDetailInfo()
        }).catch(e => {
          console.log(`login error:${e}`)
          this.loading = false
          this.getCodeImage()
        })
      } else {
        this.$message({
          message: `参数不对`,
          type: 'error'
        })
      }
    },
    getUserDetailInfo() {
      this.$get(`auth/user`)
        .then(res => {
          this.$store.commit('account/setUser', res.data.principal)
          this.$message({
            message: '获取用户信息成功',
            type: 'success'
          })
          this.loading = false
          console.log(`获取用户信息成功`)
          this.$router.push('/')
        }).catch(e => {
          this.$message({
            message: '获取用户信息失败',
            type: 'error'
          })
          console.log(`获取用户信息失败：${e}`)
          this.loading = false
        })
    },
    getCodeImage() {
      // 获取验证码不需要触发拦截器
      axios({
        methods: 'GET',
        url: `${this.codeUrl}?key=${this.codeKey}`,
        responseType: 'arraybuffer'
      }).then(res => {
        return 'data:image/png;base64,' + btoa(
          new Uint8Array(res.data)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        )
      }).then((res) => {
        this.imageCode = res
      }).catch(() => {
        this.$message({
          message: '图片加载失败',
          type: 'error'
        })
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
