// src/stores/user.js
import { defineStore } from 'pinia'

// 创建 userStore 实例
export const userStore = defineStore({
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    isLoggedIn: computed(() => !!userStore.state.token)
  })
})

// 提供辅助方法
userStore.setToken = (newToken) => {
  userStore.state.token = newToken
  if (newToken) {
    localStorage.setItem('token', newToken)
  } else {
    localStorage.removeItem('token')
  }
}

userStore.setUserInfo = (info) => {
  userStore.state.userInfo = info
}

userStore.logout = () => {
  userStore.state.token = ''
  userStore.state.userInfo = null
  localStorage.removeItem('token')
}