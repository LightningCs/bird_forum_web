import request from '@/utils/request'

export function getChatMessages(sourceId, targetId) {
    return request({
        url: '/message/list',
        method: 'get',
        params: {
            sourceId,
            targetId
        }
    })
}

export function saveMessage(data) {
    return request({
        url: '/message',
        method: 'post',
        data
    })
}