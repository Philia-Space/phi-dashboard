// @ts-nocheck
import React, { useState } from 'react';
import { Input, Button, Card, Loading } from '@philiaspace/ui-primitives';
import type { DataTableProps, ColumnDef } from '../types';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export function DataTable<T extends object>({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  loading = false,
  pageSize: externalPageSize,
  total: externalTotal,
  onPageChange,
  onSearch,
  onSort,
  sortColumn,
  sortDirection,
  searchable = true,
  className,
  style,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(externalPageSize || 50);

  const pageSize = externalPageSize || internalPageSize;
  const total = externalTotal ?? data.length;
  const isServerMode = externalTotal !== undefined;

  const filtered = !isServerMode && search
    ? data.filter((row) =>
        columns.some((col) =>
          String(row[col.key as keyof T] || '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  const paged = isServerMode ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const handlePageSizeChange = (newSize: number) => {
    setInternalPageSize(newSize);
    setPage(1);
    onPageChange?.(1, newSize);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (onSearch) onSearch(value);
  };

  const handleSort = (colKey: string, colSortKey?: string) => {
    if (!onSort) return;
    const key = colSortKey || colKey;
    const newDir = sortColumn === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDir);
  };

  return (
    <Card className={className} style={style}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        {searchable && (
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ flex: 1 }}
          />
        )}
        {onEdit && (
          <Button variant="primary" size="sm">
            + Add New
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loading />
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      onClick={() => col.sortable && handleSort(String(col.key), col.sortKey)}
                      style={{
                        padding: '0.75rem',
                        textAlign: col.align || 'left',
                        fontWeight: 600,
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
                        cursor: col.sortable && onSort ? 'pointer' : 'default',
                        userSelect: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => { if (col.sortable && onSort) e.currentTarget.style.color = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {col.title}
                        {col.sortable && onSort && sortColumn === (col.sortKey || String(col.key)) && (
                          <span style={{ fontSize: '0.65rem', color: '#3b82f6' }}>
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                        {col.sortable && onSort && sortColumn !== (col.sortKey || String(col.key)) && (
                          <span style={{ fontSize: '0.65rem', color: '#475569' }}>▲▼</span>
                        )}
                      </span>
                    </th>
                  ))}
                  {(onEdit || onDelete) && <th style={{ padding: '0.75rem' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid #1e293b',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1e293b';
                      e.currentTarget.style.boxShadow = 'inset 3px 0 0 #3b82f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        style={{
                          padding: '0.75rem',
                          textAlign: col.align || 'left',
                          color: '#f8fafc',
                        }}
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.key as keyof T] || '-')}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {onEdit && (
                            <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button variant="danger" size="sm" onClick={() => onDelete(row)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {paged.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No records found
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderTop: '1px solid #1e293b', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Showing {from}–{to} of {total}
              </span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <button disabled={page <= 1} onClick={() => { setPage(1); onPageChange?.(1, pageSize); }} style={{ background: 'none', border: '1px solid #334155', color: page <= 1 ? '#475569' : '#f8fafc', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: page <= 1 ? 'default' : 'pointer' }}>First</button>
              <button disabled={page <= 1} onClick={() => { setPage(page - 1); onPageChange?.(page - 1, pageSize); }} style={{ background: 'none', border: '1px solid #334155', color: page <= 1 ? '#475569' : '#f8fafc', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: page <= 1 ? 'default' : 'pointer' }}>Prev</button>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0 0.5rem' }}>{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); onPageChange?.(page + 1, pageSize); }} style={{ background: 'none', border: '1px solid #334155', color: page >= totalPages ? '#475569' : '#f8fafc', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: page >= totalPages ? 'default' : 'pointer' }}>Next</button>
              <button disabled={page >= totalPages} onClick={() => { setPage(totalPages); onPageChange?.(totalPages, pageSize); }} style={{ background: 'none', border: '1px solid #334155', color: page >= totalPages ? '#475569' : '#f8fafc', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: page >= totalPages ? 'default' : 'pointer' }}>Last</button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
