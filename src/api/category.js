import request from '@/utils/request'

// 分页查询分类列表
export function getCategoryList(req) {
  return request({
    url: '/category/list',
    method: 'get',
    params: req
  })
}

// 更新分类
export function updateCategory(data) {
  return request({
    url: '/category',
    method: 'put',
    data: data
  })
}

// 批量删除分类
export function batchDeleteCategories(ids) {
  return request({
    url: '/category/delete/batch',
    method: 'delete',
    data: ids
  })
}

// 根据ID删除分类
export function deleteCategory(id) {
  return request({
    url: '/category/' + id,
    method: 'delete'
  })
}
