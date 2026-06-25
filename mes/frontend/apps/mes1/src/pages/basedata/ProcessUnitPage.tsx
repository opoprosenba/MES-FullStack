import { useState } from 'react'
import { Form, Button, Input, Select, Radio, Tag, Popconfirm, message, Space, Modal } from 'antd'
import { PlusOutlined, TeamOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageContainer from '@/components/PageContainer'
import { ensureArray } from '@/utils/ensureArray'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import ModalForm from '@/components/ModalForm'
import { usePagination } from '@/hooks/usePagination'
import * as puApi from '@/api/basedata/process-unit'
import type { SpProcessUnit, SpProcessUnitDTO } from '@/types/process-unit'
import type { SpTeam } from '@/types/team'

const statusMap: Record<string, { text: string; color: string }> = {
  '0': { text: '正常', color: 'green' },
  '1': { text: '已删除', color: 'red' },
  '2': { text: '已禁用', color: 'orange' },
}

const UNIT_TYPES = [
  { label: '人员作业单元', value: '0' },
  { label: '设备作业单元', value: '1' },
]

export default function ProcessUnitPage() {
  const queryClient = useQueryClient()
  const { pagination, onChange, reset } = usePagination()
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form] = Form.useForm()

  // Selected unit for right-side team panel
  const [selectedUnit, setSelectedUnit] = useState<SpProcessUnitDTO | null>(null)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [allTeams, setAllTeams] = useState<SpTeam[]>([])
  const [boundTeams, setBoundTeams] = useState<SpTeam[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['processUnits', pagination, filters],
    queryFn: () => puApi.page({ current: pagination.current, size: pagination.pageSize, ...filters }),
  })

  const saveMutation = useMutation({
    mutationFn: (v: Partial<SpProcessUnit>) => puApi.addOrUpdate(v),
    onSuccess: () => {
      message.success('操作成功')
      setModalOpen(false)
      setEditId(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['processUnits'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (r: SpProcessUnitDTO) => puApi.deleteById(r.id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['processUnits'] })
    },
  })

  const handleSelectUnit = async (record: SpProcessUnitDTO) => {
    setSelectedUnit(record)
    const teams = await puApi.getTeams(record.id)
    setBoundTeams(Array.isArray(teams) ? teams : [])
  }

  const handleOpenTeamModal = async () => {
    const res = await puApi.getAllTeams()
    const records = (res as any)?.records || []
    setAllTeams(records.filter((t: SpTeam) => t.deleted === '0'))
    setTeamModalOpen(true)
  }

  const handleAddTeam = async (teamId: string) => {
    if (!selectedUnit) return
    await puApi.addTeam(selectedUnit.id, teamId)
    message.success('绑定成功')
    const teams = await puApi.getTeams(selectedUnit.id)
    setBoundTeams(Array.isArray(teams) ? teams : [])
    setTeamModalOpen(false)
  }

  const handleRemoveTeam = async (teamId: string) => {
    if (!selectedUnit) return
    await puApi.removeTeam(selectedUnit.id, teamId)
    message.success('解绑成功')
    setBoundTeams((prev) => prev.filter((t) => t.id !== teamId))
  }

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '加工单元代码', dataIndex: 'code', key: 'code' },
    { title: '加工单元名称', dataIndex: 'name', key: 'name' },
    { title: '标准产能(小时)', dataIndex: 'capacity', key: 'capacity' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => v === '0' ? '人员作业单元' : v === '1' ? '设备作业单元' : '-' },
    { title: '线边库', dataIndex: 'hasLineWarehouse', key: 'hasLineWarehouse',
      render: (v: string) => v === '1' ? <Tag color="blue">有</Tag> : <Tag>无</Tag> },
    { title: '状态', dataIndex: 'deleted', key: 'deleted',
      render: (v: string) => {
        const s = statusMap[v] || { text: v, color: 'default' }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作', key: 'action',
      render: (_: any, r: SpProcessUnitDTO) => (
        <Space>
          <Button type="link" size="small" onClick={() => {
            setEditId(r.id)
            form.setFieldsValue(r)
            setModalOpen(true)
          }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => deleteMutation.mutate(r)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 16 }}>加工单元管理</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button type="primary" icon={<PlusOutlined />}
              onClick={() => { setEditId(null); form.resetFields(); form.setFieldsValue({ deleted: '0', hasLineWarehouse: '0', type: '0' }); setModalOpen(true) }}>
              新增加工单元
            </Button>
            <SearchForm
              onSearch={(v) => { setFilters(v); reset() }}
              onReset={() => { setFilters({}); reset() }}
              loading={isLoading}>
              <Form.Item name="code"><Input placeholder="加工单元代码" style={{ width: 200 }} /></Form.Item>
              <Form.Item name="name"><Input placeholder="加工单元名称" style={{ width: 200 }} /></Form.Item>
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
          onRow={(record: SpProcessUnitDTO) => ({
            onClick: () => handleSelectUnit(record),
            style: {
              cursor: 'pointer',
              background: selectedUnit?.id === record.id ? '#e6f7ff' : undefined,
            },
          })} />
      </div>
      <ModalForm
        open={modalOpen}
        title={editId ? '编辑加工单元' : '新增加工单元'}
        formInstance={form}
        onCancel={() => {
          setModalOpen(false)
          setEditId(null)
          form.resetFields()
        }}
        onFinish={(v) => { saveMutation.mutate({ ...v, id: editId || undefined }); return Promise.resolve(); }}
        loading={saveMutation.isPending}>
          <Form.Item name="code" label="加工单元代码" rules={[{ required: true, message: '请输入加工单元代码' }]}>
            <Input placeholder="请输入加工单元代码" />
          </Form.Item>
          <Form.Item name="capacity" label="日标准产能(小时)" rules={[{ required: true, message: '请输入日标准产能' }]}>
            <Input placeholder="请输入日标准产能" />
          </Form.Item>
          <Form.Item name="hasLineWarehouse" label="是否有线边库" rules={[{ required: true, message: '请选择' }]}>
            <Select options={[{ label: '否', value: '0' }, { label: '是', value: '1' }]} />
          </Form.Item>
          <Form.Item name="name" label="加工单元名称" rules={[{ required: true, message: '请输入加工单元名称' }]}>
            <Input placeholder="请输入加工单元名称" />
          </Form.Item>
          <Form.Item name="type" label="加工单元类型" rules={[{ required: true, message: '请选择' }]}>
            <Select options={UNIT_TYPES} />
          </Form.Item>
          <Form.Item name="descr" label="加工单元描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="deleted" label="状态" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="0">正常</Radio>
              <Radio value="1">已删除</Radio>
              <Radio value="2">已禁用</Radio>
            </Radio.Group>
          </Form.Item>
      </ModalForm>
      {/* 下方区块：加工单元班组管理 */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 500, fontSize: 16 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            加工单元班组管理 {selectedUnit ? `- ${selectedUnit.name}` : '(请先选择一个加工单元)'}
          </div>
          {selectedUnit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenTeamModal}
              style={{ marginBottom: 12 }}>
              新增班组绑定
            </Button>
          )}
        </div>
        {selectedUnit ? (
          <PageTable
            rowKey="id"
            dataSource={boundTeams}
            loading={false}
            total={boundTeams.length}
            pagination={false}
            columns={[
              { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
              { title: '班组代码', dataIndex: 'code' },
              { title: '班组名称', dataIndex: 'name' },
              { title: '状态', dataIndex: 'status', render: (v: string) => v === '0' ? '正常' : '禁用' },
              {
                title: '操作', key: 'action',
                render: (_: any, r: SpTeam) => (
                  <Popconfirm title="确定解绑？" onConfirm={() => handleRemoveTeam(r.id)}>
                    <Button type="link" size="small" danger>解绑</Button>
                  </Popconfirm>
                ),
              },
            ]} />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <p>请点击上方加工单元查看班组绑定</p>
          </div>
        )}

        {/* Team selection modal */}
        <Modal
          title="选择班组"
          open={teamModalOpen}
          onCancel={() => setTeamModalOpen(false)}
          footer={null}
          width={500}>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {allTeams.map((t) => (
              <Button key={t.id} size="small" style={{ margin: 4 }}
                onClick={() => handleAddTeam(t.id)}>
                {t.name} ({t.code})
              </Button>
            ))}
          </div>
        </Modal>
      </div>
    </PageContainer>
  )
}
