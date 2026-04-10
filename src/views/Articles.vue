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
        <el-form-item label="文章内容" prop="context">
          <el-input v-model="searchForm.context" placeholder="请输入内容关键字" clearable />
        </el-form-item>

        <!-- 3. 发布者名称 -->
        <el-form-item label="发布者" prop="publisherName">
          <el-input v-model="searchForm.publisherName" placeholder="请输入发布者名称" clearable />
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
        <el-form-item label="违规状态" prop="violationStatus">
          <el-select v-model="searchForm.violationStatus" placeholder="请选择" clearable style="width: 180px;">
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
        <el-button type="danger" :icon="Delete" plain :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
        <el-button type="warning" :icon="Hide" plain :disabled="selectedRows.length === 0" @click="handleBatchHide">批量隐藏</el-button>
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
              <img :src="scope.row.image || 'https://via.placeholder.com/80x50?text=无封面'" class="article-cover" />
              <div class="article-text">
                <div class="article-title">{{ scope.row.title }}</div>
                <div class="article-stats">
                  <span>👍 {{ scope.row.likeNum }}</span>
                  <span>⭐ {{ scope.row.collectNum }}</span>
                  <span>👁 {{ scope.row.viewNum }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="publisherName" label="发布者" min-width="120" align="center" />
        
        <!-- 文章状态 -->
        <el-table-column label="文章状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '草稿'" type="info">草稿</el-tag>
            <el-tag v-else-if="scope.row.status === '已发布'" type="success">已发布</el-tag>
            <el-tag v-else-if="scope.row.status === '不可见'" type="warning">不可见</el-tag>
          </template>
        </el-table-column>

        <!-- 违规状态 -->
        <el-table-column label="违规标记" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isIllegal === 0" type="success" effect="plain">正常</el-tag>
            <el-tag v-else type="danger" effect="dark">违规</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="发布时间" width="160" align="center" sortable />

        <!-- 操作列 -->
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
            <el-button 
              type="success" 
              link 
              :icon="Check"
              v-if="scope.row.isIllegal === 1"
              @click="handleUpdateIllegal(scope.row, 0)"
            >不违规</el-button>
            <el-button 
              type="danger" 
              link 
              :icon="Close"
              v-if="scope.row.isIllegal === 0"
              @click="handleUpdateIllegal(scope.row, 1)"
            >违规</el-button>
            <el-button 
              type="warning" 
              link 
              :icon="Hide" 
              v-if="scope.row.status === '已发布'"
              @click="handleHide(scope.row)"
            >隐藏</el-button>
            <el-button 
              type="success" 
              link 
              :icon="View"
              v-if="scope.row.status === '不可见'"
              @click="handleShow(scope.row)"
            >显示</el-button>
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
import { Search, Refresh, Hide, Delete, View, Check, Close } from '@element-plus/icons-vue'
import { getArticleList, batchHideArticles, updateArticleIllegal, batchDeleteArticles, updateArticleStatus } from '@/api/article'

const router = useRouter()

// ================== 状态定义 ==================
const loading = ref(false)
const searchFormRef = ref()

// 搜索表单数据
const searchForm = reactive({
  title: '',
  context: '',
  publisherName: '',
  category: '',
  violationStatus: '', // 0: 不违规, 1: 违规
  status: ''         // 0: 草稿, 1: 已发布, 2: 不可见
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格多选数据
const selectedRows = ref<any[]>([])

// 表格数据
const tableData = ref<any[]>([])

// ================== 后端API调用 ==================

// 加载文章列表
const loadArticleList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.title) params.title = searchForm.title
    if (searchForm.context) params.context = searchForm.context
    if (searchForm.publisherName) params.publisherName = searchForm.publisherName
    if (searchForm.category) params.category = searchForm.category
    if (searchForm.violationStatus !== '') params.violationStatus = searchForm.violationStatus
    if (searchForm.status !== '') params.status = searchForm.status

    const res = await getArticleList(params)
      tableData.value = res || []
      pagination.total = res.length
  } catch (error) {
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// ================== 方法与逻辑 ==================

// 组件挂载时拉取一次数据
onMounted(() => {
  loadArticleList()
})

// 搜索按钮
const handleSearch = () => {
  pagination.currentPage = 1 // 搜索时重置回第一页
  loadArticleList()
}

// 重置按钮
const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
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
  loadArticleList()
}
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadArticleList()
}

// ================== 表格行内操作 ==================

// 查看文章详情
const handleView = (row: any) => {
  const routeUrl = router.resolve({ path: `/paper/${row.id}` })
  window.open(routeUrl.href, '_blank')
  ElMessage.info(`正在新窗口预览文章: ${row.title}`)
}

// 更新文章违规状态
const handleUpdateIllegal = async (row: any, isIllegal: number) => {
  const statusText = isIllegal === 0 ? '不违规' : '违规'
  ElMessageBox.confirm(`确定要将文章标记为${statusText}吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await updateArticleIllegal(row.id, isIllegal)
      ElMessage.success(`文章已标记为${statusText}`)
      loadArticleList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

// 隐藏文章
const handleHide = (row: any) => {
  ElMessageBox.confirm(`确定要将文章 [${row.title}] 设为不可见吗？前台用户将无法访问。`, '隐藏提示', {
    confirmButtonText: '确定隐藏',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await updateArticleStatus({ id: row.id, status: '不可见' })
      ElMessage.success('文章已隐藏')
      loadArticleList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

// 显示文章
const handleShow = (row: any) => {
  ElMessageBox.confirm(`确定要将文章 [${row.title}] 重新发布吗？`, '显示提示', {
    confirmButtonText: '确定显示',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await updateArticleStatus({ id: row.id, status: '已发布' })
      ElMessage.success('文章已重新发布')
      loadArticleList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

// ================== 批量操作 ==================

// 批量隐藏
const handleBatchHide = () => {
  ElMessageBox.confirm(`确定要将选中的 ${selectedRows.value.length} 篇文章设为不可见吗？`, '批量隐藏', {
    confirmButtonText: '确定隐藏',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    try {
      const res = await batchHideArticles(ids)
      ElMessage.success(`已隐藏 ${ids.length} 篇文章`)
      loadArticleList()
    } catch (error) {
      ElMessage.error('批量隐藏失败')
    }
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要永久删除选中的 ${selectedRows.value.length} 篇文章吗？此操作不可恢复！`, '批量删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    try {
      const res = await batchDeleteArticles(ids)
      ElMessage.success(`已删除 ${ids.length} 篇文章`)
      loadArticleList()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
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

/* 图文混排的"文章信息"列 */
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

.article-stats {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 10px;
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