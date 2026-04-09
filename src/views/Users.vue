<template>
  <div class="user-manage-container">
    <!-- ================== 上半部分：筛选条件卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form">
        <!-- 用户名称 -->
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="searchForm.username" placeholder="请输入用户名称" clearable />
        </el-form-item>

        <!-- 账号 -->
        <el-form-item label="账号" prop="account">
          <el-input v-model="searchForm.account" placeholder="请输入账号" clearable />
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别" prop="sex">
          <el-select v-model="searchForm.sex" placeholder="请选择性别" clearable style="width: 120px;">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="未知" value="未知" />
          </el-select>
        </el-form-item>

        <!-- 用户状态 -->
        <el-form-item label="用户状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>

        <!-- 搜索与重置按钮 -->
        <el-form-item class="action-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ================== 下半部分：用户列表与分页卡片 ================== -->
    <el-card shadow="never" class="table-card">
      
      <!-- 表格操作栏 -->
      <div class="table-header-actions">
        <el-button type="danger" :icon="Delete" plain :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</el-button>
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
        
        <el-table-column label="用户头像" width="100" align="center">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar" />
          </template>
        </el-table-column>

        <el-table-column prop="username" label="用户名称" min-width="150" />
        <el-table-column prop="account" label="账号" min-width="180" />
        
        <el-table-column prop="sex" label="性别" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.sex === '男' ? 'primary' : (scope.row.sex === '女' ? 'danger' : 'info')">
              {{ scope.row.sex }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="注册日期" min-width="160" align="center" sortable />

        <el-table-column label="用户状态" width="100" align="center">
          <template #default="scope">
            <!-- switch 开关直接控制启用/禁用 -->
            <el-switch
              v-model="scope.row.status"
              active-value="启用"
              inactive-value="禁用"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="(val) => handleStatusChange(scope.row, val)"
            />
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Watch" @click="handleDetail(scope.row)">查看</el-button>
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

    <!-- ================== 用户详情 Dialog ================== -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="userDetail">
        <el-descriptions-item label="用户ID">{{ userDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ userDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ userDetail.account }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ userDetail.sex }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ userDetail.status }}</el-descriptions-item>
        <el-descriptions-item label="粉丝数量">{{ userDetail.fansCount }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ userDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="用户留言" :span="2">{{ userDetail.message || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Watch } from '@element-plus/icons-vue'
import { getUserList, getUserById, updateUserStatus, batchDeleteUsers } from '@/api/user'

// ================== 状态定义 ==================
const loading = ref(false)
const searchFormRef = ref()
const detailDialogVisible = ref(false)
const userDetail = ref<any>(null)

// 搜索表单数据
const searchForm = reactive({
  username: '',
  account: '',
  sex: '',
  status: ''
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

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.account) params.account = searchForm.account
    if (searchForm.sex) params.sex = searchForm.sex
    if (searchForm.status) params.status = searchForm.status

    const res = await getUserList(params)
    tableData.value = res
    pagination.total = res.length // 假设后端返回的列表长度即为总数，实际项目中可能需要单独的 total 字段
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// ================== 方法与逻辑 ==================

// 组件挂载时拉取一次数据
onMounted(() => {
  loadUserList()
})

// 搜索按钮
const handleSearch = () => {
  pagination.currentPage = 1 // 搜索时重置回第一页
  loadUserList()
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

// 切换用户状态
const handleStatusChange = async (row: any, val: string) => {
  const statusText = val === '启用' ? '启用' : '禁用'
  const code = val === '启用' ? 0 : 1 // 0-启用, 1-禁用
  
  try {
    const res = await updateUserStatus(code)
    ElMessage.success(`已成功${statusText}用户：${row.username}`)
    loadUserList()
  } catch (error) {
    ElMessage.error(`${statusText}失败`)
    // 恢复开关状态
    row.status = val === '启用' ? '禁用' : '启用'
  }
}

// 分页 - 切换每页显示条数
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadUserList()
}

// 分页 - 切换页码
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadUserList()
}

// 查看用户详情
const handleDetail = async (row: any) => {
  try {
    const res = await getUserById(row.id)
    userDetail.value = res
    detailDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取用户详情失败')
  }
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 名用户吗？此操作不可恢复！`, '批量删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    try {
      const res = await batchDeleteUsers(ids)
      ElMessage.success(`已删除 ${ids.length} 名用户`)
      loadUserList()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.user-manage-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 搜索表单卡片 */
.search-card {
  border-radius: 8px;
}

/* 让表单项更紧凑，对齐更美观 */
.search-form .el-form-item {
  margin-bottom: 15px;
  margin-right: 20px;
}

.action-buttons {
  margin-right: 0;
}

/* 表格卡片 */
.table-card {
  border-radius: 8px;
  flex: 1;
}

/* 表格顶部的操作栏 */
.table-header-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

/* 分页组件对齐 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Element Plus 标签颜色微调 */
:deep(.el-tag) {
  border-radius: 4px;
}
</style>