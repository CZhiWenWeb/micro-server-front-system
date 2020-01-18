<template>
  <div style="padding:30px;">
    <div class="app-container">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-input v-model="name" placeholder="用户名" class="filter-item search-item" />
        </el-col>
        <el-col :span="4">
          <el-input v-model="dept" placeholder="部门" class="filter-item search-item" />
        </el-col>
        <el-col :span="4">
          <el-button @click="thisSearch">搜索</el-button>
        </el-col>
        <el-col :span="4">
          <el-button @click="thisClear">重置</el-button>
        </el-col>
        <el-col :span="4">
          <el-button v-if="batchDel" @click="batchDel">删除选中</el-button>
        </el-col>
        <el-col :span="4">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              更多操作<i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="addUser">添加</el-dropdown-item>
              <el-dropdown-item command="b">删除</el-dropdown-item>
              <el-dropdown-item command="c">取消操作</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
      <!--  :data将传入table的数据与currentPage，pagesize关联（.slice（start,end）返回数据中选定的元素）   -->
      <el-table
        ref="multipleTable"
        :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="show"
          type="selection"
          width="55"
        />
        <el-table-column
          label="用户名"
          prop="username"
        />
        <el-table-column
          label="性别"
          prop="sex"
        />
        <el-table-column
          label="邮箱"
          prop="email"
        />
        <el-table-column
          label="部门"
          prop="deptName"
        />
        <el-table-column
          label="状态"
          prop="status"
        />
        <el-table-column
          label="创建时间"
          prop="createTime"
          sortable="custom"
        />
        <el-table-column
          align="right"
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleView()"
            >View</el-button>
            <el-button
              size="mini"
              @click="handleEdit(scope.$index,scope.row)"
            >Edit</el-button>
            <el-button
              size="mini"
              @click="handleDel(scope.$index+(currentPage-1)*pagesize)"
            >Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        :page-size="pagesize"
        :current-page="currentPage"
        layout="total, prev, pager, next"
        :total="tableData.length"
        prev-text="上一页"
        next-text="下一页"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!--  对话框,使用组件edit，通过自定义事件接受子组件传递的参数  -->
    <Edit
      :dialog-form-visible="isVisible"
      :dialog-title="dialogTitle"
      @close="changVisible"
    />
    <router-view />
  </div>
</template>
<script>
import Edit from './edit'
export default {
  components: { Edit },
  data() {
    return {
      name: '',
      dept: '',
      // 存放table展示数据
      tableData: [],
      search: '',
      currentPage: 1,
      pagesize: 5,
      batchDel: false,
      // 存放后台数据
      cTableData: [],
      // 存放selections
      multipleSelection: [],
      show: false,
      isVisible: false,
      dialogTitle: ''
    }
  },
  // 生命周期函数中使用异步请求可能导致在该生命周期内请求不能完成，导致后续使用为空
  mounted: function() {
    this.$get(`system/user`)
      .then(res => {
        this.cTableData = res.data.data.rows
        console.log(res.data.data.rows)
        this.tableData = this.cTableData.filter(data => !this.search || data.name.toLowerCase()
          .includes(this.search.toLowerCase()))
        console.log(this.tableData)
      }).catch(e => {
        this.$message({
          type: 'error',
          message: '获取用户列表失败'
        })
        console.log(e)
      })
  },
  methods: {
    thisSearch() {
      this.$message('search')
    },
    thisClear() {
      this.name = ''
      this.dept = ''
      this.$message('clear')
    },
    // index当前分页list中的下标，row为该行数据
    handleEdit(index, row) {
      this.dialogFormVisible = true
      this.dialogTitle = '编辑'
      console.log(index)
      console.log(row)
    },
    handleDel(index) {
      this.tableData.splice(index, 1)
    },
    handleView() {

    },
    // 初始也currentPage,初始每页数据pagesize和数据data
    handleSizeChange: function(size) {
      this.pagesize = size
    },
    // 点击第几页
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage
    },
    searchChange: function() {
      this.tableData = this.cTableData.filter(data => !this.search || data.name.toLowerCase()
        .includes(this.search.toLowerCase()))
      console.log(this.tableData)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      console.log(this.multipleSelection)
    },
    handleCommand(command) {
      this.show = command === 'b'
      this.batchDel = command === 'b'
      console.log(this.show)
    },
    addUser: function() {
      this.isVisible = true
      this.dialogTitle = '添加用户'
    },
    changVisible(data) {
      console.log('changeVisible')
      this.isVisible = data
    }
  }
}
</script>
