<template>
  <div class="home-container">
    <!-- 头部 -->
    <header class="header">
      <div class="logo">小鸟论坛</div>

      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章或作者"
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
          style="width: 400px; margin-right: 20px;"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <div class="header-right">
        <el-button type="success" @click="goToSubmit">+ 发布文章</el-button>
        <el-button :icon="ChatLineRound" @click="openChat">聊天</el-button>
        
        <!-- 新增：好友按钮 -->
        <el-button :icon="UserFilled" @click="goToFriends" v-if="isLoggedIn">好友</el-button>

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
      <!-- 左侧导航：文章分类 -->
      <div class="sidebar">
        <h3>文章分类</h3>
        <ul>
          <li 
            v-for="(category, index) in categories" 
            :key="index" 
            class="interactive-li"
            @click="goToCategoryList(category.name)"
          >
            <img :src="category.icon" alt="" class="icon" />
            <span class="hover-text">{{ category.name }}</span>
          </li>
        </ul>
      </div>

      <!-- 中间主区：最新文章列表 -->
      <div class="content-area">
        <div class="section-title">最新文章</div>
        <div class="paper-list">
          <div 
            v-for="(paper, index) in articles" 
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
              <div class="paper-title">{{ paper.title }}</div>
              <div class="paper-summary">{{ paper.summary }}</div>
              <div class="paper-meta">
                <span>•</span>
                <span>{{ paper.createTime }}</span>
                <span>•</span>
                <span>{{ paper.viewNum }} 浏览</span>
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
      </div>

      <!-- 右侧边栏 -->
      <div class="right-sidebar">
        <!-- 热门文章 -->
        <div class="section">
          <h3>热门文章</h3>
          <ul>
            <li 
              v-for="(hot, index) in hotArticles" 
              :key="index"
              class="interactive-li clickable-item"
              @click="goToPaperDetail(hot.id)"
            >
              <span class="rank">{{ index + 1 }}</span>
              <span class="title hover-text">{{ hot.title }}</span>
              <span class="views">{{ hot.viewNum }} 阅读</span>
            </li>
          </ul>
        </div>

        <!-- 热门分类方向 -->
        <div class="section">
          <h3>热门分类</h3>
          <ul>
            <li 
              v-for="(major, index) in popularCategories" 
              :key="index"
              class="interactive-li"
              @click="goToCategoryList(major.name)"
            >
              <img :src="major.icon" alt="" class="major-icon" />
              <span class="hover-text">{{ major.name }}</span>
              <span class="count">{{ major.articleCount }} 篇文章</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticleList, getHotArticleList, getCategoryList, getUserById } from '@/api/index'
import { Search, ChatLineRound, UserFilled, User, Lock, Clock, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()

const currentUser = ref({
  id: 1, // 当前登录用户的ID
  name: '我',
  avatar: 'https://via.placeholder.com/40x40?text=我'
})

// ================== 原有数据与方法 (保持不变) ==================
const categories = ref([ { name: '计算机科学', icon: 'https://via.placeholder.com/20x20?text=CS' }, { name: '机械工程', icon: 'https://via.placeholder.com/20x20?text=ME' }, { name: '经济学', icon: 'https://via.placeholder.com/20x20?text=EC' }, { name: '管理学', icon: 'https://via.placeholder.com/20x20?text=MGT' }, { name: '心理学', icon: 'https://via.placeholder.com/20x20?text=PSY' } ])
const articles = ref([ 
  { id: 1, title: '基于深度学习的图像识别研究', publisherName: '张三', avatar: 'https://via.placeholder.com/40x40?text=Z', summary: '本文提出了一种新的卷积神经网络结构，用于提升图像分类准确率。', category: '计算机学院', createTime: '2025-04-01', likeNum: 156, image: 'https://via.placeholder.com/400x200?text=封面' }, 
  { id: 2, title: '智能交通系统的设计与实现', publisherName: '李四', avatar: 'https://via.placeholder.com/40x40?text=L', summary: '本项目开发了一个城市交通调度系统，采用物联网技术进行实时监控。', category: '自动化学院', createTime: '2025-03-28', likeNum: 122, image: 'https://via.placeholder.com/400x200?text=交通图' } ])
const hotArticles = ref([ { id: 101, title: 'AI在医疗诊断中的应用', viewNum: '12.3万' }, { id: 102, title: '区块链技术发展现状', viewNum: '9.8万' }, { id: 103, title: '新能源汽车电池寿命预测', viewNum: '8.2万' }, { id: 104, title: '高校学生心理压力调研', viewNum: '7.5万' } ])
const popularCategories = ref([ { name: '人工智能', articleCount: '156', icon: 'https://via.placeholder.com/20x20?text=AI' }, { name: '大数据', articleCount: '132', icon: 'https://via.placeholder.com/20x20?text=BD' }, { name: '物联网', articleCount: '98', icon: 'https://via.placeholder.com/20x20?text=IoT' }, { name: '金融学', articleCount: '85', icon: 'https://via.placeholder.com/20x20?text=FIN' } ])


onMounted(async () => {
  // 获取用户信息
  currentUser.value = await getUserById(1)
  // 获取分类列表
  categories.value = await getCategoryList({
    'pageNo': 0,
    'pageSize': 1,
    'pageNum': 10
  })
  console.log(categories)
  // 获取最新文章列表
  articles.value = await getArticleList({
    'pageNo': 0,
    'pageSize': 1,
    'pageNum': 10
  })
  // 获取热门文章
  hotArticles.value = await getHotArticleList()
  // 获取热门分类
  popularCategories.value = await getCategoryList({
    'pageNo': 0,
    'pageSize': 1,
    'pageNum': 10
  })
})

// ================== 新增：登录状态与用户信息 ==================
// 为了让你直接看到效果，这里默认设为 true (已登录)
const isLoggedIn = ref(true) 



// ================== 顶部导航交互事件 ==================
// 跳转好友列表
const goToFriends = () => {
  console.log('跳转到好友列表页面')
  router.push('/friends')
}

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

const searchKeyword = ref('')
const handleSearch = () => { router.push({ path: '/search', query: { keyword: searchKeyword.value } }) }
const goToSubmit = () => { router.push('/submit-paper') }
const login = () => { router.push('/login') }
const openChat = () => { router.push('/chat') }
const goToCategoryList = (name: string) => { router.push({ path: '/search', query: { category: name } }) }
const goToPaperDetail = (id: number) => { router.push(`/paper/${id}`) }
</script>

<style scoped>
/* 保持原有基础样式 */
.home-container { font-family: 'Microsoft YaHei', sans-serif; background-color: #f5f5f5; min-height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
.logo { font-size: 20px; font-weight: bold; color: #1a73e8; }
.search-box { display: flex; align-items: center; gap: 10px; }
.header-right { display: flex; align-items: center; gap: 10px; }

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

/* ======== 下面省略原有主体样式（直接使用即可） ======== */
.main-content { display: flex; padding: 20px; gap: 20px; }
.sidebar { width: 200px; background: white; border-radius: 8px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.sidebar h3 { margin-top: 0; color: #333; }
.sidebar ul { list-style: none; padding: 0; margin: 10px 0; }
.sidebar .icon { width: 20px; height: 20px; margin-right: 8px; vertical-align: middle; }
.content-area { flex: 1; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
.paper-list { margin-top: 10px; }
.paper-item { border-bottom: 1px solid #eee; padding: 15px 0; transition: all 0.2s; cursor: pointer; }
.paper-item:hover { background-color: #f9f9f9; }
.paper-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.author-info { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.author { font-weight: 500; }
.status { padding: 4px 8px; border-radius: 12px; font-size: 12px; color: white; }
.status.approved { background-color: #4CAF50; }
.status.pending { background-color: #FF9800; }
.paper-title { font-size: 16px; font-weight: 600; color: #333; margin: 0; line-height: 1.4; }
.paper-summary { color: #666; margin: 8px 0; font-size: 14px; line-height: 1.5; }
.paper-meta { color: #999; font-size: 12px; margin: 8px 0; display: flex; gap: 10px; }
.paper-image { margin-top: 10px; width: 100%; max-width: 400px; height: 200px; overflow: hidden; border-radius: 8px; }
.paper-image img { width: 100%; height: 100%; object-fit: cover; }
.right-sidebar { width: 300px; background: white; border-radius: 8px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.section { margin-bottom: 20px; }
.section h3 { margin-top: 0; color: #333; }
.section ul { list-style: none; padding: 0; margin: 10px 0; }
.section .rank { width: 20px; text-align: center; font-weight: bold; color: #ff6b00; }
.section .title { flex: 1; font-size: 14px; color: #333; }
.section .views { font-size: 12px; color: #999; }
.major-icon { width: 20px; height: 20px; margin-right: 8px; }
.count { font-size: 12px; color: #666; }
.category-tag { margin-right: 10px; margin-left: 5px; margin-top: 10px; background-color: rgba(0, 0, 0, 0.2); border: none; }

/* 交互列表样式 */
.interactive-li { cursor: pointer; transition: all 0.2s ease; padding: 8px 10px !important; border-radius: 4px; box-sizing: border-box; display: flex; align-items: center; gap: 8px; border-bottom: 1px dashed #eee; }
.interactive-li:hover { background-color: #f0f7ff; border-bottom-color: transparent; }
.interactive-li:hover .hover-text { color: #1a73e8; text-decoration: underline; }
</style>