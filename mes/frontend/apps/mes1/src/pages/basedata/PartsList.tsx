import { useState, useEffect } from 'react'
import { Form, Button, Input, Select, Tag, Popconfirm, message, InputNumber, Switch, TreeSelect } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageContainer from '@/components/PageContainer'
import { ensureArray } from '@/utils/ensureArray'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import ModalForm from '@/components/ModalForm'
import PermissionGuard from '@/components/PermissionGuard'
import { usePagination } from '@/hooks/usePagination'
import * as partsApi from '@/api/parts'
import type { SpPartsCategory } from '@/api/parts'

const statusMap: Record<string, { text: string; color: string }> = {
  '正常': { text: '正常', color: 'green' },
  '禁用': { text: '禁用', color: 'red' },
}

const PARTS_TYPE_MAP: Record<number, string> = { 1: '自制件', 2: '外购件', 3: '外协件' }

const UNIT_OPTS = ['个','件','千克','克','米','厘米','毫米','升','套','箱','卷','张']

/** 将扁平的分类列表转为 TreeSelect 树形数据 */
function buildCategoryTree(list: SpPartsCategory[]): any[] {
  const map = new Map<number, any>()
  const roots: any[] = []
  list.forEach(c => map.set(c.id, { title: c.categoryName, value: c.id, key: c.id, children: [] }))
  list.forEach(c => {
    const node = map.get(c.id)!
    if (c.parentId && c.parentId !== 0 && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  // 递归清理空 children
  const clean = (nodes: any[]) => nodes.forEach(n => { if (!n.children.length) delete n.children; else clean(n.children) })
  clean(roots)
  return roots
}

export default function PartsList() {
  const queryClient = useQueryClient()
  const { pagination, onChange, reset } = usePagination()
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formInstance] = Form.useForm()
  const [categories, setCategories] = useState<SpPartsCategory[]>([])

  // 加载分类数据
  useEffect(() => {
    partsApi.getPartsCategoryTree().then((res: any) => {
      const list = (res?.data || res?.records || res || []) as SpPartsCategory[]
      if (Array.isArray(list)) setCategories(list)
    }).catch(() => {})
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['parts', pagination, filters],
    queryFn: () =>
      partsApi.getPartsPage({
        current: pagination.current,
        size: pagination.pageSize,
        ...filters,
      }),
  })

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => partsApi.saveParts(values),
    onSuccess: () => {
      message.success('操作成功')
      setModalOpen(false)
      setEditId(null)
      formInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['parts'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '操作失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partsApi.deleteParts(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['parts'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '删除失败')
    },
  })

  const switchMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => partsApi.switchPartsStatus(id, status),
    onSuccess: () => {
      message.success('状态已更新')
      queryClient.invalidateQueries({ queryKey: ['parts'] })
    },
  })

  const handleSearch = (values: Record<string, unknown>) => {
    const mappedFilters: Record<string, unknown> = {}
    if (values.partCode) mappedFilters.partCode = values.partCode
    if (values.partName) mappedFilters.partName = values.partName
    if (values.status) mappedFilters.status = values.status
    setFilters(mappedFilters)
    reset()
  }

  const handleReset = () => {
    setFilters({})
    reset()
  }

  const handleAdd = () => {
    setEditId(null)
    formInstance.resetFields()
    formInstance.setFieldsValue({ status: '正常', partsType: 1, version: 'V1.0', batchFlag: false, safeStock: 0 })
    setModalOpen(true)
  }

  const handleEdit = async (record: partsApi.SpParts) => {
    try {
      setEditId(record.id || null)
      const res: any = await partsApi.getPartsById(record.id || '')
      const detail = res?.data || res
      formInstance.setFieldsValue({
        ...detail,
        batchFlag: detail.batchFlag === 1,
      })
      setModalOpen(true)
    } catch {
      message.error('获取零部件详情失败')
    }
  }

  const handleDelete = (record: partsApi.SpParts) => {
    deleteMutation.mutate(record.id || '')
  }

  const handleFormFinish = (values: Record<string, any>) => {
    saveMutation.mutate({
      ...values,
      id: editId || undefined,
      batchFlag: values.batchFlag ? 1 : 0,
    })
  }

  const columns = [
    { title: '序号', key: 'index', width: 50, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '零部件编号', dataIndex: 'partCode', key: 'partCode', width: 130 },
    { title: '零部件名称', dataIndex: 'partName', key: 'partName', width: 130 },
    { title: '规格型号', dataIndex: 'spec', key: 'spec', width: 100, render: (v: string) => v || '—' },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60, render: (v: string) => v || '—' },
    {
      title: '物料分类', dataIndex: 'categoryId', key: 'categoryId', width: 100,
      render: (v: number) => {
        const cat = categories.find(c => c.id === v)
        return cat?.categoryName || '—'
      },
    },
    {
      title: '物料类型', dataIndex: 'partsType', key: 'partsType', width: 80,
      render: (v: number) => PARTS_TYPE_MAP[v] || '—',
    },
    { title: '版本号', dataIndex: 'version', key: 'version', width: 70 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 70,
      render: (status: string) => {
        const config = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 160 },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: unknown, record: partsApi.SpParts) => (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <PermissionGuard perm="basedata:parts:edit">
            <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          </PermissionGuard>
          <PermissionGuard perm="basedata:parts:delete">
            <Popconfirm title="确定删除该零部件吗？" onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          </PermissionGuard>
          <Switch
            size="small"
            checked={record.status === '正常'}
            onChange={() => switchMutation.mutate({ id: record.id!, status: record.status === '正常' ? '禁用' : '正常' })}
          />
        </div>
      ),
    },
  ]

  return (
    <PageContainer title="零部件定义">
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <Form.Item name="partCode" label="零部件编号">
          <Input placeholder="请输入零部件编号" allowClear style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="partName" label="零部件名称">
          <Input placeholder="请输入零部件名称" allowClear style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择状态" allowClear style={{ width: 100 }}>
            <Select.Option value="">全部</Select.Option>
            <Select.Option value="正常">正常</Select.Option>
            <Select.Option value="禁用">禁用</Select.Option>
          </Select>
        </Form.Item>
      </SearchForm>

      <div style={{ marginBottom: 16 }}>
        <PermissionGuard perm="basedata:parts:add">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
        </PermissionGuard>
      </div>

      <PageTable
        rowKey="id"
        columns={columns}
        dataSource={ensureArray(data?.records)}
        loading={isLoading}
        total={data?.total || 0}
        pagination={{ current: pagination.current, pageSize: pagination.pageSize }}
        onChange={onChange}
        scroll={{ x: 1200 }}
      />

      <ModalForm
        open={modalOpen}
        title={editId ? '编辑零部件' : '新增零部件'}
        onCancel={() => { setModalOpen(false); setEditId(null) }}
        onFinish={handleFormFinish}
        formInstance={formInstance}
        width={650}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          {editId && (
            <Form.Item name="partCode" label="零部件编号">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item name="partName" label="零部件名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="如 Φ10×100" />
          </Form.Item>
          <Form.Item name="unit" label="计量单位">
            <Select placeholder="请选择" allowClear>
              {UNIT_OPTS.map(u => <Select.Option key={u} value={u}>{u}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="categoryId" label="物料分类">
            <TreeSelect
              placeholder="请选择分类"
              allowClear
              treeDefaultExpandAll
              treeData={buildCategoryTree(categories)}
            />
          </Form.Item>
          <Form.Item name="partsType" label="物料类型">
            <Select>
              <Select.Option value={1}>自制件</Select.Option>
              <Select.Option value={2}>外购件</Select.Option>
              <Select.Option value={3}>外协件</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="drawingNo" label="零件图号">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item name="version" label="版本号">
            <Input placeholder="V1.0" />
          </Form.Item>
          <Form.Item name="safeStock" label="安全库存">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="批次管理" name="batchFlag" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="remark" label="备注信息">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select>
              <Select.Option value="正常">正常</Select.Option>
              <Select.Option value="禁用">禁用</Select.Option>
            </Select>
          </Form.Item>
        </div>
      </ModalForm>
    </PageContainer>
  )
}