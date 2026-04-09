<template>
  <el-container class="admin-layout">
    <!-- ================== 左侧固定侧边栏 ================== -->
    <el-aside width="220px" class="sidebar">
      <div class="logo-box">
        <span class="logo-text">小鸟论坛系统后台</span>
      </div>
      
      <!-- 注意这里新增了 router 属性，开启路由模式 -->
      <!-- default-active 绑定当前路由路径，实现刷新后菜单高亮不丢失 -->
      <el-menu
        router
        :default-active="route.path"
        class="admin-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘概览</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/managers">
          <el-icon><Management /></el-icon>
          <span>管理员管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/articles">
          <el-icon><Document /></el-icon>
          <span>文章管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/comments">
          <el-icon><ChatLineRound /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/categories">
          <el-icon><List /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/reportReasons">
          <el-icon><Ticket /></el-icon>
          <span>举报原因管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/reports">
          <el-icon><Warning /></el-icon>
          <span>举报审核</span>
        </el-menu-item>        
        
        <el-menu-item index="/admin/notices">
          <el-icon><Message /></el-icon>
          <span>通知管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- ================== 右侧主体区域 ================== -->
    <el-container class="main-container">
      <!-- 顶部 Header -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-icon class="collapse-icon"><Fold /></el-icon>
        </div>
        <div class="header-right">
          <el-avatar size="small" src="https://via.placeholder.com/40x40/1a73e8/ffffff?text=Admin" style="margin-right: 10px;" />
          <span class="admin-name">超级管理员</span>
          <el-button type="danger" link style="margin-left: 20px;" @click="logout">退出登录</el-button>
        </div>
      </el-header>

      <!-- 核心内容区 (动态渲染区域) -->
      <el-main class="dashboard-content">
        <!-- 【魔法在这里】这里是一个“插槽”，点击左侧菜单时，对应的页面会在这里面渲染 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataLine, User, Document, ChatLineRound, Warning, Management, List, Ticket, Message } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 退出登录
const logout = () => {
  ElMessageBox.confirm('确定要退出后台管理系统吗?', '提示', {
    confirmButtonText: '确定退出',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('已安全退出')
    router.push('/admin/login') 
  }).catch(() => {})
}
</script>

<style scoped>
/* 布局样式与之前一样，剔除了数据卡片的样式 */
.admin-layout { height: 100vh; width: 100vw; overflow: hidden; }
.sidebar { background-color: #304156; display: flex; flex-direction: column; transition: width 0.3s; }
.logo-box { height: 60px; display: flex; justify-content: center; align-items: center; background-color: #2b3649; color: white; font-size: 18px; font-weight: bold; letter-spacing: 1px; }
.admin-menu { border-right: none; flex: 1; overflow-y: auto; }
.admin-menu::-webkit-scrollbar { display: none; }
.admin-header { height: 60px; background-color: #ffffff; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08); z-index: 10; }
.header-left { display: flex; align-items: center; font-size: 20px; cursor: pointer; }
.header-right { display: flex; align-items: center; }
.admin-name { font-size: 14px; color: #333; font-weight: 500; }
.main-container { display: flex; flex-direction: column; background-color: #f0f2f5; }
.dashboard-content { padding: 20px; flex: 1; overflow-y: auto; }
</style>