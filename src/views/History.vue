<template>
  <div class="history-container">
    <header class="header">
      <div class="logo">
        <span class="logo-text">小鸟论坛</span>
      </div>
      
      <div class="header-right">
        <el-button type="success" @click="goToSubmit">+ 发布文章</el-button>
        <el-button :icon="Bell" @click="router.push('/notifications')">通知</el-button>
        <el-button @click="openChat">聊天</el-button>
        <el-button @click="goToFriends" v-if="isLoggedIn">好友</el-button>
      </div>
    </header>

    <main class="main-content">
      <div class="content-area history-list-wrapper">
        <div class="section-title">
          <div class="title-left">
            浏览历史
            <span class="subtitle">共 {{ historyList.length }} 条记录</span>
          </div>
          <el-button 
            :type="isEditMode ? 'success' : 'primary'" 
            plain 
            size="small" 
            @click="toggleEditMode"
          >
            {{ isEditMode ? '完成' : '编辑' }}
          </el-button>
        </div>

        <div class="paper-list">
          <TransitionGroup name="list">
            <div 
              class="paper-item history-item" 
              v-for="item in historyList" 
              :key="item.id"
            >
              <div class="content-left">
                <h3 class="paper-title" @click="goToPaperDetail(item.id)">{{ item.title }}</h3>
                <p class="paper-summary">{{ item.summary }}</p>
                
                <div class="paper-meta">
                  <el-tag size="small" :type="item.tagType" plain>
                    {{ item.category }}
                  </el-tag>
                  <span>·</span>
                  <span>发布于 {{ item.publishTime }}</span>
                  <span>·</span>
                  <span>{{ item.likes }} 赞</span>
                  <span>·</span>
                  <span class="viewed-time">上次浏览: {{ item.lastViewedTime }}</span>
                </div>
              </div>

              <div class="content-right">
                <el-image 
                  class="history-cover" 
                  :src="item.cover" 
                  fit="cover"
                >
                  <template #error>
                    <div class="image-slot">暂无图片</div>
                  </template>
                </el-image>
              </div>

              <div class="delete-action" v-if="isEditMode">
                <el-button 
                  type="danger" 
                  plain 
                  size="small"
                  @click.stop="handleDelete(item.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </TransitionGroup>
          
          <el-empty v-if="historyList.length === 0" description="暂无浏览历史" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'

const router = useRouter()

// 模拟用户登录状态
const isLoggedIn = ref(true) 

// 模拟浏览历史数据
const historyList = ref([
  {
    id: 1,
    title: '基于深度学习的图像识别研究与实践',
    summary: '本文提出了一种新的卷积神经网络结构，详细探讨了CNN的核心架构，用于提升图像分类准确率。',
    category: '深度学习',
    tagType: 'primary',
    publishTime: '2025-04-01',
    likes: 156,
    lastViewedTime: '刚刚',
    cover: 'https://picsum.photos/id/10/160/100'
  },
  {
    id: 2,
    title: '理解高并发：原理、场景和解决方案',
    summary: '本文通过具体项目场景，详细介绍了高并发场景下的解决方案，如分布式锁、缓存、数据库优化、消息队列等。',
    category: 'Java',
    tagType: 'success',
    publishTime: '2025-03-15',
    likes: 89,
    lastViewedTime: '2小时前',
    cover: 'https://picsum.photos/id/20/160/100'
  },
  {
    id: 3,
    title: 'MySQL 优化与性能调优',
    summary: '本文详细介绍了MySQL的性能优化方法，包括索引优化、查询优化、存储引擎优化等。',
    category: 'MySQL',
    tagType: 'warning',
    publishTime: '2025-02-28',
    likes: 234,
    lastViewedTime: '昨天 14:30',
    cover: 'https://picsum.photos/id/30/160/100'
  }
])

const goToPaperDetail = (id: number) => { router.push(`/paper/${id}`) }

const goToSubmit = () => { router.push('/submit-paper') }

const openChat = () => { router.push('/chat') }
// 跳转好友列表
const goToFriends = () => {
  console.log('跳转到好友列表页面')
  router.push('/friends')
}

// ======== 新增：编辑与删除逻辑 ========
const isEditMode = ref(false)

// 切换编辑模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

// 删除单条历史记录
const handleDelete = (id) => {
  historyList.value = historyList.value.filter(item => item.id !== id)
}
</script>

<style scoped>
/* ======== 全局与容器 ======== */
.history-container { 
  font-family: 'Microsoft YaHei', sans-serif; 
  background-color: #f5f5f5; 
  min-height: 100vh; 
}

/* ======== 顶部导航栏 ======== */
.header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 15px 30px; 
  background: white; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  position: sticky; 
  top: 0; 
  z-index: 100; 
}

.logo { 
  font-size: 20px; 
  font-weight: bold; 
  color: #1a73e8; 
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}

/* ======== 主体内容与卡片 ======== */
.main-content { 
  display: flex; 
  justify-content: center; 
  padding: 20px; 
}

.content-area.history-list-wrapper { 
  width: 100%;
  max-width: 1000px; 
  background: white; 
  border-radius: 8px; 
  padding: 24px; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
}

/* ======== 标题区：两端对齐适配编辑按钮 ======== */
.section-title { 
  font-size: 18px; 
  font-weight: bold; 
  margin-bottom: 20px; 
  color: #333; 
  display: flex;
  justify-content: space-between; /* 让标题和按钮分居左右 */
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.title-left {
  display: flex;
  align-items: baseline;
}

.section-title .subtitle {
  font-size: 14px;
  font-weight: normal;
  color: #999;
  margin-left: 12px;
}

/* ======== 文章列表项 ======== */
.paper-list { 
  margin-top: 10px; 
  position: relative;
}

.paper-item.history-item { 
  display: flex;
  justify-content: space-between;
  align-items: center; /* 确保右侧的删除按钮垂直居中 */
  border-bottom: 1px solid #eee; 
  padding: 20px 0; 
  transition: all 0.3s ease; 
  cursor: pointer; 
  gap: 24px;
}

.paper-item.history-item:hover { 
  background-color: #f9f9f9; 
}

.paper-item.history-item:last-child {
  border-bottom: none;
}

.content-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.paper-title { 
  font-size: 16px; 
  font-weight: 600; 
  color: #333; 
  margin: 0 0 10px 0; 
  line-height: 1.4; 
  transition: color 0.2s;
}

.paper-item.history-item:hover .paper-title {
  color: #1a73e8; 
}

.paper-summary { 
  color: #666; 
  margin: 0 0 12px 0; 
  font-size: 14px; 
  line-height: 1.6; 
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.paper-meta { 
  color: #999; 
  font-size: 12px; 
  display: flex; 
  align-items: center;
  gap: 10px; 
}

.viewed-time {
  color: #ff9800; 
  font-weight: 500;
}

/* ======== 封面图样式 ======== */
.content-right {
  width: 160px;
  height: 100px;
  flex-shrink: 0;
}

.history-cover {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  border: 1px solid #eee;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #ccc;
  font-size: 12px;
}

/* ======== 新增：编辑状态与删除按钮 ======== */
.delete-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 10px;
}

/* Vue 列表过渡动画 (配合 TransitionGroup 使用) */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>