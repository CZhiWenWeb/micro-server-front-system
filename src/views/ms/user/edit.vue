<template>
  <!--   添加用户对话框   -->
  <el-dialog :title="dialogTitle" :visible.sync="visible">
    <el-form ref="form" v-loading="loading" :model="form">
      <el-form-item label="头像" label-width="120px">
        <el-upload
          class="avatar-uploader"
          action="http://192.168.15.192:8301/system/user/avatar"
          :headers="headers"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="form.avatar" :src="form.avatar" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
      </el-form-item>
      <el-form-item label="用户名" label-width="120px"><el-input v-model="form.username" /></el-form-item>
      <el-form-item label="密码" label-width="120px"><el-input v-model="form.password" /></el-form-item>
      <el-form-item label="邮箱" label-width="120px"><el-input v-model="form.email" /></el-form-item>
      <el-form-item label="电话" label-width="120px"><el-input v-model="form.mobile" /></el-form-item>
      <el-form-item label="部门" label-width="120px">
        <div class="block">
          <el-cascader
            ref="casDept"
            v-model="form.deptId"
            :options="deptOptions"
            :props="{expandTrigger:'hover'}"
            @change="formDeptChange"
          />
        </div>
      </el-form-item>
      <el-form-item label="角色" label-width="120px">
        <!--       参考select选择器 创建条目     -->
        <el-select v-model="form.roleId" multiple placeholder="请选择角色">
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.roleName"
            :value="item.roleId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="性别" label-width="120px">
        <template>
          <el-radio v-model="form.sex" label="0">男</el-radio>
          <el-radio v-model="form.sex" label="1">女</el-radio>
        </template>
      </el-form-item>
      <el-form-item label="状态" label-width="120px">
        <template>
          <el-radio v-model="form.status" label="1">有效</el-radio>
          <el-radio v-model="form.status" label="0">禁用</el-radio>
        </template>
      </el-form-item>
      <el-form-item label="描述" label-width="120px">
        <el-input v-model="form.description" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="emitToParent">取消</el-button>
      <el-button type="primary" @click="formCommit">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getToken } from '@/utils/auth'
import axios from 'axios'
export default {
  name: 'Edit',
  props: {
    dialogFormVisible: {
      type: Boolean,
      default: false
    },
    dialogTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: this.initForm(),
      //  部门列表
      deptOptions: [],
      //  角色列表
      roleOptions: [],
      loading: '',
      visible: false,
      headers: ''
    }
  },
  watch: {
    dialogFormVisible: function() {
      this.visible = this.dialogFormVisible
    }
  },
  mounted() {
    this.loading = true
    axios.all([
      this.getDepts(),
      this.getRoles()
    ]).then(axios.spread((resDepts, resRoles) => {
      this.deptOptions = resDepts.data.data.rows
      console.log(this.deptOptions)
      this.roleOptions = resRoles.data.data
      this.loading = false
    })).catch(() => {
      this.loading = false
      this.dialogFormVisible = false
      this.$message({
        message: '系统异常',
        type: 'error'
      })
    })
    // 初始化上传图片的请求头部
    this.headers = {
      Authorization: 'bearer' + getToken()
    }
  },
  methods: {
    initForm() {
      return {
        username: '',
        password: '',
        sex: '',
        deptId: [],
        email: '',
        status: '',
        roleId: [],
        mobile: '',
        description: '',
        avatar: ''
      }
    },
    formCommit() {
      console.log(this.form)
      if (this.form.roleId) { this.form.roleId = this.form.roleId.join(',') }
      this.$post(`system/user`, { ...this.form }).then(() => {
        this.$message({
          message: '添加成功',
          type: 'success'
        })
      }).catch(() => {
        this.$message({
          message: '添加失败',
          type: 'error'
        })
        this.dialogFormVisible = false
      })
    },
    formDeptChange(value) {
      this.form.deptId = this.form.deptId.slice(-1)
    },
    getDepts() {
      return this.$get(`system/dept`)
    },
    getRoles() {
      return this.$get(`system/role/options`)
    },
    // 子组件通过事件向父组件传值，this.$emit(p1,p2)p1为父组件事件名，p2为值
    emitToParent() {
      console.log('emit')
      this.$emit('close', false)
    },
    handleAvatarSuccess(res, file) {
      this.form.avatar = URL.createObjectURL(file.raw)
      console.log(this.form.avatar)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
  }
}
</script>

<style scoped>

</style>
