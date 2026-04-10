import request from '@/utils/request'

export function getStatisticsData() {
    return request({
        url: '/statistics',
        method: 'get'
    })
}