<template>
  <el-container>
    <el-header>
      <img src="../assets/element.svg" alt="">
      <div>
        <el-button type="primary" plain>用户</el-button>
        <el-button type="info" plain>退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '56px' : '300px'">
        <div class="toggle-button" @click="toggleMenu">
          <i :class="isCollapse ? 'el-icon-arrow-right': 'el-icon-arrow-down'"></i>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          router
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="isCollapseTransition"
          text-color="#666666"
          background-color="#ffcccc"
          active-text-color="#ff6666">
          <el-submenu :index="'/' + item.id" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="menuIconList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="'/' + child.path" v-for="child in item.children" :key="child.id">
              <span><i class="el-icon-menu"></i>{{child.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'home',
    data() {
      return {
        menuList: [],
        menuIconList: {
          125: 'el-icon-user-solid',
          103: 'el-icon-s-cooperation',
          101: 'el-icon-s-goods',
          102: 'el-icon-s-order',
          145: 'el-icon-s-marketing'
        },
        isCollapse: false,
        isCollapseTransition: false,
        activeMenu: ''
      }
    },
    created() {
      this.getMenuList()
      this.activeMenu = window.location.hash.slice(1)
      // console.log(this.activeMenu)
    },
    methods: {
      logout() {
        // 删除sessionStorage中的token
        window.sessionStorage.clear()
        // 并重定向到登陆页面
        this.$router.push('login')
      },
      // 获取左侧菜单栏数据
      async getMenuList() {
        var {data: res} = await this.$http.get('menus')
        // console.log(res)
        // 错误提示
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 将返回的菜单栏数据赋值
        this.menuList = res.data
      },
      // 控制左侧菜单栏展开缩小
      toggleMenu() {
        this.isCollapse = !this.isCollapse
        // 同时将图标改变成向右
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-header {
    display: flex;
    justify-content: space-between;
    background-color: #ff9966;
    color: #333;
    text-align: center;
    line-height: 60px;
  }

  .el-aside {
    background-color: #ffcccc;
    color: #333;
    text-align: center;
    line-height: 200px;
  }

  .el-main {
    background-color: #eeeeee;
    color: #333;
    text-align: center;
    line-height: 160px;
  }

  .el-container {
    height: 100%;
  }

  .toggle-button {
    background-color: #fff;
    height: 56px;
    line-height: 56px;
    cursor: pointer;
  }

  .el-menu-item {
    text-indent: 80px;
    color: #666666;

    i {
      text-indent: 0px;
    }
  }
</style>
