<template>
  <div class="change-pwd-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="logo" @click="goHome">🎓 毕业论文系统</div>
      <div class="header-right">
        <el-button :icon="ArrowLeft" @click="goHome">返回首页</el-button>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main class="main-layout">
      <div class="pwd-card">
        
        <!-- 页面标题与图标 -->
        <div class="card-header">
          <div class="icon-wrapper">
            <el-icon class="lock-icon"><Lock /></el-icon>
          </div>
          <h2>修改密码</h2>
          <p class="subtitle">为了您的账号安全，请定期更改密码</p>
        </div>

        <!-- 修改密码表单 -->
        <el-form 
          :model="pwdForm" 
          :rules="rules" 
          ref="pwdFormRef" 
          label-width="0"
          size="large"
          class="pwd-form"
        >
          <!-- 1. 邮箱账号 -->
          <el-form-item prop="email">
            <el-input 
              v-model="pwdForm.email" 
              placeholder="请输入您绑定的邮箱账号" 
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <!-- 2. 邮箱验证码 -->
          <el-form-item prop="code">
            <div class="code-container">
              <el-input 
                v-model="pwdForm.code" 
                placeholder="请输入6位验证码" 
                :prefix-icon="Key"
                maxlength="6"
                style="flex: 1;"
              />
              <el-button 
                type="primary" 
                plain
                :disabled="countdown > 0"
                class="send-code-btn"
                @click="sendVerifyCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 3. 新密码 -->
          <el-form-item prop="newPassword">
            <el-input 
              v-model="pwdForm.newPassword" 
              type="password"
              placeholder="请输入新密码 (至少6位)" 
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <!-- 4. 确认新密码 -->
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="pwdForm.confirmPassword" 
              type="password"
              placeholder="请再次确认新密码" 
              :prefix-icon="CircleCheck"
              show-password
            />
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item class="submit-row">
            <el-button 
              type="primary" 
              class="submit-btn" 
              :loading="loading"
              @click="handleSubmit"
            >
              确认修改密码
            </el-button>
          </el-form-item>
        </el-form>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, Lock, Message, Key, CircleCheck } from '@element-plus/icons-vue'

const router = useRouter()

// ================== 状态与数据 ==================
const pwdFormRef = ref<FormInstance | null>(null)
const loading = ref(false)
const countdown = ref(0) // 验证码倒计时

// 表单数据绑定
const pwdForm = reactive({
  email: 'zhangsan@example.com', // 实际开发中，这里可以默认填入当前登录用户的邮箱
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// ================== 校验规则 ==================
// 验证两次密码是否一致的自定义规则
const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致!'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  email:[
    { required: true, message: '请输入邮箱账号', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger:['blur', 'change'] }
  ],
  code:[
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码必须为6位', trigger: 'blur' }
  ],
  newPassword:[
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword:[
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
})

// ================== 交互方法 ==================

// 发送验证码逻辑
const sendVerifyCode = () => {
  // 先单独校验邮箱格式是否正确
  if (!pwdForm.email) {
    ElMessage.warning('请先输入邮箱账号')
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(pwdForm.email)) {
    ElMessage.error('邮箱格式不正确，无法发送')
    return
  }

  // 模拟发送接口请求
  ElMessage.success(`验证码已发送至 ${pwdForm.email}，请查收！`)
  
  // 开启 60 秒倒计时
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 提交修改逻辑
const handleSubmit = async () => {
  if (!pwdFormRef.value) return
  
  await pwdFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 模拟 API 提交请求
      setTimeout(() => {
        loading.value = false
        ElMessage.success('密码修改成功！请使用新密码重新登录')
        
        // 安全规范：修改密码后自动跳回登录页，要求重新登录
        router.push('/login') 
      }, 1500)
      
    } else {
      ElMessage.error('请检查填写的信息是否有误')
      return false
    }
  })
}

// 返回首页
const goHome = () => router.push('/')
</script>

<style scoped>
.change-pwd-container {
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f4f6f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.logo { font-size: 20px; font-weight: bold; color: #1a73e8; cursor: pointer; }

/* 主体布局：居中卡片 */
.main-layout {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.pwd-card {
  background: white;
  width: 100%;
  max-width: 450px; /* 控制表单最大宽度，显得精致 */
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

/* 头部图标与标题 */
.card-header {
  text-align: center;
  margin-bottom: 30px;
}
.icon-wrapper {
  width: 60px;
  height: 60px;
  background-color: #e6f1fc;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px;
}
.lock-icon {
  font-size: 30px;
  color: #1a73e8;
}
.card-header h2 {
  margin: 0 0 10px 0;
  font-size: 22px;
  color: #333;
}
.subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

/* 表单内部样式 */
.pwd-form {
  margin-top: 20px;
}

/* 验证码同行布局 */
.code-container {
  display: flex;
  width: 100%;
  gap: 15px;
}
.send-code-btn {
  width: 120px; /* 固定按钮宽度，防止倒计时数字变化导致按钮宽度跳动 */
}

/* 提交按钮 */
.submit-row {
  margin-top: 30px;
  margin-bottom: 0;
}
.submit-btn {
  width: 100%;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
}
</style>