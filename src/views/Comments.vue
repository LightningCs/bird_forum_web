<template>
  <div class="comment-manage-container">
    <!-- ================== 上半部分：筛选条件卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="80px">
        <!-- 1. 评论内容 -->
        <el-form-item label="评论内容" prop="context">
          <el-input v-model="searchForm.context" placeholder="请输入评论关键字" clearable />
        </el-form-item>

        <!-- 2. 发布者名称 -->
        <el-form-item label="发布者" prop="username">
          <el-input v-model="searchForm.username" placeholder="请输入发布者名称" clearable />
        </el-form-item>

        <!-- 3. 所属文章 -->
        <el-form-item label="所属文章" prop="title">
          <el-input v-model="searchForm.title" placeholder="请输入文章标题" clearable />
        </el-form-item>

        <!-- 4. 是否违规 -->
        <el-form-item label="违规状态" prop="isIllegal">
          <el-select v-model="searchForm.isIllegal" placeholder="请选择" clearable style="width: 140px;">
            <el-option label="不违规" :value="false" />
            <el-option label="违规" :value="true" />
          </el-select>
        </el-form-item>

        <!-- 5. 评论状态 -->
        <el-form-item label="评论状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px;">
            <el-option label="可见" value="可见" />
            <el-option label="不可见" value="不可见" />
          </el-select>
        </el-form-item>

        <!-- 搜索与重置按钮 -->
        <el-form-item class="action-buttons" style="margin-left: 20px;">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ================== 下半部分：评论列表与分页卡片 ================== -->
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
        <el-table-column prop="num" label="序号" width="80" align="center" />

        <!-- 评论内容：支持长文本截断和悬浮提示 -->
        <el-table-column label="评论内容" min-width="250" show-overflow-tooltip>
          <template #default="scope">
            <div class="comment-content-text">{{ scope.row.context }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="userName" label="发布者" width="120" align="center" />

        <!-- 所属文章 -->
        <el-table-column label="所属文章" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" :underline="false" @click="goToArticle(scope.row.articleId)">
              《{{ scope.row.articleTitle }}》
            </el-link>
          </template>
        </el-table-column>

        <!-- 违规标记 -->
        <el-table-column label="违规标记" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="!scope.row.isIllegal" type="success" effect="plain">正常</el-tag>
            <el-tag v-else type="danger" effect="dark">违规</el-tag>
          </template>
        </el-table-column>

        <!-- 评论状态 -->
        <el-table-column label="评论状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '可见'" type="success">可见</el-tag>
            <el-tag v-else type="info">不可见</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="发布时间" width="160" align="center" sortable />

        <!-- 操作列 -->
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button
              type="success"
              link
              :icon="Check"
              v-if="scope.row.isIllegal"
              @click="handleUpdateIllegal(scope.row, 0)"
            >不违规</el-button>
            <el-button
              type="danger"
              link
              :icon="Close"
              v-if="!scope.row.isIllegal"
              @click="handleUpdateIllegal(scope.row, 1)"
            >违规</el-button>
            <el-button
              type="warning"
              link
              :icon="Hide"
              v-if="scope.row.status === '可见'"
              @click="handleHide(scope.row)"
            >隐藏</el-button>
            <el-button
              type="success"
              link
              :icon="View"
              v-else
              @click="handleShow(scope.row)"
            >恢复</el-button>
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
import { Search, Refresh, Hide, Delete, View, Check, Close } from '@element-plus/icons-vue'
import { getCommentList, batchHideComments, updateCommentIllegal, batchDeleteComments, deleteComment, hideComments } from '@/api/comment'

const router = useRouter()

// ================== 状态定义 ==================
const loading = ref(false)
const searchFormRef = ref()

const searchForm = reactive({
  articleId: '',
  rootId: '',
  status: '',
  context: '',
  username: '',
  title: '',
  isIllegal: null as boolean | null
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const selectedRows = ref<any[]>([])
const tableData = ref<any[]>([])

// ================== 后端API调用 ==================

const loadCommentList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.articleId) params.articleId = searchForm.articleId
    if (searchForm.rootId) params.rootId = searchForm.rootId
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.context) params.context = searchForm.context
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.title) params.title = searchForm.title
    if (searchForm.isIllegal !== null) params.isIllegal = searchForm.isIllegal

    const res = await getCommentList(params)

    for (let i = 0; i < res.length; i++) {
      const element = res[i]
      element.num = (pagination.currentPage - 1) * pagination.pageSize + i + 1
    }

    tableData.value = res || []
    pagination.total = res.length || 0
  } catch (error) {
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

// ================== 数据获取 ==================

onMounted(() => {
  loadCommentList()
})

// ================== 搜索与分页 ==================

const handleSearch = () => {
  pagination.currentPage = 1
  loadCommentList()
}

const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  handleSearch()
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadCommentList()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadCommentList()
}

// ================== 跳转文章 ==================

const goToArticle = (articleId: number) => {
  const routeUrl = router.resolve({ path: `/paper/${articleId}` })
  window.open(routeUrl.href, '_blank')
}

// ================== 行内操作 ==================

// 更新评论违规状态
const handleUpdateIllegal = async (row: any, isIllegal: number) => {
  const statusText = isIllegal === 0 ? '不违规' : '违规'
  ElMessageBox.confirm(`确定要将评论标记为${statusText}吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await updateCommentIllegal(row.id, isIllegal)
      ElMessage.success(`评论已标记为${statusText}`)
      loadCommentList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const handleHide = (row: any) => {
  ElMessageBox.confirm(`确定要隐藏该评论吗？前台用户将无法看到此评论。`, '隐藏提示', {
    confirmButtonText: '确定隐藏',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = '不可见'
    hideComments(row.id, '不可见')
    ElMessage.success('评论已隐藏')
  }).catch(() => {})
}

const handleShow = (row: any) => {
  ElMessageBox.confirm(`确定要恢复该评论的可见状态吗？`, '恢复提示', {
    confirmButtonText: '确定恢复',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    row.status = '可见'
    hideComments(row.id, '可见')
    ElMessage.success('评论已恢复可见')
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要永久删除该评论吗？此操作不可恢复！`, '危险操作提示', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      const res = await deleteComment(row.id)
      ElMessage.success('删除成功')
      loadCommentList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// ================== 批量操作 ==================

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 条评论吗？`, '批量删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    try {
      const res = await batchDeleteComments(ids)
      ElMessage.success(`已删除 ${ids.length} 条评论`)
      loadCommentList()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}

const handleBatchHide = () => {
  ElMessageBox.confirm(`确定要批量隐藏选中的 ${selectedRows.value.length} 条评论吗？`, '批量隐藏', {
    confirmButtonText: '确定隐藏',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    try {
      const res = await batchHideComments(ids)
      ElMessage.success(`已隐藏 ${ids.length} 条评论`)
      loadCommentList()
    } catch (error) {
      ElMessage.error('批量隐藏失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.comment-manage-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  border-radius: 8px;
}

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

.comment-content-text {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-tag) {
  border-radius: 4px;
}
</style>