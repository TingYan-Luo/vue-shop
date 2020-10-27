<template>
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card class="box-card">
        <el-table :data="rightList" stripe border >
          <el-table-column type="index"></el-table-column>
          <el-table-column label="权限名称" prop="authName"></el-table-column>
          <el-table-column label="路径" prop="path"></el-table-column>
          <el-table-column label="级别" prop="level">
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.level == 0">一级</el-tag>
              <el-tag type="" v-if="scope.row.level == 1">二级</el-tag>
              <el-tag type="warning" v-if="scope.row.level == 2">三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
</template>

<script>
    export default {
        name: 'rights',
      data() {
          return {
            rightList: []
          }
      },
      created() {
          this.getRightList()
      },
      methods: {
          async getRightList() {
            var {data: res} = await this.$http.get('rights/list')
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.rightList = res.data
          }
      }

    }
</script>

<style scoped>

</style>
