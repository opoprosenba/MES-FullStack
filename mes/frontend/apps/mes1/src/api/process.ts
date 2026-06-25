import client from '@/api/client'

export interface SpProcess {
  id?: number
  processCode?: string
  processName: string
  workUnitId: number
  workUnitName?: string
  workHour: number
  manufactureCycle: number
  isGeneratePlan: string
  remark?: string
  status: string
  isDeleted?: number
  createTime?: string
  updateTime?: string
  createUsername?: string
  updateUsername?: string
}

export interface SpProcessReq {
  current?: number
  size?: number
  processCode?: string
  processName?: string
  workUnitId?: number
  status?: string
}

export interface SpProcessUnit {
  id: string
  code: string
  name: string
  status: string
}

export function getProcessPage(params: SpProcessReq) {
  return client.get('/basedata/process/page', { params })
}

export function getProcessById(id: number | string) {
  return client.get('/basedata/process/get-by-id', { params: { id } })
}

export function addProcess(data: Partial<SpProcess>) {
  return client.post('/basedata/process/add', data)
}

export function updateProcess(data: Partial<SpProcess>) {
  return client.post('/basedata/process/update', data)
}

export function deleteProcess(id: number | string) {
  return client.post('/basedata/process/delete', { id })
}

export function getWorkUnitSelect() {
  return client.get('/basedata/process/work-unit-select')
}

export function getProcessSelect() {
  return client.get('/basedata/process/process-select')
}
