<template>
  <div class="friends-page-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="logo" @click="goHome">小鸟论坛</div>
      <div class="header-right">
        <el-button :icon="ArrowLeft" @click="goHome">返回首页</el-button>
      </div>
    </header>

    <!-- 主体内容区 -->
    <main class="main-layout">
      <div class="friends-wrapper">
        
        <!-- 页面头部与搜索栏 -->
        <div class="page-header">
          <div class="title-area">
            <h2 class="page-title">我的好友</h2>
            <span class="count-badge">共 {{ filteredFriends.length }} 人</span>
          </div>
          <el-input 
            v-model="searchQuery" 
            placeholder="输入名称或账号搜索..." 
            :prefix-icon="Search" 
            style="width: 260px;"
            clearable
          />
        </div>

        <!-- 好友列表区 -->
        <div class="friends-list" v-if="filteredFriends.length > 0">
          <div 
            v-for="friend in filteredFriends" 
            :key="friend.id" 
            class="friend-card"
          >
            <!-- 左侧：头像与在线状态 -->
            <div class="friend-left clickable" @click="goToUserProfile(friend.id)">
              <div class="avatar-box">
                <img :src="friend.avatar" alt="头像" class="avatar-img" />
                <!-- <span class="online-dot" :class="{ 'is-online': friend.isOnline }"></span> -->
              </div>
            </div>

            <!-- 中间：名称、账号与标签 -->
            <div class="friend-middle">
              <div class="name-row">
                <span class="friend-name clickable" @click="goToUserProfile(friend.id)">
                  {{ friend.username }}
                </span>
                <!-- <el-tag 
                  size="small" 
                  :type="friend.isOnline ? 'success' : 'info'" 
                  effect="light"
                  class="status-tag"
                >
                  {{ friend.isOnline ? '在线' : '离线' }}
                </el-tag> -->
              </div>
              <div class="account-row">
                <el-icon><Message /></el-icon>
                <span>{{ friend.account }}</span>
              </div>
            </div>

            <!-- 右侧：操作按钮 -->
            <div class="friend-right">
              <!-- 关注/互关按钮 -->
              <el-button 
                :type="friend.isFollowed ? 'default' : 'primary'" 
                :plain="!friend.isFollowed"
                class="action-btn follow-btn"
                @click="toggleFollow(friend)"
              >
                <el-icon v-if="!friend.isFollowed"><Switch /></el-icon>
                <el-icon v-else><Check /></el-icon>
                {{ !friend.isFollowed ? '取消关注' : '关注' }}
              </el-button>
              
              <!-- 聊天按钮 -->
              <el-button 
                type="primary" 
                class="action-btn chat-btn"
                @click="goToChat(friend.id)"
              >
                <el-icon><ChatDotRound /></el-icon>
                发消息
              </el-button>
            </div>
          </div>
        </div>

        <!-- 无搜索结果或无好友时的空状态 -->
        <el-empty 
          v-else 
          description="没有找到相关好友哦" 
          :image-size="160"
        />

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getFriendList } from '@/api/index'
import { Search, ArrowLeft, Message, Check, Switch, ChatDotRound } from '@element-plus/icons-vue'
import { follow, unfollow } from '@/api/follow'
import { useUserStore } from '@/stores/user.ts'

const router = useRouter()
const userStore = useUserStore()

// ================== 模拟好友数据 ==================
const friendsList = ref([])

// ================== 状态与方法 ==================
const searchQuery = ref('')

// 计算属性：实现实时搜索过滤
const filteredFriends = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) return friendsList.value
  
  return friendsList.value.filter(friend => 
    friend.name.toLowerCase().includes(keyword) || 
    friend.account.toLowerCase().includes(keyword)
  )
})

// 关注/取消关注交互逻辑
const toggleFollow = (friend: any) => {
  if (!friend.isFollowed) {
    // 如果是互关，点击变成单向关注 (取消了我的关注)
    ElMessage.info(`已取消关注 ${friend.username}`)
    // 实际项目中应该是调接口删除好友关系，这里简单模拟状态变化
    unfollow(userStore.userInfo?.id, friend.id)
    friend.isFollowed = true
  } else {
    // 重新关注
    ElMessage.success(`关注成功！`)
    follow(userStore.userInfo?.id, friend.id)
    friend.isFollowed = false 
  }
}

onMounted(async () => {
  friendsList.value = await getFriendList(1, false)
})

// ================== 路由跳转 ==================
const goHome = () => router.push('/')

// 点击头像或名字跳转到用户主页
const goToUserProfile = (id: number) => {
  router.push(`/user/${id}`)
}

// 点击发消息跳转到聊天页面（并带上好友 ID）
const goToChat = (id: number) => {
  console.log(`跳转到聊天室，并打开与用户 ${id} 的对话`)
  // 实际开发中可以通过 query 或 params 传参，让聊天页直接选中此人
  // router.push({ path: '/chat', query: { friendId: id } })
  router.push('/chat') 
}
</script>

<style scoped>
.friends-page-container {
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f4f6f9;
  min-height: 100vh;
  padding-bottom: 40px;
}

/* 顶部导航 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}
.logo { font-size: 20px; font-weight: bold; color: #1a73e8; cursor: pointer; }

/* 主体布局 */
.main-layout {
  max-width: 800px;
  margin: 30px auto 0;
  padding: 0 20px;
}

.friends-wrapper {
  background: white;
  border-radius: 8px;
  padding: 25px 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  min-height: 600px;
}

/* 页面头部：标题与搜索 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.title-area {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.count-badge {
  background-color: #e6f1fc;
  color: #1a73e8;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

/* 好友列表卡片样式 */
.friend-card {
  display: flex;
  align-items: center;
  padding: 20px 15px;
  border-bottom: 1px solid #fafafa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.friend-card:hover {
  background-color: #f9fbfd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transform: translateY(-1px);
}

/* 左侧：头像区 */
.friend-left {
  margin-right: 20px;
  flex-shrink: 0;
}

.avatar-box {
  position: relative;
  width: 56px;
  height: 56px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f2f5;
}

.online-dot {
  position: absolute;
  right: 0;
  bottom: 2px;
  width: 12px;
  height: 12px;
  background-color: #909399; /* 离线灰 */
  border-radius: 50%;
  border: 2px solid #fff;
}
.online-dot.is-online {
  background-color: #67c23a; /* 在线绿 */
}

/* 中间：信息区 */
.friend-middle {
  flex: 1;
  min-width: 0; /* 防止文本溢出 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.friend-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.status-tag {
  font-weight: normal;
  border: none;
}

.account-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #888;
}

/* 右侧：操作按钮 */
.friend-right {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  border-radius: 20px;
  padding: 8px 16px;
}

.follow-btn {
  width: 106px; /* 固定宽度防止文字变化时按钮抖动 */
}

.chat-btn {
  font-weight: bold;
}

/* 统一的可点击交互样式 */
.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}
.clickable:hover {
  opacity: 0.8;
}
.friend-name.clickable:hover {
  color: #1a73e8;
  text-decoration: underline;
}
</style>