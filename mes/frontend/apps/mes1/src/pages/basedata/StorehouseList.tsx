import { useState, useEffect } from 'react'
import { Form, Button, Input, InputNumber, Select, Tag, Popconfirm, message, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageContainer from '@/components/PageContainer'
import { ensureArray } from '@/utils/ensureArray'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import ModalForm from '@/components/ModalForm'
import { usePagination } from '@/hooks/usePagination'
import * as storehouseApi from '@/api/storehouse'
import type { SpStorehouse, SpLocation } from '@/api/storehouse'

const statusMap: Record<string, { text: string; color: string }> = {
  '正常': { text: '正常', color: 'green' },
  '禁用': { text: '禁用', color: 'orange' },
}

const storeTypeMap: Record<string, string> = {
  '零件库': '零件库',
  '产品库': '产品库',
}

export default function StorehouseList() {
  const queryClient = useQueryClient()
  
  const { pagination: storePagination, onChange: onStoreChange, reset: resetStore } = usePagination()
  const { pagination: locPagination, onChange: onLocChange, reset: resetLoc } = usePagination()
  
  const [storeFilters, setStoreFilters] = useState<Record<string, unknown>>({})
  const [storeModalOpen, setStoreModalOpen] = useState(false)
  const [storeEditId, setStoreEditId] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<SpStorehouse | null>(null)
  const [storeFormInstance] = Form.useForm()
  
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [locationEditId, setLocationEditId] = useState<string | null>(null)
  const [locationFormInstance] = Form.useForm()
  
  const [storehouseOptions, setStorehouseOptions] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    fetchStorehouseOptions()
  }, [])

  const fetchStorehouseOptions = async () => {
    try {
      const res = await storehouseApi.getStorehouseSelect()
      const options = ensureArray(res).map((s: SpStorehouse) => ({
        label: `${s.storeCode} - ${s.storeName}`,
        value: String(s.id),
      }))
      setStorehouseOptions(options)
    } catch (e) {
      console.error('Failed to fetch storehouse options:', e)
    }
  }

  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ['storehouses', storePagination, storeFilters],
    queryFn: () =>
      storehouseApi.getStorehousePage({
        current: storePagination.current,
        size: storePagination.pageSize,
        ...storeFilters,
      }),
  })

  const { data: locData, isLoading: locLoading } = useQuery({
    queryKey: ['locations', locPagination, selectedStore?.id],
    queryFn: () => {
      if (!selectedStore?.id) return Promise.resolve({ data: { records: [], total: 0 } })
      return storehouseApi.getLocationPage({
        current: locPagination.current,
        size: locPagination.pageSize,
        storeId: selectedStore.id,
      })
    },
    enabled: !!selectedStore?.id,
  })

  const saveStoreMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => storehouseApi.saveStorehouse(values as SpStorehouse),
    onSuccess: () => {
      message.success('操作成功')
      setStoreModalOpen(false)
      setStoreEditId(null)
      storeFormInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['storehouses'] })
      fetchStorehouseOptions()
    },
  })

  const deleteStoreMutation = useMutation({
    mutationFn: (id: string) => storehouseApi.deleteStorehouse(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['storehouses'] })
      setSelectedStore(null)
      fetchStorehouseOptions()
    },
  })

  const saveLocMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => storehouseApi.saveLocation(values as SpLocation),
    onSuccess: () => {
      message.success('操作成功')
      setLocationModalOpen(false)
      setLocationEditId(null)
      locationFormInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })

  const deleteLocMutation = useMutation({
    mutationFn: (id: string) => storehouseApi.deleteLocation(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })

  const handleStoreSearch = (values: Record<string, unknown>) => {
    const mappedFilters: Record<string, unknown> = {}
    if (values.storeCode) mappedFilters.storeCode = values.storeCode
    if (values.storeName) mappedFilters.storeName = values.storeName
    if (values.storeType) mappedFilters.storeType = values.storeType
    if (values.status) mappedFilters.status = values.status
    setStoreFilters(mappedFilters)
    resetStore()
  }

  const handleStoreReset = () => {
    setStoreFilters({})
    resetStore()
  }

  const handleAddStore = () => {
    setStoreEditId(null)
    setStoreModalOpen(true)
    storeFormInstance.setFieldsValue({
      groupNum: undefined,
      rowNum: undefined,
      layerNum: undefined,
      colNum: undefined,
      status: '正常',
    })
  }

  const handleEditStore = async (record: SpStorehouse) => {
    setStoreEditId(record.id || null)
    const res = await storehouseApi.getStorehouseById(record.id || '')
    storeFormInstance.setFieldsValue(res)
    setStoreModalOpen(true)
  }

  const handleDeleteStore = (record: SpStorehouse) => {
    deleteStoreMutation.mutate(record.id || '')
  }

  const handleStoreFormFinish = (values: Record<string, unknown>) => {
    saveStoreMutation.mutate({
      ...values,
      id: storeEditId || undefined,
    })
  }

  const handleAddLocation = () => {
    setLocationEditId(null)
    setLocationModalOpen(true)
    locationFormInstance.setFieldsValue({
      groupNo: undefined,
      rowNo: undefined,
      layerNo: undefined,
      colNo: undefined,
      status: '正常',
    })
  }

  const handleEditLocation = async (record: SpLocation) => {
    setLocationEditId(record.id || null)
    await fetchStorehouseOptions()
    const res = await storehouseApi.getLocationById(record.id || '')
    locationFormInstance.setFieldsValue(res)
    setLocationModalOpen(true)
  }

  const handleDeleteLocation = (record: SpLocation) => {
    deleteLocMutation.mutate(record.id || '')
  }

  const handleLocationFormFinish = (values: Record<string, unknown>) => {
    saveLocMutation.mutate({
      ...values,
      id: locationEditId || undefined,
      storeId: values.storeId,
    })
  }

  const storeColumns = [
    { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '库房编码', dataIndex: 'storeCode', key: 'storeCode' },
    { title: '库房名称', dataIndex: 'storeName', key: 'storeName' },
    { title: '库房类型', dataIndex: 'storeType', key: 'storeType' },
    { title: '组', dataIndex: 'groupNum', key: 'groupNum', width: 60 },
    { title: '排', dataIndex: 'rowNum', key: 'rowNum', width: 60 },
    { title: '层', dataIndex: 'layerNum', key: 'layerNum', width: 60 },
    { title: '列', dataIndex: 'colNum', key: 'colNum', width: 60 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => {
        const s = statusMap[val] || { text: val, color: 'default' }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 160 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: SpStorehouse) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEditStore(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteStore(record)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const locationColumns = [
    { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '库位编码', dataIndex: 'locCode', key: 'locCode' },
    { title: '所属库房', dataIndex: 'storeCode', key: 'storeCode' },
    { title: '组', dataIndex: 'groupNo', key: 'groupNo', width: 60 },
    { title: '排', dataIndex: 'rowNo', key: 'rowNo', width: 60 },
    { title: '层', dataIndex: 'layerNo', key: 'layerNo', width: 60 },
    { title: '列', dataIndex: 'colNo', key: 'colNo', width: 60 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => {
        const s = statusMap[val] || { text: val, color: 'default' }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: SpLocation) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEditLocation(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteLocation(record)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer>
      <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>库房库位定义</div>
      
      {/* 上部：库房管理区域 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 500 }}>库房管理</span>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStore}>
            新增库房
          </Button>
        </div>
        
        <SearchForm onSearch={handleStoreSearch} onReset={handleStoreReset} loading={storeLoading}>
          <Form.Item name="storeCode"><Input placeholder="库房编码" style={{ width: 130 }} /></Form.Item>
          <Form.Item name="storeName"><Input placeholder="库房名称" style={{ width: 130 }} /></Form.Item>
          <Form.Item name="storeType">
            <Select placeholder="库房类型" style={{ width: 120 }} allowClear>
              <Select.Option value="零件库">零件库</Select.Option>
              <Select.Option value="产品库">产品库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" style={{ width: 100 }} allowClear>
              <Select.Option value="正常">正常</Select.Option>
              <Select.Option value="禁用">禁用</Select.Option>
            </Select>
          </Form.Item>
        </SearchForm>
        
        <PageTable
          rowKey="id"
          columns={storeColumns}
          dataSource={ensureArray(storeData?.records)}
          loading={storeLoading}
          total={storeData?.total || 0}
          pagination={{ current: storePagination.current, pageSize: storePagination.pageSize }}
          onChange={onStoreChange}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedStore?.id ? [String(selectedStore.id)] : [],
            onChange: (keys: (string | number)[]) => {
              const key = String(keys[0])
              const store = ensureArray(storeData?.records).find((s: SpStorehouse) => String(s.id) === key)
              setSelectedStore(store || null)
              resetLoc()
            },
          }}
        />
      </div>
      
      {/* 下部：库位管理区域 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 500 }}>库位管理</span>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddLocation} disabled={!selectedStore}>
            新增库位
          </Button>
        </div>
        
        {selectedStore ? (
          <PageTable
            rowKey="id"
            columns={locationColumns}
            dataSource={ensureArray(locData?.records)}
            loading={locLoading}
            total={locData?.total || 0}
            pagination={{ current: locPagination.current, pageSize: locPagination.pageSize }}
            onChange={onLocChange}
          />
        ) : (
          <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <span style={{ color: '#999' }}>请选择上方库房查看库位</span>
          </div>
        )}
      </div>

      <ModalForm
        open={storeModalOpen}
        title={storeEditId ? '编辑库房' : '新增库房'}
        width={700}
        formInstance={storeFormInstance}
        onCancel={() => { setStoreModalOpen(false); setStoreEditId(null) }}
        loading={saveStoreMutation.isPending}
        onFinish={handleStoreFormFinish}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 500, marginBottom: 16, color: '#1890ff' }}>基本信息</div>
          <Form.Item name="storeCode" label="库房编码" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            <Input disabled={true} placeholder="自动生成" />
          </Form.Item>
          <Form.Item name="storeName" label="库房名称" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} rules={[{ required: true, message: '库房名称不能为空' }]}>
            <Input placeholder="请输入库房名称" />
          </Form.Item>
          <Form.Item name="storeType" label="库房类型" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} rules={[{ required: true, message: '库房类型不能为空' }]}>
            <Select placeholder="请选择库房类型">
              <Select.Option value="零件库">零件库</Select.Option>
              <Select.Option value="产品库">产品库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="descInfo" label="库房描述" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            <Input.TextArea rows={3} placeholder="请输入库房描述" />
          </Form.Item>
        </div>
        
        <div>
          <div style={{ fontWeight: 500, marginBottom: 16, color: '#1890ff' }}>库房规格信息</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Form.Item name="groupNum" label="组" labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} rules={[{ required: true, message: '组不能为空' }, { type: 'number', min: 1, message: '数值不能小于1' }]}>
              <InputNumber min={1} placeholder="请输入≥1的数字" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="rowNum" label="排" labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} rules={[{ required: true, message: '排不能为空' }, { type: 'number', min: 1, message: '数值不能小于1' }]}>
              <InputNumber min={1} placeholder="请输入≥1的数字" style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <Form.Item name="layerNum" label="层" labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} rules={[{ required: true, message: '层不能为空' }, { type: 'number', min: 1, message: '数值不能小于1' }]}>
              <InputNumber min={1} placeholder="请输入≥1的数字" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="colNum" label="列" labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} rules={[{ required: true, message: '列不能为空' }, { type: 'number', min: 1, message: '数值不能小于1' }]}>
              <InputNumber min={1} placeholder="请输入≥1的数字" style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </div>
        
        <Form.Item name="status" label="状态" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Select>
            <Select.Option value="正常">正常</Select.Option>
            <Select.Option value="禁用">禁用</Select.Option>
          </Select>
        </Form.Item>
      </ModalForm>

      <ModalForm
        open={locationModalOpen}
        title={locationEditId ? '编辑库位' : '新增库位'}
        width={600}
        formInstance={locationFormInstance}
        onCancel={() => { setLocationModalOpen(false); setLocationEditId(null) }}
        loading={saveLocMutation.isPending}
        onFinish={handleLocationFormFinish}
      >
        <Form.Item name="storeId" label="所属库房" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} rules={[{ required: true, message: '所属库房不能为空' }]}>
          <Select placeholder="请选择库房">
            {storehouseOptions.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="locCode" label="库位编码" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Input disabled={true} placeholder="自动生成" />
        </Form.Item>
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="groupNo" label="组号" labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} rules={[{ required: true, message: '组号不能为空' }, { type: 'number', min: 1, message: '数值不能小于1' }]}>
            <InputNumber min={1} placeholder="请输入≥1的数字" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="rowNo" label="排号" labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} rules={[{ required: true, message: '排号不能为空' }, { type: 'number', min: 1, message: '数值不能小于1' }]}>
            <InputNumber min={1} placeholder="请输入≥1的数字" style={{ width: '100%' }} />
          </Form.Item>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <Form.Item name="layerNo" label="层号" labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} rules={[{ required: true, message: '层号不能为空' }, { type: 'number', min: 1, message: '数值不能小于1' }]}>
            <InputNumber min={1} placeholder="请输入≥1的数字" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="colNo" label="列号" labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} rules={[{ required: true, message: '列号不能为空' }, { type: 'number', min: 1, message: '数值不能小于1' }]}>
            <InputNumber min={1} placeholder="请输入≥1的数字" style={{ width: '100%' }} />
          </Form.Item>
        </div>
        <Form.Item name="status" label="状态" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Select>
            <Select.Option value="正常">正常</Select.Option>
            <Select.Option value="禁用">禁用</Select.Option>
          </Select>
        </Form.Item>
      </ModalForm>
    </PageContainer>
  )
}