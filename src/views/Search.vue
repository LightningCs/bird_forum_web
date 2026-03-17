<template>
  <div class="search-page-container">
    <!-- 顶部导航 (与首页保持一致) -->
    <header class="header">
      <div class="logo" @click="goHome">小鸟论坛</div>

      <div class="search-box">
        <el-input
          v-model="searchInputValue"
          placeholder="搜索文章或作者"
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
          style="width: 400px; margin-right: 20px;"
          clearable
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <div class="header-right">
        <el-button type="success" @click="goToSubmit">+ 发布文章</el-button>
        <el-button :icon="Bell" @click="router.push('/notifications')">通知</el-button>
        <!-- 未登录状态：显示登录/注册按钮 -->
        <el-button v-if="!isLoggedIn" :icon="User" @click="login">登录 / 注册</el-button>

        <!-- 已登录状态：显示用户头像及下拉菜单 -->
        <el-dropdown v-else trigger="hover" @command="handleCommand" class="user-dropdown">
          <!-- 触发下拉的元素（头像） -->
          <div class="avatar-wrapper" @click="goToProfile">
            <img :src="currentUser.avatar" alt="用户头像" class="header-avatar" />
          </div>
          <!-- 下拉菜单内容 -->
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 为了移动端或直观体验，加个去主页的显式选项 -->
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>个人主页
              </el-dropdown-item>
              
              <!-- 需求 2.1 修改用户密码 -->
              <el-dropdown-item command="password">
                <el-icon><Lock /></el-icon>修改密码
              </el-dropdown-item>
              
              <!-- 需求 2.2 用户浏览文章历史 -->
              <el-dropdown-item command="history">
                <el-icon><Clock /></el-icon>浏览历史
              </el-dropdown-item>
              
              <!-- 需求 2.3 退出登录 (加上 divided 显示分割线) -->
              <el-dropdown-item command="logout" divided style="color: #f56c6c;">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="main-content">
      <div class="results-wrapper" v-loading="loading">
        <!-- 搜索结果信息提示 -->
        <div class="search-summary">
          <h2 class="summary-title">{{ searchSummaryText }}</h2>
          <span class="summary-count">共找到 <strong>{{ searchResults.length }}</strong> 篇相关文章</span>
        </div>

        <!-- 搜索结果列表 -->
        <div class="paper-list" v-if="searchResults.length > 0">
          <div 
            v-for="(paper, index) in searchResults" 
            :key="index" 
            class="paper-item"
            @click="goToPaperDetail(paper.id)"
          >
            <div>
              <div class="paper-header">
                <div class="author-info">
                  <img :src="paper.avatar" alt="头像" class="avatar" />
                  <span class="author">{{ paper.publisherName }}</span>
                </div>
              </div>
              <div class="paper-title" v-html="highlightKeyword(paper.title)"></div>
              <div class="paper-summary">{{ paper.content }}</div>
              <div class="paper-meta">
                <span>•</span>
                <span>{{ paper.createTime }}</span>
                <span>•</span>
                <span>{{ paper.viewNum }} 阅读</span>
                <span>•</span>
                <span>{{ paper.likeNum }} 赞</span>
              </div>
              <div class="paper-image" v-if="paper.image">
                <img :src="paper.image" alt="文章封面" />
              </div>
              <div class="categories">
                <el-tag v-for="tag in paper.categories" :key="tag" effect="dark" class="category-tag">
                  {{ tag.name }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 无结果时的空状态 -->
        <el-empty 
          v-else 
          description="抱歉，没有找到相关的文章，换个关键词试试吧~" 
          :image-size="200"
        >
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </el-empty>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticleList, getUserById } from '@/api/index'
import { Search, User, Lock, Clock, SwitchButton, Bell } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isLoggedIn = ref(false)
const currentUser = ref({})

// 状态定义
const loading = ref(false)
const searchInputValue = ref('')
const searchSummaryText = ref('')
const searchResults = ref([])

// ================== 模拟全局文章库 ==================
const allMockPapers =[
  {
    id: 1, title: '基于深度学习的图像识别研究', author: '张三', avatar: 'https://via.placeholder.com/40x40?text=Z',
    summary: '本文提出了一种新的卷积神经网络结构，用于提升图像分类准确率。', category: '计算机科学', date: '2025-04-01', views: 892, likes: 156, status: '已审核', image: 'https://via.placeholder.com/400x200?text=文章封面'
  },
  {
    id: 2, title: '智能交通系统的设计与实现', author: '李四', avatar: 'https://via.placeholder.com/40x40?text=L',
    summary: '本项目开发了一个城市交通调度系统，采用物联网技术进行实时监控。', category: '计算机科学', date: '2025-03-28', views: 734, likes: 122, status: '待审核', image: 'https://via.placeholder.com/400x200?text=交通图'
  },
  {
    id: 3, title: '大学生消费行为分析', author: '王五', avatar: 'https://via.placeholder.com/40x40?text=W',
    summary: '通过对500名学生的问卷调查，分析其消费习惯和影响因素。', category: '经济学', date: '2025-03-25', views: 610, likes: 98, status: '已审核', image: null
  },
  {
    id: 4, title: '人工智能在医疗诊断中的应用', author: '赵六', avatar: 'https://via.placeholder.com/40x40?text=Z',
    summary: '探讨AI大模型在早期肿瘤筛查中的准确率和伦理问题。', category: '人工智能', date: '2025-02-15', views: 1250, likes: 300, status: '已审核', image: null
  },
  {
    id: 5, title: '宏观经济学视角下的通货膨胀分析', author: '钱七', avatar: 'https://via.placeholder.com/40x40?text=Q',
    summary: '结合近十年的经济数据，分析通货膨胀对普通家庭财富的影响。', category: '经济学', date: '2025-01-20', views: 450, likes: 60, status: '已审核', image: 'https://via.placeholder.com/400x200?text=经济图表'
  }
]
// ====================================================

// 执行搜索逻辑
const performSearch = () => {
  loading.value = true
  
  // 从路由中获取参数
  const keyword = route.query.keyword as string
  const category = route.query.category as string

  // 模拟网络延迟
  setTimeout(async () => {
    if (category) {
      // 分类搜索：匹配所属学科
      searchInputValue.value = '' // 清空搜索框，因为是按分类点的
      searchSummaryText.value = `分类 "${category}" 下的文章`
      searchResults.value = await getArticleList({
        'category': category,
        'pageNo': 0,
        'pageSize': 1,
        'pageNum': 10
      })
    } else {
      // 关键字搜索：匹配标题、作者或摘要
      searchInputValue.value = keyword
      searchSummaryText.value = keyword === '' ? `全部文章` : `包含关键字 "${keyword}" 的搜索结果`
      searchResults.value = await getArticleList({
        'keyword': keyword,
        'pageNo': 0,
        'pageSize': 1,
        'pageNum': 10
      })
    }
    
    loading.value = false
  }, 500) // 延迟500ms，展示 loading 动画效果
}

// 高亮标题中的关键字
const highlightKeyword = (text: string) => {
  const keyword = route.query.keyword as string
  if (!keyword) return text
  // 使用正则替换，将关键字包裹在带有颜色的 span 中
  const reg = new RegExp(`(${keyword})`, 'gi')
  return text.replace(reg, '<span style="color: #e60000; font-weight: bold;">$1</span>')
}

// 头部搜索框触发重新搜索
const handleSearch = () => {
  if (!searchInputValue.value.trim()) return
  // 使用路由跳转自身，触发 query 变化
  router.push({ path: '/search', query: { keyword: searchInputValue.value } })
}

// 路由导航方法
const goHome = () => router.push('/')
const goToSubmit = () => router.push('/submit-paper')
const login = () => router.push('/login')
const goToPaperDetail = (id: number) => {
  console.log(`跳转到文章详情页，ID: ${id}`)
  router.push(`/paper/${id}`)
}

// 生命周期：组件挂载时执行一次搜索
onMounted(async () => {
  currentUser.value = await getUserById(1)

  if (currentUser.value !== null) {
    isLoggedIn.value = true
  }

  performSearch()
})

// 点击头像跳转个人主页
const goToProfile = () => {
  console.log(`跳转到用户ID为 ${currentUser.value.id} 的主页`)
  router.push(`/user/${currentUser.value.id}`)
}

// 处理下拉菜单的点击事件
const handleCommand = (command: string) => {
  if (command === 'profile') {
    goToProfile()
  } else if (command === 'password') {
    router.push('/change-password')
  } else if (command === 'history') {
    router.push('/history')
  } else if (command === 'logout') {
    // 退出登录前的确认弹窗
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      isLoggedIn.value = false
      ElMessage.success('已安全退出登录')
    }).catch(() => {})
  }
}

// 监听路由参数变化：当用户在当前搜索页再次点击搜索时，无需刷新页面重新拉取数据
watch(() => route.query, () => {
  performSearch()
})
</script>

<style scoped>
.search-page-container {
  font-family: 'Microsoft YaHei', sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 头部样式（与首页一致） */
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

.search-box {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 10px;
}

/* 主体内容区 */
.main-content {
  max-width: 900px;
  margin: 20px auto;
}

.results-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px 30px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  min-height: 500px;
}

/* 搜索摘要信息 */
.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 15px;
  margin-bottom: 10px;
}

.summary-title {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.summary-count {
  font-size: 14px;
  color: #666;
}

.summary-count strong {
  color: #1a73e8;
  font-size: 16px;
}

/* 文章列表样式 (复用首页核心样式) */
.paper-item {
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
  padding: 20px 10px; /* 悬停时稍微往内挤一点，效果更好看 */
  margin: 0 -10px;
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.author {
  font-weight: 500;
  color: #333;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
}

.status.approved {
  background-color: #4CAF50;
}

.status.pending {
  background-color: #FF9800;
}

.paper-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.paper-summary {
  color: #666;
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.6;
}

.paper-meta {
  color: #999;
  font-size: 13px;
  margin: 12px 0 8px 0;
  display: flex;
  gap: 10px;
}

.paper-image {
  margin-top: 15px;
  width: 100%;
  max-width: 300px;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
}

.paper-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag { margin-right: 10px; margin-left: 5px; margin-top: 10px; background-color: rgba(0, 0, 0, 0.2); border: none; }

/* ======== 新增：用户头像及下拉菜单样式 ======== */
.user-dropdown {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.avatar-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none; /* 去除点击时的虚线框 */
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

/* 鼠标悬停头像时的光圈效果 */
.header-avatar:hover {
  border-color: #1a73e8;
  box-shadow: 0 0 8px rgba(26, 115, 232, 0.4);
}
</style>