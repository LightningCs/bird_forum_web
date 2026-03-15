import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // 配置 @ 指向 src 目录
    }
  },
  // ======== 核心代理配置 ========
  server: {
    port: 5173,
    proxy: {
      // 只要请求地址以 /api 开头，就会触发代理
      '/api': {
        target: 'http://127.0.0.1:6666', // 后端真实的接口地址
        changeOrigin: true, // 允许跨域
        // 如果后端的接口本身没有 /api 前缀，需要用 rewrite 去掉它
        // 例如：前端请求 /api/user -> 代理转发到 http://127.0.0.1:6666/user
        rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})