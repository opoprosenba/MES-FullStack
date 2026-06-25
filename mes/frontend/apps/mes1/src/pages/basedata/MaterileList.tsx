import { useState } from 'react'
import { Form, Button, Input, Select, Tag, Popconfirm, message, Image } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageContainer from '@/components/PageContainer'
import { ensureArray } from '@/utils/ensureArray'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import ModalForm from '@/components/ModalForm'
import { usePagination } from '@/hooks/usePagination'
import * as materileApi from '@/api/basedata/materile'
import MaterileForm from './MaterileForm'
import type { Materiel } from '@/types/common'

const deletedMap: Record<string, { text: string; color: string }> = {
  '0': { text: '正常', color: 'green' },
  '1': { text: '已删除', color: 'red' },
  '2': { text: '禁用', color: 'orange' },
}

export default function MaterileList() {
  const queryClient = useQueryClient()
  const { pagination, onChange, reset } = usePagination()
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<Materiel | null>(null)
  const [formInstance] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['materiles', pagination, filters],
    queryFn: () =>
      materileApi.page({
        current: pagination.current,
        size: pagination.pageSize,
        ...filters,
      }),
  })

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => materileApi.addOrUpdate(values),
    onSuccess: () => {
      message.success('操作成功')
      setModalOpen(false)
      setEditId(null)
      formInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['materiles'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (record: Materiel) => materileApi.deleteById(record.id || ''),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['materiles'] })
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.msg || '删除失败')
    },
  })

  const handleSearch = (values: Record<string, unknown>) => {
    const mappedFilters: Record<string, unknown> = {}
    if (values.materiel) mappedFilters.materielLike = values.materiel
    if (values.materielDesc) mappedFilters.materielDescLike = values.materielDesc
    if (values.matType) mappedFilters.matType = values.matType
    if (values.source) mappedFilters.source = values.source
    if (values.deleted) mappedFilters.deleted = values.deleted
    setFilters(mappedFilters)
    reset()
  }

  const handleReset = () => {
    setFilters({})
    reset()
  }

  const handleAdd = () => {
    setEditId(null)
    setSelectedRecord(null)
    setModalOpen(true)
  }

  const handleEdit = (record: Materiel) => {
    setEditId(record.id)
    setSelectedRecord(record)
    setModalOpen(true)
  }

  const handleDelete = (record: Materiel) => {
    deleteMutation.mutate(record)
  }

  const handleModalCancel = () => {
    setModalOpen(false)
    setEditId(null)
  }

  const handleFormFinish = (values: Record<string, unknown>) => {
    saveMutation.mutate({
      ...values,
      id: editId || undefined,
    })
  }

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '物料编码', dataIndex: 'materiel', key: 'materiel' },
    { title: '物料名称', dataIndex: 'materielDesc', key: 'materielDesc' },
    { title: '物料类型', dataIndex: 'matType', key: 'matType' },
    { title: '计量单位', dataIndex: 'unit', key: 'unit', render: (v: string) => v || '-' },
    { title: '规格型号', dataIndex: 'model', key: 'model', render: (v: string) => v || '-' },
    { title: '材质', dataIndex: 'material', key: 'material', render: (v: string) => v || '-' },
    { title: '需求提前期(天)', dataIndex: 'leadTime', key: 'leadTime', width: 120 },
    { title: '安全库存', dataIndex: 'safetyStock', key: 'safetyStock', width: 100 },
    { title: '物料来源', dataIndex: 'source', key: 'source', render: (v: string) => v || '-' },
    {
      title: '状态',
      dataIndex: 'deleted',
      key: 'deleted',
      render: (val: string) => {
        const s = deletedMap[val] || { text: val, color: 'default' }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 160 },
    { title: '图片', dataIndex: 'imageUrl', key: 'imageUrl', width: 80,
      render: (v: string) =>
        v ? (
          <Image src={v} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Materiel) => (
        <span>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <PageContainer>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>物料信息定义</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增物料
            </Button>
            <SearchForm onSearch={handleSearch} onReset={handleReset} loading={isLoading}>
              <Form.Item name="materiel"><Input placeholder="物料编码" style={{ width: 150 }} /></Form.Item>
              <Form.Item name="materielDesc"><Input placeholder="物料名称" style={{ width: 150 }} /></Form.Item>
              <Form.Item name="matType">
                <Select placeholder="物料类型" style={{ width: 120 }} allowClear>
                  <Select.Option value="产品">产品</Select.Option>
                  <Select.Option value="零件">零件</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="source">
                <Select placeholder="物料来源" style={{ width: 100 }} allowClear>
                  <Select.Option value="自制">自制</Select.Option>
                  <Select.Option value="外购">外购</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="deleted">
                <Select placeholder="状态" style={{ width: 100 }} allowClear>
                  <Select.Option value="0">正常</Select.Option>
                  <Select.Option value="2">禁用</Select.Option>
                </Select>
              </Form.Item>
            </SearchForm>
          </div>
        </div>
        <PageTable
          rowKey="id"
          columns={columns}
          dataSource={ensureArray(data?.records)}
          loading={isLoading}
          total={data?.total || 0}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize }}
          onChange={onChange}
        />
      </div>

      <ModalForm
        open={modalOpen}
        title={editId ? '编辑物料' : '新增物料'}
        width={900}
        formInstance={formInstance}
        onCancel={handleModalCancel}
        loading={saveMutation.isPending}
      >
        <MaterileForm
          id={editId}
          record={selectedRecord}
          formInstance={formInstance}
          onFinish={handleFormFinish}
        />
      </ModalForm>
    </PageContainer>
  )
}
