<template>
  <div class="publish-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" circle @click="goBack"></el-button>
        <span class="page-title">发布文章</span>
      </div>
      <div class="header-right">
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" :loading="loading" @click="submitPaper">发布文章</el-button>
      </div>
    </header>

    <!-- 主体表单区域 -->
    <main class="main-context">
      <div class="form-wrapper">
        <el-form 
          :model="articleForm" 
          :rules="rules" 
          ref="formRef" 
          label-position="top"
        >
          <!-- 1. 标题 -->
          <el-form-item label="文章标题" prop="title">
            <el-input 
              v-model="articleForm.title" 
              placeholder="请输入清晰、准确的论文标题" 
              maxlength="50" 
              show-word-limit
              class="title-input"
            />
          </el-form-item>

          <div class="flex-row">
            <!-- 2. 分类 -->
            <el-form-item label="所属分类 (可多选)" prop="categories" style="flex: 1;">
              <el-select 
                v-model="articleForm.categories" 
                multiple 
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择文章分类（可多选）" 
                style="width: 100%;"
              >
                <el-option v-for="item in categories" :key="item.id" :value="item.id" :label="item.name"></el-option>
              </el-select>
            </el-form-item>
          </div>

          <!-- 3. 标题封面上传 -->
          <el-form-item label="文章封面" prop="image">
            <el-upload
              class="image-uploader"
              drag
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleimageChange"
            >
              <div v-if="imagePreviewUrl" class="preview-container">
                <img :src="imagePreviewUrl" class="image-preview" alt="封面预览" />
                <div class="upload-hover-mask">
                  <el-icon><Edit /></el-icon> 点击更换封面
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
          </el-form-item>

          <!-- 4. 内容编辑区 (wangEditor) -->
          <el-form-item label="文章内容（支持文本、图片、代码段）" prop="context">
            <div class="editor-container">
              <Toolbar
                style="border-bottom: 1px solid #dcdfe6"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                style="height: 500px; overflow-y: hidden;"
                v-model="articleForm.context"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
                @onChange="handleChange"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { ArrowLeft, Edit, UploadFilled } from '@element-plus/icons-vue'
import { getCategoryList, saveArticle } from '@/api/index.js'

// 引入 wangEditor 相关依赖
import '@wangeditor/editor/dist/css/style.css' // 必须引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { el } from 'element-plus/es/locales.mjs'

const router = useRouter()
const formRef = ref<FormInstance | null>(null)
const loading = ref(false)
const categories = ref([])

// 挂载时
onMounted(async () => {
    categories.value = await getCategoryList({
    'pageNo': 0,
    'pageSize': 1,
    'pageNum': 500
  })
})

// ================== wangEditor 配置区 ==================
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
// 模式：'default' 或 'simple'
const mode = 'default' 

const toolbarConfig = {} // 工具栏配置，按需修改
const editorConfig = { placeholder: '请输入正文，支持图片和代码块...' } // 编辑器配置

// 组件销毁时，及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

// 监听内容改变，触发 Element 表单验证，消除红框错误提示
const handleChange = () => {
  if (formRef.value) {
    formRef.value.validateField('context')
  }
}
// =======================================================

// 表单数据
const articleForm = ref({
  title: '',
  categories: [] as string[],
  image: null as File | null,
  context: '', // wangEditor 会自动把 HTML 代码绑定到这里
  publisherId: 1
})

// 封面预览 URL
const imagePreviewUrl = ref('')

// 自定义校验器：处理 wangEditor 空文本状态（空状态下它可能是 '<p><br></p>'）
const validatecontext = (rule: any, value: any, callback: any) => {
  if (!value || value === '<p><br></p>') {
    callback(new Error('文章内容不能为空'))
  } else {
    callback()
  }
}

// 表单校验规则
const rules = ref<FormRules>({
  title:[
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 5, max: 50, message: '标题长度在 5 到 50 个字符', trigger: 'blur' }
  ],
  categories:[
    { required: true, type: 'array', message: '请至少选择一个学科分类', trigger: 'change' } 
  ],
  context:[
    { required: true, validator: validatecontext, trigger: 'blur' }
  ]
})

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
    
    articleForm.value.image = uploadFile.raw
    imagePreviewUrl.value = URL.createObjectURL(uploadFile.raw)
  }
}

// 提交发布
const submitPaper = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (!articleForm.value.image) {
        ElMessage.warning('建议上传一张封面图片让文章更吸引人~')
      }

      loading.value = true
      
      setTimeout(() => {
        console.log('提交的完整数据：', articleForm.value)
        // 注意：articleForm.value.context 此时包含完整的 HTML 标签和正文内容
        ElMessage.success('文章发布成功！')
        const formData = new FormData()
        formData.append('title', articleForm.value.title)
        articleForm.value.categories.forEach(id => {
          formData.append('categories', id)
        })
        formData.append('imageFile', articleForm.value.image)
        formData.append('context', articleForm.value.context)
        formData.append('publisherId', articleForm.value.publisherId)
        formData.append('status', '已发布')
        saveArticle(formData)
        loading.value = false
        router.push('/') 
      }, 1500)
    } else {
      ElMessage.error('请完善必填信息')
      return false
    }
  })
}

// 保存草稿
const saveDraft = () => {
  ElMessage.success('草稿已保存')
  const formData = new FormData()
  formData.append('title', articleForm.value.title)
  articleForm.value.categories.forEach(id => {
    formData.append('categories', id)
  })
  formData.append('imageFile', articleForm.value.image)
  formData.append('context', articleForm.value.context)
  formData.append('publisherId', articleForm.value.publisherId)
  formData.append('status', '草稿')
  saveArticle(formData)
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.publish-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-right {
  display: flex;
  gap: 10px;
}

.main-context {
  max-width: 900px;
  margin: 30px auto 0;
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.title-input :deep(.el-input__wrapper) {
  padding: 8px 15px;
  font-size: 18px;
}

.flex-row {
  display: flex;
  gap: 20px;
}

.image-uploader {
  width: 100%;
}

.image-uploader :deep(.el-upload-dragger) {
  padding: 0; 
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  overflow: hidden;
  position: relative;
}

.upload-placeholder {
  padding: 40px;
  color: #909399;
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: image;
  display: block;
}

.upload-hover-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-container:hover .upload-hover-mask {
  opacity: 1;
}

/* 真正富文本编辑器的容器样式 */
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s;
  /* z-index 防止下拉菜单被其他元素遮挡 */
  z-index: 10; 
  width: 100%;
}

.editor-container:hover {
  border-color: #c0c4cc;
}

.editor-container:focus-within {
  border-color: #409eff;
}
</style>