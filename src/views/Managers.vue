<template>
  <div class="manager-container">
    <!-- ================== 搜索卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="90px">
        <el-form-item label="管理员姓名" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入管理员姓名" clearable />
        </el-form-item>

        <el-form-item label="管理员身份" prop="identity">
          <el-select v-model="searchForm.identity" placeholder="请选择身份" clearable style="width: 150px;">
            <el-option label="超级管理员" :value="0" />
            <el-option label="普通管理员" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="账号状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px;">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>

        <el-form-item style="margin-left: 20px;">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearchSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ================== 列表卡片 ================== -->
    <el-card shadow="never" class="table-card">
      <div class="table-header-actions">
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增管理员</el-button>
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="num" label="序号" width="80" align="center" />

        <!-- 管理员信息 -->
        <el-table-column label="管理员信息" min-width="200">
          <template #default="scope">
            <div class="manager-info-col">
              <el-avatar :size="36" class="manager-avatar">
                {{ scope.row.name?.charAt(0) }}
              </el-avatar>
              <div>
                <div class="manager-name">{{ scope.row.name }}</div>
                <div class="manager-email">{{ scope.row.account }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="身份" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.identity === 0" type="danger" effect="dark">超级管理员</el-tag>
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
      <el-form :model="dialogForm" :rules="dialogMode === 'add' ? addRules : editRules" ref="dialogFormRef" label-width="90px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入管理员姓名" />
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model="dialogForm.account" placeholder="请输入管理员账号" :disabled="dialogMode === 'edit'" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogMode === 'add'">
          <el-input v-model="dialogForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="管理员身份" prop="identity">
          <el-radio-group v-model="dialogForm.identity">
            <el-radio :value="0">超级管理员</el-radio>
            <el-radio :value="1">普通管理员</el-radio>
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
import { getManagerList, getManagerById, addManager, updateManager, deleteManager } from '@/api/manager'

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const dialogFormRef = ref()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')

const searchForm = reactive({
  name: '',
  identity: '',
  status: ''
})

const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const tableData = ref<any[]>([])

const dialogForm = reactive({
  id: null as number | null,
  name: '',
  account: '',
  password: '',
  identity: 0,
  status: '启用'
})

const addRules: any = {
  name:     [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  account:  [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  identity: [{ required: true, message: '请选择身份', trigger: 'change' }],
  status:   [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const editRules: any = {
  name:     [{ required: false, message: '请输入姓名', trigger: 'blur' }],
  account:  [{ required: false, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: false, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  identity: [{ required: false, message: '请选择身份', trigger: 'change' }],
  status:   [{ required: false, message: '请选择状态', trigger: 'change' }]
}

// ================== 后端API调用 ==================

// 加载管理员列表
const loadManagerList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.identity !== '') params.identity = searchForm.identity
    if (searchForm.status) params.status = searchForm.status

    const res = await getManagerList(params)

    for (let i = 0; i < res.length; i++) {
      const element = res[i]
      element.num = (pagination.currentPage - 1) * pagination.pageSize + i + 1
    }
    
    tableData.value = res
  } catch (error) {
    ElMessage.error('获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

// ================== 搜索与分页 ==================

const handleSearch = () => {
  pagination.currentPage = 1
  loadManagerList()
}

const resetSearchSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadManagerList()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadManagerList()
}

// ================== Dialog ==================

const openDialog = (row?: any) => {
  if (row) {
    dialogMode.value = 'edit'
    dialogForm.id = row.id
    dialogForm.name = row.name
    dialogForm.account = row.account
    dialogForm.password = ''
    dialogForm.identity = row.identity
    dialogForm.status = row.status
  } else {
    dialogMode.value = 'add'
    dialogForm.id = null
    dialogForm.name = ''
    dialogForm.account = ''
    dialogForm.password = ''
    dialogForm.identity = 1
    dialogForm.status = '启用'
  }
  dialogVisible.value = true
}

const resetDialogForm = () => {
  dialogForm.id = null
  dialogForm.name = ''
  dialogForm.account = ''
  dialogForm.password = ''
  dialogForm.identity = 1
  dialogForm.status = '启用'
  dialogFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  await dialogFormRef.value?.validate()
  submitLoading.value = true
  try {
    if (dialogMode.value === 'add') {
      const data = {
        name: dialogForm.name,
        account: dialogForm.account,
        password: dialogForm.password,
        identity: dialogForm.identity,
        status: dialogForm.status
      }
      const res = await addManager(data)
      ElMessage.success('新增成功')
      dialogVisible.value = false
      loadManagerList()
    } else {
      // 编辑模式，先获取完整信息
      const detailRes = await getManagerById(dialogForm.id!)
      const data = {
        id: detailRes.id,
        name: dialogForm.name,
        account: dialogForm.account,
        password: dialogForm.password || detailRes.password,
        identity: dialogForm.identity,
        status: dialogForm.status
      }
      const res = await updateManager(data)
      ElMessage.success('编辑成功')
      dialogVisible.value = false
      loadManagerList()
    }
  } catch (error) {
    ElMessage.error(dialogMode.value === 'add' ? '新增失败' : '编辑失败')
  } finally {
    submitLoading.value = false
  }
}

// ================== 行内操作 ==================

const handleToggleStatus = (row: any) => {
  const action = row.status === '启用' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}管理员「${row.name}」吗？`, `${action}确认`, {
    confirmButtonText: `确定${action}`, cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      // 获取完整信息
      const detailRes = await getManagerById(row.id)
      const data = {
        id: detailRes.id,
        name: detailRes.name,
        account: detailRes.account,
        password: detailRes.password,
        identity: detailRes.identity,
        status: action
      }
      const res = await updateManager(data)
      loadManagerList()
      ElMessage.success(`${action}成功`)
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除管理员「${row.name}」吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error'
  }).then(async () => {
    try {
      const res = await deleteManager(row.id)
      ElMessage.success('删除成功')
      loadManagerList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => loadManagerList())
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