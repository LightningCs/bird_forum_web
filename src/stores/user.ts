// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  id?: number
  username?: string
  email?: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>(localStorage.getItem('token') || '')
  
  // Load userInfo from localStorage if available
  const userInfoJson = localStorage.getItem('userInfo')
  const userInfo = ref<UserInfo | null>(userInfoJson ? JSON.parse(userInfoJson) : null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUserInfo = (info: UserInfo | null) => {
    userInfo.value = info
    if (info) {
      localStorage.setItem('userInfo', JSON.stringify(info))
    } else {
      localStorage.removeItem('userInfo')
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    logout
  }
})