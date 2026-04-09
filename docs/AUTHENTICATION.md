# 用户认证功能文档

## 功能概述

实现了前端路由守卫功能，当用户访问需要认证的页面时，系统会自动检查用户是否已登录。如果未登录，将重定向到登录页面。

## 实现的功能

### 1. 用户状态管理 (src/stores/user.ts)

创建了一个 Pinia store 来管理用户认证状态：

- **状态**:
  - `token`: 存储用户令牌
  - `userInfo`: 存储用户信息
  - `isLoggedIn`: 计算属性，判断用户是否已登录

- **方法**:
  - `setToken(token)`: 设置用户令牌
  - `setUserInfo(info)`: 设置用户信息
  - `logout()`: 清除用户信息并登出

### 2. 路由守卫 (src/router/index.ts)

在路由配置中添加了认证守卫：

- **需要认证的页面** (`requiresAuth: true`):
  - `/chat` - 聊天页面
  - `/submit-paper` - 提交论文页面
  - `/friends` - 好友页面
  - `/change-password` - 修改密码页面
  - `/history` - 历史记录页面
  - `/notifications` - 通知页面
  - `/admin/*` - 所有管理员页面

- **无需认证的页面** (`requiresAuth: false`):
  - `/` - 首页
  - `/login` - 登录页
  - `/register` - 注册页
  - `/search` - 搜索页
  - `/paper/:id` - 论文详情页
  - `/user/:id` - 用户主页
  - `/admin/login` - 管理员登录页

**守卫逻辑**:
1. 在路由跳转前检查 `requiresAuth` 标志
2. 如果需要认证但用户未登录，显示提示消息并重定向到登录页
3. 保存目标路径到 `redirect` 查询参数，登录后可跳回原页面

### 3. 请求拦截器 (src/utils/request.js)

更新了 axios 响应拦截器以处理 401 错误：

- 当收到 401 响应时：
  - 显示错误消息 "Token 过期，请重新登录"
  - 调用 `userStore.logout()` 清除用户信息
  - 自动重定向到登录页

## 使用方法

### 在登录页面使用

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogin = async () => {
  // 调用登录 API
  const token = await loginApi(username, password)
  
  // 保存 token
  userStore.setToken(token)
  
  // 获取用户信息
  const userInfo = await getUserInfo()
  userStore.setUserInfo(userInfo)
  
  // 跳转到之前要访问的页面或原首页
  const redirect = router.currentRoute.value.query.redirect
  router.push(redirect || '/')
}
</script>
```

### 在其他页面获取用户信息

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 检查是否登录
if (userStore.isLoggedIn) {
  console.log('用户已登录', userStore.userInfo)
}
</script>
```

### 用户登出

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>
```

## 注意事项

1. **Token 持久化**: Token 存储在 localStorage 中，页面刷新后仍然有效
2. **自动跳转**: 401 错误会自动清除用户信息并跳转到登录页
3. **路由保护**: 未登录用户无法直接访问受保护的页面
4. **返回原页面**: 登录成功后可以返回用户原本想访问的页面

## 后续优化建议

1. 考虑添加 Token 刷新机制
2. 可以添加角色权限控制
3. 可以添加登录过期时间检测
4. 可以添加记住密码功能