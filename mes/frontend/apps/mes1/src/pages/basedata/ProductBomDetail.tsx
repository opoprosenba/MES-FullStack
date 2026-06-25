import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Button, Input, Select, InputNumber, Tag, Popconfirm, message, Tree, Card, Row, Col, Descriptions } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageContainer from '@/components/PageContainer'
import { ensureArray } from '@/utils/ensureArray'
import PageTable from '@/components/PageTable'
import ModalForm from '@/components/ModalForm'
import * as productBomApi from '@/api/productBom'
import * as partsApi from '@/api/parts'
import * as materileApi from '@/api/materile'

export default function ProductBomDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [nodeModalOpen, setNodeModalOpen] = useState(false)
  const [editNodeId, setEditNodeId] = useState<string | null>(null)
  const [nodeFormInstance] = Form.useForm()

  const { data: bomData } = useQuery({
    queryKey: ['productBom', id],
    queryFn: () => productBomApi.getProductBomById(id || ''),
    enabled: !!id,
  })

  const { data: nodesData, isLoading: nodesLoading } = useQuery({
    queryKey: ['productBomNodes', id],
    queryFn: () => productBomApi.getProductBomNodes(id || ''),
    enabled: !!id,
  })

  const { data: partsList } = useQuery({
    queryKey: ['partsSelect'],
    queryFn: () => partsApi.getPartsSelect(),
  })

  const { data: materialList } = useQuery({
    queryKey: ['materialSelect'],
    queryFn: () => materileApi.getMaterileSelect(),
  })

  const nodes = useMemo(() => ensureArray(nodesData), [nodesData])
  const isLocked = (bomData as any)?.data?.isLocked === 1

  const treeData = useMemo(() => {
    const buildTree = (parentId: string): unknown[] => {
      return nodes
        .filter((n) => n.parentId === parentId)
        .map((n) => ({
          key: n.id,
          title: `${n.nodeName} (${n.quantity})`,
          children: buildTree(n.id || ''),
        }))
    }
    return buildTree('0')
  }, [nodes])

  const addNodeMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => productBomApi.addProductBomNode(values),
    onSuccess: () => {
      message.success('添加节点成功')
      setNodeModalOpen(false)
      nodeFormInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['productBomNodes', id] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '添加节点失败')
    },
  })

  const updateNodeMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => productBomApi.updateProductBomNode(values),
    onSuccess: () => {
      message.success('修改成功')
      setNodeModalOpen(false)
      setEditNodeId(null)
      nodeFormInstance.resetFields()
      queryClient.invalidateQueries({ queryKey: ['productBomNodes', id] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '修改失败')
    },
  })

  const deleteNodeMutation = useMutation({
    mutationFn: (nodeId: string) => productBomApi.deleteProductBomNode(nodeId),
    onSuccess: () => {
      message.success('删除成功')
      queryClient.invalidateQueries({ queryKey: ['productBomNodes', id] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { msg?: string } } }
      message.error(error?.response?.data?.msg || '删除失败')
    },
  })

  const handleBack = () => {
    navigate('/basedata/product-bom-management')
  }

  const handleTreeNodeSelect = (keys: React.Key[]) => {
    if (keys.length > 0) {
      setSelectedNodeId(keys[0] as string)
    }
  }

  const handleAddNode = () => {
    if (!selectedNodeId) {
      message.warning('请先选择父节点')
      return
    }
    setEditNodeId(null)
    nodeFormInstance.resetFields()
    nodeFormInstance.setFieldsValue({ parentId: selectedNodeId, bomId: id, quantity: 1 })
    setNodeModalOpen(true)
  }

  const handleEditNode = (record: productBomApi.SpProductBomNode) => {
    setEditNodeId(String(record.id || ''))
    nodeFormInstance.setFieldsValue(record)
    setNodeModalOpen(true)
  }

  const handleDeleteNode = (record: productBomApi.SpProductBomNode) => {
    deleteNodeMutation.mutate(String(record.id || ''))
  }

  const handleNodeFormFinish = (values: Record<string, unknown>) => {
    if (editNodeId) {
      updateNodeMutation.mutate({ ...values, id: editNodeId })
    } else {
      addNodeMutation.mutate(values)
    }
  }

  const handleNodeTypeChange = (_nodeType: string) => {
    nodeFormInstance.setFieldsValue({ nodeCode: undefined, nodeName: undefined })
  }

  const handleNodeCodeChange = (nodeCode: string) => {
    const nodeType = nodeFormInstance.getFieldValue('nodeType')
    if (nodeType === '零部件') {
      const part = ensureArray(partsList).find((p) => p.partCode === nodeCode)
      if (part) {
        nodeFormInstance.setFieldsValue({ nodeName: part.partName })
      }
    } else if (nodeType === '物料') {
      const material = ensureArray(materialList).find((m) => m.materiel === nodeCode)
      if (material) {
        nodeFormInstance.setFieldsValue({ nodeName: material.materielDesc })
      }
    }
  }

  const columns = [
    { title: '节点名称', dataIndex: 'nodeName', key: 'nodeName' },
    { title: '节点层级', dataIndex: 'level', key: 'level', width: 80 },
    { title: '节点编号', dataIndex: 'nodeCode', key: 'nodeCode', width: 120 },
    {
      title: '节点类型',
      dataIndex: 'nodeType',
      key: 'nodeType',
      width: 90,
      render: (v: string) => {
        const colorMap: Record<string, string> = { 产品: 'blue', 零部件: 'green', 物料: 'orange' }
        return <Tag color={colorMap[v] || 'default'}>{v}</Tag>
      },
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: productBomApi.SpProductBomNode) => {
        if (String(record.parentId) === '0') {
          return null
        }
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="link" size="small" disabled={isLocked} onClick={() => handleEditNode(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确定删除该节点及其子节点吗？"
              onConfirm={() => handleDeleteNode(record)}
              okText="确定"
              cancelText="取消"
              disabled={isLocked}
            >
              <Button type="link" size="small" danger disabled={isLocked}>
                删除
              </Button>
            </Popconfirm>
          </div>
        )
      },
    },
  ]

  const rootNode = nodes.find((n) => String(n.parentId) === '0')

  return (
    <PageContainer title={`产品BOM详情 - ${(bomData as any)?.data?.productMaterialName || ''} V${(bomData as any)?.data?.version || 1}`}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回列表
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={3}>
          <Descriptions.Item label="产品物料编码">
            <span style={{
              display: 'inline-block',
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {(bomData as any)?.data?.productMaterialCode}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="产品物料名称">
            <span style={{
              display: 'inline-block',
              maxWidth: 220,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {(bomData as any)?.data?.productMaterialName}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="版本">V{(bomData as any)?.data?.version}</Descriptions.Item>
          <Descriptions.Item label="定版状态" span={2}>
            <Tag color={isLocked ? 'blue' : 'orange'}>{isLocked ? '已定版' : '未定版'}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16}>
        <Col span={6}>
          <Card title="BOM结构" style={{ height: '100%' }} styles={{ body: { maxHeight: 500, overflow: 'auto' } }}>
            {treeData.length > 0 ? (
              <Tree
                showLine
                defaultExpandAll
                selectedKeys={selectedNodeId ? [selectedNodeId] : rootNode?.id ? [rootNode.id] : []}
                treeData={treeData}
                onSelect={handleTreeNodeSelect}
              />
            ) : (
              <div style={{ color: '#999' }}>暂无数据</div>
            )}
          </Card>
        </Col>
        <Col span={18}>
          <Card
            title="节点列表"
            extra={
              !isLocked && (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNode} disabled={!selectedNodeId}>
                  新增子节点
                </Button>
              )
            }
          >
            <PageTable
              rowKey="id"
              columns={columns}
              dataSource={nodes}
              loading={nodesLoading}
              total={nodes.length}
              pagination={{ current: 1, pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      <ModalForm
        open={nodeModalOpen}
        title={editNodeId ? '编辑节点' : '新增子节点'}
        onCancel={() => {
          setNodeModalOpen(false)
          setEditNodeId(null)
        }}
        onFinish={handleNodeFormFinish}
        formInstance={nodeFormInstance}
        width={500}
      >
        <Form.Item name="bomId" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="parentId" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="nodeType" label="节点类型" rules={[{ required: true, message: '请选择节点类型' }]}>
          <Select placeholder="请选择节点类型" onChange={handleNodeTypeChange} disabled={!!editNodeId}>
            <Select.Option value="零部件">零部件</Select.Option>
            <Select.Option value="物料">物料</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="nodeCode" label="节点编号" rules={[{ required: true, message: '请选择节点编号' }]}>
          <Select
            placeholder="请选择节点编号"
            showSearch
            optionFilterProp="children"
            onChange={handleNodeCodeChange}
            disabled={!!editNodeId}
          >
            {nodeFormInstance.getFieldValue('nodeType') === '零部件' &&
              ensureArray(partsList).map((p) => (
                <Select.Option key={p.partCode} value={p.partCode}>
                  {p.partCode} - {p.partName}
                </Select.Option>
              ))}
            {nodeFormInstance.getFieldValue('nodeType') === '物料' &&
              ensureArray(materialList).map((m) => (
                <Select.Option key={m.materiel} value={m.materiel}>
                  {m.materiel} - {m.materielDesc}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item name="nodeName" label="节点名称">
          <Input readOnly placeholder="自动带出" />
        </Form.Item>
        <Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
          <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入数量" />
        </Form.Item>
      </ModalForm>
    </PageContainer>
  )
}
