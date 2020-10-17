<template>
  <div class="login-container">
    <div class="avatar">
      <img src="../assets/logo.png" alt="">
    </div>
    <el-form class="login-form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
      <el-form-item prop="username">
        <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" prefix-icon="el-icon-lock" v-model="loginForm.password" v-on:keyup.enter.native="loginEvent"></el-input>
      </el-form-item>
      <el-form-item class="login-btn">
        <el-button type="primary" @click="loginEvent">登陆</el-button>
        <el-button @click="resetEvent">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: 'login',
    data() {
      return {
        loginForm: {
          username: '',
          password: ''
        },
        loginFormRules: {
          // 验证用户名是否合法
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      // 点击登陆方法
      loginEvent() {
        // console.log('登陆方法')
        // 1. 进行数据预验证：直接调用el-form的方法
        this.$refs.loginFormRef.validate(async valid => {
          // console.log(valid)
          // 如果valid为false，则停止向下运行
          if (!valid) return false
          // 如果valid为true，则向后端发送请求
          var {data} = await this.$http.post('login', this.loginForm)
          // console.log(data)
          if (data.meta.status !== 200) {
            return this.$message.error(data.meta.msg)
          }
          // 如果响应码为200，则说明登陆成功，
          // 保存token
          window.sessionStorage.setItem('token', data.data.token)
          // 重定向到首页
          this.$router.push('home')
        })
      },
      // 重置表单输入方法
      resetEvent() {
        // console.log(this.$refs.loginFormRef)
        this.$refs.loginFormRef.resetFields()
      }
    }
  }
</script>

<style lang="less" scoped>
  .login-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 300px;
    background-color: #FFFFFF;
    border-radius: 5px;

    .avatar {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 150px;
      height: 150px;
      padding: 10px;
      border-radius: 50%;
      border: 1px solid #EEEEEE;
      background-color: #FFFFFF;
      box-shadow: 0 0 10px #EEEEEE;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #EEEEEE;
      }
    }

    .login-form {
      position: absolute;
      bottom: 10%;
      width: 100%;
      padding: 0 30px;

      .login-btn {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
</style>
