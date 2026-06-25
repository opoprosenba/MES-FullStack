import { useEffect } from 'react'
import { Form, Select } from 'antd'
import type { FormInstance } from 'antd/es/form'
import { useQuery } from '@tanstack/react-query'
import type { SpTeamUser } from '@/api/basedata/teamUser'
import * as teamApi from '@/api/system/team'
import * as userApi from '@/api/system/user'

interface TeamUserFormProps {
  id?: string | null
  record?: SpTeamUser | null
  onFinish?: (values: any) => void
  formInstance: FormInstance
}

function TeamUserForm({ id, record, onFinish, formInstance }: TeamUserFormProps) {
  const { data: teamData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamApi.list(),
  })

  const { data: userData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => userApi.list(),
  })

  useEffect(() => {
    if (id && record) {
      formInstance.setFieldsValue(record)
    } else if (!id) {
      formInstance.resetFields()
    }
  }, [id, record, formInstance])

  const teamOptions = ((teamData || {}).records || []).map((t: { id: string; name: string; code: string }) => ({
    label: `${t.name} (${t.code})`,
    value: t.id,
  }))

  const userOptions = ((userData || {}).records || []).map((u: { id: string; username: string; name: string }) => ({
    label: `${u.name || u.username} (${u.username})`,
    value: u.id,
  }))

  return (
    <Form form={formInstance} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="teamId"
        label="所属班组"
        rules={[{ required: true, message: '请选择所属班组' }]}
      >
        <Select placeholder="请选择所属班组" options={teamOptions} showSearch filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        } />
      </Form.Item>
      <Form.Item
        name="userId"
        label="员工用户"
        rules={[{ required: true, message: '请选择员工用户' }]}
      >
        <Select placeholder="请选择员工用户" options={userOptions} showSearch filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        } />
      </Form.Item>
    </Form>
  )
}

export default TeamUserForm
