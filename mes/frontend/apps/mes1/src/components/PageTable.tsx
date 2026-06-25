import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { TableRowSelection } from 'antd/es/table/interface'
import type { ReactNode } from 'react'

interface PageTableProps<T> {
  columns: ColumnsType<T>
  dataSource: T[]
  loading: boolean
  total: number
  pagination?: {
    current: number
    pageSize: number
  } | false
  onChange?: (pagination: { current: number; pageSize: number }) => void
  rowKey?: string
  rowSelection?: TableRowSelection<T>
  toolbar?: ReactNode
  scroll?: { x?: number; y?: number }
  onRow?: (record: T) => { onClick?: () => void; style?: React.CSSProperties }
  rowClassName?: (record: T, index: number) => string
}

function PageTable<T extends object>({
  columns,
  dataSource,
  loading,
  total,
  pagination,
  onChange,
  rowKey = 'id',
  rowSelection,
  toolbar,
  scroll,
  onRow,
  rowClassName,
}: PageTableProps<T>) {
  const paginationConfig = pagination === false ? false : pagination ? {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total,
    showTotal: (totalItems: number) => `共 ${totalItems} 条`,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  } : false

  return (
    <div>
      {toolbar && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {toolbar}
        </div>
      )}

      <Table<T>
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={paginationConfig}
        onChange={(pag) => {
          if (pagination !== false && pag.current && pag.pageSize && onChange) {
            onChange({ current: pag.current, pageSize: pag.pageSize })
          }
        }}
        rowSelection={rowSelection}
        scroll={scroll}
        onRow={onRow}
        rowClassName={rowClassName}
      />
    </div>
  )
}

export default PageTable
