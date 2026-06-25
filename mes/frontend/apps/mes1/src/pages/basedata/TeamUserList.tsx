import { useState } from 'react'
import { Form, Button, Input, Tag, Popconfirm, message, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageContainer from '@/components/PageContainer'
import { ensureArray } from '@/utils/ensureArray'
import SearchForm from '@/components/SearchForm'
import PageTable from '@/components/PageTable'
import ModalForm from '@/components/ModalForm'
import * as teamUserApi from '@/api/basedata/teamUser'
import * as teamApi from '@/api/system/team'
import TeamUserForm from './TeamUserForm'
import type { SpTeamUser } from '@/api/basedata/teamUser'

export default function TeamUserList() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<SpTeamUser | null>(null)
  const [formInstance] = Form.useForm()

  const { data: teamData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamApi.list(),
  })

  const teamOptions = ((teamData || {}).records || []).map((t: { id: string; name: string; code: string }) => ({
    label: `${t.name} (${t.code})`,
    value: t.id,
  }))

  const { data, isLoading,refetch } = useQuery({
    queryKey: ['teamUsers', filters],
    queryFn: () =>
      teamUserApi.page({
        current: 1,
        size: 100,
        ...filters,
      }),
  })

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => teamUserApi.addOrUpdate(values as SpTeamUser),
    onSuccess: () => {
      message.success('操作成功')
      setModalOpen(false)
      setEditId(null)
      setSelectedRecord(null)
      formInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['teamUsers'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamUserApi.deleteById(id),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['teamUsers'] })
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
    setSelectedRecord(null)
    setModalOpen(true)
  }

  const handleEdit = (record: SpTeamUser) => {
    setEditId(record.id || null)
    setSelectedRecord(record)
    setModalOpen(true)
  }

  const handleDelete = (record: SpTeamUser) => {
    if (record.id) {
      deleteMutation.mutate(record.id)
    }
  }

  const handleModalCancel = () => {
    setModalOpen(false)
    setEditId(null)
    setSelectedRecord(null)
  }

  const handleFormFinish = (values: Record<string, unknown>) => {
    saveMutation.mutate({
      ...values,
      id: editId || undefined,
    })
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: '所属班组',
      dataIndex: 'teamName',
      key: 'teamName',
    },
    {
      title: '员工账号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '员工姓名',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: SpTeamUser) => (
        <span>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除该记录吗？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <PageContainer>
      <SearchForm onSearch={handleSearch} onReset={handleReset} loading={isLoading}>
        <Form.Item name="teamId">
          <Select placeholder="请选择班组" options={teamOptions} allowClear style={{ width: 200 }} />
        </Form.Item>
      </SearchForm>

      <PageTable
        rowKey="id"
        columns={columns}
        dataSource={ensureArray(data?.records)}
        loading={isLoading}
        total={data?.total || 0}
        pagination={false}
        toolbar={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增
          </Button>
        }
      />

      <ModalForm
        open={modalOpen}
        title={editId ? '编辑班组员工' : '新增班组员工'}
        formInstance={formInstance}
        onCancel={handleModalCancel}
        loading={saveMutation.isPending}
      >
        <TeamUserForm
          id={editId}
          record={selectedRecord}
          formInstance={formInstance}
          onFinish={handleFormFinish}
        />
      </ModalForm>
    </PageContainer>
  )
}
