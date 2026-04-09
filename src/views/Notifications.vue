<template>
  <div class="notifications-container">
    <header class="header">
      <div class="logo" @click="router.push('/')">小鸟论坛</div>
      <div class="header-right">
        <el-button @click="router.back()">返回</el-button>
      </div>
    </header>

    <main class="main-content">
      <el-card shadow="never" class="notify-card">
        <div class="card-header">
          <span class="card-title">系统通知</span>
          <div class="header-actions">
            <el-button type="primary" link @click="markAllRead" :disabled="unreadCount === 0">
              全部标为已读
            </el-button>
            <!-- <el-button type="danger" link @click="clearAll" :disabled="notifications.length === 0">
              清空通知
            </el-button> -->
          </div>
        </div>

        <!-- 筛选 Tab -->
        <el-tabs v-model="activeTab" class="notify-tabs">
          <el-tab-pane name="all">
            <template #label>全部 <el-badge :value="notifications.length" type="info" class="tab-badge" /></template>
          </el-tab-pane>
          <el-tab-pane name="unread">
            <template #label>未读 <el-badge :value="unreadCount" type="danger" class="tab-badge" :hidden="unreadCount === 0" /></template>
          </el-tab-pane>
        </el-tabs>

        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- 通知列表 -->
        <div class="notify-list" v-else-if="notifications.length > 0">
          <div
            v-for="item in notifications"
            :key="item.id"
            class="notify-item"
            :class="{ unread: !item.isRead }"
            @click="handleClick(item)"
          >
            <div class="notify-icon-wrap">
              <el-icon :class="['notify-icon', 'system']" :size="22">
                <component :is="iconMap['system']" />
              </el-icon>
              <span v-if="!item.isRead" class="unread-dot" />
            </div>

            <div class="notify-body">
              <div class="notify-title">{{ item.title }}</div>
              <div class="notify-content">{{ item.content }}</div>
              <div class="notify-time">{{ item.time }}</div>
            </div>

            <el-button
              type="danger"
              link
              :icon="Close"
              class="delete-btn"
              @click.stop="deleteOne(item.id)"
            />
          </div>
        </div>

        <el-empty v-else description="暂无通知" :image-size="120" />
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Bell, ChatDotRound, Pointer, Warning, InfoFilled, Close } from '@element-plus/icons-vue'
import { getNoticePage, addNoticeRead } from '@/api/notice'
import { useUserStore } from '@/stores/user.ts'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('all')
const loading = ref(false)

const iconMap: Record<string, any> = {
  system: Bell,
  comment: ChatDotRound,
  like: Pointer,
  warning: Warning,
  info: InfoFilled
}

const notifications = ref<any[]>([])

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

// Fetch notifications from backend
const fetchNotifications = async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }

  loading.value = true
  try {
    const params: Record<string, unknown> = {
      userId: userStore.userInfo.id,
      pageNo: 1,
      pageSize: 100
    }

    // Only add isRead parameter if filtering by unread
    if (activeTab.value === 'unread') {
      params.isRead = '否'
    }

    const res = await getNoticePage(params)
    
    if (res) {
      // Map backend data to frontend structure
      notifications.value = res.map((item: Record<string, unknown>) => ({
        id: item.id,
        type: item.type || 'info',
        title: item.title || '',
        content: item.context || '',
        time: item.createTime || '',
        isRead: item.isRead === '是',
        link: '' // Backend doesn't provide link, you may need to generate it based on type
      }))
    } else {
      notifications.value = []
    }
  } catch (error: unknown) {
    console.error('Failed to fetch notifications:', error)
    const errorMessage = error instanceof Error ? error.message : '获取通知失败'
    ElMessage.error(errorMessage)
    notifications.value = []
  } finally {
    loading.value = false
  }
}

// Watch for tab changes to refetch data
watch(activeTab, () => {
  fetchNotifications()
})

const handleClick = (item: Record<string, unknown>) => {
  item.isRead = true
  // You may need to call a backend API to mark as read
  if (item.link) router.push(item.link as string)
}

const markAllRead = () => {
  // You may need to call a backend API to mark all as read
  notifications.value.forEach(n => { 
    n.isRead = true
    addNoticeRead({
      noticeId: n.id,
      userId: userStore.userInfo?.id || 0,
      isRead: '是'
    })
  })
  ElMessage.success('已全部标为已读')
}

const deleteOne = (id: number) => {
  // You may need to call a backend API to delete
  notifications.value = notifications.value.filter(n => n.id !== id)
  addNoticeRead({
    noticeId: id,
    userId: userStore.userInfo?.id || 0,
    isRead: '是'
  })
}

const clearAll = () => {
  // You may need to call a backend API to clear all
  notifications.value = []
  ElMessage.success('已清空所有通知')
}

// Fetch notifications on mount
onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notifications-container {
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}

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
  cursor: pointer;
}

.header-right { display: flex; gap: 10px; }

.main-content {
  max-width: 760px;
  margin: 30px auto;
  padding: 0 20px;
}

.notify-card { border-radius: 8px; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-actions { display: flex; gap: 4px; }

.notify-tabs { margin-bottom: 8px; }

.tab-badge { margin-left: 6px; }

.loading-container {
  padding: 20px 0;
}

.notify-list { display: flex; flex-direction: column; }

.notify-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 8px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  position: relative;
}

.notify-item:last-child { border-bottom: none; }

.notify-item:hover { background-color: #f5f7f5; }

.notify-item.unread { background-color: #f0f7ff; }
.notify-item.unread:hover { background-color: #e6f0fd; }

.notify-icon-wrap {
  position: relative;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notify-icon.system { color: #409eff; }
.notify-icon.comment { color: #67c23a; }
.notify-icon.like { color: #f56c6c; }
.notify-icon.warning { color: #e6a23c; }
.notify-icon.info { color: #909399; }

.unread-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c;
  border: 1px solid #fff;
}

.notify-body { flex: 1; min-width: 0; }

.notify-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.notify-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 6px;
}

.notify-time {
  font-size: 12px;
  color: #c0c4cc;
}

.delete-btn {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.notify-item:hover .delete-btn { opacity: 1; }
</style>