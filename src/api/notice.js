import request from '@/utils/request'

// 分页查询通知列表
export function getNoticeList(params) {
  return request({
    url: '/notice/list',
    method: 'get',
    params
  })
}

// 发布通知
export function addNotice(data) {
  return request({
    url: '/notice',
    method: 'post',
    data
  })
}

// 撤回通知
export function revokeNotice(id) {
  return request({
    url: '/notice/' + id,
    method: 'post'
  })
}

// 删除通知
export function deleteNotice(id) {
  return request({
    url: '/notice/' + id,
    method: 'delete'
  })
}

export function getNoticePage(params) {
    return request({
        url: '/notice/page',
        method: 'get',
        params
    })
}

export function addNoticeRead(data) {
    return request({
        url: '/notice/read',
        method: 'post',
        data
    })
}