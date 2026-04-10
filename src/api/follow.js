import request from '@/utils/request'

export function follow(userId, targetId) {
    return request({
        url: '/follow/' + userId + '/' + targetId,
        method: 'post',
    })
}

export function unfollow(userId, targetId) {
    return request({
        url: '/follow/' + userId + '/' + targetId,
        method: 'delete',
    })
}