import request from '@/utils/request'
export function getCommentList(req) {
  return request({
    url: '/comment',
    method: 'get',
    params: req
  })
}

export function addComment(data) {
  return request({
    url: '/comment/add',
    method: 'post',
    data
  })
}