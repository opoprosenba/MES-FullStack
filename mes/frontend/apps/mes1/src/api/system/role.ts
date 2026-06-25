import client from '../client'
import type { PageResult, PageParams } from '@/types/api'
import type { SysRole } from '@/types/user'

export function page(params: PageParams & { name?: string; code?: string }) {
  const query: Record<string, unknown> = {
    ...params,
  }
  if (params.name) {
    query.nameLike = params.name
    delete query.name
  }
  if (params.code) {
    query.codeLike = params.code
    delete query.code
  }
  return client.post('/admin/sys/role/page', query) as Promise<PageResult<SysRole>>
}

export function getById(id: string) {
  return client.get('/admin/sys/role/get-by-id', { params: { id } })
}

export function addOrUpdate(record: Partial<SysRole> & { sysMenuIds?: string[] }) {
  return client.post('/admin/sys/role/add-or-update', record)
}

export function deleteById(id: string) {
  return client.post('/admin/sys/role/delete', { id })
}

export function getRoleMenuTree(roleId: string) {
  return client.get(`/admin/sys/role/tree/${roleId}`) as Promise<string[]>
}
