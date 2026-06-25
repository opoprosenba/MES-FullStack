import { useState } from 'react'
import { Form, Button, Input, Tag, Popconfirm, message, Switch, Table, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageContainer from '@/components/PageContainer'
import { ensureArray } from '@/utils/ensureArray'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import ModalForm from '@/components/ModalForm'
import * as equipmentGroupApi from '@/api/basedata/equipmentGroup'
import type { SpEquipmentGroup, GroupEquipment } from '@/api/basedata/equipmentGroup'

export default function EquipmentGroupList() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formInstance] = Form.useForm()

  const [selectedGroup, setSelectedGroup] = useState<SpEquipmentGroup | null>(null)
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false)
  const [editEquipmentModalOpen, setEditEquipmentModalOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<GroupEquipment | null>(null)
  const [equipmentForm] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['equipmentGroups', filters],
    queryFn: () =>
      equipmentGroupApi.page({
        current: 1,
        size: 100,
        ...filters,
      }),
  })

  const { data: equipmentData, isLoading: equipmentLoading } = useQuery({
    queryKey: ['groupEquipments', selectedGroup?.id],
    queryFn: () => equipmentGroupApi.getEquipmentList(selectedGroup!.id!),
    enabled: !!selectedGroup?.id,
  })

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => equipmentGroupApi.addOrUpdate(values as SpEquipmentGroup),
    onSuccess: () => {
      message.success('操作成功')
      setModalOpen(false)
      setEditId(null)
      formInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['equipmentGroups'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => equipmentGroupApi.deleteById(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['equipmentGroups'] })
      if (selectedGroup) {
        setSelectedGroup(null)
      }
    },
    onError: (error: Error) => {
      message.error(error.message || '删除失败')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      equipmentGroupApi.updateStatus(id, status),
    onSuccess: () => {
      message.success('状态更新成功')
      queryClient.invalidateQueries({ queryKey: ['equipmentGroups'] })
    },
  })

  const removeEquipmentMutation = useMutation({
    mutationFn: (id: string) => equipmentGroupApi.removeEquipment(id),
    onSuccess: () => {
      message.success('移除成功')
      queryClient.invalidateQueries({ queryKey: ['groupEquipments'] })
    },
  })

  const updateEquipmentStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      equipmentGroupApi.updateEquipmentStatus(id, status),
    onSuccess: () => {
      message.success('状态更新成功')
      queryClient.invalidateQueries({ queryKey: ['groupEquipments'] })
    },
  })

  const updateEquipmentRemarkMutation = useMutation({
    mutationFn: ({ id, remark }: { id: string; remark: string }) =>
      equipmentGroupApi.updateEquipmentRemark(id, remark),
    onSuccess: () => {
      message.success('更新成功')
      setEditEquipmentModalOpen(false)
      setSelectedEquipment(null)
      equipmentForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['groupEquipments'] })
    },
  })

  const handleSearch = (values: Record<string, unknown>) => {
    setFilters(values)
  }

  const handleReset = () => {
    setFilters({})
  }

  const handleAdd = () => {
    setEditId(null)
    formInstance.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: SpEquipmentGroup) => {
    setEditId(record.id || null)
    // 重置并设置表单值，确保编辑时数据正确回显
    formInstance.resetFields()
    formInstance.setFieldsValue({
      code: record.code,
      name: record.name,
      descr: record.descr,
      remark: record.remark,
    })
    setModalOpen(true)
  }

  const handleDelete = (record: SpEquipmentGroup) => {
    if (record.id) {
      deleteMutation.mutate(record.id)
    }
  }

  const handleStatusChange = (record: SpEquipmentGroup, checked: boolean) => {
    if (record.id) {
      statusMutation.mutate({ id: record.id, status: checked ? '0' : '1' })
    }
  }

  const handleModalCancel = () => {
    setModalOpen(false)
    setEditId(null)
    formInstance.resetFields()
  }

  const handleFormFinish = (values: Record<string, unknown>) => {
    saveMutation.mutate({
      ...values,
      id: editId || undefined,
    })
  }

  const handleSelectGroup = (record: SpEquipmentGroup) => {
    setSelectedGroup(record)
  }

  const handleRemoveEquipment = (record: GroupEquipment) => {
    removeEquipmentMutation.mutate(record.id)
  }

  const handleEquipmentStatusChange = (record: GroupEquipment, checked: boolean) => {
    updateEquipmentStatusMutation.mutate({ id: record.id, status: checked ? '0' : '1' })
  }

  const handleEditEquipment = (record: GroupEquipment) => {
    setSelectedEquipment(record)
    equipmentForm.setFieldsValue({ remark: record.remark || '' })
    setEditEquipmentModalOpen(true)
  }

  const handleEditEquipmentFinish = (values: Record<string, unknown>) => {
    if (selectedEquipment) {
      updateEquipmentRemarkMutation.mutate({ id: selectedEquipment.id, remark: String(values.remark) })
    }
  }

  const equipmentColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: '设备编码',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '0' ? 'green' : 'red'}>
          {status === '0' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '备注信息',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: GroupEquipment) => (
        <>
          <Button type="link" size="small" onClick={() => handleEditEquipment(record)}>
            编辑
          </Button>
          <Switch
            checked={record.status === '0'}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={(checked) => handleEquipmentStatusChange(record, checked)}
          />
          <Popconfirm
            title="确定要从编组中移除该设备吗？"
            onConfirm={() => handleRemoveEquipment(record)}
          >
            <Button type="link" size="small" danger>
              移除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  const groupColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: '编组代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '编组名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '编组描述',
      dataIndex: 'descr',
      key: 'descr',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: SpEquipmentGroup) => (
        <Switch
          checked={status === '0'}
          checkedChildren="正常"
          unCheckedChildren="禁用"
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: SpEquipmentGroup) => (
        <>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除该编组吗？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  return (
    <PageContainer>
      {/* 上方区块：编组管理 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>设备编组管理</div>
        <SearchForm onSearch={handleSearch} onReset={handleReset} loading={isLoading}>
          <Form.Item name="code">
            <Input placeholder="请输入编组代码" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="name">
            <Input placeholder="请输入编组名称" style={{ width: 200 }} />
          </Form.Item>
        </SearchForm>

        <PageTable
          rowKey="id"
          columns={groupColumns}
          dataSource={ensureArray(data?.records)}
          loading={isLoading}
          total={data?.total || 0}
          toolbar={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增编组
            </Button>
          }
          onRow={(record) => ({
            onClick: () => handleSelectGroup(record),
            style: { cursor: 'pointer' },
          })}
          rowClassName={(record) => (selectedGroup?.id === record.id ? 'ant-table-row-selected' : '')}
        />
      </div>

      {/* 下方区块：设备管理 */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 500, fontSize: 16 }}>
            设备管理 {selectedGroup ? `- ${selectedGroup.name}` : '(请先选择一个编组)'}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setEquipmentModalOpen(true)}
            disabled={!selectedGroup}
          >
            新增设备
          </Button>
        </div>

        {selectedGroup ? (
          <PageTable
            rowKey="id"
            columns={equipmentColumns}
            dataSource={ensureArray(equipmentData)}
            loading={equipmentLoading}
            total={equipmentData?.length || 0}
            pagination={false}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#999', padding: '50px 0', border: '1px dashed #d9d9d9', borderRadius: 4 }}>
            请先选择一个编组查看设备
          </div>
        )}
      </div>

      {/* 编组新增/编辑弹窗 */}
      <ModalForm
        open={modalOpen}
        title={editId ? '编辑编组' : '新增编组'}
        formInstance={formInstance}
        onCancel={handleModalCancel}
        onFinish={handleFormFinish}
        loading={saveMutation.isPending}
      >
          <Form.Item
            name="code"
            label="编组代码"
            rules={[{ required: true, message: '请输入编组代码' }]}
          >
            <Input placeholder="请输入编组代码" />
          </Form.Item>
          <Form.Item
            name="name"
            label="编组名称"
            rules={[{ required: true, message: '请输入编组名称' }]}
          >
            <Input placeholder="请输入编组名称" />
          </Form.Item>
          <Form.Item name="descr" label="编组描述">
            <Input.TextArea placeholder="请输入编组描述" rows={3} />
          </Form.Item>
          <Form.Item name="remark" label="备注信息">
            <Input.TextArea placeholder="请输入备注信息" rows={2} />
          </Form.Item>
      </ModalForm>

      {/* 新增设备弹窗 */}
      <AddEquipmentModal
        open={equipmentModalOpen}
        groupId={selectedGroup?.id!}
        onCancel={() => setEquipmentModalOpen(false)}
        onSuccess={() => {
          setEquipmentModalOpen(false)
          queryClient.invalidateQueries({ queryKey: ['groupEquipments'] })
        }}
      />

      {/* 编辑设备备注弹窗 */}
      <Modal
        title="编辑设备"
        open={editEquipmentModalOpen}
        onCancel={() => {
          setEditEquipmentModalOpen(false)
          setSelectedEquipment(null)
        }}
        footer={null}
      >
        <Form
          form={equipmentForm}
          layout="vertical"
          onFinish={handleEditEquipmentFinish}
          initialValues={{ remark: selectedEquipment?.remark || '' }}
        >
          <Form.Item label="设备编码">
            <Input disabled value={selectedEquipment?.equipmentCode || ''} />
          </Form.Item>
          <Form.Item name="remark" label="备注信息">
            <Input.TextArea placeholder="请输入备注信息" rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => {
              setEditEquipmentModalOpen(false)
              setSelectedEquipment(null)
            }} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}

function AddEquipmentModal({
  open,
  groupId,
  onCancel,
  onSuccess,
}: {
  open: boolean
  groupId: string
  onCancel: () => void
  onSuccess: () => void
}) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const { data: availableEquipments } = useQuery({
    queryKey: ['availableEquipments'],
    queryFn: () => equipmentGroupApi.getAvailableEquipments(),
    enabled: open,
  })

  const addMutation = useMutation({
    mutationFn: (equipmentIds: string[]) => equipmentGroupApi.addEquipment(groupId, equipmentIds, form.getFieldValue('remark')),
    onSuccess: () => {
      message.success('绑定成功')
      setSelectedRowKeys([])
      form.resetFields()
      onSuccess()
    },
    onError: (error: Error) => {
      message.error(error.message || '绑定失败')
    },
  })

  const handleOk = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择设备')
      return
    }
    setLoading(true)
    try {
      await addMutation.mutateAsync(selectedRowKeys)
    } finally {
      setLoading(false)
    }
  }

  const handleRowSelect = (keys: React.Key[]) => {
    const newKeys = keys as string[]
    setSelectedRowKeys(newKeys)
    if (newKeys.length > 0) {
      const selected = availableEquipments?.find(e => e.id === newKeys[0])
      if (selected) {
        form.setFieldsValue({ equipmentCode: selected.code })
      }
    } else {
      form.setFieldsValue({ equipmentCode: '' })
    }
  }

  const columns = [
    { title: '设备编码', dataIndex: 'code', key: 'code' },
    { title: '设备名称', dataIndex: 'name', key: 'name' },
    { title: '设备状态', dataIndex: 'status', key: 'status',
      render: (status: string) => (status === '0' ? '正常' : '禁用')
    },
  ]

  return (
    <Modal
      title="新增设备"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      width={800}
    >
      <Form form={form} layout="vertical" style={{ marginBottom: 16 }}>
        <Form.Item name="equipmentCode" label="生产设备编号">
          <Input placeholder="请从下方表格选择设备" disabled />
        </Form.Item>
        <Form.Item name="remark" label="备注信息">
          <Input.TextArea placeholder="请输入备注信息" rows={2} />
        </Form.Item>
      </Form>
      <div style={{ fontWeight: 500, marginBottom: 8 }}>生产设备选择</div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={ensureArray(availableEquipments)}
        pagination={{ pageSize: 5 }}
        rowSelection={{
          selectedRowKeys,
          onChange: handleRowSelect,
          type: 'radio',
        }}
      />
    </Modal>
  )
}
