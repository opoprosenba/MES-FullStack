import client from './client'

export interface SpPartsCategory {
  id: number
  categoryName: string
  parentId: number
  sort: number
  remark?: string
}

export interface SpParts {
  id?: string
  partCode: string
  partName: string
  spec?: string
  unit?: string
  categoryId?: number
  partsType?: number
  drawingNo?: string
  version?: string
  batchFlag?: number
  safeStock?: number
  remark?: string
  status: string
  isDeleted?: string
  createTime?: string
  updateTime?: string
}

export function getPartsPage(params: { partCode?: string; partName?: string; status?: string; categoryId?: number; partsType?: number; current?: number; size?: number }) {
  return client.post('/basedata/parts/page', params, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function getPartsById(id: string) {
  return client.get('/basedata/parts/get-by-id', { params: { id } })
}

export function saveParts(data: Record<string, unknown>) {
  return client.post('/basedata/parts/add-or-update', data, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function deleteParts(id: string) {
  return client.post('/basedata/parts/delete', { id }, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function switchPartsStatus(id: string, status: string) {
  return client.post('/basedata/parts/switch-status', { id, status }, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function getPartsSelect() {
  return client.get('/basedata/parts/list-select')
}

export function getPartsCategoryTree() {
  return client.get('/basedata/parts/category/tree')
}
