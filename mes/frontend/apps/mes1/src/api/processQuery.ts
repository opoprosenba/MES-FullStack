import client from '@/api/client'

export interface ProcessQueryTree {
  bomInfo?: {
    id?: string
    productMaterialCode?: string
    productMaterialName?: string
    version?: number
    validity?: string
    isLocked?: number
  }
  bomList?: Array<any>
  tree?: Array<TreeNode>
}

export interface TreeNode {
  key: string
  title: string
  nodeType?: string
  nodeCode?: string
  nodeName?: string
  quantity?: number
  level?: number
  isProcessFinished?: boolean
  processId?: number
  isLocked?: boolean
  children?: Array<TreeNode>
}

export interface ProcessDetailBaseInfo {
  processCode: string
  processName: string
  workHour: number
  manufactureCycle: number
  workUnitName: string
  isGeneratePlan: string
  remark: string
  status: string
}

export interface ProcessDetail {
  baseInfo: ProcessDetailBaseInfo
  content: string
  requirement: string
  attention: string
  equipment: Array<{ index: number; name: string; spec: string }>
  document: Array<{ index: number; name: string; type: string; remark: string }>
  materialList: Array<{ index: number; name: string; qty: string; unit: string; spec: string }>
}

export function getProcessQueryTree(bomId?: string) {
  return client.get('/basedata/process-query/tree', { params: { bomId } })
}

export function getProcessDetail(processId: number | string) {
  return client.get('/basedata/process-query/detail', { params: { processId } })
}
