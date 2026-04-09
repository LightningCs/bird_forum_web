import request from '@/utils/request'

export function likeCollection(req) {
  return request({
    url: '/article-like-collection/' + req.userId + '/' + req.id + '/' + req.type,
    method: 'post',
  })
}

export function commentLike(id) {
    return request({
      url: '/comment-like/' + id,
      method: 'post',
    })
}

export function commentDislike(id) {
    return request({
      url: '/comment-like/' + id,
      method: 'delete',
    })
}