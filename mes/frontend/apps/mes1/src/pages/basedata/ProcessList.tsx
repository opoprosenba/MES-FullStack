import { useState } from 'react'
import { Form, Button, Input, Select, Tag, Popconfirm, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageContainer from '@/components/PageContainer'
import { ensureArray } from '@/utils/ensureArray'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import ModalForm from '@/components/ModalForm'
import PermissionGuard from '@/components/PermissionGuard'
import { usePagination } from '@/hooks/usePagination'
import * as processApi from '@/api/process'

export default function ProcessList() {
  const queryClient = useQueryClient()
  const { pagination, onChange, reset } = usePagination()
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formInstance] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['process', pagination, filters],
    queryFn: () =>
      processApi.getProcessPage({
        current: pagination.current,
        size: pagination.pageSize,
        ...filters,
      }),
  })

  const { data: workUnitList } = useQuery({
    queryKey: ['workUnitSelect'],
    queryFn: () => processApi.getWorkUnitSelect(),
  })

  const addMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => processApi.addProcess(values),
    onSuccess: () => {
      message.success('新增成功')
      setModalOpen(false)
      formInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['process'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '新增失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => processApi.updateProcess(values),
    onSuccess: () => {
      message.success('更新成功')
      setModalOpen(false)
      setEditId(null)
      formInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['process'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => processApi.deleteProcess(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['process'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '删除失败')
    },
  })

  const handleSearch = (values: Record<string, unknown>) => {
    const mappedFilters: Record<string, unknown> = {}
    if (values.processCode) mappedFilters.processCode = values.processCode
    if (values.processName) mappedFilters.processName = values.processName
    if (values.workUnitId) mappedFilters.workUnitId = values.workUnitId
    if (values.status !== undefined && values.status !== '') mappedFilters.status = values.status
    setFilters(mappedFilters)
    reset()
  }

  const handleReset = () => {
    setFilters({})
    reset()
  }

  const handleAdd = () => {
    formInstance.resetFields()
    formInstance.setFieldsValue({ isGeneratePlan: '是' })
    setEditId(null)
    setModalOpen(true)
  }

  const handleEdit = (record: processApi.SpProcess) => {
    setEditId(record.id?.toString() || null)
    formInstance.setFieldsValue({
      ...record,
    })
    setModalOpen(true)
  }

  const handleDelete = (record: processApi.SpProcess) => {
    if (record.id) {
      deleteMutation.mutate(record.id.toString())
    }
  }

  const handleFormFinish = (values: Record<string, unknown>) => {
    if (editId) {
      updateMutation.mutate({ ...values, id: editId })
    } else {
      addMutation.mutate(values)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditId(null)
    formInstance.resetFields()
  }

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '工序编号', dataIndex: 'processCode', key: 'processCode', width: 120 },
    { title: '工序名称', dataIndex: 'processName', key: 'processName' },
    { title: '加工单元', dataIndex: 'workUnitName', key: 'workUnitName', width: 140 },
    { title: '工序工时(h)', dataIndex: 'workHour', key: 'workHour', width: 100 },
    { title: '制造周期(h)', dataIndex: 'manufactureCycle', key: 'manufactureCycle', width: 110 },
    {
      title: '是否生成生产计划',
      dataIndex: 'isGeneratePlan',
      key: 'isGeneratePlan',
      width: 140,
      render: (v: string) => <Tag color={v === '是' ? 'green' : 'orange'}>{v}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (v: string) => <Tag color={v === '正常' ? 'green' : 'red'}>{v}</Tag>,
    },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: processApi.SpProcess) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <PermissionGuard perm="basedata:process:edit">
            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              编辑
            </Button>
          </PermissionGuard>
          <PermissionGuard perm="basedata:process:delete">
            <Popconfirm
              title="确定删除该工序吗？"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </PermissionGuard>
        </div>
      ),
    },
  ]

  const workUnitOptions = ensureArray(workUnitList).map((item: processApi.SpProcessUnit) => ({
    label: `${item.code} ${item.name}`,
    value: item.id,
  }))

  return (
    <PageContainer title="工序信息定义">
      <SearchForm onSearch={handleSearch} onReset={handleReset}>
        <Form.Item name="processCode" label="工序编号">
          <Input placeholder="请输入工序编号" allowClear />
        </Form.Item>
        <Form.Item name="processName" label="工序名称">
          <Input placeholder="请输入工序名称" allowClear />
        </Form.Item>
        <Form.Item name="workUnitId" label="加工单元">
          <Select placeholder="请选择" allowClear style={{ width: 160 }}>
            {workUnitOptions.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value="">全部</Select.Option>
            <Select.Option value="正常">正常</Select.Option>
            <Select.Option value="禁用">禁用</Select.Option>
          </Select>
        </Form.Item>
      </SearchForm>

      <div style={{ marginBottom: 16 }}>
        <PermissionGuard perm="basedata:process:add">
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
        title={editId ? '编辑工序' : '新增工序'}
        onCancel={handleModalClose}
        onFinish={handleFormFinish}
        formInstance={formInstance}
        width={600}
        destroyOnHidden={false}
      >
        <Form.Item label="工序编号" name="processCode">
          <Input disabled placeholder="自动生成" />
        </Form.Item>
        <Form.Item
          label="工序名称"
          name="processName"
          rules={[{ required: true, message: '请输入工序名称' }]}
        >
          <Input placeholder="请输入工序名称" />
        </Form.Item>
        <Form.Item
          label="加工单元"
          name="workUnitId"
          rules={[{ required: true, message: '请选择加工单元' }]}
        >
          <Select placeholder="请选择加工单元" showSearch optionFilterProp="label">
            {workUnitOptions.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="工序工时(h)"
          name="workHour"
          rules={[{ required: true, message: '请输入工序工时' }]}
        >
          <Input type="number" min={1} placeholder="请输入工序工时" />
        </Form.Item>
        <Form.Item
          label="制造周期(h)"
          name="manufactureCycle"
          rules={[{ required: true, message: '请输入制造周期' }]}
        >
          <Input type="number" min={1} placeholder="请输入制造周期" />
        </Form.Item>
        <Form.Item label="是否生成生产计划" name="isGeneratePlan" initialValue="是">
          <Select placeholder="请选择">
            <Select.Option value="是">是</Select.Option>
            <Select.Option value="否">否</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="备注信息" name="remark">
          <Input.TextArea rows={3} placeholder="请输入备注信息" />
        </Form.Item>
      </ModalForm>
    </PageContainer>
  )
}
