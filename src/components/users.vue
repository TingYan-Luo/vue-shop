<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <div class="card-header">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable
                  @change="searchUser">
          <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button>
        </el-input>
        <el-button type="primary" class="checkBtn" @click="addUser">添加用户</el-button>
      </div>
      <el-table
        :data="userList"
        border
        style="width: 100%"
        stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#dbdfe4"
              @change="stateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="userEdit(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" @click="userDelete(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-s-tools"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <el-dialog title="添加用户" :visible.sync="addVisible" width="30%">
      <el-form :model="addList" :rules="addListRules" label-width="100px" ref="addListRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addList.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addList.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addList.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addList.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCancel">取 消</el-button>
        <el-button type="primary" @click="addConfirm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑用户" :visible.sync="editVisible" width="30%">
      <el-form :model="editList" :rules="editListRules" label-width="100px" ref="editListRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editList.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editList.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editList.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCancel">取 消</el-button>
        <el-button type="primary" @click="editConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'users',
    created() {
      this.getUserList()
    },
    data() {
      // 自定义校验规则
      // 邮箱格式规则
      var checkEmail = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('邮箱不能为空'))
        }
        var emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        if (emailRegex.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确格式的邮箱地址'))
        }
      }
      // 手机号码规则
      var checkMobile = (rule, value, callback) => {
        if (!value) return callback(new Error('电话号码不能为空'))
        var mobileRegex = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
        if (mobileRegex.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确格式的电话号码'))
        }
      }
      return {
        // 获取用户数据的请求参数
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        // 用户数据列表
        userList: [],
        // 搜索框内容，双向绑定
        searchInput: '',
        // 总页码数
        total: 0,
        // 是否开启添加用户弹出框
        addVisible: false,
        // 添加用户表单数据
        addList: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 添加用户表单规则
        addListRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 是否开启编辑弹出框
        editVisible: false,
        // 编辑弹出框中的表单数据
        editList: {},
        // 编辑弹出框表单验证规则
        editListRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      // 获取用户列表方法
      async getUserList() {
        var {data: res} = await this.$http.get('users', {params: this.queryInfo})
        // console.log('获取用户列表：')
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.userList = res.data.users
        this.total = res.data.total
      },
      // 当分页器中的size改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        // 重新获取数据
        this.getUserList()
      },
      // 当当前页面数发生变化
      handleCurrentChange(newNum) {
        this.queryInfo.pagenum = newNum
        // 重新获取数据
        this.getUserList()
      },
      // 搜索功能
      searchUser() {
        this.getUserList()
      },
      // 添加用户
      addUser() {
        this.addVisible = true
      },
      addCancel() {
        this.$refs.addListRef.resetFields()
        // 关闭弹出框
        this.addVisible = false
      },
      async addConfirm() {
        // console.log(this.addList)
        this.$refs.addListRef.validate(valid => {
          // 当valid为false时，直接返回false阻止向下运行
          if (!valid) return false
        })
        // 当valid为true时，执行接下来的命令
        // 向后端发送添加用户请求
        var {data: res} = await this.$http.post('users', this.addList)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        // 如果响应码为201，则添加成功
        this.$message.success(res.meta.msg)
        // 清空表单
        this.$refs.addListRef.resetFields()
        // 退出弹出框
        this.addVisible = false
      },
      // 监听状态栏改变
      async stateChange(info) {
        // console.log(info)
        // 这个通过scope.row传递来的info数据就是table中整行的数据
        var {data: res} = await this.$http.put(`users/${info.id}/state/${info.mg_state}`)
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
      },
      // 编辑用户信息
      async userEdit(id) {
        // 打开编辑弹出框
        this.editVisible = true
        // 通过id查询出当前修改的用户数据
        var {data: res} = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editList = res.data
      },
      // 编辑用户框，点击取消
      editCancel() {
        // 重置表单
        this.$refs.editListRef.resetFields()
        // 关闭弹出框
        this.editVisible = false
      },
      // 编辑用户框，点击确认，提交
      editConfirm() {
        // console.log(this.editList)
        // 预验证
        this.$refs.editListRef.validate(async valid => {
          // 如果验证失败，则直接返回
          if (!valid) return false
          // 如果验证成功，则向后端发送请求修改数据  ------（注意这里必须要传递这种格式的参数）
          var {data: res} = await this.$http.put(`users/${this.editList.id}`, {
            email: this.editList.email, mobile: this.editList.mobile
          })
          // 返回消息提示
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          console.log(res)
          this.$message.success(res.meta.msg)
          // 清空表单数据
          this.$refs.editListRef.resetFields()
          // 退出弹出框
          this.editVisible = false
          // 重新获取用户信息，刷新页面
          this.getUserList()
        })
      },
      // 删除指定用户
      async userDelete(id) {
        // console.log(id)
        var isConfirm = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        if (isConfirm !== 'confirm') {
          this.$message({type: 'info', message: '已取消删除'})
        }
        // 点击确定按钮
        var {data: res} = await this.$http.delete('users/' + id)
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message({type: 'success', message: '删除成功!'})
      }
    }
  }
</script>

<style lang="less" scoped>

  .card-header {
    width: 100%;
    margin-bottom: 15px;

    .checkBtn {
      margin-left: 20px;
    }

    .input-with-select {
      width: 400px;
    }
  }

  .text {
    font-size: 14px;
  }
</style>
