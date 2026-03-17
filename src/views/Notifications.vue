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
            <el-button type="danger" link @click="clearAll" :disabled="notifications.length === 0">
              清空通知
            </el-button>
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

        <!-- 通知列表 -->
        <div class="notify-list" v-if="filteredList.length > 0">
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="notify-item"
            :class="{ unread: !item.isRead }"
            @click="handleClick(item)"
          >
            <div class="notify-icon-wrap">
              <el-icon :class="['notify-icon', item.type]" :size="22">
                <component :is="iconMap[item.type]" />
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Bell, ChatDotRound, Pointer, Warning, InfoFilled, Close } from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('all')

const iconMap: Record<string, any> = {
  system: Bell,
  comment: ChatDotRound,
  like: Pointer,
  warning: Warning,
  info: InfoFilled
}

const notifications = ref([
  { id: 1, type: 'system', title: '系统公告', content: '小鸟论坛 v2.0 正式上线，新增 AI 审核、分类管理等功能，欢迎体验！', time: '2026-03-15 10:00:00', isRead: false, link: '/' },
  { id: 2, type: 'comment', title: '新评论', content: '用户「李四」评论了你的文章《基于深度学习的图像识别研究》', time: '2026-03-14 09:30:00', isRead: false, link: '/paper/1' },
  { id: 3, type: 'like', title: '获得点赞', content: '用户「王五」点赞了你的文章《智能交通系统的设计与实现》', time: '2026-03-13 16:20:00', isRead: false, link: '/paper/2' },
  { id: 4, type: 'warning', title: '内容警告', content: '你的评论因包含不当内容已被管理员隐藏，请遵守社区规范。', time: '2026-03-12 11:00:00', isRead: true, link: '' },
  { id: 5, type: 'system', title: '账号安全提醒', content: '检测到你的账号在新设备登录，如非本人操作请及时修改密码。', time: '2026-03-10 08:45:00', isRead: true, link: '/change-password' },
  { id: 6, type: 'like', title: '获得收藏', content: '用户「赵六」收藏了你的文章《大学生消费行为分析》', time: '2026-03-09 14:10:00', isRead: true, link: '/paper/3' },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const filteredList = computed(() =>
  activeTab.value === 'unread'
    ? notifications.value.filter(n => !n.isRead)
    : notifications.value
)

const handleClick = (item: any) => {
  item.isRead = true
  if (item.link) router.push(item.link)
}

const markAllRead = () => {
  notifications.value.forEach(n => { n.isRead = true })
  ElMessage.success('已全部标为已读')
}

const deleteOne = (id: number) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const clearAll = () => {
  notifications.value = []
  ElMessage.success('已清空所有通知')
}
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

.notify-item:hover { background-color: #f5f7fa; }

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
