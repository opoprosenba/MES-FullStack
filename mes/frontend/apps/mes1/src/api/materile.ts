import client from './client'

export interface SpMaterile {
  id?: string
  materiel: string
  materielDesc: string
  unit?: string
  matType?: string
  isDeleted?: string
}

export function getMaterileSelect() {
  return client.get('/basedata/product-bom-management/material-select')
}
