<template>
  <div class="manager-container">
    <!-- ================== 搜索卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="90px">
        <el-form-item label="管理员姓名" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入管理员姓名" clearable />
        </el-form-item>

        <el-form-item label="管理员身份" prop="role">
          <el-select v-model="searchForm.role" placeholder="请选择身份" clearable style="width: 150px;">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="普通管理员" value="普通管理员" />
          </el-select>
        </el-form-item>

        <el-form-item label="账号状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px;">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>

        <el-form-item label="创建时间" prop="dateRange">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px;"
          />
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
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增管理员</el-button>
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

        <!-- 管理员信息 -->
        <el-table-column label="管理员信息" min-width="200">
          <template #default="scope">
            <div class="manager-info-col">
              <el-avatar :size="36" :src="scope.row.avatar" class="manager-avatar">
                {{ scope.row.name?.charAt(0) }}
              </el-avatar>
              <div>
                <div class="manager-name">{{ scope.row.name }}</div>
                <div class="manager-email">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="身份" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.role === '超级管理员'" type="danger" effect="dark">超级管理员</el-tag>
            <el-tag v-else type="primary" effect="plain">普通管理员</el-tag>
          </template>
        </el-table-column>

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
          :page-sizes="[10, 20, 50]"
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
      :title="dialogMode === 'add' ? '新增管理员' : '编辑管理员'"
      width="500px"
      :close-on-click-modal="false"
      @closed="resetDialogForm"
    >
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="90px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入管理员姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogMode === 'add'">
          <el-input v-model="dialogForm.password" type="password" placeholder="请输入初始密码" show-password />
        </el-form-item>
        <el-form-item label="管理员身份" prop="role">
          <el-radio-group v-model="dialogForm.role">
            <el-radio value="超级管理员">超级管理员</el-radio>
            <el-radio value="普通管理员">普通管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="账号状态" prop="status">
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
  { id: 1, name: '超管张三', username: 'admin', email: 'admin@bird.com', role: '超级管理员', status: '启用', avatar: '', createTime: '2026-01-01 09:00:00' },
  { id: 2, name: '李四', username: 'lisi', email: 'lisi@bird.com', role: '普通管理员', status: '启用', avatar: '', createTime: '2026-01-10 10:30:00' },
  { id: 3, name: '王五', username: 'wangwu', email: 'wangwu@bird.com', role: '普通管理员', status: '启用', avatar: '', createTime: '2026-02-01 14:00:00' },
  { id: 4, name: '赵六', username: 'zhaoliu', email: 'zhaoliu@bird.com', role: '普通管理员', status: '禁用', avatar: '', createTime: '2026-02-15 11:20:00' },
]

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const dialogFormRef = ref()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
let nextId = DEFAULT_DATA.length + 1

const searchForm = reactive({
  name: '',
  role: '',
  status: '',
  dateRange: [] as string[]
})

const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const selectedRows = ref<any[]>([])
const allData = ref<any[]>([...DEFAULT_DATA])
const tableData = ref<any[]>([])

const dialogForm = reactive({
  id: null as number | null,
  name: '',
  username: '',
  email: '',
  password: '',
  role: '普通管理员',
  status: '启用'
})

const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const dialogRules: any = {
  name:     [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
  email:    [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: emailRule, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }, { min: 6, message: '密码不少于6位', trigger: 'blur' }],
  role:     [{ required: true, message: '请选择身份', trigger: 'change' }],
  status:   [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// ================== 本地筛选分页 ==================

const applyFilter = () => {
  let filtered = allData.value
  if (searchForm.name)   filtered = filtered.filter(i => i.name.includes(searchForm.name))
  if (searchForm.role)   filtered = filtered.filter(i => i.role === searchForm.role)
  if (searchForm.status) filtered = filtered.filter(i => i.status === searchForm.status)
  if (searchForm.dateRange?.length === 2) {
    const [start, end] = searchForm.dateRange
    filtered = filtered.filter(i => i.createTime >= start && i.createTime <= end + ' 23:59:59')
  }
  pagination.total = filtered.length
  const s = (pagination.currentPage - 1) * pagination.pageSize
  tableData.value = filtered.slice(s, s + pagination.pageSize)
}

onMounted(() => applyFilter())

// ================== 搜索与分页 ==================

const handleSearch = () => { pagination.currentPage = 1; applyFilter() }
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  searchForm.dateRange = []
  handleSearch()
}
const handleSelectionChange = (val: any[]) => { selectedRows.value = val }
const handleSizeChange = (val: number) => { pagination.pageSize = val; applyFilter() }
const handleCurrentChange = (val: number) => { pagination.currentPage = val; applyFilter() }

// ================== Dialog ==================

const openDialog = (row?: any) => {
  if (row) {
    dialogMode.value = 'edit'
    Object.assign(dialogForm, { id: row.id, name: row.name, username: row.username, email: row.email, password: '', role: row.role, status: row.status })
  } else {
    dialogMode.value = 'add'
  }
  dialogVisible.value = true
}

const resetDialogForm = () => {
  dialogForm.id = null
  dialogForm.name = ''
  dialogForm.username = ''
  dialogForm.email = ''
  dialogForm.password = ''
  dialogForm.role = '普通管理员'
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
        name: dialogForm.name,
        username: dialogForm.username,
        email: dialogForm.email,
        role: dialogForm.role,
        status: dialogForm.status,
        avatar: '',
        createTime: new Date().toLocaleString('sv').replace('T', ' ')
      })
    } else {
      const target = allData.value.find(i => i.id === dialogForm.id)
      if (target) Object.assign(target, { name: dialogForm.name, email: dialogForm.email, role: dialogForm.role, status: dialogForm.status })
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
  ElMessageBox.confirm(`确定要${action}管理员「${row.name}」吗？`, `${action}确认`, {
    confirmButtonText: `确定${action}`, cancelButtonText: '取消', type: 'warning'
  }).then(() => { row.status = action; ElMessage.success(`已${action}`) }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除管理员「${row.name}」吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error'
  }).then(() => {
    allData.value = allData.value.filter(i => i.id !== row.id)
    ElMessage.success('删除成功')
    applyFilter()
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 名管理员吗？`, '批量删除', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error'
  }).then(() => {
    const ids = new Set(selectedRows.value.map(r => r.id))
    allData.value = allData.value.filter(i => !ids.has(i.id))
    ElMessage.success(`已删除 ${ids.size} 名管理员`)
    applyFilter()
  }).catch(() => {})
}
</script>

<style scoped>
.manager-container {
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

.manager-info-col {
  display: flex;
  align-items: center;
  gap: 10px;
}

.manager-avatar {
  flex-shrink: 0;
  background-color: #409eff;
  color: #fff;
  font-weight: bold;
}

.manager-name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.manager-email {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-tag) { border-radius: 4px; }
</style>
