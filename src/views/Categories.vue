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
        <el-upload
          class="image-uploader"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleimageChange"
        >
          <div v-if="imagePreviewUrl" class="preview-container">
            <img :src="imagePreviewUrl" class="image-preview" alt="图标预览" />
            <div class="upload-hover-mask">
              <el-icon><Edit /></el-icon> 点击更换图标
            </div>
          </div>
          <div v-else class="upload-placeholder">
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <div class="el-upload__tip">支持 JPG/PNG/WEBP 格式，建议比例 16:9</div>
          </div>
        </el-upload>
        <el-form-item label="分类名称" prop="name" style="margin-top: 20px;">
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
import type { UploadFile } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import { getCategoryList, updateCategory, batchDeleteCategories, deleteCategory, saveCategory } from '@/api/category'

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const dialogFormRef = ref()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
// 封面预览 URL
const imagePreviewUrl = ref('')

const searchForm = reactive({
  name: '',
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
  icon: null as File | null,
  name: '',
  status: '启用' as string
})

const dialogRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 处理封面选择 (本地预览)
const handleimageChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    const isImage = uploadFile.raw.type.startsWith('image/')
    if (!isImage) {
      ElMessage.error('封面只能是图片格式!')
      return
    }
    if (uploadFile.raw.size / 1024 / 1024 > 5) {
      ElMessage.error('封面图片大小不能超过 5MB!')
      return
    }
    
    dialogForm.icon = uploadFile.raw
    imagePreviewUrl.value = URL.createObjectURL(uploadFile.raw)
  }
}

// ================== 后端API调用 ==================

// 加载分类列表
const loadCategoryList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize
    }
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.status) params.status = searchForm.status

    const res = await getCategoryList(params)
    tableData.value = res || []
    pagination.total = res.length || 0
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategoryList()
})

// ================== 搜索与分页 ==================

const handleSearch = () => {
  pagination.currentPage = 1
  loadCategoryList()
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
  loadCategoryList()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadCategoryList()
}

// ================== Dialog 操作 ==================

const openDialog = (row?: any) => {
  if (row) {
    dialogMode.value = 'edit'
    dialogForm.id = row.id
    dialogForm.name = row.name
    dialogForm.status = row.status
    dialogForm.icon = row.icon || null
  } else {
    dialogMode.value = 'add'
    dialogForm.id = null
    dialogForm.name = ''
    dialogForm.status = '启用'
    dialogForm.icon = null
  }
  dialogVisible.value = true
}

const resetDialogForm = () => {
  dialogForm.id = null
  dialogForm.name = ''
  dialogForm.status = '启用'
  dialogForm.icon = null,
  dialogFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  await dialogFormRef.value?.validate()
  submitLoading.value = true
  try {
    const formData = new FormData()
    formData.append('name', dialogForm.name)
    formData.append('status', dialogForm.status)
    formData.append('icon', dialogForm.icon)
    if (dialogMode.value === 'add') {
      await saveCategory(formData)
      ElMessage.success('新增成功')
    } else {
      formData.append('id', dialogForm.id!.toString())
      await updateCategory(formData)
      ElMessage.success('编辑成功')
    }
    ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '编辑成功')
    dialogVisible.value = false
    loadCategoryList()
  } catch (error) {
    ElMessage.error(dialogMode.value === 'add' ? '新增失败' : '编辑失败')
  } finally {
    submitLoading.value = false
  }
}

// ================== 行内操作 ==================

const handleToggleStatus = async (row: any) => {
  const action = row.status === '启用' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}分类「${row.name}」吗？`, `${action}确认`, {
    confirmButtonText: `确定${action}`,
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const formData = new FormData()
      formData.append('id', row.id)
      formData.append('name', row.name)
      formData.append('status', action)
      const res = await updateCategory(formData)
      ElMessage.success(`已${action}`)
      loadCategoryList()
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除分类「${row.name}」吗？此操作不可恢复！`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      const res = await deleteCategory(row.id)
      ElMessage.success('删除成功')
      loadCategoryList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要批量删除选中的 ${selectedRows.value.length} 个分类吗？`, '批量删除', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    const ids = selectedRows.value.map(r => r.id)
    try {
      const res = await batchDeleteCategories(ids)
      ElMessage.success(`已删除 ${ids.length} 个分类`)
      loadCategoryList()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
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