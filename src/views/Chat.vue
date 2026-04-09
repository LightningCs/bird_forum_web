<template>
  <div class="chat-page-container">
    <!-- 顶部导航 (保持系统一致性) -->
    <header class="header">
      <div class="logo" @click="goHome">小鸟论坛</div>
      <div class="header-right">
        <el-button :icon="ArrowLeft" @click="goHome">返回首页</el-button>
      </div>
    </header>

    <!-- 聊天主窗口布局 -->
    <main class="chat-layout">
      <!-- 左侧：互关好友列表 -->
      <aside class="friend-sidebar">
        <div class="sidebar-header">
          <h3>我的好友</h3>
          <!-- 简单的搜索框 -->
          <el-input 
            v-model="searchFriend" 
            placeholder="搜索好友..." 
            :prefix-icon="Search" 
            size="small" 
            clearable
          />
        </div>
        
        <div class="friend-list">
          <div 
            v-for="friend in filteredFriends" 
            :key="friend.id"
            class="friend-item"
            :class="{ 'active': activeFriendId === friend.id }"
            @click="selectFriend(friend.id)"
          >
            <div class="avatar-box">
              <img :src="friend.avatar" alt="头像" class="friend-avatar" />
            </div>
            <div class="friend-info">
              <div class="friend-name-row">
                <span class="friend-name">{{ friend.username }}</span>
                <span class="last-time">{{ friend.lastMessageTime }}</span>
              </div>
              <div class="friend-msg-row">
                <span class="last-msg">{{ friend.lastMessage }}</span>
                <span class="unread-badge" v-if="friend.unreadCount > 0">{{ friend.unreadCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧：聊天主区域 -->
      <section class="chat-area">
        <!-- 状态1：已选择好友，显示聊天界面 -->
        <div class="chat-window" v-if="activeFriend">
          <!-- 聊天窗头部 -->
          <header class="chat-header">
            <span class="chat-title">{{ activeFriend?.username }}</span>
          </header>

          <!-- 消息列表区 -->
          <div class="message-list" ref="messageListRef">
            <div 
              v-for="msg in currentMessages" 
              :key="msg.id" 
              class="message-wrapper"
              :class="msg.sourceId === currentUser.id ? 'is-me' : 'is-friend'"
            >
              <div class="message-time" v-if="msg.showTime">{{ msg.sendTime }}</div>
              <div class="message-content-row">
                <img 
                  :src="msg.sourceId === currentUser.id ? currentUser.avatar : activeFriend.avatar" 
                  alt="头像" 
                  class="msg-avatar" 
                />
                <div class="msg-bubble">
                  {{ msg.content }}
                </div>
              </div>
            </div>
          </div>

          <!-- 底部输入区 -->
          <footer class="chat-footer">
            <!-- 工具栏 (模拟) -->
            <div class="chat-toolbar">
              <el-icon class="toolbar-icon"><Picture /></el-icon>
              <el-icon class="toolbar-icon"><Folder /></el-icon>
              <el-icon class="toolbar-icon"><Microphone /></el-icon>
            </div>
            <!-- 文本输入框 -->
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="3"
              resize="none"
              placeholder="输入聊天内容，按 Enter 发送，Shift + Enter 换行"
              @keydown.enter.prevent="handleEnter"
              class="chat-input"
            />
            <!-- 发送按钮 -->
            <div class="send-action">
              <span class="tip-text">按 Enter 发送</span>
              <el-button type="primary" @click="sendMessage">发送 (Enter)</el-button>
            </div>
          </footer>
        </div>

        <!-- 状态2：未选择好友的空状态 -->
        <div class="empty-state" v-else>
          <el-icon class="empty-icon"><ChatDotRound /></el-icon>
          <p>请在左侧选择一个好友开始聊天</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFriendList, getChatMessages, saveMessage, getUserById } from '@/api/index'
import { ArrowLeft, Search, Picture, Folder, Microphone, ChatDotRound } from '@element-plus/icons-vue'


const router = useRouter()
const goHome = () => router.push('/')

// ================== 基础数据定义 ==================
const currentUser = ref({
  id: 1,
  name: '我',
  avatar: 'https://via.placeholder.com/40x40/1a73e8/ffffff?text=我'
})

// 互关好友列表模拟数据
const friends = ref([])

// 聊天记录字典 (Key 为 friendId)
const messagesDict = ref<Record<number, any[]>>({
  1001:[
    { id: 1, senderId: 8888, text: '老师好，我的毕业论文初稿已经发到您邮箱了，请您过目。', time: '10:25', showTime: true },
    { id: 2, senderId: 1001, text: '好的，论文初稿我晚上看一下。', time: '10:30', showTime: false },
    { id: 3, senderId: 1001, text: '对了，第三章的实验数据你核对过了吗？', time: '10:31', showTime: false },
  ],
  1002:[
    { id: 1, senderId: 1002, text: '兄弟，你那个深度学习的实验跑通了吗？', time: '昨天 15:00', showTime: true }
  ]
})

// ================== 状态与计算属性 ==================
const activeFriendId = ref<number | null>(null)
const searchFriend = ref('')
const inputText = ref('')
const messageListRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  currentUser.value = await getUserById(1)
  friends.value = await getFriendList(currentUser.value.id, false)
})

// 过滤后的好友列表 (支持搜索)
const filteredFriends = computed(() => {
  if (!searchFriend.value) return friends.value
  return friends.value.filter((f: any) => f.username.includes(searchFriend.value))
})

// 当前选中的好友对象
const activeFriend = computed(() =>
  friends.value.find((f: any) => f.id === activeFriendId.value) || null
)

// 当前窗口的消息列表
const currentMessages = computed(() => {
  if (!activeFriendId.value) return []
  return messagesDict.value[activeFriendId.value] || []
})

// ================== 交互方法 ==================

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 选择好友
const selectFriend = async (id: number) => {
  activeFriendId.value = id

  // 清除该好友的未读数
  const friend = friends.value.find((f: any) => f.id === id)
  if (friend) friend.unreadCount = 0

  // 确保字典里有该好友的数组
  if (!messagesDict.value[id]) {
    messagesDict.value[id] = []
  }

  // 从接口拉取与该好友的聊天记录
  try {
    const res = await getChatMessages({
      sourceId: currentUser.value.id,
      targetId: id,
      pageNo: 1,
      pageSize: 100
    })
    // 接口返回的消息列表赋值到字典
    messagesDict.value[id] = Array.isArray(res) ? res : (res?.data?.records || res?.data || [])
  } catch {
    // 接口不通时保留本地模拟数据
  }

  scrollToBottom()
}

// 处理回车发送 (Shift+Enter换行，Enter发送)
const handleEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) {
    // 默认换行行为，不需要阻止
  } else {
    sendMessage()
  }
}

// 发送消息
const sendMessage = () => {
  if (!inputText.value.trim() || !activeFriendId.value) return

  const friendId = activeFriendId.value
  const text = inputText.value.trim()
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const myMsg = {
    id: Date.now(),
    senderId: currentUser.value.id,
    sourceId: currentUser.value.id,
    targetId: friendId,
    text,
    content: text,
    time: timeStr,
    showTime: false
  }

  saveMessage({ sourceId: currentUser.value.id, targetId: friendId, content: text })

  if (!messagesDict.value[friendId]) messagesDict.value[friendId] = []
  messagesDict.value[friendId].push(myMsg)

  const friend = friends.value.find((f: any) => f.id === friendId)
  if (friend) {
    friend.lastMessage = text
    friend.lastMessageTime = timeStr
  }

  inputText.value = ''
  scrollToBottom()
  simulateReply(friendId)
}

// 模拟对方实时回复
const simulateReply = (friendId: number) => {
  setTimeout(() => {
    // 确保当前还没有切换聊天对象，或者后台静默追加
    const replyTexts =['好的，收到了！', '确实是这样，同意。', '稍等，我查一下资料。', '太棒了，继续保持！']
    const randomReply = replyTexts[Math.floor(Math.random() * replyTexts.length)]
    
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const friendMsg = {
      id: Date.now() + 1,
      senderId: friendId,
      content: randomReply,
      time: timeStr,
      showTime: false
    }

    // 将接收到的消息存入对应好友的数组
    messagesDict.value[friendId].push(friendMsg)

    // 更新好友列表的最新摘要
    const friend = friends.value.find((f: any) => f.id === friendId)
    if (friend) {
      friend.lastMessage = randomReply
      friend.lastMessageTime = timeStr
      // 如果当前不是这个好友的聊天界面，增加未读数
      if (activeFriendId.value !== friendId) {
        friend.unreadCount += 1
      }
    }

    // 如果正好在和这个好友聊天，滚动到底部
    if (activeFriendId.value === friendId) {
      scrollToBottom()
    }

  }, 1500) // 1.5秒后自动回复
}
</script>

<style scoped>
.chat-page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  overflow: hidden; /* 防止整个页面滚动，只在内部滚动 */
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
  flex-shrink: 0;
}
.logo { font-size: 20px; font-weight: bold; color: #1a73e8; cursor: pointer; }

/* 聊天主布局 */
.chat-layout {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 20px auto;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* ================== 左侧好友列表 ================== */
.friend-sidebar {
  width: 280px;
  background-color: #fdfdfd;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}
.sidebar-header h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.friend-list {
  flex: 1;
  overflow-y: auto;
}

.friend-item {
  display: flex;
  padding: 15px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f5f5f5;
}
.friend-item:hover {
  background-color: #f5f7fa;
}
.friend-item.active {
  background-color: #e6f1fc; /* 选中时的浅蓝色背景 */
}

.avatar-box {
  position: relative;
  margin-right: 12px;
}
.friend-avatar {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
}
.online-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 10px;
  height: 10px;
  background-color: #909399; /* 离线灰 */
  border-radius: 50%;
  border: 2px solid #fff;
}
.online-dot.is-online {
  background-color: #67c23a; /* 在线绿 */
}

.friend-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.friend-name-row, .friend-msg-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.friend-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.last-time {
  font-size: 12px;
  color: #999;
}
.last-msg {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 10px;
}
.unread-badge {
  background-color: #f56c6c;
  color: white;
  font-size: 12px;
  padding: 0 6px;
  border-radius: 10px;
  line-height: 18px;
  font-weight: bold;
}

/* ================== 右侧聊天区域 ================== */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* 状态1：正常的聊天窗口 */
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  height: 60px;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-title { font-size: 18px; font-weight: bold; color: #333; }
.chat-status { font-size: 13px; color: #67c23a; }

/* 滚动消息区 */
.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.message-time {
  text-align: center;
  font-size: 12px;
  color: #b0b4b8;
  margin-bottom: 15px;
}

.message-content-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.msg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.msg-bubble {
  max-width: 60%;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}

/* 区分对方和我方的气泡样式 */
.is-friend .message-content-row {
  flex-direction: row; /* 左侧 */
}
.is-friend .msg-bubble {
  background-color: #fff;
  color: #333;
  border: 1px solid #ebeef5;
  border-top-left-radius: 0; /* 左上角直角模拟气泡尖角 */
}

.is-me .message-content-row {
  flex-direction: row-reverse; /* 右侧 */
}
.is-me .msg-bubble {
  background-color: #1a73e8;
  color: #fff;
  border-top-right-radius: 0; /* 右上角直角模拟气泡尖角 */
}

/* 底部输入区 */
.chat-footer {
  height: 180px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}
.chat-toolbar {
  padding: 10px 20px;
  display: flex;
  gap: 15px;
  color: #606266;
}
.toolbar-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s;
}
.toolbar-icon:hover { color: #1a73e8; }

.chat-input {
  flex: 1;
}
.chat-input :deep(.el-textarea__inner) {
  border: none;
  box-shadow: none;
  padding: 0 20px;
  font-size: 15px;
}
.chat-input :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

.send-action {
  padding: 10px 20px 15px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
}
.tip-text { font-size: 12px; color: #999; }

/* 状态2：未选择时的空状态 */
.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}
.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #dcdfe6;
}
</style>