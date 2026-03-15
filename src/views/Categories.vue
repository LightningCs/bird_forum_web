<template>
  <div class="category-manage-container">
    <!-- ================== 搜索卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入分类名称" clearable />
        </el-form-item>

        <el-form-item label="分类状态" prop="status">
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
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增分类</el-button>
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

        <!-- 分类图标 + 名称 -->
        <el-table-column label="分类" min-width="200">
          <template #default="scope">
            <div class="category-name-col">
              <el-avatar :src="scope.row.icon" :size="32" shape="square" class="category-icon">
                <span>{{ scope.row.name?.charAt(0) }}</span>
              </el-avatar>
              <span>{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="articleCount" label="文章数" width="100" align="center" />

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
              type="warning"
              link
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
      :title="dialogMode === 'add' ? '新增分类' : '编辑分类'"
      width="480px"
      :close-on-click-modal="false"
      @closed="resetDialogForm"
    >
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入分类名称" maxlength="20" show-word-limit />
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
import { getCategoryList } from '@/api/category'

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const dialogFormRef = ref()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')

const searchForm = reactive({
  name: '',
  status: '' as string
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const selectedRows = ref<any[]>([])
const allData = ref<any[]>([])   // 后端返回的完整数据
const tableData = ref<any[]>([]) // 当前页展示的数据

const dialogForm = reactive({
  id: null as number | null,
  name: '',
  status: '启用' as string
})

const dialogRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// ================== 数据获取 ==================

const applyFilter = () => {
  let filtered = allData.value
  if (searchForm.name) {
    filtered = filtered.filter(item => item.name.includes(searchForm.name))
  }
  if (searchForm.status !== '') {
    filtered = filtered.filter(item => item.status === searchForm.status)
  }
  pagination.total = filtered.length
  const start = (pagination.currentPage - 1) * pagination.pageSize
  tableData.value = filtered.slice(start, start + pagination.pageSize)
}

const fetchTableData = async () => {
  loading.value = true
  try {
    const res = await getCategoryList({
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize,
      name: searchForm.name || undefined,
      status: searchForm.status === '' ? undefined : searchForm.status
    })
    allData.value = res || []
    applyFilter()
  } catch {
    allData.value = [
      { id: 1, name: '科技', icon: '', articleCount: 5, status: '启用', createTime: '2026-03-10 13:15:00', updateTime: null },
      { id: 2, name: 'Java', icon: '', articleCount: 12, status: '启用', createTime: '2026-03-10 13:15:00', updateTime: null },
      { id: 3, name: 'Python', icon: '', articleCount: 8, status: '启用', createTime: '2026-03-10 13:15:00', updateTime: null },
      { id: 4, name: 'Redis', icon: '', articleCount: 0, status: '启用', createTime: '2026-03-10 13:15:00', updateTime: null },
      { id: 5, name: 'Vue', icon: '', articleCount: 3, status: '禁用', createTime: '2026-03-10 13:15:00', updateTime: null },
    ]
    applyFilter()
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
  applyFilter()
}

const resetSearch = () => {
  if (searchFormRef.value) searchFormRef.value.resetFields()
  pagination.currentPage = 1
  applyFilter()
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  applyFilter()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  applyFilter()
}

// ================== Dialog 操作 ==================

const openDialog = (row?: any) => {
  if (row) {
    dialogMode.value = 'edit'
    dialogForm.id = row.id
    dialogForm.name = row.name
    dialogForm.status = row.status
  } else {
    dialogMode.value = 'add'
  }
  dialogVisible.value = true
}

const resetDialogForm = () => {
  dialogForm.id = null
  dialogForm.name = ''
  dialogForm.status = '启用'
  dialogFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  await dialogFormRef.value?.validate()
  submitLoading.value = true
  try {
    // TODO: 调用新增/编辑接口
    // dialogMode.value === 'add' ? await addCategory(dialogForm) : await updateCategory(dialogForm)
    await new Promise(resolve => setTimeout(resolve, 400)) // 模拟请求
    ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '编辑成功')
    dialogVisible.value = false
    fetchTableData()
  } finally {
    submitLoading.value = false
  }
}

// ================== 行内操作 ==================

const handleToggleStatus = (row: any) => {
  const action = row.status === '启用' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}分类「${row.name}」吗？`, `${action}确认`, {
    confirmButtonText: `确定${action}`,
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = action
    ElMessage.success(`已${action}`)
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除分类「${row.name}」吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchTableData()
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 个分类吗？`, '批量删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success(`已删除 ${selectedRows.value.length} 个分类`)
    fetchTableData()
  }).catch(() => {})
}
</script>

<style scoped>
.category-manage-container {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.category-name-col {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-icon {
  flex-shrink: 0;
  background-color: #f0f2f5;
  color: #606266;
  font-weight: bold;
}

:deep(.el-tag) {
  border-radius: 4px;
}
</style>
