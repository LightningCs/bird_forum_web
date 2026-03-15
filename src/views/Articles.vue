<template>
  <div class="article-manage-container">
    <!-- ================== 上半部分：筛选条件卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="80px">
        <!-- 1. 文章标题 -->
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="searchForm.title" placeholder="请输入文章标题" clearable />
        </el-form-item>

        <!-- 2. 文章内容 -->
        <el-form-item label="文章内容" prop="content">
          <el-input v-model="searchForm.content" placeholder="请输入内容关键字" clearable />
        </el-form-item>

        <!-- 3. 发布者名称 -->
        <el-form-item label="发布者" prop="authorName">
          <el-input v-model="searchForm.authorName" placeholder="请输入发布者名称" clearable />
        </el-form-item>

        <!-- 4. 文章分类 -->
        <el-form-item label="文章分类" prop="category">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable style="width: 180px;">
            <el-option label="计算机科学" value="计算机科学" />
            <el-option label="机械工程" value="机械工程" />
            <el-option label="经济学" value="经济学" />
            <el-option label="管理学" value="管理学" />
            <el-option label="人工智能" value="人工智能" />
          </el-select>
        </el-form-item>

        <!-- 5. 是否违规 -->
        <el-form-item label="违规状态" prop="isViolate">
          <el-select v-model="searchForm.isViolate" placeholder="请选择" clearable style="width: 180px;">
            <el-option label="不违规" :value="0" />
            <el-option label="违规" :value="1" />
          </el-select>
        </el-form-item>

        <!-- 6. 文章状态 -->
        <el-form-item label="文章状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 180px;">
            <el-option label="草稿" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="不可见" :value="2" />
          </el-select>
        </el-form-item>

        <!-- 7. 发布日期 (范围选择器) -->
        <el-form-item label="发布日期" prop="dateRange">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px;"
          />
        </el-form-item>

        <!-- 搜索与重置按钮 -->
        <el-form-item class="action-buttons" style="margin-left: 20px;">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ================== 下半部分：文章列表与分页卡片 ================== -->
    <el-card shadow="never" class="table-card">
      
      <!-- 表格操作栏 -->
      <div class="table-header-actions">
        <el-button type="danger" :icon="Delete" plain :disabled="selectedRows.length === 0">批量删除</el-button>
        <el-button type="warning" :icon="Hide" plain :disabled="selectedRows.length === 0">批量隐藏</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        v-loading="loading" 
        border 
        stripe 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column label="文章信息" min-width="300">
          <template #default="scope">
            <div class="article-info-col">
              <img :src="scope.row.cover || 'https://via.placeholder.com/80x50?text=无封面'" class="article-cover" />
              <div class="article-text">
                <div class="article-title">{{ scope.row.title }}</div>
                <div class="article-category">
                  <el-tag size="small" type="info">{{ scope.row.category }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="authorName" label="发布者" min-width="120" align="center" />
        
        <!-- 文章状态 -->
        <el-table-column label="文章状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="info">草稿</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已发布</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="warning">不可见</el-tag>
          </template>
        </el-table-column>

        <!-- 违规状态 -->
        <el-table-column label="违规标记" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isViolate === 0" type="success" effect="plain">正常</el-tag>
            <el-tag v-else type="danger" effect="dark">违规</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="publishTime" label="发布时间" width="160" align="center" sortable />

        <!-- 操作列 -->
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
            <el-button 
              type="warning" 
              link 
              :icon="Hide" 
              v-if="scope.row.status === 1"
              @click="handleHide(scope.row)"
            >下架</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Search, Refresh, Hide, Delete, View } from '@element-plus/icons-vue'

const router = useRouter()

// ================== 状态定义 ==================
const loading = ref(false)
const searchFormRef = ref()

// 搜索表单数据
const searchForm = reactive({
  title: '',
  content: '',
  authorName: '',
  category: '',
  isViolate: '', // 0: 不违规, 1: 违规
  status: '',    // 0: 草稿, 1: 已发布, 2: 不可见
  dateRange: []  //[开始日期, 结束日期]
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 1285 // 模拟总数
})

// 表格多选数据
const selectedRows = ref<any[]>([])

// 模拟表格数据
const tableData = ref<any[]>([])

// ================== 方法与逻辑 ==================

// 模拟从后台获取数据
const fetchTableData = () => {
  loading.value = true
  console.log('搜索参数：', { ...searchForm, page: pagination.currentPage, size: pagination.pageSize })
  
  setTimeout(() => {
    // 模拟后端返回的数据
    tableData.value =[
      { id: 101, title: '基于深度学习的图像识别研究与实践', cover: 'https://via.placeholder.com/80x50/1a73e8/ffffff?text=AI', category: '人工智能', authorName: '张三', status: 1, isViolate: 0, publishTime: '2026-03-15 10:20:00' },
      { id: 102, title: '论现代经济体系下的通货膨胀趋势', cover: null, category: '经济学', authorName: '李四', status: 1, isViolate: 0, publishTime: '2026-03-14 09:15:30' },
      { id: 103, title: '大学生心理健康问卷调查数据分析', cover: 'https://via.placeholder.com/80x50/ff9800/ffffff?text=Data', category: '心理学', authorName: '王五', status: 0, isViolate: 0, publishTime: '2026-03-12 14:05:12' },
      { id: 104, title: '违规测试文章：包含不当言论的文本提取', cover: 'https://via.placeholder.com/80x50/f56c6c/ffffff?text=Ban', category: '计算机科学', authorName: '黑客小明', status: 2, isViolate: 1, publishTime: '2026-03-10 16:30:45' },
    ]
    loading.value = false
  }, 600)
}

// 组件挂载时拉取一次数据
onMounted(() => {
  fetchTableData()
})

// 搜索按钮
const handleSearch = () => {
  pagination.currentPage = 1 // 搜索时重置回第一页
  fetchTableData()
}

// 重置按钮
const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
    searchForm.dateRange =[] // 手动清空日期范围
  }
  handleSearch()
}

// 表格多选变化
const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchTableData()
}
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchTableData()
}

// ================== 表格行内操作 ==================

// 查看文章详情 (可以在新窗口打开前台的文章详情页)
const handleView = (row: any) => {
  // router.resolve 可以用来打开新标签页
  const routeUrl = router.resolve({ path: `/paper/${row.id}` })
  window.open(routeUrl.href, '_blank')
  ElMessage.info(`正在新窗口预览文章: ${row.title}`)
}

// 下架/隐藏文章 (将状态由"已发布"改为"不可见")
const handleHide = (row: any) => {
  ElMessageBox.confirm(`确定要将文章 [${row.title}] 设为不可见吗？前台用户将无法访问。`, '下架提示', {
    confirmButtonText: '确定下架',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 2 // 2代表不可见
    ElMessage.success('文章已下架')
  }).catch(() => {})
}

// 删除文章
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要永久删除文章 [${row.title}] 吗？此操作不可恢复！`, '危险操作提示', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchTableData() // 删除后重新拉取列表
  }).catch(() => {})
}
</script>

<style scoped>
.article-manage-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 搜索表单卡片 */
.search-card {
  border-radius: 8px;
}

/* 统一控制表单项的间距，防止换行时挤在一起 */
.search-form .el-form-item {
  margin-bottom: 15px;
  margin-right: 20px;
}

.table-card {
  border-radius: 8px;
  flex: 1;
}

.table-header-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

/* ================== 表格内自定义样式 ================== */

/* 图文混排的“文章信息”列 */
.article-info-col {
  display: flex;
  align-items: center;
  gap: 15px;
}

.article-cover {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  flex-shrink: 0;
}

.article-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.article-title {
  font-weight: bold;
  color: #333;
  font-size: 14px;
  line-height: 1.4;
  /* 标题过长打点省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 分页组件对齐 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-tag) {
  border-radius: 4px;
}
</style>