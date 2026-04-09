import request from '@/utils/request'

export function loginApi(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 分页查询用户列表
export function getUserList(params) {
  return request({
    url: '/user',
    method: 'get',
    params
  })
}

// 根据ID获取用户详细信息
export function getUserById(id) {
  return request({
    url: '/user/' + id,
    method: 'get'
  })
}

// 修改用户状态
export function updateUserStatus(code) {
  return request({
    url: '/user/status/' + code,
    method: 'put'
  })
}

// 批量删除用户
export function batchDeleteUsers(ids) {
  return request({
    url: '/user/batch',
    method: 'delete',
    data: ids
  })
}

export function getFriendList(id, isFans) {
  return request({
    url: '/follow?userId=' + id + '&isFans=' + isFans,
    method: 'get'
  })
}
