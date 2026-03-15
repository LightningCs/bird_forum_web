import request from '@/utils/request'
export function getCategoryList(req) {
  return request({
    url: '/category/list',
    method: 'get',
    params: req
  })
}