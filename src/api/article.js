import request from '@/utils/request'

export function getArticleList(req) {
  return request({
    url: '/article/list',
    method: 'get',
    params: req
  })
}

export function getHotArticleList() {
  return request({
    url: '/article/hot/list',
    method: 'get'
  })
}

export function saveArticle(data) {
  return request({
    url: '/article',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getArticleById(userId, id) {
  return request({
    url: '/article?userId=' + userId + '&id=' + id,
    method: 'get'
  })
}

export function getUserPublishArticleList(id) {
  return request({
    url: '/article/publisher/' + id,
    method: 'get'
  })
}

export function getUserCollectArticleList(id) {
  return request({
    url: '/article/collected/' + id,
    method: 'get'
  })
}

export function addArticleView(articleId) {
  return request({
    url: '/article/view/' + articleId,
    method: 'post'
  })
}

// 批量隐藏文章
export function batchHideArticles(ids) {
  return request({
    url: '/article/hidden/batch',
    method: 'put',
    data: ids
  })
}

//更改文章违规状态
export function updateArticleIllegal(articleId, isIllegal) {
  return request({
    url: '/article/illegal',
    method: 'put',
    params: {
      articleId: articleId,
      isIllegal: isIllegal
    }
  })
}

// 批量删除文章
export function batchDeleteArticles(ids) {
  return request({
    url: '/article/delete/batch',
    method: 'delete',
    data: ids
  })
}

// 更改文章状态
export function updateArticleStatus(data) {
  return request({
    url: '/article/hidden',
    method: 'put',
    data: data
  })
}
