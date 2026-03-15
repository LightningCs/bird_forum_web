<template>
  <div class="comment-manage-container">
    <!-- ================== 上半部分：筛选条件卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="80px">
        <!-- 1. 评论内容 -->
        <el-form-item label="评论内容" prop="content">
          <el-input v-model="searchForm.context" placeholder="请输入评论关键字" clearable />
        </el-form-item>

        <!-- 2. 发布者名称 -->
        <el-form-item label="发布者" prop="authorName">
          <el-input v-model="searchForm.userName" placeholder="请输入发布者名称" clearable />
        </el-form-item>

        <!-- 3. 所属文章 -->
        <el-form-item label="所属文章" prop="articleTitle">
          <el-input v-model="searchForm.articleTitle" placeholder="请输入文章标题" clearable />
        </el-form-item>

        <!-- 4. 是否违规 -->
        <el-form-item label="违规状态" prop="isViolate">
          <el-select v-model="searchForm.isIllegal" placeholder="请选择" clearable style="width: 140px;">
            <el-option label="不违规" :value="0" />
            <el-option label="违规" :value="1" />
          </el-select>
        </el-form-item>

        <!-- 5. 评论状态 -->
        <el-form-item label="评论状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px;">
            <el-option label="可见" :value="1" />
            <el-option label="不可见" :value="0" />
          </el-select>
        </el-form-item>

        <!-- 6. 发布日期 (范围选择器) -->
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
        <el-table-column prop="id" label="ID" width="80" align="center" />

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
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
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
            >恢复可见</el-button>
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
import { getCommentList } from '@/api/index'

const router = useRouter()

// ================== 状态定义 ==================
const loading = ref(false)
const searchFormRef = ref()

const searchForm = reactive({
  content: '',
  authorName: '',
  articleTitle: '',
  isViolate: '' as number | '',
  status: '' as number | '',
  dateRange: [] as string[]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const selectedRows = ref<any[]>([])
const tableData = ref<any[]>([])

// ================== 数据获取 ==================

const fetchTableData = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize,
      context: searchForm.content || undefined,
      username: searchForm.authorName || undefined,
      title: searchForm.articleTitle || undefined,
      isIllegal: searchForm.isViolate === '' ? undefined : searchForm.isViolate,
      status: searchForm.status === '' ? undefined : searchForm.status,
      startTime: searchForm.dateRange?.[0] || undefined,
      endTime: searchForm.dateRange?.[1] || undefined
    }
    const res = await getCommentList(params)
    tableData.value = res
    pagination.total = res.total || 0
  } catch {
    // 接口不通时使用模拟数据
    tableData.value = [
      { id: 1, content: '这篇文章写得非常好，对我帮助很大！', authorName: '张三', articleId: 101, articleTitle: '基于深度学习的图像识别研究与实践', isViolate: 0, status: 1, publishTime: '2026-03-15 10:20:00' },
      { id: 2, content: '有几个地方我不太理解，能详细解释一下吗？', authorName: '李四', articleId: 102, articleTitle: '论现代经济体系下的通货膨胀趋势', isViolate: 0, status: 1, publishTime: '2026-03-14 09:15:30' },
      { id: 3, content: '这个观点有待商榷，数据来源不够权威。', authorName: '王五', articleId: 103, articleTitle: '大学生心理健康问卷调查数据分析', isViolate: 0, status: 0, publishTime: '2026-03-12 14:05:12' },
      { id: 4, content: '垃圾文章，纯属浪费时间！！！', authorName: '黑客小明', articleId: 104, articleTitle: '违规测试文章：包含不当言论的文本提取', isViolate: 1, status: 1, publishTime: '2026-03-10 16:30:45' },
    ]
    pagination.total = 4
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTableData()
})

// ================== 搜索与分页 ==================

const handleSearch = () => {
  pagination.currentPage = 1
  fetchTableData()
}

const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
    searchForm.dateRange = []
  }
  handleSearch()
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchTableData()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchTableData()
}

// ================== 跳转文章 ==================

const goToArticle = (articleId: number) => {
  const routeUrl = router.resolve({ path: `/paper/${articleId}` })
  window.open(routeUrl.href, '_blank')
}

// ================== 行内操作 ==================

const handleHide = (row: any) => {
  ElMessageBox.confirm(`确定要隐藏该评论吗？前台用户将无法看到此评论。`, '隐藏提示', {
    confirmButtonText: '确定隐藏',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 0
    ElMessage.success('评论已隐藏')
  }).catch(() => {})
}

const handleShow = (row: any) => {
  ElMessageBox.confirm(`确定要恢复该评论的可见状态吗？`, '恢复提示', {
    confirmButtonText: '确定恢复',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    row.status = 1
    ElMessage.success('评论已恢复可见')
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要永久删除该评论吗？此操作不可恢复！`, '危险操作提示', {
    confirmButtonText: '强制删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchTableData()
  }).catch(() => {})
}

// ================== 批量操作 ==================

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 条评论吗？`, '批量删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success(`已删除 ${selectedRows.value.length} 条评论`)
    fetchTableData()
  }).catch(() => {})
}

const handleBatchHide = () => {
  ElMessageBox.confirm(`确定要批量隐藏选中的 ${selectedRows.value.length} 条评论吗？`, '批量隐藏', {
    confirmButtonText: '确定隐藏',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => { row.status = 0 })
    ElMessage.success(`已隐藏 ${selectedRows.value.length} 条评论`)
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
