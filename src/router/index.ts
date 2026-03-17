// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
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

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '毕业论文系统 - 首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/submit-paper',
    name: 'SubmitPaper',
    component: SubmitPaper
  },
  {
    path: '/paper/:id',
    name: 'Paper',
    component: Paper
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User
  },
  {
    path: '/friends',
    name: 'Friends',
    component: Friends
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: ChangePassword
  },
  {
    path: '/history',
    name: 'History',
    component: History
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'Admin',
    redirect: '/admin/dashboard',
    component: Admin,
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
  // 后续可添加其他页面，例如：
  // {
  //   path: '/submit-paper',
  //   name: 'SubmitPaper',
  //   component: () => import('@/views/SubmitPaper.vue')
  // },
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: () => import('@/views/Login.vue')
  // }
]

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式
  routes
})

// 可选：设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '毕业论文系统'
  next()
})

export default router