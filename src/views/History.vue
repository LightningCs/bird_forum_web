<template>
  <div class="history-container">
    <header class="header">
      <div class="logo" @click="() => {router.push('/')}">
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
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>

          <TransitionGroup name="list" v-else-if="historyList.length > 0">
            <div 
              class="paper-item history-item" 
              v-for="item in historyList" 
              :key="item.articleId"
            >
              <div class="content-left" @click="goToPaperDetail(item.articleId)">
                <h3 class="paper-title">{{ item.title }}</h3>
                <p class="paper-summary" v-html="item.summary"></p>
                
                <div class="paper-meta">
                  <el-tag v-for="category in item.categories" :key="id" size="small" :type="item.tagType" plain>
                    {{ category.name }}
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
                  @click.stop="handleDelete(item.articleId)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </TransitionGroup>
          
          <el-empty v-if="!loading && historyList.length === 0" description="暂无浏览历史" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
import { getHistory, deleteHistory } from '@/api/history'
import { useUserStore } from '@/stores/user.ts'

const router = useRouter()
const userStore = useUserStore()

// 用户登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 浏览历史数据
const historyList = ref([])
const loading = ref(false)

// 获取历史记录
const fetchHistory = async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }

  loading.value = true
  try {
    const res = await getHistory({
      userId: userStore.userInfo.id,
      pageNo: 1,
      pageSize: 100
    })
    
    if (res) {
      // 根据后端实际返回结构调整映射
      // 假设后端返回的数据结构包含以下字段：
      // id, title, context/summary, createTime/lastViewedTime, likeNum/likes, image/cover, categoryName/category
      historyList.value = Array.isArray(res) ? res.map((item: any) => ({
        articleId: item.articleId,
        title: item.article.title,
        summary: item.article.context,
        categories: item.article.categories || '',
        tagType: 'primary',
        publishTime: item.article.createTime || '',
        likes: item.article.likeNum || 0,
        lastViewedTime: item.viewTime,
        cover: item.article.image || ''
      })) : []
    } else {
      historyList.value = []
    }
  } catch (error) {
    console.error('获取历史记录失败:', error)
    const errorMessage = error instanceof Error ? error.message : '获取历史记录失败'
    ElMessage.error(errorMessage)
    historyList.value = []
  } finally {
    loading.value = false
  }
}

const goToPaperDetail = (id: number) => { router.push(`/paper/${id}`) }

const goToSubmit = () => { router.push('/submit-paper') }

const openChat = () => { router.push('/chat') }

// 跳转好友列表
const goToFriends = () => {
  console.log('跳转到好友列表页面')
  router.push('/friends')
}

// 编辑与删除逻辑
const isEditMode = ref(false)

// 切换编辑模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

// 删除单条历史记录
const handleDelete = async (articleId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条浏览记录吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用删除接口
    await deleteHistory({
      articleId,
      userId: userStore.userInfo?.id
    })

    ElMessage.success('删除成功')
    // 重新获取历史记录
    await fetchHistory()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      const errorMessage = error instanceof Error ? error.message : '删除失败'
      ElMessage.error(errorMessage)
    }
  }
}

// 页面加载时获取历史记录
onMounted(() => {
  fetchHistory()
})
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

.logo-text {
  cursor: pointer;
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
}

/* ======== 标题区：两端对齐适配编辑按钮 ======== */
.section-title { 
  font-size: 18px; 
  font-weight: bold; 
  margin-bottom: 20px; 
  color: #333; 
  display: flex;
  justify-content: space-between; 
  align-items: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
}

.title-left {
  display: flex;
  align-items: baseline;
}

.section-title .subtitle {
  font-size: 14px;
  font-weight: normal;
  color: #666;
  margin-left: 12px;
}

/* ======== 文章列表项 ======== */
.paper-list { 
  margin-top: 10px; 
  position: relative;
}

.loading-container {
  padding: 20px 0;
}

.paper-item.history-item { 
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0; 
  padding: 20px 0; 
  transition: all 0.3s ease; 
  cursor: pointer; 
  gap: 24px;
}

.paper-item.history-item:hover { 
  background-color: #f9f9f9; 
  transform: translateX(4px);
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
  text-decoration: none;
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
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.history-cover :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  min-width: 60px;
}

/* Vue 列表过渡动画 (配合 TransitionGroup 使用) */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>