export interface ManagerVO {
  id: number
  name: string
  account: string
  identity: number
  status: string
  createTime: string
}

export interface ManagerListResponse {
  code: number
  message?: string
  data?: {
    records: ManagerVO[]
    total: number
  }
}

export interface ManagerDetailResponse {
  code: number
  message?: string
  data: ManagerVO
}

export interface CommonResponse {
  code: number
  message?: string
  data?: unknown
}
