import client from '../client'
import type { PageResult, PageParams } from '@/types/api'

export interface SpMaterile {
  id?: string
  materiel: string       // 物料编码
  materielDesc: string   // 物料名称
  matType: string        // 物料类型：产品/零件
  unit: string           // 计量单位
  model: string          // 规格型号
  material: string        // 材质
  source: string         // 物料来源：自制/外购
  leadTime: number       // 需求提前期
  safetyStock: number    // 安全库存
  imageUrl: string       // 图片路径
  remark: string         // 备注
  deleted: string        // 状态
  createTime?: string
  updateTime?: string
}

export function page(params: PageParams & { 
  materielLike?: string 
  materielDescLike?: string
  matType?: string
  source?: string
  deleted?: string 
}) {
  return client.post('/basedata/materile/page', params) as Promise<PageResult<SpMaterile>>
}

export function getById(id: string) {
  return client.get(`/basedata/materile/get-by-id?id=${id}`) as Promise<SpMaterile>
}

export function addOrUpdate(record: Partial<SpMaterile>) {
  return client.post('/basedata/materile/add-or-update', record, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function deleteById(id: string) {
  return client.post('/basedata/materile/delete', { id }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return client.post('/basedata/materile/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
