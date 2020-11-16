<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <el-steps :active="activeName - 0" finish-status="success" style="margin: 15px 0px" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="formData" :rules="formDataRules" ref="formDataRef" label-width="100px"
               :label-position="labelPosition">
        <el-tabs tab-position="left" v-model="activeName" :before-leave="changeTag">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="formData.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="formData.goods_price"
                :min="0" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="formData.goods_weight"
                :min="0" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="formData.goods_number" :min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="formData.goods_cat"
                :options="cateList"
                :props="cateProps"
                style="width: 100%"></el-cascader>
            </el-form-item>
            <el-button type="primary" style="float: right" @click="nextTag">下一步</el-button>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!--            循环动态参数列表-->
            <el-form-item :label="item.attr_name" v-for="(item, index) in paramManyList" :key="item.attr_id">
              <el-checkbox-group v-model="attr_many[index].attr_vals" size="medium">
                <el-checkbox
                  v-for="(item2, index2) in item.attr_vals"
                  :key="index2"
                  :label="item2"
                  border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-button type="primary" style="float: right" @click="nextTag">下一步</el-button>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!--              循环静态属性列表-表单输入-->
            <el-form-item :label="item.attr_name" v-for="(item, index) in paramOnlyList" :key="item.attr_id">
              <el-input v-model="attr_only[index].attr_vals"></el-input>
            </el-form-item>
            <el-button type="primary" style="float: right" @click="nextTag">下一步</el-button>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-success="handleSuccess"
              :on-remove="uploadRemove"
              :on-preview="uploadPreview"
              :file-list="uploadFileList"
              list-type="picture"
              :drag="true"
              :headers="uploadHeaderObject">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
            <el-button type="primary" style="float: right" @click="nextTag">下一步</el-button>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor
              ref="myQuillEditor"
              v-model="formData.goods_introduce"
              style="row: 15"/>
            <el-button type="primary" style="float: right; margin-top: 15px" @click="nextTag">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!--      弹出框预览上传图片-->
      <el-dialog
        title="图片预览"
        :visible.sync="picVisible"
        width="60%">
        <img :src="previewPic" style="width: 100%">
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  // 导入lodash深拷贝
  import _ from 'lodash'

  export default {
    name: 'addGoods',
    data() {
      return {
        // 标签页与步骤条当前选择的name
        activeName: '0',
        // 商品分类选择器数据
        cateIdList: [],
        // 表单label对齐方式：
        labelPosition: 'top',
        // 商品表单数据
        attr_many: [],
        attr_only: [],
        formData: {
          goods_name: '',
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0,
          goods_cat: [],
          attrs: [],
          pics: [],
          goods_introduce: ''
        },
        formDataRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'},
            {min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur'}
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'}
          ],
          goods_number: [
            {required: true, message: '请输入商品数量', type: 'number', trigger: 'blur'}
          ],
          goods_weight: [
            {required: true, message: '请输入商品重量', trigger: 'blur'}
          ],
          goods_cat: [
            {required: true, message: '请选择商品分类', trigger: 'blur'}
          ]
        },
        // 分类级联选择框的数据
        cateList: [],
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name'
        },
        // 分类的动态参数列表
        paramManyList: [],
        // 分类的静态属性列表
        paramOnlyList: [],
        // 上传图片的url地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        // 上传文件的预览数据
        uploadFileList: [],
        // 上传图片组件的请求头设置
        uploadHeaderObject: {
          Authorization: window.sessionStorage.getItem('token')
        },
        // 上传图片预览弹出框
        picVisible: false,
        previewPic: ''
      }
    },
    created() {
      this.getCates()
    },
    methods: {
      changeTag(activeName, oldActiveName) {
        // console.log(activeName + ',' + oldActiveName)
        if (oldActiveName === '0') {
          // 如果旧页面为第一个页面-基本信息
          // 如果是基础信息页面，我们需要判断是否选择了表单中的分类
          if (this.formData.goods_cat.length === 0) {
            // 进行提示，请选择分类
            this.$message.error('请选择商品分类！')
            return false
          }
        }
        if (activeName === '1') {
          // 如果要前往的页面是商品参数页面，则
          this.getParams('many')
        }
        // 如果是商品属性页面
        if (activeName === '2') {
          this.getParams('only')
        }
      },
      // 下一步按钮
      async nextTag() {
        // 如果是基础信息页面，我们需要判断是否选择了表单中的分类
        // console.log(this.cateId)
        if (this.activeName === '0' && this.formData.goods_cat.length === 0) {
          return false
        }
        // 如果是最后一页了的话
        // console.log(this.activeName)
        if (this.activeName === '4') {
          // 弹出确认框
          var isConfirm = await this.$confirm('是否确定提交添加商品？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消提交'
            })
          })
          // console.log(isConfirm)
          if (isConfirm !== 'confirm') return false
          this.addGoods()
        }
        this.activeName = this.activeName - 0 + 1 + ''
      },
      // 获取分类级联选择器的数据
      async getCates() {
        var {data: res} = await this.$http.get('categories')
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.cateList = res.data
      },
      // 点击-商品参数-tag，获取分类的参数信息
      async getParams(sel) {
        // console.log(this.cateId)
        // 获取到分类id后，通过请求后端获取到该分类的动态属性参数
        var {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: sel
          }
        })
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(this.res.meta.msg)
        // 为每一个属性的val值转换成数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          if (sel === 'many') {
            this.attr_many.push({attr_id: item.attr_id, attr_vals: []})
          } else {
            this.attr_only.push({attr_id: item.attr_id, attr_vals: ''})
          }
        })
        if (sel === 'many') {
          this.paramManyList = res.data
        } else if (sel === 'only') {
          this.paramOnlyList = res.data
        }
      },
      // 当图片上传成功时的钩子
      handleSuccess(response, file, fileList) {
        // 判断response返回的状态码是否成功
        if (response.meta.status !== 200) return this.$message.error(response.meta.msg)
        // 上传成功提示
        this.$message.success(response.meta.msg)
        this.uploadFileList = fileList
        // 将后端返回的路径存储到formData表单数据中
        this.formData.pics.push({
          pic: response.data.tmp_path
        })
      },
      // 当移除图片上传列表中的文件时
      uploadRemove(file) {
        // console.log(file)
        // 我们需要查询到表单数据组中保存的数组中的相同临时路径值的索引，
        var index = this.formData.pics.findIndex(item => {
          return item.pic === file.pic
        })
        console.log(index)
        // 然后进行删除
        this.formData.pics.splice(index, 1)
        // console.log(this.formData.pics)
      },
      // 点击图片，进行预览
      uploadPreview(file) {
        console.log(file)
        // 弹出框展示图片预览
        this.picVisible = true
        this.previewPic = file.response.data.url
      },
      async addGoods() {
        // 确认提交
        // 提交之前要进行表单验证
        this.$refs.formDataRef.validate(valid => {
          if (!valid) return this.message.error('请填写必要信息！')
        })
        // 提交前将表单中的分类id转化为字符，直接进行转化会出问题
        // this.formData.goods_cat = this.formData.goods_cat.join(',')
        // 我们需要深拷贝一个用来提交的数据
        var dataList = _.cloneDeep(this.formData)
        dataList.goods_cat = dataList.goods_cat.join(',')
        // 并且要将动态参数和静态属性数组都添加到attrs中
        dataList.attrs.push(this.attr_many)
        dataList.attrs.push(this.attr_only)
        console.log(dataList)
        var {data: res} = await this.$http.post('goods', dataList)
        console.log(res)
        if (res.meta.status !== 201) {
          this.activeName = '4'
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        // 重定向回商品列表页面
        this.$router.push('/goods')
      }
    },
    computed: {
      // 分类id
      cateId: function () {
        return this.formData.goods_cat[this.formData.goods_cat.length - 1]
      }
    }
  }
</script>

<style scoped lang="less">
  .el-tab-pane {
    padding: 20px 0;
  }

  .el-checkbox {
    margin: 5px 10px;
  }
</style>
