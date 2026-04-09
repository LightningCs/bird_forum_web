# 举报原因 API 集成文档

## 功能概述

将举报原因从静态数据改为从后端 API 动态获取，实现了举报原因的集中管理和动态更新。

## 实现的更改

### 1. 更新 API 方法 (src/api/report.js)

```javascript
export function getReportReasonList(params) {
  return request({
    url: '/reportReason/list',
    method: 'get',
    params
  })
}
```

**API 请求参数**:
- `context`: string - 内容关键字（可选）
- `status`: string - 举报原因状态（"启用"或"禁用"）
- `pageNo`: number - 当前页码
- `pageSize`: number - 每页数量

### 2. 更新 Paper.vue (src/views/Paper.vue)

在文章详情页面添加了获取举报原因的逻辑：

```javascript
// 获取举报原因列表
const fetchReportReasons = async () => {
  try {
    const data = await getReportReasonList({
      context: '',
      status: '启用',
      pageNo: 1,
      pageSize: 100
    })
    reportReasons.value = data || []
  } catch (error) {
    console.error('获取举报原因失败:', error)
    ElMessage.error('获取举报原因失败')
  }
}

// 在 onMounted 中调用
onMounted(async () => {
  // ... 其他初始化代码
  await fetchReportReasons()
})
```

**应用场景**:
- 举报文章
- 举报评论（根评论和子回复）

### 3. 更新 User.vue (src/views/User.vue)

在用户主页添加了获取举报原因的逻辑：

```javascript
// 获取举报原因列表
const fetchReportReasons = async () => {
  try {
    const data = await getReportReasonList({
      context: '',
      status: '启用',
      pageNo: 1,
      pageSize: 100
    })
    reportReasons.value = data || []
  } catch (error) {
    console.error('获取举报原因失败:', error)
    ElMessage.error('获取举报原因失败')
  }
}

// 在 onMounted 中调用
onMounted(async () => {
  const targetUserId = route.params.id
  if (targetUserId) {
    // ... 其他初始化代码
    await fetchReportReasons()
  }
})
```

**应用场景**:
- 举报用户

## API 请求示例

### 请求
```
GET /api/reportReason/list
Query Parameters:
- context: ""
- status: "启用"
- pageNo: 1
- pageSize: 100
```

### 响应格式

后端直接返回数组：

```javascript
[
  {
    "id": 1,
    "content": "违法违规内容",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  },
  {
    "id": 2,
    "content": "色情低俗",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  },
  {
    "id": 3,
    "content": "政治敏感",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  },
  {
    "id": 4,
    "content": "人身攻击",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  },
  {
    "id": 5,
    "content": "虚假信息",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  },
  {
    "id": 6,
    "content": "垃圾广告",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  },
  {
    "id": 7,
    "content": "侵犯版权",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  },
  {
    "id": 8,
    "content": "欺诈骗钱",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  },
  {
    "id": 9,
    "content": "不良引导",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  },
  {
    "id": 10,
    "content": "其他",
    "status": "启用",
    "create_time": "2026-04-05 09:00:00",
    "update_time": null
  }
]
```

**字段说明**：
- `id`: 举报原因ID
- `content`: 举报原因内容
- `status`: 状态（"启用"或"禁用"）
- `create_time`: 创建时间
- `update_time`: 更新时间

## 错误处理

如果 API 请求失败：
1. 在控制台输出错误信息
2. 显示错误提示消息："获取举报原因失败"
3. 使用静态数据作为备用方案（确保功能仍然可用）

## 优势

1. **动态管理**: 举报原因由后端统一管理，无需修改前端代码
2. **状态控制**: 可以启用/禁用特定的举报原因
3. **灵活扩展**: 可以随时添加新的举报原因
4. **数据一致性**: 所有页面使用同一套举报原因数据
5. **容错机制**: API 失败时有备用方案

## 使用场景

### 在 Paper.vue 中
- 点击"举报文章"按钮时显示举报原因下拉框
- 在评论列表中点击"举报"按钮时显示举报原因下拉框

### 在 User.vue 中
- 点击"举报用户"按钮时显示举报原因下拉框

## 注意事项

1. **状态过滤**: 默认只获取状态为"启用"的举报原因
2. **分页参数**: 设置较大的 pageSize 以获取所有启用的举报原因
3. **数据格式**: 后端直接返回数组格式，不是嵌套在 data.list 中
4. **字段命名**: 使用下划线命名（如 `create_time`、`update_time`）
5. **错误提示**: API 失败时不会阻塞页面其他功能

## 后续优化建议

1. 可以添加举报原因的缓存机制，减少重复请求
2. 可以添加举报原因的分类功能
3. 可以添加举报原因的搜索/筛选功能
4. 可以添加举报原因的排序功能（按使用频率、创建时间等）