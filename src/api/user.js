import request from '@/utils/request'

export function getUserById(id) {
  return request({
    url: '/user/' + id,
    method: 'get'
  })
}

export function getFriendList(id, isFans) {
  return request({
    url: '/follow?id=' + id + '&isFans=' + isFans,
    method: 'get'
  })
}