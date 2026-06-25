import client from '../client'
import type { PageResult, PageParams } from '@/types/api'
import type { SpProcessUnit, SpProcessUnitDTO } from '@/types/process-unit'
import type { SpTeam } from '@/types/team'

export function page(params: PageParams & { name?: string; code?: string }) {
  return client.post('/basedata/processUnit/page', params) as Promise<PageResult<SpProcessUnitDTO>>
}

export function getById(id: string) {
  return client.get(`/basedata/processUnit/${id}`) as Promise<SpProcessUnit>
}

export function addOrUpdate(record: Partial<SpProcessUnit>) {
  return client.post('/basedata/processUnit/add-or-update', record, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function deleteById(id: string) {
  return client.post('/basedata/processUnit/delete', { id }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getTeams(unitId: string) {
  return client.get(`/basedata/processUnit/teams/${unitId}`) as Promise<SpTeam[]>
}

export function addTeam(unitId: string, teamId: string, remark?: string) {
  return client.post('/basedata/processUnit/teams/add', { unitId, teamId, remark }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function removeTeam(unitId: string, teamId: string) {
  return client.post('/basedata/processUnit/teams/remove', { unitId, teamId }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getAllTeams() {
  return client.post('/admin/sys/team/page', { current: 1, size: 999 }) as Promise<PageResult<SpTeam>>
}

export function getAvailableTeams() {
  return client.get('/basedata/processUnit/teams/available') as Promise<SpTeam[]>
}
