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

// 批量隐藏评论
export function batchHideComments(ids) {
  return request({
    url: '/comment/hidden/batch',
    method: 'put',
    data: ids
  })
}

// 批量隐藏评论
export function hideComments(id, status) {
  return request({
    url: '/comment/hidden',
    method: 'put',
    params: {
      id: id,
      status: status
    }
  })
}

// 更改评论违规状态
export function updateCommentIllegal(commentId, isIllegal) {
  return request({
    url: '/comment/illegal',
    method: 'put',
    params: {
      commentId: commentId,
      isIllegal: isIllegal
    }
  })
}

// 批量删除评论
export function batchDeleteComments(ids) {
  return request({
    url: '/comment/delete/batch',
    method: 'delete',
    data: ids
  })
}

// 根据ID删除评论
export function deleteComment(id) {
  return request({
    url: '/comment/' + id,
    method: 'delete'
  })
}
