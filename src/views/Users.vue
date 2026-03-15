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
          <el-input v-model="searchForm.account" placeholder="请输入邮箱账号" clearable />
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别" prop="gender">
          <el-select v-model="searchForm.gender" placeholder="请选择性别" clearable style="width: 120px;">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="未知" value="未知" />
          </el-select>
        </el-form-item>

        <!-- 用户状态 -->
        <el-form-item label="用户状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <!-- 注册日期 (范围选择器) -->
        <el-form-item label="注册日期" prop="dateRange">
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
        <el-form-item class="action-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ================== 下半部分：用户列表与分页卡片 ================== -->
    <el-card shadow="never" class="table-card">
      
      <!-- 表格操作栏 (例如批量删除、导出等，这里留个占位) -->
      <div class="table-header-actions">
        <el-button type="primary" :icon="Plus" plain>新增用户</el-button>
        <el-button type="danger" :icon="Delete" plain :disabled="selectedRows.length === 0">批量删除</el-button>
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
        <el-table-column prop="account" label="账号 (邮箱)" min-width="180" />
        
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.gender === '男' ? 'primary' : (scope.row.gender === '女' ? 'danger' : 'info')">
              {{ scope.row.gender }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="注册日期" min-width="160" align="center" sortable />

        <el-table-column label="用户状态" width="100" align="center">
          <template #default="scope">
            <!-- switch 开关直接控制启用/禁用 -->
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="(val) => handleStatusChange(scope.row, val)"
            />
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
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
import { Search, Refresh, Plus, Delete, Edit } from '@element-plus/icons-vue'

// ================== 状态定义 ==================
const loading = ref(false)
const searchFormRef = ref()

// 搜索表单数据
const searchForm = reactive({
  username: '',
  account: '',
  gender: '',
  status: '', // 1: 启用, 0: 禁用
  dateRange: [] // [开始日期, 结束日期]
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 45 // 模拟总数
})

// 表格多选数据
const selectedRows = ref<any[]>([])

// 模拟表格数据
const tableData = ref<any[]>([])

// ================== 方法与逻辑 ==================

// 模拟从后台获取数据
const fetchTableData = () => {
  loading.value = true
  // 打印当前请求参数，实际开发中会将这些参数发给后端
  console.log('正在请求数据，参数为：', { ...searchForm, page: pagination.currentPage, size: pagination.pageSize })
  
  setTimeout(() => {
    // 模拟后端返回的数据
    tableData.value =[
      { id: 1001, avatar: 'https://via.placeholder.com/40x40?text=Z', username: '张三', account: 'zhangsan@edu.cn', gender: '男', createTime: '2025-01-10 10:20:00', status: 1 },
      { id: 1002, avatar: 'https://via.placeholder.com/40x40?text=L', username: '李四', account: 'lisi@edu.cn', gender: '女', createTime: '2025-02-14 09:15:30', status: 1 },
      { id: 1003, avatar: 'https://via.placeholder.com/40x40?text=W', username: '王五', account: 'wangwu@edu.cn', gender: '未知', createTime: '2025-03-01 14:05:12', status: 0 },
      { id: 1004, avatar: 'https://via.placeholder.com/40x40?text=Z', username: '赵六', account: 'zhaoliu@edu.cn', gender: '男', createTime: '2025-03-10 16:30:45', status: 1 },
    ]
    loading.value = false
  }, 600)
}

// 组件挂载时拉取一次数据
onMounted(() => {
  fetchTableData()
})

// 搜索按钮
const handleSearch = () => {
  pagination.currentPage = 1 // 搜索时重置回第一页
  fetchTableData()
}

// 重置按钮
const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
    // 特殊处理 dateRange，因为 resetFields 有时无法完美清空数组
    searchForm.dateRange =[] 
  }
  handleSearch()
}

// 表格多选变化
const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

// 切换用户状态 (直接在表格里的 Switch 组件修改)
const handleStatusChange = (row: any, val: number) => {
  const statusText = val === 1 ? '启用' : '禁用'
  ElMessage.success(`已成功${statusText}用户：${row.username}`)
  // 实际开发中需要调用 API: axios.put(`/api/users/${row.id}/status`, { status: val })
}

// 分页 - 切换每页显示条数
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchTableData()
}

// 分页 - 切换页码
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchTableData()
}

// 编辑按钮
const handleEdit = (row: any) => {
  ElMessage.info(`点击了编辑用户: ${row.username}`)
  // 通常这里会打开一个 Dialog 弹窗来进行编辑
}

// 删除按钮
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要永久删除用户 [${row.username}] 吗？`, '危险操作提示', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchTableData() // 删除后重新拉取列表
  }).catch(() => {})
}
</script>

<style scoped>
.user-manage-container {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 两个卡片之间的间距 */
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
  margin-right: 0; /* 最后一个按钮组去掉右边距 */
}

/* 表格卡片 */
.table-card {
  border-radius: 8px;
  flex: 1; /* 占据剩余空间 */
}

/* 表格顶部的操作栏 (新增、批量删除等) */
.table-header-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

/* 分页组件对齐 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end; /* 分页靠右对齐 */
}

/* Element Plus 标签颜色微调，显得更柔和 */
:deep(.el-tag) {
  border-radius: 4px;
}
</style>