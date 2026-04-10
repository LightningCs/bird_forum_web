import request from '@/utils/request'

export function submitReport(data) {
  return request({
    url: '/report',
    method: 'post',
    data
  })
}

// 分页查询举报列表
export function getReportList(params) {
  return request({
    url: '/report/list',
    method: 'get',
    params
  })
}

// 根据ID查询举报详情
export function getReportById(id) {
  return request({
    url: '/report?id=' + id,
    method: 'get'
  })
}

// 人工审核举报
export function manualReviewReport(id, yes) {
  return request({
    url: '/report/' + id + '?yes=' + yes,
    method: 'post'
  })
}

// AI审核举报
export function aiReviewReport(id) {
  return request({
    url: '/report/ai/' + id,
    method: 'post'
  })
}

// ================== 举报原因相关 ==================

// 分页查询举报原因列表
export function getReportReasonList(params) {
  return request({
    url: '/report-reason/list',
    method: 'get',
    params
  })
}

// 更新举报原因
export function updateReportReason(data) {
  return request({
    url: '/report-reason',
    method: 'put',
    data
  })
}

// 批量删除举报原因
export function batchDeleteReportReasons(ids) {
  return request({
    url: '/report-reason/batch',
    method: 'delete',
    data: ids
  })
}

// 根据ID删除举报原因
export function deleteReportReason(id) {
  return request({
    url: '/report-reason/' + id,
    method: 'delete'
  })
}
