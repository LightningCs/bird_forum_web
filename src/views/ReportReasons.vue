<template>
  <div class="report-reason-container">
    <!-- ================== 搜索卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="80px">
        <el-form-item label="原因内容" prop="context">
          <el-input v-model="searchForm.context" placeholder="请输入举报原因关键字" clearable />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px;">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
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
      <div class="table-header-actions">
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增原因</el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>

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
        <el-table-column prop="context" label="举报原因" min-width="280" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '启用'" type="success">启用</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="160" align="center" sortable />

        <el-table-column label="操作" width="400" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="openDialog(scope.row)">编辑</el-button>
            <el-button
              link
              :type="scope.row.status === '启用' ? 'warning' : 'success'"
              :icon="scope.row.status === '启用' ? CircleClose : CircleCheck"
              @click="handleToggleStatus(scope.row)"
            >{{ scope.row.status === '启用' ? '禁用' : '启用' }}</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- ================== 新增/编辑 Dialog ================== -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '新增举报原因' : '编辑举报原因'"
      width="480px"
      :close-on-click-modal="false"
      @closed="resetDialogForm"
    >
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="80px">
        <el-form-item label="原因内容" prop="context">
          <el-input
            v-model="dialogForm.context"
            type="textarea"
            :rows="3"
            placeholder="请输入举报原因内容"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dialogForm.status">
            <el-radio value="启用">启用</el-radio>
            <el-radio value="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import { getReportReasonList, updateReportReason, batchDeleteReportReasons, deleteReportReason } from '@/api/report'

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const dialogFormRef = ref()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')

const searchForm = reactive({
  context: '',
  status: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const selectedRows = ref<any[]>([])
const tableData = ref<any[]>([])

const dialogForm = reactive({
  id: null as number | null,
  context: '',
  status: '启用' as string
})

const dialogRules = {
  context: [{ required: true, message: '请输入举报原因内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// ================== 后端API调用 ==================

// 加载举报原因列表
const loadReportReasonList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.context) params.context = searchForm.context
    if (searchForm.status) params.status = searchForm.status

    const res = await getReportReasonList(params)

    for (let i = 0; i < res.length; i++) {
      const element = res[i]
      element.num = (pagination.currentPage - 1) * pagination.pageSize + i + 1
    }

    tableData.value = res || []
    pagination.total = res.length || 0
  } catch (error) {
    ElMessage.error('获取举报原因列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReportReasonList()
})

// ================== 搜索与分页 ==================

const handleSearch = () => {
  pagination.currentPage = 1
  loadReportReasonList()
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
  loadReportReasonList()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadReportReasonList()
}

// ================== Dialog 操作 ==================

const openDialog = (row?: any) => {
  if (row) {
    dialogMode.value = 'edit'
    dialogForm.id = row.id
    dialogForm.context = row.context
    dialogForm.status = row.status
  } else {
    dialogMode.value = 'add'
    dialogForm.id = null
    dialogForm.context = ''
    dialogForm.status = '启用'
  }
  dialogVisible.value = true
}

const resetDialogForm = () => {
  dialogForm.id = null
  dialogForm.context = ''
  dialogForm.status = '启用'
  dialogFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  await dialogFormRef.value?.validate()
  submitLoading.value = true
  try {
    const data = {
      id: dialogForm.id,
      context: dialogForm.context,
      status: dialogForm.status
    }
    const res = await updateReportReason(data)
    ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '编辑成功')
    dialogVisible.value = false
    loadReportReasonList()
  } catch (error) {
    ElMessage.error(dialogMode.value === 'add' ? '新增失败' : '编辑失败')
  } finally {
    submitLoading.value = false
  }
}

// ================== 行内操作 ==================

const handleToggleStatus = async (row: any) => {
  const action = row.status === '启用' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该举报原因吗？`, `${action}确认`, {
    confirmButtonText: `确定${action}`,
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const data = {
        id: row.id,
        context: row.context,
        status: action
      }
      const res = await updateReportReason(data)
      ElMessage.success(`已${action}`)
      loadReportReasonList()
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除举报原因「${row.context}」吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      const res = await deleteReportReason(row.id)
      ElMessage.success('删除成功')
      loadReportReasonList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 条举报原因吗？`, '批量删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    try {
      const res = await batchDeleteReportReasons(ids)
      ElMessage.success(`已删除 ${ids.length} 条举报原因`)
      loadReportReasonList()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.report-reason-container {
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

.table-header-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
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