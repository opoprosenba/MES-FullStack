import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tree, Tabs, Select, Card, Descriptions, Table, Row, Col, Spin, Empty, Tag, message } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { getProcessQueryTree, getProcessDetail } from '@/api/processQuery'

const { TabPane } = Tabs

export default function ProcessQueryList() {
  const [selectedBomId, setSelectedBomId] = useState<string | undefined>()
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('baseInfo')

  // 查询BOM树
  const { data: treeResult, isLoading: treeLoading, error: treeError } = useQuery({
    queryKey: ['processQueryTree', selectedBomId],
    queryFn: () => getProcessQueryTree(selectedBomId),
    retry: 1,
  })

  // 查询工序详情
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['processDetail', selectedNode?.processId],
    queryFn: () => selectedNode?.processId ? getProcessDetail(selectedNode.processId) : Promise.resolve(null),
    enabled: !!selectedNode?.processId,
  })

  const bomInfo = (treeResult as any)?.bomInfo
  const bomList = (treeResult as any)?.bomList || []
  const tree = (treeResult as any)?.tree || []

  // 首次加载时，自动选中第一个BOM
  useEffect(() => {
    if (bomList && bomList.length > 0 && !selectedBomId) {
      const firstBom = bomList[0]
      setSelectedBomId(firstBom.id)
    }
  }, [bomList])

  // 树数据加载后，默认选中第一个节点
  useEffect(() => {
    if (tree && tree.length > 0 && !selectedNode) {
      setSelectedNode(tree[0])
    }
  }, [tree])

  // 错误提示
  useEffect(() => {
    if (treeError) {
      message.error('加载BOM树失败，请检查后端服务')
    }
  }, [treeError])

  const handleSelectChange = (value: string) => {
    setSelectedBomId(value)
    setSelectedNode(null)
  }

  const handleTreeSelect = (_: React.Key[], info: any) => {
    const node = info?.node
    if (node) {
      setSelectedNode(node)
      setActiveTab('baseInfo')
    }
  }

  // 表格列定义
  const equipmentColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 60 },
    { title: '设备名称', dataIndex: 'name', key: 'name' },
    { title: '规格型号', dataIndex: 'spec', key: 'spec' },
  ]

  const documentColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 60 },
    { title: '文档名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '说明', dataIndex: 'remark', key: 'remark' },
  ]

  const materialColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 60 },
    { title: '物料名称', dataIndex: 'name', key: 'name' },
    { title: '数量', dataIndex: 'qty', key: 'qty', width: 80 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
  ]

  // 树节点标题渲染：带状态标识
  const renderTreeTitle = (nodeData: DataNode) => {
    const node = nodeData as any
    const { title, isProcessFinished, isLocked } = node
    return (
      <span>
        {isLocked && <Tag color="blue" style={{ marginRight: 4 }}>🔒</Tag>}
        {title}
        {isProcessFinished && <Tag color="green" style={{ marginLeft: 4 }}>✅</Tag>}
      </span>
    )
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', padding: 16 }}>
      <Row gutter={16} style={{ height: '100%' }}>
        {/* 左侧：产品BOM工艺树 */}
        <Col span={8} style={{ height: '100%' }}>
          <Card
            title="产品BOM工艺树"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, overflow: 'auto', padding: 12 } }}
            extra={
              <Select
                style={{ width: 200 }}
                placeholder="选择产品BOM"
                value={selectedBomId || bomInfo?.id}
                onChange={handleSelectChange}
                options={bomList.map((b: any) => ({
                  label: `${b.productMaterialCode || ''} ${b.productMaterialName || ''} (v${b.version || 1})`,
                  value: b.id,
                }))}
              />
            }
          >
            <Spin spinning={treeLoading}>
              {tree.length > 0 ? (
                <Tree
                  treeData={tree}
                  onSelect={handleTreeSelect}
                  selectedKeys={selectedNode ? [selectedNode.key] : []}
                  defaultExpandAll
                  titleRender={renderTreeTitle}
                />
              ) : (
                <Empty description={treeError ? '加载失败，请检查后端服务' : '暂无BOM数据'} />
              )}
            </Spin>
          </Card>
        </Col>

        {/* 右侧：工序详情 7标签页 */}
        <Col span={16} style={{ height: '100%' }}>
          <Card
            title={selectedNode ? `${selectedNode.title || '工序详情'}` : '工序详情'}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, overflow: 'auto', padding: 16 } }}
          >
            <Spin spinning={detailLoading}>
              {!selectedNode?.processId ? (
                <Empty description={selectedNode ? '该节点未关联工序' : '请从左侧选择一个节点'} />
              ) : !detail ? (
                <Empty description="暂无工艺详情" />
              ) : (
                <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                  {/* 1. 工序主信息 */}
                  <TabPane tab="工序主信息" key="baseInfo">
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="工序编号" span={1}>
                        {detail.baseInfo?.processCode || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="工序名称" span={1}>
                        {detail.baseInfo?.processName || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="工序工时" span={1}>
                        {detail.baseInfo?.workHour != null ? detail.baseInfo.workHour + ' h' : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="制造周期" span={1}>
                        {detail.baseInfo?.manufactureCycle != null ? detail.baseInfo.manufactureCycle + ' h' : '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="加工单元" span={1}>
                        {detail.baseInfo?.workUnitName || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="是否生成计划" span={1}>
                        {detail.baseInfo?.isGeneratePlan || '-'}
                      </Descriptions.Item>
                      <Descriptions.Item label="状态" span={2}>
                        <Tag color={detail.baseInfo?.status === '正常' ? 'green' : 'default'}>
                          {detail.baseInfo?.status || '-'}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="备注" span={2}>
                        <pre
                          style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            margin: 0,
                            background: 'none',
                            border: 'none',
                            fontFamily: 'inherit',
                          }}
                        >
                          {detail.baseInfo?.remark || '-'}
                        </pre>
                      </Descriptions.Item>
                    </Descriptions>
                  </TabPane>

                  {/* 2. 工序内容 */}
                  <TabPane tab="工序内容" key="content">
                    <pre
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        padding: 16,
                        background: '#f6f6f6',
                        borderRadius: 4,
                        minHeight: 300,
                        margin: 0,
                      }}
                    >
                      {detail.content || '暂无工序内容'}
                    </pre>
                  </TabPane>

                  {/* 3. 工序要求 */}
                  <TabPane tab="工序要求" key="requirement">
                    <pre
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        padding: 16,
                        background: '#f6f6f6',
                        borderRadius: 4,
                        minHeight: 300,
                        margin: 0,
                      }}
                    >
                      {detail.requirement || '暂无工序要求'}
                    </pre>
                  </TabPane>

                  {/* 4. 注意事项 */}
                  <TabPane tab="注意事项" key="attention">
                    <pre
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        padding: 16,
                        background: '#f6f6f6',
                        borderRadius: 4,
                        minHeight: 300,
                        margin: 0,
                      }}
                    >
                      {detail.attention || '暂无注意事项'}
                    </pre>
                  </TabPane>

                  {/* 5. 工装设备 */}
                  <TabPane tab="工装设备" key="equipment">
                    <Table
                      dataSource={detail.equipment || []}
                      columns={equipmentColumns}
                      rowKey="index"
                      pagination={false}
                      size="small"
                      bordered
                      locale={{ emptyText: '暂无工装设备数据' }}
                    />
                  </TabPane>

                  {/* 6. 技术文档 */}
                  <TabPane tab="技术文档" key="document">
                    <Table
                      dataSource={detail.document || []}
                      columns={documentColumns}
                      rowKey="index"
                      pagination={false}
                      size="small"
                      bordered
                      locale={{ emptyText: '暂无技术文档数据' }}
                    />
                  </TabPane>

                  {/* 7. 备料清单 */}
                  <TabPane tab="备料清单" key="materialList">
                    <Table
                      dataSource={detail.materialList || []}
                      columns={materialColumns}
                      rowKey="index"
                      pagination={false}
                      size="small"
                      bordered
                      locale={{ emptyText: '暂无备料清单数据' }}
                    />
                  </TabPane>
                </Tabs>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
