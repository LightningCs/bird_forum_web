<template>
  <div class="report-review-container">
    <!-- ================== 搜索卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="90px">
        <el-form-item label="举报者" prop="reporter">
          <el-input v-model="searchForm.reporter" placeholder="请输入举报者名称" clearable />
        </el-form-item>

        <el-form-item label="举报原因" prop="reasonId">
          <el-input v-model="searchForm.reasonId" placeholder="请输入举报原因ID" clearable />
        </el-form-item>

        <el-form-item label="目标类型" prop="targetType">
          <el-select v-model="searchForm.targetType" placeholder="请选择" clearable style="width: 140px;">
            <el-option label="文章" value="文章" />
            <el-option label="评论" value="评论" />
            <el-option label="用户" value="用户" />
          </el-select>
        </el-form-item>

        <el-form-item label="处理状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px;">
            <el-option label="未处理" value="未处理" />
            <el-option label="已处理" value="已处理" />
          </el-select>
        </el-form-item>

        <el-form-item style="margin-left: 20px;">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ================== 列表卡片 ================== -->
    <el-card shadow="never" class="table-card">
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="90" align="center" />
        <el-table-column prop="reporterName" label="举报者" width="110" align="center" />
        <el-table-column prop="context" label="举报原因" min-width="160" show-overflow-tooltip />

        <el-table-column label="目标类型" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.targetType === '文章' ? 'primary' : scope.row.targetType === '评论' ? 'warning' : 'danger'"
              effect="plain"
            >{{ scope.row.targetType }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="targetId" label="目标ID" width="90" align="center" />
        <el-table-column prop="remark" label="原因描述" min-width="200" show-overflow-tooltip />

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '已处理'" type="success">已处理</el-tag>
            <el-tag v-else type="danger" effect="plain">未处理</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="举报时间" width="160" align="center" sortable />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              :icon="Checked"
              :disabled="scope.row.status === '已处理'"
              :title="scope.row.status === '已处理' ? '该举报已处理' : ''"
              @click="handleReview(scope.row)"
            >人工审核</el-button>
            <el-button
              type="warning"
              link
              :icon="MagicStick"
              :disabled="scope.row.status === '已处理'"
              :title="scope.row.status === '已处理' ? '该举报已处理' : ''"
              @click="handleAiReview(scope.row)"
            >AI审核</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- ================== 审核 Dialog ================== -->
    <el-dialog
      v-model="dialogVisible"
      title="举报审核"
      width="520px"
      :close-on-click-modal="false"
      @closed="currentRow = null"
    >
      <template v-if="currentRow">
        <el-descriptions :column="2" border size="small" class="review-desc">
          <el-descriptions-item label="举报ID">{{ currentRow.id }}</el-descriptions-item>
          <el-descriptions-item label="举报者">{{ currentRow.reporterName }}</el-descriptions-item>
          <el-descriptions-item label="举报内容" :span="2">{{ currentRow.context }}</el-descriptions-item>
          <el-descriptions-item label="目标类型">{{ currentRow.targetType }}</el-descriptions-item>
          <el-descriptions-item label="目标ID">{{ currentRow.targetId }}</el-descriptions-item>
          <el-descriptions-item label="原因描述" :span="2">{{ currentRow.remark || '—' }}</el-descriptions-item>
          <el-descriptions-item label="举报时间" :span="2">{{ currentRow.createTime }}</el-descriptions-item>
        </el-descriptions>

        <el-form :model="reviewForm" ref="reviewFormRef" label-width="90px" style="margin-top: 20px;">
          <el-form-item label="处理结果" prop="result" :rules="[{ required: true, message: '请选择处理结果', trigger: 'change' }]">
            <el-radio-group v-model="reviewForm.result">
              <el-radio value="属实">举报属实（处罚被举报方）</el-radio>
              <el-radio value="不属实">举报不属实（忽略）</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="处理备注" prop="remark">
            <el-input
              v-model="reviewForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入处理备注（选填）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitReview">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Checked, MagicStick } from '@element-plus/icons-vue'
import { getReportList, getReportById, manualReviewReport, aiReviewReport } from '@/api/report'

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const reviewFormRef = ref()
const dialogVisible = ref(false)
const currentRow = ref<any>(null)

const searchForm = reactive({
  reporter: '',
  reasonId: '',
  targetType: '',
  status: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<any[]>([])

const reviewForm = reactive({
  result: '',
  remark: ''
})

// ================== 后端API调用 ==================

// 加载举报列表
const loadReportList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.reporter) params.reporter = searchForm.reporter
    if (searchForm.reasonId) params.reasonId = searchForm.reasonId
    if (searchForm.targetType) params.targetType = searchForm.targetType
    if (searchForm.status) params.status = searchForm.status

    const res = await getReportList(params)
    tableData.value = res || []
    pagination.total = res.length || 0
  } catch (error) {
    ElMessage.error('获取举报列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReportList()
})

// ================== 搜索与分页 ==================

const handleSearch = () => {
  pagination.currentPage = 1
  loadReportList()
}

const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadReportList()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadReportList()
}

// ================== 审核操作 ==================

const handleReview = async (row: any) => {
  try {
    const res = await getReportById(row.id)
    currentRow.value = res
    reviewForm.result = ''
    reviewForm.remark = ''
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取举报详情失败')
  }
}

const handleAiReview = (row: any) => {
  ElMessageBox.confirm(
    `是否让大模型自动审核该举报？\n\n举报内容：${row.context}\n原因描述：${row.description || '无'}`,
    'AI 自动审核',
    {
      confirmButtonText: '确认，开始审核',
      cancelButtonText: '取消',
      type: 'info',
      dangerouslyUseHTMLString: false
    }
  ).then(async () => {
    const loadingMsg = ElMessage({ message: 'AI 审核中，请稍候...', type: 'info', duration: 0 })
    try {
      const res = await aiReviewReport(row.id)
      loadingMsg.close()
      ElMessage.success('AI 审核完成，举报已处理')
      loadReportList()
    } catch (error) {
      loadingMsg.close()
      ElMessage.error('AI 审核失败，请稍后重试')
    }
  }).catch(() => {})
}

const handleSubmitReview = async () => {
  await reviewFormRef.value?.validate()
  submitLoading.value = true
  try {
    const yes = reviewForm.result === '属实'
    const res = await manualReviewReport(currentRow.value.id, yes)
    ElMessage.success('审核处理完成')
    dialogVisible.value = false
    loadReportList()
  } catch (error) {
    ElMessage.error('审核处理失败')
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.report-review-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card { border-radius: 8px; }

.search-form .el-form-item {
  margin-bottom: 15px;
  margin-right: 20px;
}

.table-card {
  border-radius: 8px;
  flex: 1;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.review-desc {
  font-size: 13px;
}

:deep(.el-tag) { border-radius: 4px; }
:deep(.el-descriptions__label) { white-space: nowrap; }
</style>