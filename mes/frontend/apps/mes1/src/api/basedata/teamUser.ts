import client from '../client'
import type { PageResult, PageParams } from '@/types/api'

export interface SpTeamUser {
  id?: string
  teamId?: string
  userId?: string
  teamName?: string
  teamCode?: string
  userName?: string
  username?: string
  createTime?: string
  createUsername?: string
  updateTime?: string
  updateUsername?: string
}

export function page(params: PageParams & { teamId?: string }) {
  return client.post('/admin/basedata/teamUser/page', params) as Promise<PageResult<SpTeamUser>>
}

export function getById(id: string) {
  return client.get('/admin/basedata/teamUser/get-by-id', { params: { id } })
}

export function addOrUpdate(record: SpTeamUser) {
  return client.post('/admin/basedata/teamUser/add-or-update', record, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function deleteById(id: string) {
  return client.post('/admin/basedata/teamUser/delete', { id }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function batchDelete(ids: string[]) {
  return client.post('/admin/basedata/teamUser/batch-delete', { ids }, {
    headers: { 'Content-Type': 'application/json' },
  })
}
