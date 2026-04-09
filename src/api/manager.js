import request from '@/utils/request'

// 分页查询管理员列表
export function getManagerList(params) {
  return request({
    url: '/manager/list',
    method: 'get',
    params
  })
}

// 根据ID获取管理员详细信息
export function getManagerById(id) {
  return request({
    url: '/manager/' + id,
    method: 'get'
  })
}

// 新增管理员
export function addManager(data) {
  return request({
    url: '/manager',
    method: 'post',
    data
  })
}

// 修改管理员信息
export function updateManager(data) {
  return request({
    url: '/manager',
    method: 'put',
    data
  })
}

// 删除管理员
export function deleteManager(id) {
  return request({
    url: '/manager/' + id,
    method: 'delete'
  })
}