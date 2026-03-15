<template>
  <div class="admin-login-container">
    <div class="login-box">
      <!-- 标题区 -->
      <div class="login-header">
        <h2>小鸟论坛系统后台</h2>
        <p>Backend Management System</p>
      </div>

      <!-- 表单区 -->
      <el-form 
        :model="loginForm" 
        :rules="rules" 
        ref="loginFormRef" 
        size="large"
        class="login-form"
      >
        <!-- 账号 -->
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入管理员账号" 
            :prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入管理员密码" 
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item style="margin-top: 30px; margin-bottom: 0;">
          <el-button 
            type="primary" 
            class="submit-btn" 
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'


const router = useRouter()
const loginFormRef = ref<FormInstance | null>(null)
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 校验规则
const rules = reactive<FormRules>({
  username:[
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password:[
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于 6 位', trigger: 'blur' }
  ]
})

// 登录逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 模拟后台 API 登录请求
      setTimeout(() => {
        // 假设账号是 admin，密码是 123456
        if (loginForm.username === 'admin' && loginForm.password === '123456') {
          ElMessage.success('管理员登录成功！')
          // 登录成功后跳转到后台首页 (假设路由为 /admin)
          router.push('/admin') 
        } else {
          ElMessage.error('账号或密码错误，请重试！(提示: admin/123456)')
        }
        loading.value = false
      }, 1000)
    } else {
      ElMessage.warning('请完整填写登录信息')
      return false
    }
  })
}
</script>

<style scoped>
/* 整个页面的背景：深色科技感渐变，区分前台的浅色背景 */
.admin-login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); /* Tailwind 的 slate 深色系 */
  background-image: radial-gradient(circle at 50% 50%, #334155 0%, #0f172a 100%);
}

/* 居中的白色登录卡片 */
.login-box {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
}

/* 标题区域 */
.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.logo {
  border-radius: 8px;
  margin-bottom: 15px;
}

.login-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1e293b;
  font-weight: bold;
  letter-spacing: 1px;
}

.login-header p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 表单区域 */
.login-form {
  margin-top: 20px;
}

/* 输入框样式微调，显得更厚实 */
.login-form :deep(.el-input__wrapper) {
  padding: 8px 15px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}
.login-form :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px #1a73e8 inset;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 4px; /* 增加字间距，更有气势 */
  background-color: #1a73e8;
  border: none;
  height: 44px;
}

.submit-btn:hover {
  background-color: #1557b0;
}
</style>