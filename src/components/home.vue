<template>
  <div>
    <el-button @click="logout">退出</el-button>
  </div>
</template>

<script>
  export default {
    name: 'home',
    methods: {
      logout() {
        // 删除sessionStorage中的token
        window.sessionStorage.clear()
        // 并重定向到登陆页面
        this.$router.push('login')
      }
    }
  }
</script>

<style scoped>

</style>
