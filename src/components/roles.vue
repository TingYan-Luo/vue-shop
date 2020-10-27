<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-button type="primary" @click="addRole">添加角色</el-button>
      <el-table :data="roleList" stripe border style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <div class="demo-table-expand">
              <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id"
                      :class="['bottomBorder', index1 === 0 ? 'topBorder':'']">
                <!--                渲染第一级权限-->
                <el-col :span="5">
                  <el-tag closable @close="deleteRight(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <el-row v-for="(item2, index2) in item1.children" :key="item2.id"
                          :class="[index2 === 0 ? '':'topBorder']">
                    <!--                    渲染第二级权限-->
                    <el-col :span="6">
                      <el-tag type="success" closable @close="deleteRight(scope.row, item2.id)">{{item2.authName}}
                      </el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-row>
                        <!--                        渲染第三季权限-->
                        <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable
                                @close="deleteRight(scope.row, item3.id)">{{item3.authName}}
                        </el-tag>
                      </el-row>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="level">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-tools" @click="setRight(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="添加角色" :visible.sync="addVisible" width="30%">
      <el-form :model="addForm" :rules="addFormRules" label-width="100px" ref="addFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCancel">取 消</el-button>
        <el-button type="primary" @click="addConfirm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑角色" :visible.sync="editVisible" width="30%">
      <el-form :model="editForm" :rules="addFormRules" label-width="100px" ref="editFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCancel">取 消</el-button>
        <el-button type="primary" @click="editConfirm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="分配权限" :visible.sync="setRightVisible" width="30%" @close="closeSetRight">
      <el-tree :data="setRightList" :props="setRightProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="checkRightList" ref="setRightRef"></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setCancel">取 消</el-button>
        <el-button type="primary" @click="setConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'roles',
    data() {
      return {
        // 角色列表
        roleList: [],
        // 添加角色弹出框是否开启
        addVisible: false,
        // 添加角色表单数据
        addForm: {
          roleName: '',
          roleDesc: ''
        },
        // 添加角色表单数据的验证规则
        addFormRules: {
          roleName: [
            {required: true, message: '请输入角色名', trigger: 'blur'}
          ]
        },
        // 编辑角色弹出框是否开启
        editVisible: false,
        // 编辑角色表单数据
        editForm: {},
        // 分配权限弹出框是否开启
        setRightVisible: false,
        // 分配权限树形数据
        setRightList: [],
        setRightProps: {
          children: 'children',
          label: 'authName'
        },
        // 复选框选中的权限数据id的数组
        checkRightList: [],
        // 存储当前用户id
        setRoleId: ''
      }
    },
    created() {
      this.getRoleList()
    },
    methods: {
      async getRoleList() {
        var {data: res} = await this.$http.get('roles')
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.roleList = res.data
      },
      // 添加角色
      addRole() {
        // 打开弹出框表单
        this.addVisible = true
      },
      // 添加角色-取消
      addCancel() {
        // 重置表单
        this.$refs.addFormRef.resetFields()
        // 关闭弹出框
        this.addVisible = false
      },
      // 添加角色-确定
      async addConfirm() {
        // console.log(this.addForm)
        // 预验证
        this.$refs.addFormRef.validate(valid => {
          if (valid) return false
        })
        // 验证通过，则向后短发送请求，添加角色
        var {data: res} = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        // 如果验证码为201，则添加成功
        this.$message.success(res.meta.msg)
        // 重置表单
        this.$refs.addFormRef.resetFields()
        // 关闭弹出框
        this.addVisible = false
        // 重新获取角色列表刷新页面
        this.getRoleList()
      },
      // 编辑角色
      async editRole(id) {
        // console.log(id)
        // 根据id获取当前要编辑的角色数据
        var {data: res} = await this.$http.get('roles/' + id)
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editForm = res.data
        // 打开弹出框
        this.editVisible = true
      },
      editCancel() {
        // 重置表单
        this.$refs.editFormRef.resetFields()
        // 关闭弹出框
        this.editVisible = false
      },
      async editConfirm() {
        console.log(this.editForm)
        // 提交之前进行预验证
        this.$refs.editFormRef.validate(valid => {
          console.log(valid)
          if (!valid) return false
        })
        // 验证通过
        var {data: res} = await this.$http.put('roles/' + this.editForm.roleId, this.editForm)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 提交成功
        this.$message.success('编辑成功！')
        this.editCancel()
        // 重新获取角色列表
        this.getRoleList()
      },
      // 删除角色
      async deleteRole(id) {
        // console.log(id)
        var {data: res} = await this.$http.delete('roles/' + id)
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 提交成功
        this.$message.success(res.meta.msg)
        // 重新获取角色列表
        this.getRoleList()
      },
      // 点击tag的叉号关闭tag触发删除权限
      async deleteRight(role, id) {
        // 弹出确认框
        var isConfirm = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        if (isConfirm !== 'confirm') return this.$message.error('已取消删除')
        var {data: res} = await this.$http.delete(`roles/${role.id}/rights/${id}`)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 提交成功
        this.$message.success(res.meta.msg)
        // 重新获取当前角色的权限
        role.children = res.data
      },
      // 点击分配权限按钮，打开为角色分配权限对话框
      async setRight(role) {
        // 通过向后端发送请求，获取到所有权限列表，且是tree形式的
        var {data: res} = await this.$http.get('rights/tree')
        // console.log(res)
        this.setRightList = res.data
        this.getRightArray(role, this.checkRightList)
        // 将当前用户的id存储到公共数据中
        this.setRoleId = role.id
        // 将默认勾选的数组数据赋值
        this.setRightVisible = true
      },
      // 当关闭分配权限弹出框时
      closeSetRight() {
        // 清空默认勾选权限数组
        this.checkRightList = []
      },
      // 取消分配权限
      setCancel() {
        this.setRightVisible = false
      },
      // 确定提交分配好的权限
      async setConfirm() {
        // 获取到当前tree中勾选好的权限id的数组
        var checked = [
          ...this.$refs.setRightRef.getCheckedKeys(),
          ...this.$refs.setRightRef.getHalfCheckedKeys()
        ]
        // 由于后端发送需要用string，所以进行拼接
        var keys = checked.join(',')
        // console.log(keys)
        // 将数组发送给后端
         var {data: res} = await this.$http.post(`roles/${this.setRoleId}/rights`, {
          rids: keys
        })
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 提交成功
        this.$message.success(res.meta.msg)
        // 关闭弹出框
        this.setRightVisible = false
        // 重新获取数据
        this.getRoleList()
      },
      // 递归的方式，将某个角色拥有的权限id添加到数组中
      getRightArray(role, arr) {
        // 我们只需要添加第三级权限，意味着整个role没有children属性
        if (!role.children) {
          return arr.push(role.id)
        }
        // 否则将role的children的每一个role传递进本方法进行递归
        role.children.forEach(item => {
          this.getRightArray(item, arr)
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-button {
    margin-bottom: 15px;
  }

  .demo-table-expand {
    line-height: 20px;
    font-size: 14px;
  }

  .topBorder {
    border-top: 1px solid #EEEEEE;
  }

  .bottomBorder {
    border-bottom: 1px solid #EEEEEE;
  }

  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
</style>
