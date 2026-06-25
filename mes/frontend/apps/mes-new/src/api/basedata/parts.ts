// apps/mes-new/src/api/basedata/parts.ts
import { http } from '@/http/client'
import type { PageParams, PageResult } from '@/types/api'
import type { SpParts, SpPartsCategory } from '@/types/basedata'

const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } }

export interface PartsPageParams extends PageParams {
  partCode?: string
  partName?: string
  status?: string
  categoryId?: number
  partsType?: number
}

export function partsPage(params: PartsPageParams) {
  return http.post<PageResult<SpParts>>('/basedata/parts/page', params)
}

export function partsGetById(id: string) {
  return http.get<SpParts>(`/basedata/parts/get-by-id?id=${id}`)
}

export function partsAddOrUpdate(record: Partial<SpParts>) {
  return http.post<string>('/basedata/parts/add-or-update', record, JSON_HEADERS)
}

export function partsDelete(id: string) {
  return http.post<void>('/basedata/parts/delete', { id }, JSON_HEADERS)
}

export function partsSwitchStatus(id: string, status: string) {
  return http.post<void>('/basedata/parts/switch-status', { id, status }, JSON_HEADERS)
}

export function partsListSelect() {
  return http.get<SpParts[]>('/basedata/parts/list-select')
}

// 分类
export function partsCategoryTree() {
  return http.get<SpPartsCategory[]>('/basedata/parts/category/tree')
}

export function partsCategoryAdd(record: Partial<SpPartsCategory>) {
  return http.post<number>('/basedata/parts/category/add', record, JSON_HEADERS)
}

export function partsCategoryUpdate(record: SpPartsCategory) {
  return http.post<void>('/basedata/parts/category/update', record, JSON_HEADERS)
}

export function partsCategoryDelete(id: number) {
  return http.post<void>('/basedata/parts/category/delete', { id }, JSON_HEADERS)
}
