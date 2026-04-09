<template>
  <div class="notice-manage-container">
    <!-- ================== 搜索卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="80px">
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="searchForm.title" placeholder="请输入通知标题" clearable />
        </el-form-item>

        <el-form-item label="通知内容" prop="context">
          <el-input v-model="searchForm.context" placeholder="请输入内容关键字" clearable />
        </el-form-item>

        <el-form-item label="通知类型" prop="type">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 150px;">
            <el-option label="系统公告" value="系统公告" />
            <el-option label="活动通知" value="活动通知" />
            <el-option label="安全提醒" value="安全提醒" />
            <el-option label="功能更新" value="功能更新" />
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
        <el-button type="primary" :icon="Plus" @click="openDialog()">发布通知</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column label="通知类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="typeTagMap[scope.row.type]?.tagType" effect="plain">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />

        <el-table-column label="内容" min-width="280" show-overflow-tooltip>
          <template #default="scope">
            <span class="content-preview">{{ scope.row.context }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createBy" label="创建者" width="120" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160" align="center" sortable />

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="openDialog(scope.row)">编辑</el-button>
            <el-button type="warning" link :icon="RefreshLeft" @click="handleRevoke(scope.row)">撤回</el-button>
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

    <!-- ================== 发布/编辑 Dialog ================== -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '发布通知' : '编辑通知'"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetDialogForm"
    >
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="90px">
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="dialogForm.title" placeholder="请输入通知标题" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="通知类型" prop="type">
          <el-select v-model="dialogForm.type" placeholder="请选择通知类型" style="width: 100%;">
            <el-option label="系统公告" value="系统公告" />
            <el-option label="活动通知" value="活动通知" />
            <el-option label="安全提醒" value="安全提醒" />
            <el-option label="功能更新" value="功能更新" />
          </el-select>
        </el-form-item>

        <el-form-item label="通知内容" prop="context">
          <el-input
            v-model="dialogForm.context"
            type="textarea"
            :rows="5"
            placeholder="请输入通知内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ dialogMode === 'add' ? '发布' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, RefreshLeft } from '@element-plus/icons-vue'
import { getNoticeList, addNotice, revokeNotice, deleteNotice } from '@/api/notice'

// ================== 类型标签映射 ==================
const typeTagMap: Record<string, { tagType: string }> = {
  '系统公告': { tagType: 'primary' },
  '活动通知': { tagType: 'success' },
  '安全提醒': { tagType: 'danger' },
  '功能更新': { tagType: 'warning' }
}

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const dialogFormRef = ref()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')

const searchForm = reactive({
  title: '',
  context: '',
  type: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref<any[]>([])

const dialogForm = reactive({
  id: null as number | null,
  title: '',
  type: '',
  context: ''
})

const dialogRules = {
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  context: [{ required: true, message: '请输入通知内容', trigger: 'blur' }]
}

// ================== 后端API调用 ==================

// 加载通知列表
const loadNoticeList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.title) params.title = searchForm.title
    if (searchForm.context) params.context = searchForm.context
    if (searchForm.type) params.type = searchForm.type

    const res = await getNoticeList(params)
    tableData.value = res || []
    pagination.total = res.length || 0
  } catch {
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNoticeList()
})

// ================== 搜索与分页 ==================

const handleSearch = () => {
  pagination.currentPage = 1
  loadNoticeList()
}

const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadNoticeList()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadNoticeList()
}

// ================== Dialog 操作 ==================

const openDialog = (row?: any) => {
  if (row) {
    dialogMode.value = 'edit'
    dialogForm.id = row.id
    dialogForm.title = row.title
    dialogForm.type = row.type
    dialogForm.context = row.context
  } else {
    dialogMode.value = 'add'
    dialogForm.id = null
    dialogForm.title = ''
    dialogForm.type = ''
    dialogForm.context = ''
  }
  dialogVisible.value = true
}

const resetDialogForm = () => {
  dialogForm.id = null
  dialogForm.title = ''
  dialogForm.type = ''
  dialogForm.context = ''
  dialogFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  await dialogFormRef.value?.validate()
  submitLoading.value = true
  try {
    const data = {
      title: dialogForm.title,
      type: dialogForm.type,
      context: dialogForm.context
    }
    const res = await addNotice(data)
    ElMessage.success(dialogMode.value === 'add' ? '发布成功' : '保存成功')
    dialogVisible.value = false
    loadNoticeList()
  } catch {
    ElMessage.error(dialogMode.value === 'add' ? '发布失败' : '保存失败')
  } finally {
    submitLoading.value = false
  }
}

// ================== 行内操作 ==================

const handleRevoke = (row: any) => {
  ElMessageBox.confirm(`确定要撤回通知「${row.title}」吗？撤回后用户将无法看到此通知。`, '撤回确认', {
    confirmButtonText: '确定撤回',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await revokeNotice(row.id)
      ElMessage.success('通知已撤回')
      loadNoticeList()
    } catch {
      ElMessage.error('撤回失败')
    }
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要永久删除通知「${row.title}」吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      const res = await deleteNotice(row.id)
      ElMessage.success('删除成功')
      loadNoticeList()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.notice-manage-container {
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

.content-preview {
  color: #606266;
  font-size: 13px;
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