import client from './client'

export interface SpProductBom {
  id?: string
  productMaterialId: string
  productMaterialCode: string
  productMaterialName: string
  version: number
  remark?: string
  validity: string
  isLocked: number
  isDeleted?: number
  createTime?: string
  updateTime?: string
}

export interface SpProductBomNode {
  id?: string | number
  bomId: string | number
  parentId: string | number
  nodeType: string
  nodeCode: string
  nodeName: string
  quantity: number
  level: number
  sort?: number
  processId?: string | number
  isDeleted?: number
  createTime?: string
  updateTime?: string
}

export function getProductBomPage(params: { productMaterialCode?: string; productMaterialName?: string; version?: number; isLocked?: number; current?: number; size?: number }) {
  return client.post('/basedata/product-bom-management/page', params, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function getProductBomById(id: string | number) {
  return client.get('/basedata/product-bom-management/get-by-id', { params: { id } })
}

export function addProductBom(data: Record<string, unknown>) {
  return client.post('/basedata/product-bom-management/add', data, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function updateProductBom(data: Record<string, unknown>) {
  return client.post('/basedata/product-bom-management/update', data, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function deleteProductBom(id: string | number) {
  return client.post('/basedata/product-bom-management/delete', { id }, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function lockProductBom(id: string | number) {
  return client.post('/basedata/product-bom-management/lock', { id }, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function upgradeProductBom(id: string | number) {
  return client.post('/basedata/product-bom-management/upgrade', { id }, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function getProductBomNodes(bomId: string | number) {
  return client.get('/basedata/product-bom-management/nodes', { params: { bomId } })
}

export function addProductBomNode(data: Record<string, unknown>) {
  return client.post('/basedata/product-bom-management/node/add', data, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function updateProductBomNode(data: Record<string, unknown>) {
  return client.post('/basedata/product-bom-management/node/update', data, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function deleteProductBomNode(id: string | number) {
  return client.post('/basedata/product-bom-management/node/delete', { id }, {
    headers: { 'Content-Type': 'application/json;charset=utf-8' }
  })
}

export function getProductMaterialSelect() {
  return client.get('/basedata/product-bom-management/material-select')
}

export function getMaxBomVersion(productMaterialId: string) {
  return client.get('/basedata/product-bom-management/max-version', { params: { productMaterialId } })
}
