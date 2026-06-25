// apps/mes-new/src/pages/basedata/parts/PartsList.tsx
import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  DataTable,
  Input,
  Label,
  Select,
  Switch,
  toast,
} from '@workspace/ui'
import { Cpu, Pencil, Plus, Trash2 } from 'lucide-react'
import PageContainer from '@/components/PageContainer'
import SearchForm from '@/components/SearchForm'
import PermissionGuard from '@/components/PermissionGuard'
import PartsForm from './PartsForm'
import { useQuery$, useMutation$ } from '@/http/hooks'
import { invalidate } from '@/http/queryCache'
import { partsPage, partsDelete, partsSwitchStatus, partsCategoryTree } from '@/api/basedata/parts'
import type { PartsPageParams } from '@/api/basedata/parts'
import type { SpParts } from '@/types/basedata'

const PAGE_SIZE = 10
const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '正常', value: '正常' },
  { label: '禁用', value: '禁用' },
]
const PARTS_TYPE_LABELS: Record<number, string> = { 1: '自制件', 2: '外购件', 3: '外协件' }
const UNIT_LABELS: Record<string, string> = {
  '个': '个', '件': '件', '千克': '千克', '克': '克', '米': '米',
  '厘米': '厘米', '毫米': '毫米', '升': '升', '套': '套', '箱': '箱', '卷': '卷', '张': '张',
}

export default function PartsList() {
  const [params, setParams] = useState<PartsPageParams>({ current: 1, size: PAGE_SIZE })
  const [draftCode, setDraftCode] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftStatus, setDraftStatus] = useState('')
  const [draftCategoryId, setDraftCategoryId] = useState<number | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SpParts | null>(null)
  const [deleting, setDeleting] = useState<SpParts | null>(null)

  const { data, loading } = useQuery$(['basedata', 'parts', 'page', params], () => partsPage(params))
  const { data: categories } = useQuery$(['basedata', 'parts', 'category', 'tree'], () => partsCategoryTree())
  const { mutate: removeParts } = useMutation$((id: string) => partsDelete(id))
  const { mutate: toggleStatus } = useMutation$(({ id, status }: { id: string; status: string }) => partsSwitchStatus(id, status))

  const onSearch = () =>
    setParams({ current: 1, size: PAGE_SIZE, partCode: draftCode || undefined, partName: draftName || undefined, status: draftStatus || undefined, categoryId: draftCategoryId })

  const onReset = () => {
    setDraftCode(''); setDraftName(''); setDraftStatus(''); setDraftCategoryId(undefined)
    setParams({ current: 1, size: PAGE_SIZE })
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await removeParts(deleting.id)
      toast.success('删除成功')
      invalidate('["basedata","parts"')
    } catch { /* 拦截器已 toast */ } finally { setDeleting(null) }
  }

  const handleToggleStatus = async (record: SpParts) => {
    const newStatus = record.status === '正常' ? '禁用' : '正常'
    try {
      await toggleStatus({ id: record.id, status: newStatus })
      toast.success(newStatus === '正常' ? '已启用' : '已禁用')
      invalidate('["basedata","parts"')
    } catch { /* 拦截器已 toast */ }
  }

  const columns = useMemo<ColumnDef<SpParts>[]>(
    () => [
      { accessorKey: 'partCode', header: '零部件编号', size: 140 },
      { accessorKey: 'partName', header: '零部件名称', size: 150 },
      { accessorKey: 'spec', header: '规格型号', cell: ({ row }) => row.original.spec || '—', size: 100 },
      { accessorKey: 'unit', header: '单位', cell: ({ row }) => row.original.unit || '—', size: 60 },
      {
        accessorKey: 'categoryId', header: '物料分类', size: 100,
        cell: ({ row }) => {
          const cat = categories?.find((c) => c.id === row.original.categoryId)
          return cat?.categoryName || '—'
        },
      },
      {
        accessorKey: 'partsType', header: '物料类型', size: 90,
        cell: ({ row }) => PARTS_TYPE_LABELS[row.original.partsType ?? 1] || '—',
      },
      {
        accessorKey: 'status', header: '状态', size: 80,
        cell: ({ row }) => (
          <Badge variant={row.original.status === '正常' ? 'secondary' : 'destructive'}>
            {row.original.status || '—'}
          </Badge>
        ),
      },
      { accessorKey: 'createTime', header: '创建时间', cell: ({ row }) => row.original.createTime ?? '—', size: 160 },
      {
        id: 'actions', header: '操作', size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(row.original); setFormOpen(true) }}>
              <Pencil className="size-4" />
            </Button>
            <PermissionGuard perm="basedata:parts:delete">
              <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(row.original)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </PermissionGuard>
            <Switch
              checked={row.original.status === '正常'}
              onCheckedChange={() => handleToggleStatus(row.original)}
            />
          </div>
        ),
      },
    ],
    [categories],
  )

  return (
    <PageContainer
      title="零部件管理"
      description="维护零部件主数据与分类"
      actions={
        <PermissionGuard perm="basedata:parts:add">
          <Button onClick={() => { setEditing(null); setFormOpen(true) }}>
            <Plus className="size-4" />
            新增零部件
          </Button>
        </PermissionGuard>
      }
    >
      <div className="flex gap-6">
        {/* 左侧分类树 */}
        <div className="w-48 shrink-0 rounded-md border p-3">
          <div className="mb-2 text-sm font-medium">物料分类</div>
          <div className="space-y-0.5 text-sm">
            <button
              className={`block w-full rounded px-2 py-1 text-left hover:bg-accent ${!draftCategoryId ? 'bg-accent font-medium' : ''}`}
              onClick={() => { setDraftCategoryId(undefined); setParams(p => ({ ...p, current: 1, categoryId: undefined })) }}
            >
              全部分类
            </button>
            {(categories ?? []).filter(c => !c.parentId || c.parentId === 0).map((cat) => (
              <button
                key={cat.id}
                className={`block w-full rounded px-2 py-1 text-left hover:bg-accent ${draftCategoryId === cat.id ? 'bg-accent font-medium' : ''}`}
                onClick={() => { setDraftCategoryId(cat.id); setParams(p => ({ ...p, current: 1, categoryId: cat.id })) }}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        </div>

        {/* 右侧列表 */}
        <div className="flex-1 min-w-0">
          <SearchForm onSearch={onSearch} onReset={onReset}>
            <div className="space-y-1.5">
              <Label htmlFor="s-pcode">零部件编号</Label>
              <Input id="s-pcode" className="h-9 w-36" value={draftCode} onChange={(e) => setDraftCode(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-pname">零部件名称</Label>
              <Input id="s-pname" className="h-9 w-36" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-pstatus">状态</Label>
              <Select
                id="s-pstatus"
                className="h-9 w-28"
                value={draftStatus}
                onValueChange={setDraftStatus}
                options={STATUS_OPTIONS.map(o => ({ label: o.label, value: o.value }))}
              />
            </div>
          </SearchForm>

          <DataTable
            columns={columns}
            data={data?.records ?? []}
            loading={loading}
            loadingRowCount={PAGE_SIZE}
            pagination={{
              mode: 'server',
              pageIndex: (data?.current ?? params.current) - 1,
              pageSize: PAGE_SIZE,
              totalPages: data?.pages ?? 1,
              totalRows: data?.total,
              onPageChange: (idx) => setParams((p) => ({ ...p, current: idx + 1 })),
            }}
          />
        </div>
      </div>

      <PartsForm open={formOpen} onOpenChange={setFormOpen} record={editing} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除零部件「{deleting?.partName}」吗?此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}