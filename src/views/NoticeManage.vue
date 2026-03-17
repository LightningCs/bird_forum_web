<template>
  <div class="notice-manage-container">
    <!-- ================== 搜索卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="80px">
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="searchForm.title" placeholder="请输入标题关键字" clearable />
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input v-model="searchForm.content" placeholder="请输入内容关键字" clearable />
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
            <span class="content-preview">{{ scope.row.content }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="creator" label="创建者" width="120" align="center" />
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

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="dialogForm.content"
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

// ================== 类型标签映射 ==================
const typeTagMap: Record<string, { tagType: string }> = {
  '系统公告': { tagType: 'primary' },
  '活动通知': { tagType: 'success' },
  '安全提醒': { tagType: 'danger' },
  '功能更新': { tagType: 'warning' }
}

// ================== 默认数据 ==================
const DEFAULT_DATA = [
  { id: 1, title: '小鸟论坛 v2.0 正式上线', content: '小鸟论坛 v2.0 正式上线，新增 AI 审核、分类管理、通知管理等功能，欢迎体验！', type: '系统公告', creator: '超管张三', createTime: '2026-03-15 10:00:00' },
  { id: 2, title: '春季学术交流活动开始报名', content: '2026年春季学术交流活动现已开放报名，欢迎各位同学踊跃参与，截止日期为4月1日。', type: '活动通知', creator: '李四', createTime: '2026-03-14 09:30:00' },
  { id: 3, title: '账号安全加固通知', content: '为保障账号安全，系统已升级密码策略，请所有用户在下次登录时更新密码，密码长度不少于8位。', type: '安全提醒', creator: '超管张三', createTime: '2026-03-12 11:00:00' },
  { id: 4, title: '富文本编辑器功能上线', content: '文章发布页面现已支持富文本编辑，可插入图片、代码块、表格等内容，欢迎使用。', type: '功能更新', creator: '王五', createTime: '2026-03-10 14:20:00' },
  { id: 5, title: '五一假期系统维护公告', content: '五一假期期间（5月1日 00:00 - 5月2日 06:00）系统将进行例行维护，届时服务暂停，请提前做好安排。', type: '系统公告', creator: '超管张三', createTime: '2026-03-08 16:00:00' },
]

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const dialogFormRef = ref()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
let nextId = DEFAULT_DATA.length + 1

const searchForm = reactive({ title: '', content: '', type: '' })
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const allData = ref<any[]>([...DEFAULT_DATA])
const tableData = ref<any[]>([])

const dialogForm = reactive({
  id: null as number | null,
  title: '',
  type: '',
  content: ''
})

const dialogRules = {
  title:   [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  type:    [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }]
}

// ================== 本地筛选分页 ==================
const applyFilter = () => {
  let filtered = allData.value
  if (searchForm.title)   filtered = filtered.filter(i => i.title.includes(searchForm.title))
  if (searchForm.content) filtered = filtered.filter(i => i.content.includes(searchForm.content))
  if (searchForm.type)    filtered = filtered.filter(i => i.type === searchForm.type)
  pagination.total = filtered.length
  const start = (pagination.currentPage - 1) * pagination.pageSize
  tableData.value = filtered.slice(start, start + pagination.pageSize)
}

onMounted(() => applyFilter())

// ================== 搜索与分页 ==================
const handleSearch = () => { pagination.currentPage = 1; applyFilter() }
const resetSearch = () => { searchFormRef.value?.resetFields(); handleSearch() }
const handleSizeChange = (val: number) => { pagination.pageSize = val; applyFilter() }
const handleCurrentChange = (val: number) => { pagination.currentPage = val; applyFilter() }

// ================== Dialog ==================
const openDialog = (row?: any) => {
  if (row) {
    dialogMode.value = 'edit'
    Object.assign(dialogForm, { id: row.id, title: row.title, type: row.type, content: row.content })
  } else {
    dialogMode.value = 'add'
  }
  dialogVisible.value = true
}

const resetDialogForm = () => {
  dialogForm.id = null
  dialogForm.title = ''
  dialogForm.type = ''
  dialogForm.content = ''
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
        title: dialogForm.title,
        type: dialogForm.type,
        content: dialogForm.content,
        creator: '当前管理员',
        createTime: new Date().toLocaleString('sv').replace('T', ' ')
      })
      ElMessage.success('通知已发布')
    } else {
      const target = allData.value.find(i => i.id === dialogForm.id)
      if (target) Object.assign(target, { title: dialogForm.title, type: dialogForm.type, content: dialogForm.content })
      ElMessage.success('通知已更新')
    }
    dialogVisible.value = false
    applyFilter()
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
  }).then(() => {
    allData.value = allData.value.filter(i => i.id !== row.id)
    ElMessage.success('通知已撤回')
    applyFilter()
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要永久删除通知「${row.title}」吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    allData.value = allData.value.filter(i => i.id !== row.id)
    ElMessage.success('删除成功')
    applyFilter()
  }).catch(() => {})
}
</script>

<style scoped>
.notice-manage-container {
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

.content-preview {
  color: #606266;
  font-size: 13px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-tag) { border-radius: 4px; }
</style>
