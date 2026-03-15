<template>
  <div class="login-container">
    <!-- 左侧背景图 -->
    <div class="left-panel">
      <img src="D:\vue\bird_forum_web\public\背景.png" alt="背景图" class="bg-image" />
    </div>

    <!-- 右侧登录表单 -->
    <div class="right-panel">
      <div class="form-wrapper">
        <h2>欢迎登录</h2>
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="70px">
          <!-- 账号 -->
          <el-form-item label="账号" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入账号" clearable />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>

          <!-- 记住我 + 注册链接 -->
          <el-form-item>
              <div class="remember-and-register">
                  <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                  <span class="register-text" @click="goToRegister">注册</span>
              </div>
          </el-form-item>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%;">
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 表单数据
const loginForm = ref({
  username: '',
  password: '',
  captcha: ''
})

// 是否记住我
const rememberMe = ref(false)

// 加载状态
const loading = ref(false)

// 验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码为4位', trigger: 'blur' }
  ]
}

// 表单引用
const loginFormRef = ref(null)

// 路由器
const router = useRouter()

// 登录处理
const handleLogin = async () => {
  await loginFormRef.value.validate()
  loading.value = true
  try {
    setTimeout(() => {
      alert('登录成功！')
      router.push('/')
      loading.value = false
    }, 1500)
  } catch (error) {
    loading.value = false
  }
}

// 跳转注册页
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.left-panel {
  flex: 1;
  background-color: #fff;
  border-radius: 16px 0 0 16px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.right-panel {
  flex: 1;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 0 16px 16px 0;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

.form-wrapper h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-weight: bold;
  font-size: 20px;
  line-height: 1.2;
}

/* 修复验证码标签换行 */
.el-form-item__label {
  white-space: nowrap !important; /* 防止标签换行 */
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 控制验证码输入框和按钮的布局 */
.captcha-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-container .el-input {
  flex: 1;
  min-width: 106px;
}

.captcha-container .el-button {
  padding: 6px 12px !important;
  font-size: 12px;
  width: 100px;
  height: 28px;
}

/* 控制验证码图片的布局 */
.captcha-image {
  width: 100px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  object-fit: contain;
}

.el-checkbox {
  font-size: 14px;
}

.el-link {
  font-size: 14px;
  cursor: pointer;
}

.el-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.remember-and-register {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 14px;
}

.register-text {
  color: #409EFF; /* 替换成主题蓝色，你也可以改成想要的颜色 */
  cursor: pointer;
  transition: color 0.3s;
}

.register-text:hover {
  color: #66b1ff;
  text-decoration: underline;
}
</style>