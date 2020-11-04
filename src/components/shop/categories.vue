<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!--        添加分类按钮-->
      <el-button type="primary" style="margin-bottom: 15px" @click="addClassify(null)">添加分类</el-button>
      <!--        商品分类表格-->
      <table-tree ref="table"
                  sum-text="sum"
                  index-text="序号"
                  :data="classifyList"
                  :columns="treeColumnsProps"
                  :stripe="true"
                  :border="true"
                  :show-header="true"
                  :show-summary="false"
                  :show-row-hover="true"
                  :show-index="true"
                  :tree-type="true"
                  :is-fold="true"
                  :expand-type="false"
                  :selection-type="false">
        <!--      是否有效渲染模板-->
        <template scope="scope" slot="cat_deleted">
          <div>
            <i class="el-icon-success" v-if="scope.row.cat_deleted === true" style="color: #00AA88"></i>
            <i class="el-icon-error" v-else style="color: red"></i>
          </div>
        </template>
        <!--      排序渲染模板-->
        <template scope="scope" slot="cat_level">
          <div>
            <el-tag type="success" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="warning" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="danger" v-else>三级</el-tag>
          </div>
        </template>
        <!--      操作渲染模板-->
        <template slot="options" slot-scope="scope">
          <div>
            <el-button type="primary" icon="el-icon-edit" @click="editClose(scope.row.cat_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteCate(scope.row)">删除</el-button>
          </div>
        </template>
      </table-tree>
      <!--        分页器-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!--      弹出框-->
      <el-dialog title="添加分类" :visible.sync="addVisible" width="30%" @close="addClose">
        <el-form :model="addForm" :rules="addFormRules" label-width="100px" ref="addFormRef">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="addClassifyData"
              :options="addClassifyList"
              :props="addProps"
              width="300px"
              @change="selectClass"></el-cascader>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addCancel">取 消</el-button>
          <el-button type="primary" @click="addConfirm">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="编辑分类" :visible.sync="editVisible" width="30%">
        <el-form :model="editForm" :rules="editFormRules" label-width="100px" ref="editFormRef">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editCancel">取 消</el-button>
          <el-button type="primary" @click="editConfirm">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'goods',
    data() {
      return {
        // 向后端请求商品列表数据的请求参数
        queryInfo: {
          type: [],
          pagenum: 1,
          pagesize: 5
        },
        // 所有商品列表的数据
        classifyList: [],
        // 总数据条数
        total: 0,
        // table-tree的列属性配置
        treeColumnsProps: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            prop: 'cat_deleted',
            type: 'template',
            template: 'cat_deleted'
          },
          {
            label: '排序',
            prop: 'cat_level',
            type: 'template',
            template: 'cat_level'
          },
          {
            label: '操作',
            type: 'template',
            template: 'options'
          }
        ],
        // 添加弹出框同样可以用于编辑，通过title来设置
        dialogTitle: '',
        // 添加分类弹出框是否可见
        addVisible: false,
        // 添加表单
        addForm: {
          // 默认为0
          cat_pid: 0,
          cat_name: '',
          // 默认为0
          cat_level: 0
        },
        // 添加表单的表单规则
        addFormRules: {
          cat_name: [
            {required: true, message: '请输入分类名', trigger: 'blur'},
            {min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur'}
          ]
        },
        // 级联选择器的数据-前两级的商品分类数据
        addClassifyList: [],
        // 级联选择器绑定的数据
        addClassifyData: [],
        addProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          checkStrictly: true
        },

        // 编辑分类弹出框
        editVisible: false,
        editForm: {
          cat_name: '',
          cat_id: 0
        },
        editFormRules: {
          cat_name: [
            {required: true, message: '请输入分类名', trigger: 'blur'},
            {min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      // 获取到商品分类列表
      this.getClassifyList()
    },
    methods: {
      // 获取所有的商品分类列表
      async getClassifyList() {
        var {data: res} = await this.$http.get('categories', {
          params: this.queryInfo
        })
        // console.log(res.data.result)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.classifyList = res.data.result
        this.total = res.data.total
      },
      // 当页码大小改变时
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        // 重新获取商品分类列表
        this.getClassifyList()
      },
      // 当前页面页码变化时
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        // 重新获取商品分类列表
        this.getClassifyList()
      },
      // 添加分类功能
      async addClassify() {
        // 只需要前两级的数据
        this.queryInfo.type = [2]
        // 发送请求，获取数据
        var {data: res} = await this.$http.get('categories', {
          params: this.queryInfo
        })
        // console.log(res.data.result)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.addClassifyList = res.data.result
        this.addVisible = true
      },
      // 添加分类弹出框取消
      addCancel() {
        this.addVisible = false
      },
      // 添加分类弹出框确认，发送请求
      async addConfirm() {
        console.log(this.addForm)
        // 验证表单
        this.$refs.addFormRef.validate(valid => {
          // console.log(valid)
          if (!valid) return false
        })
        // 向后端发送请求
        var {data: res} = await this.$http.post('categories', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.queryInfo.type = []
        this.getClassifyList()

        this.addVisible = false
      },
      // 当选择节点变化时
      selectClass() {
        this.addForm.cat_level = this.addClassifyData.length
        // 选择级联选择器的最后一个选项的id为父级id
        this.addForm.cat_pid = this.addClassifyData[this.addClassifyData.length - 1]
      },
      // 添加分类弹出框关闭事件
      addClose() {
        // 清空值
        this.addClassifyData = []
        // 清楚表单验证
        this.$refs.addFormRef.resetFields()
        this.addVisible = false
      },
      // 删除分类功能
      async deleteCate(cate) {
        // console.log(cate)
        // 弹出确认框
        var isConfirm = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
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
        console.log(isConfirm)
        if (isConfirm !== 'confirm') {
          return false
        }
        // 向后端请求，删除该cate类
        var {data: res} = await this.$http.delete('categories/' + cate.cat_id)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        // 重新获取商品分类数据
        this.getClassifyList()
      },
      // 编辑分类功能
      async editClose(id) {
        this.editForm.cat_id = id
        // 根据id查询出分类信息
        var {data} = await this.$http.get('categories/' + id)
        if (data.meta.status !== 200) return this.$message.error(data.meta.msg)
        console.log(data)
        // 将后端响应的数据赋值给编辑分类的表单
        this.editForm.cat_name = data.data.cat_name
        this.editVisible = true
      },
      // 取消编辑
      editCancel() {
        this.$refs.editFormRef.resetFields()
        this.editVisible = false
      },
      // 确定提交编辑
      async editConfirm() {
        console.log(this.editForm)
        // 进行表单验证
        this.$refs.editFormRef.validate(valid => {
          if (valid) return false
        })
        // 验证通过后，向后端发起请求，编辑分类
        var {data: res} = await this.$http.put('categories/' + this.editForm.cat_id, {
          cat_name: this.editForm.cat_name
        })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        // 刷新页面
        this.getClassifyList()
        this.editVisible = false
      }
    }
  }
</script>

<style scoped>

</style>
