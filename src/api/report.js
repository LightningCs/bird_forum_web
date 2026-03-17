import request from '@/utils/request'

export function submitReport(data) {
  return request({
    url: '/report/add',
    method: 'post',
    data
  })
}

export function getReportReasonList() {
  return request({
    url: '/reportReason/list',
    method: 'get'
  })
}
