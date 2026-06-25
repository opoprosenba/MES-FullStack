import client from '../client'
import type { PageResult, PageParams } from '@/types/api'

export interface SpEquipmentGroup {
  id?: string
  code?: string
  name?: string
  descr?: string
  remark?: string
  status?: string
  createTime?: string
  createUsername?: string
}

export interface GroupEquipment {
  id: string
  groupId: string
  equipmentId: string
  equipmentCode?: string
  equipmentName?: string
  equipmentStatus?: string
  equipmentDescr?: string
  remark?: string
  status?: string
  createTime?: string
  createUsername?: string
}

export function page(params: PageParams & { code?: string; name?: string }) {
  return client.post('/basedata/equipmentGroup/page', params) as Promise<PageResult<SpEquipmentGroup>>
}

export function getById(id: string) {
  return client.get(`/basedata/equipmentGroup/${id}`) as Promise<SpEquipmentGroup>
}

export function addOrUpdate(record: SpEquipmentGroup) {
  return client.post('/basedata/equipmentGroup/add-or-update', record, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function deleteById(id: string) {
  return client.post('/basedata/equipmentGroup/delete', { id }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function batchDelete(ids: string[]) {
  return client.post('/basedata/equipmentGroup/batch-delete', { ids }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function updateStatus(id: string, status: string) {
  return client.post('/basedata/equipmentGroup/update-status', { id, status }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getEquipmentList(groupId: string) {
  return client.get(`/basedata/equipmentGroup/equipment/list/${groupId}`) as Promise<GroupEquipment[]>
}

export function getAvailableEquipments() {
  return client.get('/basedata/equipmentGroup/equipment/available') as Promise<any[]>
}

export function addEquipment(groupId: string, equipmentIds: string[], remark?: string) {
  return client.post('/basedata/equipmentGroup/equipment/add', { groupId, equipmentIds, remark }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function removeEquipment(id: string) {
  return client.post('/basedata/equipmentGroup/equipment/remove', { id }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function updateEquipmentRemark(id: string, remark: string) {
  return client.post('/basedata/equipmentGroup/equipment/update-remark', { id, remark }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function updateEquipmentStatus(id: string, status: string) {
  return client.post('/basedata/equipmentGroup/equipment/update-status', { id, status }, {
    headers: { 'Content-Type': 'application/json' },
  })
}
