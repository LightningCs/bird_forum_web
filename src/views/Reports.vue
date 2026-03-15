<template>
  <div class="report-review-container">
    <!-- ================== 搜索卡片 ================== -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" class="search-form" label-width="90px">
        <el-form-item label="举报者" prop="reporterName">
          <el-input v-model="searchForm.reporterName" placeholder="请输入举报者名称" clearable />
        </el-form-item>

        <el-form-item label="举报原因" prop="reason">
          <el-input v-model="searchForm.reason" placeholder="请输入举报原因关键字" clearable />
        </el-form-item>

        <el-form-item label="目标类型" prop="targetType">
          <el-select v-model="searchForm.targetType" placeholder="请选择" clearable style="width: 140px;">
            <el-option label="文章" value="文章" />
            <el-option label="评论" value="评论" />
            <el-option label="用户" value="用户" />
          </el-select>
        </el-form-item>

        <el-form-item label="原因描述" prop="description">
          <el-input v-model="searchForm.description" placeholder="请输入原因描述关键字" clearable />
        </el-form-item>

        <el-form-item label="处理状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px;">
            <el-option label="未处理" value="未处理" />
            <el-option label="已处理" value="已处理" />
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
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="90" align="center" />
        <el-table-column prop="reporterName" label="举报者" width="110" align="center" />
        <el-table-column prop="reason" label="举报原因" min-width="160" show-overflow-tooltip />

        <el-table-column label="目标类型" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.targetType === '文章' ? 'primary' : scope.row.targetType === '评论' ? 'warning' : 'danger'"
              effect="plain"
            >{{ scope.row.targetType }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="targetId" label="目标ID" width="90" align="center" />
        <el-table-column prop="description" label="原因描述" min-width="200" show-overflow-tooltip />

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '已处理'" type="success">已处理</el-tag>
            <el-tag v-else type="danger" effect="plain">未处理</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reportTime" label="举报时间" width="160" align="center" sortable />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              :icon="Checked"
              :disabled="scope.row.status === '已处理'"
              @click="handleReview(scope.row)"
            >人工审核</el-button>
            <el-button
              type="warning"
              link
              :icon="MagicStick"
              :disabled="scope.row.status === '已处理'"
              @click="handleAiReview(scope.row)"
            >AI审核</el-button>
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

    <!-- ================== 审核 Dialog ================== -->
    <el-dialog
      v-model="dialogVisible"
      title="举报审核"
      width="520px"
      :close-on-click-modal="false"
      @closed="currentRow = null"
    >
      <template v-if="currentRow">
        <el-descriptions :column="2" border size="small" class="review-desc">
          <el-descriptions-item label="举报ID">{{ currentRow.id }}</el-descriptions-item>
          <el-descriptions-item label="举报者">{{ currentRow.reporterName }}</el-descriptions-item>
          <el-descriptions-item label="举报原因" :span="2">{{ currentRow.reason }}</el-descriptions-item>
          <el-descriptions-item label="目标类型">{{ currentRow.targetType }}</el-descriptions-item>
          <el-descriptions-item label="目标ID">{{ currentRow.targetId }}</el-descriptions-item>
          <el-descriptions-item label="原因描述" :span="2">{{ currentRow.description || '—' }}</el-descriptions-item>
          <el-descriptions-item label="举报时间" :span="2">{{ currentRow.reportTime }}</el-descriptions-item>
        </el-descriptions>

        <el-form :model="reviewForm" ref="reviewFormRef" label-width="90px" style="margin-top: 20px;">
          <el-form-item label="处理结果" prop="result" :rules="[{ required: true, message: '请选择处理结果', trigger: 'change' }]">
            <el-radio-group v-model="reviewForm.result">
              <el-radio value="属实">举报属实（处罚被举报方）</el-radio>
              <el-radio value="不属实">举报不属实（忽略）</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="处理备注" prop="remark">
            <el-input
              v-model="reviewForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入处理备注（选填）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitReview">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Checked, MagicStick } from '@element-plus/icons-vue'

// ================== 默认数据 ==================
const DEFAULT_DATA = [
  { id: 1, reporterName: '张三', reason: '包含色情、暴力等违法违规内容', targetType: '文章', targetId: 101, description: '该文章含有大量不雅图片，严重违规', status: '未处理', reportTime: '2026-03-15 10:20:00' },
  { id: 2, reporterName: '李四', reason: '恶意广告或垃圾信息', targetType: '评论', targetId: 305, description: '评论区全是广告链接', status: '未处理', reportTime: '2026-03-14 09:15:30' },
  { id: 3, reporterName: '王五', reason: '人身攻击或网络暴力', targetType: '用户', targetId: 88, description: '该用户持续对我进行辱骂', status: '已处理', reportTime: '2026-03-13 14:05:12' },
  { id: 4, reporterName: '赵六', reason: '抄袭或侵犯版权', targetType: '文章', targetId: 202, description: '该文章与我发布的内容完全一致，未经授权', status: '未处理', reportTime: '2026-03-12 16:30:45' },
  { id: 5, reporterName: '孙七', reason: '散布谣言或虚假信息', targetType: '文章', targetId: 315, description: '文章内容严重失实，误导读者', status: '已处理', reportTime: '2026-03-11 11:00:00' },
  { id: 6, reporterName: '周八', reason: '侵犯他人隐私或个人信息', targetType: '评论', targetId: 412, description: '评论中暴露了他人手机号和住址', status: '未处理', reportTime: '2026-03-10 08:45:00' },
  { id: 7, reporterName: '吴九', reason: '政治敏感或违反法律法规', targetType: '文章', targetId: 178, description: '文章涉及违禁政治内容', status: '未处理', reportTime: '2026-03-09 17:20:00' },
  { id: 8, reporterName: '郑十', reason: '恶意广告或垃圾信息', targetType: '用户', targetId: 56, description: '该用户批量发布广告文章', status: '已处理', reportTime: '2026-03-08 13:10:00' },
]

// ================== 状态定义 ==================
const loading = ref(false)
const submitLoading = ref(false)
const searchFormRef = ref()
const reviewFormRef = ref()
const dialogVisible = ref(false)
const currentRow = ref<any>(null)

const searchForm = reactive({
  reporterName: '',
  reason: '',
  targetType: '',
  description: '',
  status: ''
})

const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const allData = ref<any[]>([...DEFAULT_DATA])
const tableData = ref<any[]>([])

const reviewForm = reactive({ result: '', remark: '' })

// ================== 本地筛选分页 ==================

const applyFilter = () => {
  let filtered = allData.value
  if (searchForm.reporterName) filtered = filtered.filter(i => i.reporterName.includes(searchForm.reporterName))
  if (searchForm.reason)       filtered = filtered.filter(i => i.reason.includes(searchForm.reason))
  if (searchForm.targetType)   filtered = filtered.filter(i => i.targetType === searchForm.targetType)
  if (searchForm.description)  filtered = filtered.filter(i => i.description?.includes(searchForm.description))
  if (searchForm.status)       filtered = filtered.filter(i => i.status === searchForm.status)
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

// ================== 审核操作 ==================

const handleReview = (row: any) => {
  currentRow.value = row
  reviewForm.result = ''
  reviewForm.remark = ''
  dialogVisible.value = true
}

const handleAiReview = (row: any) => {
  ElMessageBox.confirm(
    `是否让大模型自动审核该举报？\n\n举报原因：${row.reason}\n原因描述：${row.description || '无'}`,
    'AI 自动审核',
    {
      confirmButtonText: '确认，开始审核',
      cancelButtonText: '取消',
      type: 'info',
      dangerouslyUseHTMLString: false
    }
  ).then(async () => {
    const loadingMsg = ElMessage({ message: 'AI 审核中，请稍候...', type: 'info', duration: 0 })
    try {
      // TODO: 替换为实际大模型审核接口调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      const target = allData.value.find(i => i.id === row.id)
      if (target) target.status = '已处理'
      loadingMsg.close()
      ElMessage.success('AI 审核完成，举报已处理')
      applyFilter()
    } catch {
      loadingMsg.close()
      ElMessage.error('AI 审核失败，请稍后重试')
    }
  }).catch(() => {})
}

const handleSubmitReview = async () => {
  await reviewFormRef.value?.validate()
  submitLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const target = allData.value.find(i => i.id === currentRow.value.id)
    if (target) target.status = '已处理'
    ElMessage.success('审核处理完成')
    dialogVisible.value = false
    applyFilter()
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.report-review-container {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.review-desc {
  font-size: 13px;
}

:deep(.el-tag) { border-radius: 4px; }
:deep(.el-descriptions__label) { white-space: nowrap; }
</style>
