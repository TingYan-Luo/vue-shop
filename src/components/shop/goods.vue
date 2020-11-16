<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--      卡片视图-->
    <el-card class="box-card">
      <!--        头部搜索框-->
      <div class="card-header">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable
                  @change="searchGoods">
          <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
        </el-input>
        <!--          添加商品按钮-->
        <el-button type="primary" class="checkBtn" @click="addGoods">添加商品</el-button>
      </div>
      <!--        商品列表表单-->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" width="800%"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="editGoods(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
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
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'goods',
    data() {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 5
        },
        goodsList: [],
        // 总商品数量
        total: 0
      }
    },
    created() {
      this.getGoodsList()
    },
    methods: {
      async getGoodsList() {
        // 获取商品列表总数据
        var {data: res} = await this.$http.get('goods', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // console.log(res)
        this.goodsList = res.data.goods
        this.total = res.data.total
      },
      // 分页器操作
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      handleCurrentChange(newNum) {
        this.queryInfo.pagenum = newNum
        this.getGoodsList()
      },
      // 搜索框，搜索功能
      searchGoods() {
        // 重新获取商品列表数据
        this.getGoodsList()
      },
      // 删除商品功能
      async deleteGoods(id) {
        // console.log(id)
        // 弹出提示框，确认删除
        const isConfirm = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
        // console.log(isConfirm)
        if (!isConfirm) return false
        // 向后端发送请求，删除商品
        var {data: res} = await this.$http.delete('goods/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.$message.success(res.meta.msg)
        // 重新获取数据
        this.getGoodsList()
      },
      // 添加商品-跳转到添加页面
      addGoods() {
        this.$router.push('/addGoods')
      },
      // 编辑商品
      editGoods(id) {
        console.log(id)
        // 弹出编辑框
      }
    }
  }
</script>

<style scoped>

</style>
