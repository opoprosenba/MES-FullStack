import { useState } from 'react'
import { Form, Button, Input, Select, Tag, Popconfirm, message, Modal, Table, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { ensureArray } from '@/utils/ensureArray'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import ModalForm from '@/components/ModalForm'
import PermissionGuard from '@/components/PermissionGuard'
import { usePagination } from '@/hooks/usePagination'
import * as productBomApi from '@/api/productBom'

export default function ProductBomList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { pagination, onChange, reset } = usePagination()
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [materialModalOpen, setMaterialModalOpen] = useState(false)
  const [formInstance] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['productBom', pagination, filters],
    queryFn: () =>
      productBomApi.getProductBomPage({
        current: pagination.current,
        size: pagination.pageSize,
        ...filters,
      }),
  })

  const { data: materialList } = useQuery({
    queryKey: ['productMaterialSelect'],
    queryFn: () => productBomApi.getProductMaterialSelect(),
  })

  const addMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => productBomApi.addProductBom(values),
    onSuccess: () => {
      message.success('新增成功')
      setModalOpen(false)
      formInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['productBom'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '新增失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productBomApi.deleteProductBom(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['productBom'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '删除失败')
    },
  })

  const lockMutation = useMutation({
    mutationFn: (id: string) => productBomApi.lockProductBom(id),
    onSuccess: () => {
      message.success('定版成功')
      queryClient.invalidateQueries({ queryKey: ['productBom'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '定版失败')
    },
  })

  const upgradeMutation = useMutation({
    mutationFn: (id: string) => productBomApi.upgradeProductBom(id),
    onSuccess: () => {
      message.success('版本升级成功')
      queryClient.invalidateQueries({ queryKey: ['productBom'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '版本升级失败')
    },
  })

  const handleSearch = (values: Record<string, unknown>) => {
    const mappedFilters: Record<string, unknown> = {}
    if (values.productMaterialCode) mappedFilters.productMaterialCode = values.productMaterialCode
    if (values.productMaterialName) mappedFilters.productMaterialName = values.productMaterialName
    if (values.version) mappedFilters.version = values.version
    if (values.validity) mappedFilters.validity = values.validity
    if (values.isLocked !== undefined && values.isLocked !== '') mappedFilters.isLocked = values.isLocked
    setFilters(mappedFilters)
    reset()
  }

  const handleReset = () => {
    setFilters({})
    reset()
  }

  const handleAdd = () => {
    formInstance.resetFields()
    formInstance.setFieldsValue({ version: 1 })
    setModalOpen(true)
  }

  const handleSelectMaterial = () => {
    setMaterialModalOpen(true)
  }

  const handleMaterialSelect = async (record: { id: string; materiel: string; materielDesc: string }) => {
    formInstance.setFieldsValue({
      productMaterialId: record.id,
      productMaterialCode: record.materiel,
      productMaterialName: record.materielDesc,
    })
    setMaterialModalOpen(false)

    try {
      const res = await productBomApi.getMaxBomVersion(record.id)
      const maxVersion = res as number
      formInstance.setFieldsValue({
        version: maxVersion ? maxVersion + 1 : 1,
      })
    } catch (err) {
      formInstance.setFieldsValue({ version: 1 })
    }
  }

  const handleFormFinish = (values: Record<string, unknown>) => {
    addMutation.mutate(values)
  }

  const handleViewBom = (record: productBomApi.SpProductBom) => {
    navigate(`/basedata/product-bom-management/detail/${record.id}`)
  }

  const handleEdit = (record: productBomApi.SpProductBom) => {
    navigate(`/basedata/product-bom-management/detail/${record.id}`)
  }

  const handleDelete = (record: productBomApi.SpProductBom) => {
    const isLocked = record.isLocked === 1
    Modal.confirm({
      title: '删除提示',
      content: isLocked
        ? '该BOM已锁定定版，无法执行删除操作'
        : '确定删除该BOM？删除后所有BOM节点数据将同步清空，数据不可恢复',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true, disabled: isLocked },
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(record.id || '')
          message.success('删除成功')
        } catch (err: any) {
          message.error(err.message || '删除失败')
        }
      }
    })
  }

  const handleLock = (record: productBomApi.SpProductBom) => {
    lockMutation.mutate(record.id || '')
  }

  const handleUpgrade = (record: productBomApi.SpProductBom) => {
    upgradeMutation.mutate(record.id || '')
  }

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '产品物料编码', dataIndex: 'productMaterialCode', key: 'productMaterialCode', width: 140 },
    { title: '产品物料名称', dataIndex: 'productMaterialName', key: 'productMaterialName' },
    { title: '版本', dataIndex: 'version', key: 'version', width: 80, render: (v: number) => `V${v}` },
    {
      title: '有效性',
      dataIndex: 'validity',
      key: 'validity',
      width: 80,
      render: (v: string) => <Tag color={v === '有效' ? 'green' : 'default'}>{v}</Tag>,
    },
    {
      title: '定版标识',
      dataIndex: 'isLocked',
      key: 'isLocked',
      width: 90,
      render: (v: number) => <Tag color={v === 1 ? 'blue' : 'orange'}>{v === 1 ? '已定版' : '未定版'}</Tag>,
    },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: unknown, record: productBomApi.SpProductBom) => {
        const isLocked = record.isLocked === 1
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="link" size="small" onClick={() => handleViewBom(record)}>
              查看BOM
            </Button>
            <PermissionGuard perm="basedata:productBom:edit">
              <Button type="link" size="small" disabled={isLocked} onClick={() => handleEdit(record)}>
                编辑
              </Button>
            </PermissionGuard>
            <PermissionGuard perm="basedata:productBom:lock">
              <Popconfirm
                title="定版后BOM将不可编辑，是否确认定版？"
                onConfirm={() => handleLock(record)}
                okText="确定"
                cancelText="取消"
                disabled={isLocked}
              >
                <Button type="link" size="small" disabled={isLocked}>
                  定版
                </Button>
              </Popconfirm>
            </PermissionGuard>
            <PermissionGuard perm="basedata:productBom:upgrade">
              <Button type="link" size="small" onClick={() => handleUpgrade(record)}>
                升级版本
              </Button>
            </PermissionGuard>
            <PermissionGuard perm="basedata:productBom:delete">
              <Popconfirm
                title="确定删除该BOM吗？"
                onConfirm={() => handleDelete(record)}
                okText="确定"
                cancelText="取消"
                disabled={isLocked}
              >
                <Button type="link" size="small" danger disabled={isLocked}>
                  删除
                </Button>
              </Popconfirm>
            </PermissionGuard>
          </div>
        )
      },
    },
  ]

  const materialColumns = [
    { title: '物料编码', dataIndex: 'materiel', key: 'materiel', width: 120 },
    { title: '物料描述', dataIndex: 'materielDesc', key: 'materielDesc' },
    { title: '基本单位', dataIndex: 'unit', key: 'unit', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: { id: string; materiel: string; materielDesc: string }) => (
        <Button type="link" size="small" onClick={() => handleMaterialSelect(record)}>
          选择
        </Button>
      ),
    },
  ]

  return (
    <PageContainer title="产品BOM管理">
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <Form.Item name="productMaterialCode" label="产品物料编码">
          <Input placeholder="请输入产品物料编码" allowClear />
        </Form.Item>
        <Form.Item name="productMaterialName" label="产品物料名称">
          <Input placeholder="请输入产品物料名称" allowClear />
        </Form.Item>
        <Form.Item name="version" label="版本">
          <Input placeholder="请输入版本号" allowClear style={{ width: 100 }} />
        </Form.Item>
        <Form.Item name="isLocked" label="定版状态">
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value="">全部</Select.Option>
            <Select.Option value={0}>未定版</Select.Option>
            <Select.Option value={1}>已定版</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="validity" label="有效性">
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value="">全部</Select.Option>
            <Select.Option value="有效">有效</Select.Option>
            <Select.Option value="无效">无效</Select.Option>
          </Select>
        </Form.Item>
      </SearchForm>

      <div style={{ marginBottom: 16 }}>
        <PermissionGuard perm="basedata:productBom:add">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增
          </Button>
        </PermissionGuard>
      </div>

      <PageTable
        rowKey="id"
        columns={columns}
        dataSource={ensureArray((data as any)?.records)}
        loading={isLoading}
        total={(data as any)?.total || 0}
        pagination={{ current: pagination.current, pageSize: pagination.pageSize }}
        onChange={onChange}
      />

      <ModalForm
        open={modalOpen}
        title="新增产品BOM"
        onCancel={() => setModalOpen(false)}
        onFinish={handleFormFinish}
        formInstance={formInstance}
        width={500}
      >
        <Form.Item name="productMaterialId" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="产品物料" required>
          <Space.Compact>
            <Form.Item name="productMaterialCode" noStyle>
              <Input style={{ width: '30%' }} placeholder="编码" readOnly />
            </Form.Item>
            <Form.Item name="productMaterialName" noStyle>
              <Input style={{ width: '60%' }} placeholder="名称" readOnly />
            </Form.Item>
            <Button style={{ width: '10%' }} onClick={handleSelectMaterial}>
              选择
            </Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item name="version" label="版本" rules={[{ required: true, message: '请输入版本' }]}>
          <Input type="number" min={1} placeholder="请输入版本号" />
        </Form.Item>
        <Form.Item name="remark" label="备注信息">
          <Input.TextArea rows={3} placeholder="请输入备注信息" />
        </Form.Item>
      </ModalForm>

      <Modal
        open={materialModalOpen}
        title="选择产品物料"
        onCancel={() => setMaterialModalOpen(false)}
        footer={null}
        width={700}
        getContainer={false}
        zIndex={1001}
      >
        <Table
          rowKey="id"
          columns={materialColumns}
          dataSource={ensureArray(materialList)}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>
    </PageContainer>
  )
}
