import request from '@/utils/request'

export function addHistory(data) {
  return request({
    url: '/history',
    method: 'post',
    data
  })
}

export function getHistory(params) {
  return request({
    url: '/history',
    method: 'get',
    params
  })
}

export function deleteHistory(data) {
  return request({
    url: '/history',
    method: 'delete',
    data
  })
}