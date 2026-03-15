<template>
  <div class="detail-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="logo" @click="goHome">🎓 毕业论文系统</div>
      <div class="header-right">
        <el-button type="success" @click="goToSubmit">+ 发布论文</el-button>
        <el-button :icon="User" @click="goHome">返回首页</el-button>
      </div>
    </header>

    <!-- 顶部封面背景 -->
    <div class="cover-banner" :style="{ backgroundImage: `url(${article.image})` }">
      <div class="banner-mask">
        <div class="banner-content">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="categories">
            <el-tag v-for="tag in article.categories" :key="tag" effect="dark" class="category-tag">
              {{ tag.name }}
            </el-tag>
          </div>
          <div class="article-meta">
            <div class="author clickable" @click="goToUserProfile(article.publisherId)">
              <img :src="article.avatar" alt="头像" class="avatar" />
              <span>{{ article.publisherName }}</span>
            </div>
            <span class="divider">|</span>
            <span>发布于 {{ article.createTime }}</span>
            <span class="divider">|</span>
            <span><el-icon><View /></el-icon> {{ article.viewNum }} 阅读</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容区 -->
    <main class="main-layout">
      <!-- 左侧：文章正文 + 评论区 -->
      <div class="left-content">
        <!-- 1. 文章正文 -->
        <article class="article-body">
          <div class="html-content" v-html="article.context"></div>
        </article>

        <!-- 2. 互动操作区 (点赞、收藏) -->
        <div class="action-bar">
          <el-button 
            :type="isLiked ? 'primary' : 'default'" 
            size="large" 
            class="action-btn"
            @click="toggleLike"
          >
            <el-icon size="18"><Pointer /></el-icon>
            <span>{{ isLiked ? '已赞' : '点赞' }} ({{ article.likeNum }})</span>
          </el-button>
          
          <el-button 
            :type="isCollected ? 'warning' : 'default'" 
            size="large" 
            class="action-btn"
            @click="toggleCollect"
          >
            <el-icon size="18"><Star /></el-icon>
            <span>{{ isCollected ? '已收藏' : '收藏' }} ({{ article.collectNum }})</span>
          </el-button>
        </div>

        <!-- 3. 评论区 -->
        <div class="comments-section">
          <h3 class="section-title">评论 ({{ comments.length }})</h3>
          
          <!-- 发布评论框 -->
          <div class="comment-input-area" id="comment-input-box">
            <img :src=article.avatar alt="我的头像" class="my-avatar" />
            <div class="input-box">
              <!-- 回复提示条 -->
              <div class="reply-tip" v-if="replyState.active">
                <span>正在回复 @{{ replyState.targetName }}</span>
                <el-button type="primary" link @click="cancelReply" size="small">取消回复</el-button>
              </div>
              
              <el-input 
                ref="commentInputRef"
                v-model="newComment" 
                type="textarea" 
                :rows="3" 
                :placeholder="replyState.active ? `回复 @${replyState.targetName}...` : '写下你的评论或疑问...'" 
              />
              <div class="submit-row">
                <el-button type="primary" @click="submitComment">
                  {{ replyState.active ? '发布回复' : '发布评论' }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <!-- 根评论 -->
              <div class="comment-main">
                <img :src="comment.avatar" alt="头像" class="comment-avatar clickable" @click="goToUserProfile(comment.commentUserId)" />
                <div class="comment-content-box">
                  <div class="comment-header">
                    <span class="comment-author clickable" @click="goToUserProfile(comment.commentUserId)">{{ comment.userName }}</span>
                    <span class="comment-time">{{ comment.createTime }}</span>
                  </div>
                  <div class="comment-text">{{ comment.context }}</div>
                  
                  <!-- 评论操作栏：点赞与回复 -->
                  <div class="comment-actions">
                    <span 
                      class="action-item" 
                      :class="{ 'is-liked': comment.isLike }"
                      @click="toggleCommentLike(comment)"
                    >
                      <el-icon><Pointer /></el-icon> {{ comment.likeNum > 0 ? comment.likeNum : '点赞' }}
                    </span>
                    <span class="action-item" @click="handleReply(comment.id, comment.userName)">
                      <el-icon><ChatDotRound /></el-icon> 回复
                    </span>
                  </div>
                  
                  <!-- 嵌套的子回复 -->
                  <div class="replies-box" v-if="comment.children && comment.children.length > 0">
                    <div v-for="reply in comment.children" :key="reply.id" class="reply-item">
                      <img :src="reply.avatar" alt="头像" class="reply-avatar clickable" @click="goToUserProfile(reply.commentUserId)" />
                      <div class="reply-content-box">
                        <div class="reply-header">
                          <span class="reply-author clickable" @click="goToUserProfile(reply.commentUserId)">{{ reply.userName }}</span>
                          <span class="reply-target" v-if="reply.replyUserName" @click="goToUserProfile(reply.replyUserId)">
                            回复 @{{ reply.replyUserName }}
                          </span>
                          <span class="comment-time">{{ reply.createTime }}</span>
                        </div>
                        <div class="comment-text">{{ reply.context }}</div>
                        
                        <!-- 回复操作栏：点赞与回复 -->
                        <div class="comment-actions">
                          <span 
                            class="action-item" 
                            :class="{ 'is-liked': reply.isLike }"
                            @click="toggleCommentLike(reply)"
                          >
                            <el-icon><Pointer /></el-icon> {{ reply.likeNum > 0 ? reply.likeNum : '点赞' }}
                          </span>
                          <!-- 注意：子回复也是回复到它所在的这棵“树”(根评论)下 -->
                          <span class="action-item" @click="handleReply(reply.rootId === 0 ? reply.id : reply.rootId, reply.replyUserName, comment.id)">
                            <el-icon><ChatDotRound /></el-icon> 回复
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：相关文章推荐 -->
      <aside class="right-sidebar">
        <div class="related-widget">
          <h3 class="widget-title">相关文章推荐</h3>
          <div class="related-list">
            <div 
              v-for="item in relatedArticles" 
              :key="item.id" 
              class="related-item"
              @click="goToPaperDetail(item.id)"
            >
              <img :src="item.image" alt="封面" class="related-cover" />
              <div class="related-info">
                <h4 class="related-title">{{ item.title }}</h4>
                <div class="related-meta">
                  <span>{{ item.publisherName }}</span>
                  <span>{{ item.createTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getArticleById, getHotArticleList, getCommentList, likeCollection, commentDislike, commentLike, addComment } from '@/api/index'
import { User, View, Pointer, Star, ChatDotRound } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const paperId = route.params.id

// ================== 文章核心数据 ==================
const article = ref({
  id: 1,
  title: '基于深度学习的图像识别研究与实践',
  image: 'https://via.placeholder.com/1200x400/1a73e8/ffffff?text=AI+Image+Recognition',
  name: '张三 (CSDN特邀专家)',
  avatar: 'https://via.placeholder.com/50x50?text=Z',
  createTime: '2025-04-01 14:30',
  publisherId: 1,
  publisherName: 'ccc',
  likeNum: 156,
  collectNum: 10,
  context: `<p>近年来，深度学习在图像识别领域取得了突破性进展。本文将详细探讨卷积神经网络（CNN）的核心架构...</p>`
})

// 修复：监听路由变化重新加载页面
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      console.log(`加载新文章: ${newId}`)
      article.value = await getArticleById(newId)
      relatedArticles.value = await getHotArticleList()
      comments.value = await getCommentList({
        'articleId': newId,
        'status': '可见',
        'pageNo': 0,
        'pageSize': 10
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
)

onMounted(async () => {
  article.value = await getArticleById(paperId)
  relatedArticles.value = await getHotArticleList()
  comments.value = await getCommentList({
    'articleId': paperId,
    'status': '可见',
    'pageNo': 0,
    'pageSize': 10
  })
})

const isLiked = ref(false)
const isCollected = ref(false)

const toggleLike = () => {
  isLiked.value = !isLiked.value
  article.value.likeNum += isLiked.value ? 1 : -1
  likeCollection({ id: paperId, type: 1 })
}
const toggleCollect = () => {
  isCollected.value = !isCollected.value
  article.value.collectNum += isCollected.value ? 1 : -1
  likeCollection({ id: paperId, type: 2 })
}

// ================== 跳转个人主页 ==================
const goToUserProfile = (userId: number) => {
  if (!userId) return
  router.push(`/user/${userId}`)
  // 实际项目中：router.push(`/user/${userId}`)
}

// ================== 评论系统进阶功能 ==================

// 1. 点赞评论功能
const toggleCommentLike = (item: any) => {
  if (item.isLiked) {
    item.likeNum--
    item.isLiked = false
    commentDislike(item.id)
  } else {
    item.likeNum++
    item.isLiked = true
    commentLike(item.id)
  }
}

// 2. 回复状态管理
const commentInputRef = ref<any>(null)
const newComment = ref('')
const replyState = ref({
  active: false,
  rootCommentId: 0, // 属于哪一条根评论
  targetName: '',   // 回复的对象名字
  parentId: 0,      // 父评论id
  targetId: 0       // 被回复用户id
})

// 点击“回复”按钮触发
const handleReply = (rootCommentId: number, targetName: string, parentId: number = 0, targetId: number = 0) => {
  replyState.value = {
    active: true,
    rootCommentId,
    targetName,
    parentId,
    targetId
  }
  // 让页面滚动到输入框位置并聚焦
  const inputBox = document.getElementById('comment-input-box')
  if (inputBox) {
    inputBox.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  nextTick(() => {
    commentInputRef.value?.focus()
  })
}

// 取消回复
const cancelReply = () => {
  replyState.value = { active: false, rootCommentId: 0, targetName: '', parentId: 0, targetId: 0 }
}

// 提交评论/回复
const submitComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('内容不能为空')
    return
  }

  const newObj = 
  {
    id: 101,
    context: '111111111111111111',
    articleId: 1,
    commentUserId: 1,
    rootId: 0,
    parentId: 0,
    status: '可见',
    likeNum: 0,
    createTime: '2025-04-02 09:15',
    userName: 'ccc',
    avatar: '',
    isLike: false,
    replyUserId: 0,
    replyUserName: '',
    replyAvatar: '',
    children: []
  }

  if (replyState.value.active) {
    // 逻辑：追加到对应的子回复数组中
    newObj.replyUserName = replyState.value.targetName
    newObj.replyUserId = replyState.value.targetId
    
    const targetRootComment = comments.value.find(c => c.id === replyState.value.rootCommentId)
    if (targetRootComment) {
      if (!targetRootComment.children) targetRootComment.children =[]
      targetRootComment.children.push(newObj)
    }
    newObj.rootId = replyState.value.rootCommentId
    newObj.parentId = replyState.value.parentId
    cancelReply() // 发布后取消回复状态
    ElMessage.success('回复成功')
  } else {
    // 逻辑：作为一条新的主评论发布
    newObj.rootId = 0
    newObj.parentId = 0
    comments.value.unshift(newObj)
    ElMessage.success('评论发布成功')
  }
  addComment({
    context: newObj.context,
    articleId: newObj.articleId,
    rootId: newObj.rootId,
    parentId: newObj.parentId
  })
  
  newComment.value = ''
}

// 模拟评论初始数据（新增了作者ID和isLiked字段）
const comments = ref([
  {
    id: 101,
    context: '111111111111111111',
    articleId: 1,
    commentUserId: 1,
    rootId: 0,
    parentId: 0,
    status: '可见',
    likeNum: 0,
    createTime: '2025-04-02 09:15',
    userName: 'ccc',
    avatar: '',
    isLike: false,
    replyUserId: 0,
    replyUserName: '',
    replyAvatar: '',
    children: [
      {
        id: 102,
        context: '22222222222222222222',
        articleId: 1,
        commentUserId: 2,
        rootId: 0,
        parentId: 0,
        status: '可见',
        likeNum: 0,
        createTime: '2025-04-02 09:18',
        userName: 'ccc',
        avatar: '',
        isLike: false,
        replyUserId: 101,
        replyUserName: 'ccc',
        replyAvatar: '',
        children: []
      }
    ]
  },
  {
    id: 102,
    context: '8654',
    articleId: 1,
    commentUserId: 2,
    rootId: 0,
    parentId: 0,
    status: '可见',
    likeNum: 0,
    createTime: '2025-04-02 10:10',
    userName: 'cc2',
    avatar: '',
    isLike: false,
    replyUserId: 0,
    replyUserName: '',
    replyAvatar: '',
    children: [
      {
        id: 103,
        context: '4567',
        articleId: 1,
        commentUserId: 2,
        rootId: 102,
        parentId: 102,
        status: '可见',
        likeNum: 0,
        createTime: '2025-04-02 10:20',
        userName: 'cc3',
        avatar: '',
        isLike: false,
        replyUserId: 102,
        replyUserName: 'cc2',
        replyAvatar: '',
        children: []
      },
      {
        id: 104,
        context: '1232134',
        articleId: 1,
        commentUserId: 2,
        rootId: 102,
        parentId: 103,
        status: '可见',
        likeNum: 0,
        createTime: '2025-04-02 10:24',
        userName: 'cc4',
        avatar: '',
        isLike: false,
        replyUserId: 2,
        replyUserName: 'cc3',
        replyAvatar: '',
        children: []
      }
    ]
  }
])

// ================== 右侧推荐及其他跳转 ==================
const relatedArticles = ref([
  {
    id: 1,
    title: '基于深度学习的图像识别研究与实践',
    image: 'https://via.placeholder.com/1200x400/1a73e8/ffffff?text=AI+Image+Recognition',
    name: '张三 (CSDN特邀专家)',
    avatar: 'https://via.placeholder.com/50x50?text=Z',
    createTime: '2025-04-01 14:30',
    publisherId: 1,
    publisherName: 'ccc',
    likeNum: 156,
    context: `<p>近年来，深度学习在图像识别领域取得了突破性进展。本文将详细探讨卷积神经网络（CNN）的核心架构...</p>`
  },
  {
    id: 1,
    title: '基于深度学习的图像识别研究与实践',
    image: 'https://via.placeholder.com/1200x400/1a73e8/ffffff?text=AI+Image+Recognition',
    name: '张三 (CSDN特邀专家)',
    avatar: 'https://via.placeholder.com/50x50?text=Z',
    createTime: '2025-04-01 14:30',
    publisherId: 1,
    publisherName: 'ccc',
    likeNum: 156,
    context: `<p>近年来，深度学习在图像识别领域取得了突破性进展。本文将详细探讨卷积神经网络（CNN）的核心架构...</p>`
  }
])
const goHome = () => router.push('/')
const goToSubmit = () => router.push('/submit-paper')
const goToPaperDetail = (id: number) => router.push(`/paper/${id}`)
</script>

<style scoped>
/* 此处省略与上文相同的基础布局样式，只展示修改和新增的部分 */
.detail-container { background-color: #f4f6f9; min-height: 100vh; padding-bottom: 50px; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 0 30px; height: 60px; background-color: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); position: sticky; top: 0; z-index: 100; }
.logo { font-size: 20px; font-weight: bold; color: #1a73e8; cursor: pointer; }
.header-right { display: flex; gap: 10px; }
.cover-banner { width: 100%; height: 350px; background-size: cover; background-position: center; position: relative; }
.banner-mask { width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%); display: flex; align-items: flex-end; padding-bottom: 40px; }
.banner-content { max-width: 1200px; margin: 0 auto; width: 100%; padding: 0 20px; color: #e6e6e6; position: relative; z-index: 20; }
.category-tag { margin-right: 10px; margin-bottom: 15px; background-color: rgba(0, 0, 0, 0.2); border: none; }
.article-title { font-size: 32px; font-weight: bold; margin: 0 0 20px 0; line-height: 1.4; }
.article-meta { display: flex; align-items: center; gap: 20px; font-size: 16px; color: #555; background-color: rgba(255, 255, 255, 0.7); /* 半透明白色 */ backdrop-filter: blur(8px); /* 毛玻璃模糊效果，高级感的来源！ */
  padding: 8px 20px; /* 给文字上下左右留出呼吸感 */
  border-radius: 30px; /* 圆润的胶囊形状 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 淡淡的阴影，增加立体感 */
  width: fit-content;}
.article-meta .author { display: flex; align-items: center; gap: 10px; }
.article-meta .avatar { width: 48px; height: 48px; border-radius: 50%; border: 3px solid white; }
.divider { color: #999; }

.main-layout { display: flex; max-width: 1200px; margin: -30px auto 0; gap: 20px; padding: 0 20px; position: relative; z-index: 10; }
.left-content { flex: 1; min-width: 0; }
.article-body { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); margin-bottom: 20px; }
.html-content { font-size: 16px; line-height: 1.8; color: #000; }
.html-content :deep(h2) { margin-top: 30px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
.html-content :deep(p) { margin: 15px 0; }

.action-bar { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
.action-btn { width: 150px; border-radius: 20px; font-weight: bold; }

.comments-section { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.section-title { margin-top: 0; margin-bottom: 20px; font-size: 18px; color: #333; border-left: 4px solid #1a73e8; padding-left: 10px; }

/* ======== 新增与修改的评论区样式 ======== */

/* 可点击元素的统一样式 */
.clickable {
  cursor: pointer;
  transition: opacity 0.2s, color 0.2s;
}
.clickable:hover {
  opacity: 0.8;
  color: #1a73e8 !important;
}

/* 回复提示条 */
.reply-tip {
  background-color: #f0f7ff;
  color: #1a73e8;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-input-area { display: flex; gap: 15px; margin-bottom: 40px; }
.my-avatar { width: 40px; height: 40px; border-radius: 50%; }
.input-box { flex: 1; }
.submit-row { display: flex; justify-content: flex-end; margin-top: 10px; }

.comment-item { margin-bottom: 30px; }
.comment-main { display: flex; gap: 15px; }
.comment-avatar { width: 40px; height: 40px; border-radius: 50%; }
.comment-content-box { flex: 1; border-bottom: 1px solid #eee; padding-bottom: 20px; }
.comment-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.comment-author { font-weight: bold; color: #333; }
.comment-time { font-size: 12px; color: #999; }
.comment-text { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 10px; }

/* 评论操作区：点赞/回复交互 */
.comment-actions { display: flex; gap: 20px; font-size: 13px; color: #888; }
.action-item { cursor: pointer; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
.action-item:hover { color: #1a73e8; }
.action-item.is-liked { color: #1a73e8; font-weight: bold; } /* 点赞后的高亮蓝色 */

.replies-box { margin-top: 15px; background-color: #fafafa; padding: 15px; border-radius: 6px; }
.reply-item { display: flex; gap: 10px; margin-bottom: 15px; }
.reply-item:last-child { margin-bottom: 0; }
.reply-avatar { width: 30px; height: 30px; border-radius: 50%; }
.reply-content-box { flex: 1; }
.reply-header { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
.reply-author { font-weight: bold; color: #333; font-size: 13px; }
.reply-target { color: #1a73e8; font-size: 13px; margin-left: 2px; }

.right-sidebar { width: 320px; flex-shrink: 0; }
.related-widget { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); position: sticky; top: 80px; }
.widget-title { margin-top: 0; margin-bottom: 20px; font-size: 16px; color: #333; border-left: 4px solid #ff9800; padding-left: 10px; }
.related-list { display: flex; flex-direction: column; gap: 15px; }
.related-item { display: flex; gap: 10px; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.2s; }
.related-item:hover { background-color: #f0f7ff; }
.related-cover { width: 100px; height: 66px; border-radius: 4px; object-fit: cover; }
.related-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.related-title { margin: 0; font-size: 14px; color: #333; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.related-meta { font-size: 12px; color: #999; display: flex; justify-content: space-between; }
</style>