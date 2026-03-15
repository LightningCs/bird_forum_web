<template>
  <div class="register-container">
    <!-- 左侧背景图 -->
    <div class="left-panel">
      <img src="D:\vue\bird_forum_web\public\背景.png" alt="背景图" class="bg-image" />
    </div>

    <!-- 右侧注册表单 -->
    <div class="right-panel">
      <div class="form-wrapper">
        <h2>欢迎注册</h2>
        <!-- 注意：label-width 稍微调宽了一点，为了能放下“确认密码”四个字 -->
        <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="90px">
          
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="请输入用户名" clearable />
          </el-form-item>

          <!-- 用户账号（邮箱） -->
          <el-form-item label="用户账号" prop="email">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱账号" clearable />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item label="用户密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>

          <!-- 再次输入密码 -->
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>

          <!-- 去登录链接 -->
          <el-form-item>
              <div class="back-to-login">
                  <span class="login-text" @click="goToLogin">已有账号？去登录</span>
              </div>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item>
            <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%;">
              注册
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
import type { FormInstance, FormRules } from 'element-plus'

// 表单数据
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 加载状态
const loading = ref(false)

// 表单引用
const registerFormRef = ref<FormInstance | null>(null)

// 路由器
const router = useRouter()

// 自定义校验规则：检查两次密码是否一致
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

// 验证规则
const registerRules = ref<FormRules>({
  username:[
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email:[
    { required: true, message: '请输入邮箱账号', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger:['blur', 'change'] } // 邮箱格式内置校验
  ],
  password:[
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword:[
    { required: true, validator: validatePass2, trigger: 'blur' } // 触发自定义一致性校验
  ]
})

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟接口请求
        setTimeout(() => {
          alert('注册成功！即将跳转至登录页...')
          router.push('/login') // 根据你的路由配置修改
          loading.value = false
        }, 1500)
      } catch (error) {
        loading.value = false
      }
    } else {
      console.log('表单校验失败')
      return false
    }
  })
}

// 跳转登录页
const goToLogin = () => {
  router.push('/login') // 假设你的登录页路由是 /login
}
</script>

<style scoped>
/* 整体布局保持与登录页完全一致 */
.register-container {
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

/* 修复标签换行问题 */
.el-form-item__label {
  white-space: nowrap !important;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 按钮和链接样式 */
.el-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.back-to-login {
  display: flex;
  justify-content: flex-end; /* 让“去登录”文字靠右 */
  width: 100%;
  font-size: 14px;
}

.login-text {
  color: #409EFF; /* 替换成主题蓝色，你也可以改成想要的颜色 */
  cursor: pointer;
  transition: color 0.3s;
}

.login-text:hover {
  color: #66b1ff;
  text-decoration: underline;
}
</style>