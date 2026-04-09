import request from '@/utils/request'

export function likeCollection(req) {
  return request({
    url: '/article-like-collection/' + req.userId + '/' + req.id + '/' + req.type,
    method: 'post',
  })
}

export function commentLike(commentId, userId) {
    return request({
      url: '/comment-like/' + commentId + '/' + userId,
      method: 'post',
    })
}

export function commentDislike(commentId, userId) {
    return request({
      url: '/comment-like/' + commentId + '/' + userId,
      method: 'delete',
    })
}