import { useEffect, useState } from 'react'
import { Form, Input, Radio, Select, InputNumber, Upload, message, Row, Col, Divider } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd/es/form'
import * as flowApi from '@/api/technology/flow'
import type { Flow } from '@/types/common'

interface MaterileFormProps {
  id?: string | null
  record?: any | null
  onFinish?: (values: any) => void
  formInstance: FormInstance
}

const MAT_TYPE_OPTIONS = ['产品', '零件', '标准件', '其他']
const SOURCE_OPTIONS = ['自制', '外购']

const TYPE_DEFAULTS: Record<string, { source: string; leadTime: number }> = {
  '产品': { source: '自制', leadTime: 3 },
  '零件': { source: '外购', leadTime: 1 },
  '标准件': { source: '外购', leadTime: 1 },
  '其他': { source: '外购', leadTime: 1 },
}

function MaterileForm({ id, record, onFinish, formInstance }: MaterileFormProps) {
  const [flowOptions, setFlowOptions] = useState<Flow[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    flowApi.flowList().then((res: any) => {
      setFlowOptions(Array.isArray(res) ? res : [])
    })
  }, [])

  useEffect(() => {
    if (id && record) {
      formInstance.setFieldsValue(record)
      setImageUrl(record.imageUrl || null)
    } else if (!id) {
      formInstance.resetFields()
      setImageUrl(null)
    }
  }, [id, record, formInstance])

  const handleFinish = (values: any) => {
    onFinish?.({ ...values, imageUrl })
  }

  const handleTypeChange = (matType: string) => {
    const defaults = TYPE_DEFAULTS[matType]
    if (defaults) {
      formInstance.setFieldsValue({ source: defaults.source, leadTime: defaults.leadTime })
    }
  }

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { default: client } = await import('@/api/client')
      const res = await client.post('/basedata/materile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = (res as any)?.url || ''
      setImageUrl(url)
      onSuccess?.({ url }, file)
      message.success('上传成功')
    } catch {
      onError?.(new Error('上传失败'))
      message.error('上传失败')
    }
  }

  return (
    <Form
      form={formInstance}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ deleted: '0', leadTime: 1, safetyStock: 0, matType: '产品', source: '自制' }}
    >
      <Divider plain style={{ fontSize: 13, marginTop: 0 }}>基本信息</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="materiel" label="物料编码" tooltip="新增时由系统自动生成">
            <Input placeholder="自动生成" disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="matType" label="物料类型" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="请选择物料类型" onChange={handleTypeChange}>
              {MAT_TYPE_OPTIONS.map((t) => (
                <Select.Option key={t} value={t}>{t}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="materielDesc" label="物料名称" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入物料名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="model" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
        </Col>
      </Row>

      <Divider plain style={{ fontSize: 13 }}>属性信息</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="unit" label="计量单位">
            <Input placeholder="例如：个、台、件、套" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="material" label="材质">
            <Select placeholder="请选择材质" allowClear>
              <Select.Option value="钢材">钢材</Select.Option>
              <Select.Option value="铝合金">铝合金</Select.Option>
              <Select.Option value="塑料">塑料</Select.Option>
              <Select.Option value="铜">铜</Select.Option>
              <Select.Option value="木材">木材</Select.Option>
              <Select.Option value="玻璃">玻璃</Select.Option>
              <Select.Option value="电子元件">电子元件</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="leadTime" label="需求提前期(天)" rules={[{ required: true, message: '请输入' }]}
            extra={<span style={{ color: '#ff4d4f' }}>最小值为1天</span>}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="safetyStock" label="安全库存" extra="可设置为0">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="source" label="物料来源" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="请选择物料来源" allowClear>
              {SOURCE_OPTIONS.map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="flowId" label="关联工艺">
            <Select placeholder="请选择工艺" allowClear>
              {flowOptions.map((f) => (
                <Select.Option key={f.id} value={f.id}>{f.flow} - {f.flowDesc}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider plain style={{ fontSize: 13 }}>其他信息</Divider>

      <Form.Item name="remark" label="备注信息">
        <Input.TextArea rows={2} placeholder="请输入备注信息" />
      </Form.Item>

      <Form.Item name="deleted" label="状态" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio value="0">正常</Radio>
          <Radio value="2">禁用</Radio>
        </Radio.Group>
      </Form.Item>

      <Divider plain style={{ fontSize: 13 }}>图片上传</Divider>

      <Form.Item label="物料图片" extra="支持 JPG、PNG 格式，大小不超过 2MB">
        <Upload
          accept=".jpg,.jpeg,.png"
          listType="picture-card"
          showUploadList={false}
          customRequest={handleUpload}
          beforeUpload={(file) => {
            const isImage = file.type.startsWith('image/')
            if (!isImage) { message.error('仅支持图片文件'); return Upload.LIST_IGNORE }
            const isLt2M = file.size / 1024 / 1024 < 2
            if (!isLt2M) { message.error('图片大小不能超过2MB'); return Upload.LIST_IGNORE }
            return true
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="物料图片" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
          ) : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传图片</div>
            </div>
          )}
        </Upload>
        {imageUrl && (
          <a onClick={() => setImageUrl(null)} style={{ display: 'block', marginTop: 4, color: '#ff4d4f', fontSize: 12 }}>
            移除图片
          </a>
        )}
      </Form.Item>
    </Form>
  )
}

export default MaterileForm
