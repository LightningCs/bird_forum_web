<template>
  <div class="report-reason-container">
    <!-- ================== 搜索卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="80px">
        <el-form-item label="原因内容" prop="content">
          <el-input v-model="searchForm.content" placeholder="请输入举报原因关键字" clearable />
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
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="content" label="举报原因" min-width="280" show-overflow-tooltip />
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
        <el-form-item label="原因内容" prop="content">
          <el-input
            v-model="dialogForm.content"
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

// ================== 默认数据 ==================
const DEFAULT_DATA = [
  { id: 1, content: '包含色情、暴力等违法违规内容', useCount: 128, status: '启用', createTime: '2026-01-01 10:00:00' },
  { id: 2, content: '恶意广告或垃圾信息', useCount: 95, status: '启用', createTime: '2026-01-02 11:00:00' },
  { id: 3, content: '侵犯他人隐私或个人信息', useCount: 67, status: '启用', createTime: '2026-01-03 09:30:00' },
  { id: 4, content: '散布谣言或虚假信息', useCount: 54, status: '启用', createTime: '2026-01-04 14:20:00' },
  { id: 5, content: '抄袭或侵犯版权', useCount: 43, status: '启用', createTime: '2026-01-05 08:45:00' },
  { id: 6, content: '人身攻击或网络暴力', useCount: 38, status: '启用', createTime: '2026-01-06 16:00:00' },
  { id: 7, content: '政治敏感或违反法律法规', useCount: 29, status: '启用', createTime: '2026-01-07 10:30:00' },
  { id: 8, content: '其他原因', useCount: 12, status: '禁用', createTime: '2026-01-08 13:00:00' },
]

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const dialogFormRef = ref()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
let nextId = DEFAULT_DATA.length + 1

const searchForm = reactive({ content: '', status: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const selectedRows = ref<any[]>([])
const allData = ref<any[]>([...DEFAULT_DATA])
const tableData = ref<any[]>([])

const dialogForm = reactive({ id: null as number | null, content: '', status: '启用' })
const dialogRules = {
  content: [{ required: true, message: '请输入举报原因内容', trigger: 'blur' }],
  status:  [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// ================== 本地筛选分页 ==================

const applyFilter = () => {
  let filtered = allData.value
  if (searchForm.content) {
    filtered = filtered.filter(item => item.content.includes(searchForm.content))
  }
  if (searchForm.status) {
    filtered = filtered.filter(item => item.status === searchForm.status)
  }
  pagination.total = filtered.length
  const start = (pagination.currentPage - 1) * pagination.pageSize
  tableData.value = filtered.slice(start, start + pagination.pageSize)
}

onMounted(() => applyFilter())

// ================== 搜索与分页 ==================

const handleSearch = () => { pagination.currentPage = 1; applyFilter() }
const resetSearch = () => { searchFormRef.value?.resetFields(); handleSearch() }
const handleSelectionChange = (val: any[]) => { selectedRows.value = val }
const handleSizeChange = (val: number) => { pagination.pageSize = val; applyFilter() }
const handleCurrentChange = (val: number) => { pagination.currentPage = val; applyFilter() }

// ================== Dialog ==================

const openDialog = (row?: any) => {
  if (row) {
    dialogMode.value = 'edit'
    dialogForm.id = row.id
    dialogForm.content = row.content
    dialogForm.status = row.status
  } else {
    dialogMode.value = 'add'
  }
  dialogVisible.value = true
}

const resetDialogForm = () => {
  dialogForm.id = null
  dialogForm.content = ''
  dialogForm.status = '启用'
  dialogFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  await dialogFormRef.value?.validate()
  submitLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    if (dialogMode.value === 'add') {
      allData.value.unshift({
        id: nextId++,
        content: dialogForm.content,
        useCount: 0,
        status: dialogForm.status,
        createTime: new Date().toLocaleString('sv').replace('T', ' ')
      })
    } else {
      const target = allData.value.find(item => item.id === dialogForm.id)
      if (target) { target.content = dialogForm.content; target.status = dialogForm.status }
    }
    ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '编辑成功')
    dialogVisible.value = false
    applyFilter()
  } finally {
    submitLoading.value = false
  }
}

// ================== 行内操作 ==================

const handleToggleStatus = (row: any) => {
  const action = row.status === '启用' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该举报原因吗？`, `${action}确认`, {
    confirmButtonText: `确定${action}`, cancelButtonText: '取消', type: 'warning'
  }).then(() => { row.status = action; ElMessage.success(`已${action}`) }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除举报原因「${row.content}」吗？`, '删除确认', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error'
  }).then(() => {
    allData.value = allData.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
    applyFilter()
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 条举报原因吗？`, '批量删除', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error'
  }).then(() => {
    const ids = new Set(selectedRows.value.map(r => r.id))
    allData.value = allData.value.filter(item => !ids.has(item.id))
    ElMessage.success(`已删除 ${ids.size} 条举报原因`)
    applyFilter()
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

.table-card { border-radius: 8px; flex: 1; }

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

:deep(.el-tag) { border-radius: 4px; }
</style>
