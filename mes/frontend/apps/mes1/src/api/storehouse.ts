import client from './client'

export interface SpStorehouse {
  id?: string
  storeCode: string
  storeName: string
  storeType: string
  descInfo?: string
  groupNum: number
  rowNum: number
  layerNum: number
  colNum: number
  status: string
  isDeleted?: string
  createTime?: string
  updateTime?: string
}

export interface SpLocation {
  id?: string
  locCode: string
  storeId: string
  storeCode: string
  groupNo: number
  rowNo: number
  layerNo: number
  colNo: number
  status: string
  isDeleted?: string
  createTime?: string
  updateTime?: string
}

export function getStorehousePage(params: { storeCode?: string; storeName?: string; storeType?: string; status?: string; current?: number; size?: number }) {
  return client.post('/basedata/storehouse/page', params, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function getStorehouseById(id: string) {
  return client.get('/basedata/storehouse/get-by-id', { params: { id } })
}

export function saveStorehouse(data: Record<string, unknown>) {
  return client.post('/basedata/storehouse/add-or-update', data, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function deleteStorehouse(id: string) {
  return client.post('/basedata/storehouse/delete', { id }, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function getStorehouseSelect() {
  return client.get('/basedata/storehouse/list-select')
}

export function getLocationPage(params: { storeId?: number; locCode?: string; storeCode?: string; status?: string; current?: number; size?: number }) {
  return client.post('/basedata/location/page', params, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function getLocationById(id: string) {
  return client.get('/basedata/location/get-by-id', { params: { id } })
}

export function saveLocation(data: Record<string, unknown>) {
  return client.post('/basedata/location/add-or-update', data, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function deleteLocation(id: string) {
  return client.delete(`/basedata/location/delete/${id}`)
}