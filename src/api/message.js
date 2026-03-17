import request from '@/utils/request'

export function getChatMessages(req) {
    return request({
        url: '/message/list',
        method: 'get',
        params: req
    })
}

export function saveMessage(data) {
    return request({
        url: '/message',
        method: 'post',
        data
    })
}