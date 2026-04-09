// src/stores/index.ts
import { createPinia } from 'pinia'

// 创建全局 userStore 实例（在 Pinia 初始化时创建）
let userStore: ReturnType<typeof useUserStore> | null = null

// 从 router guard 中暴露获取 userStore 实例的函数
export const getUserStore = () => {
  if (!userStore) {
    throw new Error('userStore not initialized. Please ensure Pinia is properly setup.')
  }
  return userStore
}

// 在 Pinia 初始化时设置 userStore 实例
createPinia().use((state) => {
  // 确保 userStore 实例只被设置一次
  if (!userStore) {
    userStore = state
  }
})

export default createPinia({
  state: () => {
    userStore: null
  }
})