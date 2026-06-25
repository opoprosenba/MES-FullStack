// apps/mes-new/src/pages/basedata/parts/PartsForm.tsx
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Label, Select, Switch, Textarea, toast } from '@workspace/ui'
import { Cpu, Info } from 'lucide-react'
import FormDialog, { FormSection } from '@/components/FormDialog'
import FormField from '@/components/FormField'
import { useQuery$, useMutation$ } from '@/http/hooks'
import { invalidate } from '@/http/queryCache'
import { partsAddOrUpdate, partsCategoryTree } from '@/api/basedata/parts'
import type { SpParts, SpPartsCategory } from '@/types/basedata'

const UNIT_OPTIONS = [
  { label: '个', value: '个' },
  { label: '件', value: '件' },
  { label: '千克', value: '千克' },
  { label: '克', value: '克' },
  { label: '米', value: '米' },
  { label: '厘米', value: '厘米' },
  { label: '毫米', value: '毫米' },
  { label: '升', value: '升' },
  { label: '套', value: '套' },
  { label: '箱', value: '箱' },
  { label: '卷', value: '卷' },
  { label: '张', value: '张' },
]

const PARTS_TYPE_OPTIONS = [
  { label: '自制件', value: 1 },
  { label: '外购件', value: 2 },
  { label: '外协件', value: 3 },
]

const schema = z.object({
  partCode: z.string().optional(),
  partName: z.string().min(1, '请输入零部件名称'),
  spec: z.string().optional(),
  unit: z.string().optional(),
  categoryId: z.number().nullable().optional(),
  partsType: z.number().optional(),
  drawingNo: z.string().optional(),
  version: z.string().optional(),
  batchFlag: z.boolean(),
  safeStock: z.number().min(0).optional(),
  remark: z.string().optional(),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: SpParts | null
}

export default function PartsForm({ open, onOpenChange, record }: Props) {
  const isEdit = !!record
  const { mutate, loading } = useMutation$((dto: Partial<SpParts>) => partsAddOrUpdate(dto))
  const { data: categories } = useQuery$(['basedata', 'parts', 'category', 'tree'], () => partsCategoryTree(), { enabled: open })

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      partCode: '', partName: '', spec: '', unit: '', categoryId: null,
      partsType: 1, drawingNo: '', version: 'V1.0', batchFlag: false,
      safeStock: 0, remark: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        partCode: record?.partCode ?? '',
        partName: record?.partName ?? '',
        spec: record?.spec ?? '',
        unit: record?.unit ?? '',
        categoryId: record?.categoryId ?? null,
        partsType: record?.partsType ?? 1,
        drawingNo: record?.drawingNo ?? '',
        version: record?.version ?? 'V1.0',
        batchFlag: record?.batchFlag === 1,
        safeStock: record?.safeStock ?? 0,
        remark: record?.remark ?? '',
      })
    }
  }, [open, record, reset])

  const onSubmit = handleSubmit(async (values) => {
    const dto: Partial<SpParts> = {
      ...(record ?? {}),
      partCode: values.partCode || undefined,
      partName: values.partName,
      spec: values.spec || undefined,
      unit: values.unit || undefined,
      categoryId: values.categoryId ?? undefined,
      partsType: values.partsType,
      drawingNo: values.drawingNo || undefined,
      version: values.version || 'V1.0',
      batchFlag: values.batchFlag ? 1 : 0,
      safeStock: values.safeStock ?? 0,
      remark: values.remark || undefined,
    }
    try {
      await mutate(dto)
      toast.success(isEdit ? '修改成功' : '新增成功')
      invalidate('["basedata","parts"')
      onOpenChange(false)
    } catch { /* 拦截器已 toast */ }
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? '编辑零部件' : '新增零部件'}
      description="维护零部件主数据"
      icon={Cpu}
      onSubmit={onSubmit}
      submitting={loading}
    >
      <FormSection title="基本信息" icon={Info}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="零部件编号" htmlFor="p-code">
            <Input id="p-code" placeholder="留空自动生成" disabled={isEdit} {...register('partCode')} />
          </FormField>
          <FormField label="零部件名称" htmlFor="p-name" required error={errors.partName?.message}>
            <Input id="p-name" aria-invalid={!!errors.partName} {...register('partName')} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="规格型号" htmlFor="p-spec">
            <Input id="p-spec" placeholder="如: Φ10×100" {...register('spec')} />
          </FormField>
          <FormField label="计量单位" htmlFor="p-unit">
            <Controller
              control={control}
              name="unit"
              render={({ field }) => (
                <Select
                  id="p-unit"
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  options={UNIT_OPTIONS.map(o => ({ label: o.label, value: o.value }))}
                  placeholder="请选择单位"
                />
              )}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="物料分类" htmlFor="p-cat">
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  id="p-cat"
                  value={field.value?.toString() ?? ''}
                  onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                  options={(categories ?? []).map((c: SpPartsCategory) => ({
                    label: (c.parentId && c.parentId > 0 ? '　' : '') + c.categoryName,
                    value: c.id.toString(),
                  }))}
                  placeholder="请选择分类"
                />
              )}
            />
          </FormField>
          <FormField label="物料类型" htmlFor="p-type">
            <Controller
              control={control}
              name="partsType"
              render={({ field }) => (
                <Select
                  id="p-type"
                  value={field.value?.toString() ?? '1'}
                  onValueChange={(v) => field.onChange(Number(v))}
                  options={PARTS_TYPE_OPTIONS.map(o => ({ label: o.label, value: o.value.toString() }))}
                />
              )}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="零件图号" htmlFor="p-dno">
            <Input id="p-dno" {...register('drawingNo')} />
          </FormField>
          <FormField label="设计版本号" htmlFor="p-ver">
            <Input id="p-ver" placeholder="V1.0" {...register('version')} />
          </FormField>
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="p-batch">批次管理</Label>
          <Controller
            control={control}
            name="batchFlag"
            render={({ field }) => <Switch id="p-batch" checked={field.value} onCheckedChange={field.onChange} />}
          />
        </div>

        <FormField label="安全库存" htmlFor="p-ss">
          <Input id="p-ss" type="number" min={0} step={0.01} {...register('safeStock', { valueAsNumber: true })} />
        </FormField>

        <FormField label="备注说明" htmlFor="p-remark">
          <Textarea id="p-remark" rows={2} {...register('remark')} />
        </FormField>
      </FormSection>
    </FormDialog>
  )
}