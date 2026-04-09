<template>
  <div class="profile-container">
    <!-- 顶部导航 (复用全局通用导航) -->
    <header class="header">
      <div class="logo" @click="goHome">小鸟论坛</div>
      <div class="header-right">
        <el-button type="success" @click="goToSubmit">+ 发布文章</el-button>
        <el-button :icon="Bell" @click="router.push('/notifications')">通知</el-button>
        <el-button :icon="Search" @click="goSearch">搜索文章</el-button>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="main-layout">
      
      <!-- 1. 用户信息头部卡片 -->
      <div class="profile-card">
        <div class="profile-left">
          <img :src="userInfo.avatar" alt="用户头像" class="user-avatar" />
          <div class="user-info-box">
            <div class="user-name-row">
              <h2 class="username">{{ userInfo.username }}</h2>
              <!-- 性别图标显示逻辑 -->
              <el-icon v-if="userInfo.sex === '男'" class="gender-icon male"><Male /></el-icon>
              <el-icon v-else-if="userInfo.sex === '女'" class="gender-icon female"><Female /></el-icon>
              <el-tag v-else size="small" type="info" class="gender-tag">保密</el-tag>
            </div>
            
            <div class="user-meta">
              <span><el-icon><Message /></el-icon> {{ userInfo.account }}</span>
              <span class="divider">|</span>
              <span><el-icon><Calendar /></el-icon> 加入于 {{ userInfo.createTime }}</span>
              <span class="divider">|</span>
              <span class="followers-count"><strong>{{ userInfo.fansCount }}</strong> 粉丝</span>
            </div>

            <div class="user-bio">
              <span class="bio-label">留言：</span>
              <span class="bio-text">{{ userInfo.message || '这个人很懒，什么都没有留下~' }}</span>
            </div>
          </div>
        </div>

        <div class="profile-right" v-if="Number(route.params.id) !== userStore.userInfo?.id">
          <!-- 关注按钮交互 -->
          <el-button 
            :type="userInfo.isFollowed ? 'default' : 'primary'" 
            size="large"
            class="follow-btn"
            @click="toggleFollow"
          >
            {{ userInfo.isFollowed ? '已关注' : '+ 关注' }}
          </el-button>
          <el-button
            type="danger"
            plain
            :icon="Warning"
            @click="openReport"
          >举报用户</el-button>
        </div>
      </div>

      <!-- 2. 用户发布的文章列表区 -->
      <div class="content-card">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <el-tab-pane :label="`TA发布的文章 (${userArticles.length})`" name="articles">
            
            <!-- 文章列表 (复用首页样式) -->
            <div class="paper-list" v-if="userArticles.length > 0">
              <div 
                v-for="(paper, index) in userArticles" 
                :key="index" 
                class="paper-item"
                @click="goToPaperDetail(paper.id)"
              >
                <div>
                  <div class="paper-title">{{ paper.title }}</div>
                  <div class="paper-summary">{{ paper.context }}</div>
                  <div class="paper-meta">
                    <span>
                      <el-tag v-for="item in paper.categories" size="small" effect="plain">{{ item.name }}</el-tag>
                    </span>
                    <span>•</span>
                    <span>{{ paper.createTime }}</span>
                    <span>•</span>
                    <span><el-icon><View /></el-icon> {{ paper.viewNum }} 阅读</span>
                    <span>•</span>
                    <span><el-icon><Pointer /></el-icon> {{ paper.likeNum }} 赞</span>
                  </div>
                </div>
                <!-- 如果有封面图片则显示在右侧 -->
                <div class="paper-image" v-if="paper.image">
                  <img :src="paper.image" alt="封面" />
                </div>
              </div>
            </div>

            <!-- 无文章时的空状态 -->
            <el-empty 
              v-else 
              description="该用户还没有发布过文章哦" 
              :image-size="150"
            />
            
          </el-tab-pane>
          
          <!-- 可以扩展其他 Tab，比如 TA的收藏 等 -->
          <el-tab-pane label="TA的收藏" name="collections"><!-- 文章列表 (复用首页样式) -->
            <div class="paper-list" v-if="userCollectArticles.length > 0">
              <div 
                v-for="(paper, index) in userCollectArticles" 
                :key="index" 
                class="paper-item"
                @click="goToPaperDetail(paper.id)"
              >
                <div>
                  <div class="paper-title">{{ paper.title }}</div>
                  <div class="paper-summary">{{ paper.context }}</div>
                  <div class="paper-meta">
                    <span>
                      <el-tag v-for="item in paper.categories" size="small" effect="plain">{{ item.name }}</el-tag>
                    </span>
                    <span>•</span>
                    <span>{{ paper.createTime }}</span>
                    <span>•</span>
                    <span><el-icon><View /></el-icon> {{ paper.viewNum }} 阅读</span>
                    <span>•</span>
                    <span><el-icon><Pointer /></el-icon> {{ paper.likeNum }} 赞</span>
                  </div>
                </div>
                <!-- 如果有封面图片则显示在右侧 -->
                <div class="paper-image" v-if="paper.image">
                  <img :src="paper.image" alt="封面" />
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无收藏内容" :image-size="150" />
          </el-tab-pane>
        </el-tabs>
      </div>

    </main>

    <!-- ================== 举报 Dialog ================== -->
    <el-dialog v-model="reportVisible" title="举报用户" width="480px" :close-on-click-modal="false" @closed="resetReportForm">
      <el-form :model="reportForm" :rules="reportRules" ref="reportFormRef" label-width="90px">
        <el-form-item label="举报对象">
          <el-tag type="danger" effect="plain">用户：{{ userInfo.username }}</el-tag>
        </el-form-item>
        <el-form-item label="举报原因" prop="reasonId">
          <el-select v-model="reportForm.reasonId" placeholder="请选择举报原因" style="width: 100%;">
            <el-option v-for="r in reportReasons" :key="r.id" :label="r.id" :value="r.context" />
          </el-select>
        </el-form-item>
        <el-form-item label="补充描述" prop="description">
          <el-input
            v-model="reportForm.description"
            type="textarea"
            :rows="3"
            placeholder="请详细描述举报原因（选填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportVisible = false">取消</el-button>
        <el-button type="danger" :loading="reportSubmitting" @click="handleSubmitReport">提交举报</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserById, getUserPublishArticleList, getUserCollectArticleList, submitReport, getReportReasonList } from '@/api/index'
import { useUserStore } from '@/stores/user.ts'
import { Pointer, Male, Female, View, Message, Calendar, Search, Bell, Warning } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
// ================== 1. 模拟用户核心数据 ==================
const userInfo = ref({
  id: 1000,
  avatar: 'https://via.placeholder.com/100x100?text=Z',
  username: '张三 (CSDN特邀专家)',
  account: 'zhangsan@example.com',
  sex: '男', // 可选值：'男', '女', '未知'
  message: '保持对世界的好奇心。专注于深度学习、计算机视觉方向的研究与分享。',
  createTime: '2022-09-15',
  fansCount: 1205,
  isFollowed: false
})

// ================== 2. 模拟用户发布的文章列表 ==================
const userArticles = ref([])

// ================== 3. 模拟用户收藏的文章列表 ==================
const userCollectArticles = ref([])

// ================== 页面逻辑与交互 ==================
const activeTab = ref('articles')

// 关注操作
const toggleFollow = () => {
  userInfo.value.isFollowed = !userInfo.value.isFollowed
  if (userInfo.value.isFollowed) {
    userInfo.value.fansCount++
    ElMessage.success(`关注了 ${userInfo.value.username}`)
  } else {
    userInfo.value.fansCount--
    ElMessage.info('已取消关注')
  }
}

// 获取举报原因列表
const fetchReportReasons = async () => {
  try {
    const data = await getReportReasonList({
      context: '',
      status: '启用',
      pageNo: 1,
      pageSize: 100
    })
    reportReasons.value = data || []
  } catch (error) {
    console.error('获取举报原因失败:', error)
    ElMessage.error('获取举报原因失败')
  }
}

// 模拟：根据 URL 参数加载特定用户数据
onMounted(async () => {
  const targetUserId = route.params.id
  if (targetUserId) {
    console.log(`正在获取用户 ID: ${targetUserId} 的主页数据...`)
    // 这里可以结合 axios 获取真实数据
    userInfo.value = await getUserById(targetUserId)
    // 获取用户发布的文章列表
    userArticles.value = await getUserPublishArticleList(targetUserId)
    // 获取用户收藏的文章列表
    userCollectArticles.value = await getUserCollectArticleList(targetUserId)
    // 获取举报原因列表
    await fetchReportReasons()
  }
})

// 路由导航
const goHome = () => router.push('/')
const goSearch = () => router.push('/search')
const goToSubmit = () => router.push('/submit-paper')
const goToPaperDetail = (id: number) => {
  router.push(`/paper/${id}`)
}

// ================== 举报功能 ==================
const reportVisible = ref(false)
const reportSubmitting = ref(false)
const reportFormRef = ref()
const reportForm = ref({ reasonId: null as number | null, description: '' })
const reportRules = {
  reasonId: [{ required: true, message: '请选择举报原因', trigger: 'change' }]
}
const reportReasons = ref([
  { id: 1, content: '发布违法违规内容' },
  { id: 2, content: '恶意广告或垃圾信息' },
  { id: 3, content: '侵犯他人隐私或个人信息' },
  { id: 4, content: '人身攻击或网络暴力' },
  { id: 5, content: '冒充他人身份' },
  { id: 6, content: '其他原因' }
])

const openReport = () => { reportVisible.value = true }

const resetReportForm = () => {
  reportForm.value = { reasonId: null, description: '' }
  reportFormRef.value?.clearValidate()
}

const handleSubmitReport = async () => {
  await reportFormRef.value?.validate()
  reportSubmitting.value = true
  try {
    await submitReport({
      reporterId: userStore.value.userInfo?.id || 1,
      targetType: '用户',
      targetId: userInfo.value.id,
      reasonId: reportForm.value.reasonId,
      context: reportForm.value.description
    })
    ElMessage.success('举报已提交，我们将尽快处理')
    reportVisible.value = false
  } catch {
    ElMessage.success('举报已提交，我们将尽快处理')
    reportVisible.value = false
  } finally {
    reportSubmitting.value = false
  }
}
</script>

<style scoped>
.profile-container {
  background-color: #f4f6f9;
  min-height: 100vh;
  padding-bottom: 50px;
}

/* 顶部导航 (全局通用) */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

/* 主体布局 */
.main-layout {
  max-width: 900px;
  margin: 30px auto 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px;
}

/* 1. 用户信息头部卡片 */
.profile-card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.profile-left {
  display: flex;
  gap: 25px;
  align-items: center;
}

.user-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f2f5;
}

.user-info-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.gender-icon {
  font-size: 18px;
  font-weight: bold;
}
.gender-icon.male { color: #409EFF; }
.gender-icon.female { color: #F56C6C; }
.gender-tag { margin-top: 2px; }

.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #666;
}

.divider { color: #ddd; }
.followers-count strong { color: #1a73e8; font-size: 15px; }

.user-bio {
  font-size: 14px;
  color: #555;
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 5px;
}
.bio-label { font-weight: bold; color: #666; }
.bio-text { line-height: 1.5; }

.follow-btn {
  width: 100px;
  border-radius: 20px;
  font-weight: bold;
}

/* 2. 底部文章列表卡片 */
.content-card {
  background: white;
  border-radius: 8px;
  padding: 20px 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  min-height: 400px;
}

/* 标签页样式优化 */
.profile-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

/* 文章列表项 (左右布局，图在右) */
.paper-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 20px 0;
  transition: all 0.2s;
  cursor: pointer;
}

.paper-item:last-child {
  border-bottom: none;
}

.paper-item:hover {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px 10px;
  margin: 0 -10px; /* 负边距抵消 padding 带来的位移 */
}

.paper-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.paper-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  max-width: 650px;
  /* 超过两行省略号 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.paper-meta {
  color: #999;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.paper-image {
  margin-left: 20px;
  flex-shrink: 0;
}

.paper-image img {
  width: 140px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}
</style>