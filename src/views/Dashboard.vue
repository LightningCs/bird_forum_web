<template>
  <div>
    <div class="welcome-box">
      <h2>👋 欢迎回来，超级管理员</h2>
      <p>今天是 {{ currentDate }}，系统运行一切正常。以下是核心数据概览：</p>
    </div>

    <el-row :gutter="20" class="stat-cards">
      <!-- 文章统计卡片 -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="data-card" @click="navigateTo('/admin/articles')">
          <div class="card-content">
            <div class="data-info">
              <div class="card-title">文章发布量</div>
              <div class="total-num">{{ stats.totalArticles }}</div>
              <div class="today-num">
                <span>今日新增</span><span class="up-trend"><el-icon><Top /></el-icon> {{ stats.todayArticles }}</span>
              </div>
            </div>
            <div class="icon-box blue-icon"><el-icon><Document /></el-icon></div>
          </div>
        </el-card>
      </el-col>

      <!-- 评论统计卡片 -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="data-card" @click="navigateTo('/admin/comments')">
          <div class="card-content">
            <div class="data-info">
              <div class="card-title">评论发表量</div>
              <div class="total-num">{{ stats.totalComments }}</div>
              <div class="today-num">
                <span>今日新增</span><span class="up-trend"><el-icon><Top /></el-icon> {{ stats.todayComments }}</span>
              </div>
            </div>
            <div class="icon-box green-icon"><el-icon><ChatLineRound /></el-icon></div>
          </div>
        </el-card>
      </el-col>

      <!-- 举报统计卡片 -->
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="data-card" @click="navigateTo('/admin/reports')">
          <div class="card-content">
            <div class="data-info">
              <div class="card-title">待处理举报</div>
              <div class="total-num text-danger">{{ stats.pendingReports }}</div>
              <div class="today-num">
                <span v-if="stats.pendingReports > 0" style="color: #f56c6c;">需尽快处理！</span>
                <span v-else style="color: #67c23a;">暂无违规情况</span>
              </div>
            </div>
            <div class="icon-box red-icon"><el-icon><Warning /></el-icon></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Top, Document, ChatLineRound, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const currentDate = ref('')
onMounted(() => {
  const date = new Date()
  currentDate.value = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

const stats = ref({ totalArticles: 1285, todayArticles: 12, totalComments: 8432, todayComments: 45, pendingReports: 6 })

const navigateTo = (path: string) => { router.push(path) }
</script>

<style scoped>
/* 这里放原本属于数据卡片的样式 */
.welcome-box { margin-bottom: 25px; }
.welcome-box h2 { margin: 0 0 10px 0; font-size: 22px; color: #333; }
.welcome-box p { margin: 0; font-size: 14px; color: #666; }
.stat-cards { margin-bottom: 25px; }
.data-card { cursor: pointer; border-radius: 8px; border: none; transition: all 0.3s ease; }
.data-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important; }
.card-content { display: flex; justify-content: space-between; align-items: center; padding: 10px; }
.data-info { display: flex; flex-direction: column; }
.card-title { font-size: 14px; color: #909399; margin-bottom: 10px; font-weight: bold; }
.total-num { font-size: 32px; font-weight: bold; color: #303133; margin-bottom: 10px; line-height: 1; }
.text-danger { color: #f56c6c !important; }
.today-num { font-size: 13px; color: #606266; display: flex; align-items: center; gap: 8px; }
.up-trend { color: #67c23a; display: flex; align-items: center; font-weight: bold; }
.icon-box { width: 60px; height: 60px; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 30px; }
.blue-icon { background-color: #e6f1fc; color: #1a73e8; }
.green-icon { background-color: #f0f9eb; color: #67c23a; }
.red-icon { background-color: #fef0f0; color: #f56c6c; }
</style>