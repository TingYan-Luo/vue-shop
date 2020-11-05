<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>
      <div style="margin: 15px 0px">
        选择商品分类：
        <el-cascader
          v-model="categoryData"
          :options="categoryList"
          :props="categoryListProps"
          width="300px"></el-cascader>
      </div>
      <!--      标签页-->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" style="margin-bottom: 15px" :disabled="isAdd" @click="addParams">添加参数</el-button>
          <el-table
            :data="tableData"
            border
            stripe
            style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" :closable="true"
                        @close="closeTag(scope.row, index)">{{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="editParams(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" style="margin-bottom: 15px" @click="addParams">添加参数</el-button>
          <el-table
            :data="tableData"
            border
            stripe
            style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" :closable="true"
                        @close="closeTag(scope.row, index)">{{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="editParams(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!--    弹出框-->
    <el-dialog :title="isEdit+ addTitle" :visible.sync="addVisible" width="30%" @close="addClose">
      <el-form :model="addForm" :rules="addFormRules" label-width="100px" ref="addFormRef">
        <el-form-item :label="addTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCancel">取 消</el-button>
        <el-button type="primary" @click="addConfirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'params',
    data() {
      return {
        // 级联选择框，选择的数据
        categoryData: [],
        // 级联选择框，列表数据
        categoryList: [],
        categoryListProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name'
        },
        // 当前的标签页名字
        activeName: 'many',
        // 表格数据
        tableData: [],
        // 动态编辑标签
        // inputVisible: false,
        // inputValue: '',
        // 添加属性-弹出框
        isEdit: '',
        addVisible: false,
        addForm: {
          attr_name: '',
          attr_sel: this.activeName,
          attr_vals: ''
        },
        addFormRules: {
          attr_name: [
            {required: true, message: '请输入分类名', trigger: 'blur'},
            {min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur'}
          ]
        },
        editParamId: 0
      }
    },
    created() {
      this.getCategoryList()
    },
    methods: {
      // 获取商品分类信息数据
      async getCategoryList() {
        var {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // console.log(res)
        this.categoryList = res.data
      },
      // 点击标签页换页时触发的事件：重新获取表格数据
      async handleClick() {
        this.tableData = await this.getParams()
      },
      // 获取参数属性
      async getParams() {
        // 先判断categoryData，商品分类是否选择
        if (this.categoryData.length === 0) {
          // 说明没有选择，则直接返回空数组
          return []
        }
        // 如果不为0，则代表我们选择了商品分类
        // 向后端发送请求，获取选择的商品分类的参数属性
        var {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: this.activeName
          }
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 将res.data中的每一项的attr_vals值转化为数组
        res.data.forEach(item => {
          // 判断值是否为空
          /* if (item.attr_vals.trim() === '') {
            return
          } */
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 为每一个参数项添加一个独有的属性，用户区分el-input的显式和数据绑定
          item.inputVisible = false
          item.inputValue = ''
        })
        // console.log(res.data)
        return res.data
      },
      // 添加参数功能
      addParams() {
        // 判断当前是哪个标签页
        // console.log(this.activeName)
        this.isEdit = '添加'
        this.addForm.attr_sel = this.activeName
        this.addVisible = true
      },
      // 编辑功能
      async editParams(param) {
        this.isEdit = '编辑'
        // 根据id查询到当前修改的分类参数
        // console.log(param.attr_id)
        var {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${param.attr_id}`, {
          params: {
            attr_sel: this.activeName
          }
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // console.log(res)
        this.addForm.attr_name = res.data.attr_name
        this.addForm.attr_sel = res.data.attr_sel
        this.addForm.attr_vals = res.data.attr_vals
        this.editParamId = param.attr_id
        this.addVisible = true
      },
      // 参数弹出框取消
      addCancel() {
        this.addVisible = false
      },
      // 参数确定-提交参数
      async addConfirm() {
        // 验证表单
        this.$refs.addFormRef.validate(valid => {
          if (!valid) return false
        })
        if (this.isEdit === '添加') {
          // 添加操作
          // 向后端发送请求，添加属性
          var {data: resAdd} = await this.$http.post(`categories/${this.cateId}/attributes`, this.addForm)
          // console.log(resAdd)
          if (resAdd.meta.status !== 201) return this.$message.error(resAdd.meta.msg)
          this.$message.success(resAdd.meta.msg)
        } else if (this.isEdit === '编辑') {
          // console.log(this.addForm)
          // 想后端发送亲贵，编辑属性
          var {data: resEdit} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamId}`, this.addForm)
          // console.log(resEdit)
          if (resEdit.meta.status !== 200) return this.$message.error(resEdit.meta.msg)
          this.$message.success(resEdit.meta.msg)
        }
        // 重新获取数据
        this.tableData = await this.getParams()
        this.addVisible = false
      },
      // 弹出框关闭事件
      addClose() {
        // 重置表单
        this.$refs.addFormRef.clearValidate()
        this.addForm.attr_name = ''
        this.addForm.attr_sel = this.activeName
        this.addForm.attr_vals = ''
      },
      // 删除功能
      async deleteParams(id) {
        // 弹出提示框
        var isConfirm = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          showCancelButton: true
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
        // console.log(isConfirm)
        if (isConfirm !== 'confirm') {
          return false
        }
        // console.log(id)
        // 发送删除请求
        var {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        // 重新获取表格数据
        this.tableData = await this.getParams()
      },
      // 动态编辑标签输入-添加标签
      handleInputConfirm(param) {
        const inputValue = param.inputValue
        if (inputValue) {
          param.attr_vals.push(inputValue)
        }
        // console.log(this.cateId)
        this.saveTag(param)
        param.inputVisible = false
        param.inputValue = ''
        // 不需要冲洗获取数据，因为在scope.row.inputValue中已经存储了新增的数据
      },
      showInput(scope) {
        // console.log(scope.row)
        scope.row.inputVisible = true
        this.$nextTick(_ => {
          // 文本框自动获取焦点
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      // 关闭tag-删除标签
      closeTag(param, index) {
        // console.log(param)
        // console.log(index)
        // 删除inputValue中的第index个数据
        param.attr_vals.splice(index, 1)
        // 同时向后端发起请求，删除标签
        this.saveTag(param)
      },
      // 提交对标签的编辑操作-添加，删除
      async saveTag(param) {
        // 向后端发送请求，添加标签
        var {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${param.attr_id}`, {
          attr_name: param.attr_name,
          attr_sel: param.attr_sel,
          attr_vals: param.attr_vals.join(' ')
        })
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
      }
    },
    computed: {
      isAdd: function () {
        // 判断分类id是否存在
        if (this.categoryData.length === 3) {
          return false
        }
        return true
      },
      // 当前分类的id
      cateId: function () {
        return this.categoryData[this.categoryData.length - 1]
      },
      addTitle: function () {
        if (this.activeName === 'only') {
          return '静态参数'
        }
        return '动态参数'
      }
    },
    watch: {
      // 监控分类数据是否变化
      categoryData: async function () {
        // 通过分类id获取表格数据
        this.tableData = await this.getParams()
      }
    }
  }
</script>

<style scoped>
  .el-tag {
    margin-left: 0 !important;
  }

  .input-new-tag {
    width: 10%;
  }
</style>
