// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Admin from '@/views/AdminLayout.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import ChangePassword from '@/views/ChangePassword.vue'
import Chat from '@/views/Chat.vue'
import Friends from '@/views/Friends.vue'
import History from '@/views/History.vue'
import Home from '@/views/Home.vue'
import Notifications from '@/views/Notifications.vue'
import Login from '@/views/Login.vue'
import Paper from '@/views/Paper.vue'
import Register from '@/views/Register.vue'
import Search from '@/views/Search.vue'
import SubmitPaper from '@/views/SubmitPaper.vue'
import User from '@/views/User.vue'
import { useUserStore } from '@/stores/user.ts'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '毕业论文系统 - 首页', requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { requiresAuth: false }
  },
  {
    path: '/submit-paper',
    name: 'SubmitPaper',
    component: SubmitPaper,
    meta: { requiresAuth: true }
  },
  {
    path: '/paper/:id',
    name: 'Paper',
    component: Paper,
    meta: { requiresAuth: false }
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
    meta: { requiresAuth: false }
  },
  {
    path: '/friends',
    name: 'Friends',
    component: Friends,
    meta: { requiresAuth: true }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    name: 'Admin',
    redirect: '/admin/dashboard',
    component: Admin,
    meta: { requiresAuth: false },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'articles',
        name: 'Article',
        component: () => import('@/views/Articles.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue')
      },
      {
        path: 'managers',
        name: 'Managers',
        component: () => import('@/views/Managers.vue')
      },
      {
        path: 'comments',
        name: 'Comments',
        component: () => import('@/views/Comments.vue')
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue')
      },
      {
        path: 'reportReasons',
        name: 'ReportReasons',
        component: () => import('@/views/ReportReasons.vue')
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue')
      },
      {
        path: 'notices',
        name: 'NoticeManage',
        component: () => import('@/views/NoticeManage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：验证用户是否已登录
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = (to.meta.title as string) || '毕业论文系统'
  
  // 检查路由是否需要认证
  const requiresAuth = to.meta.requiresAuth as boolean
  
  if (requiresAuth && !userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router