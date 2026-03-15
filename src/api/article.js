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

export function getArticleById(id) {
  return request({
    url: '/article?id=' + id,
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