// @ts-nocheck
import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: keyof T | string;
  title: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  sortKey?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  loading?: boolean;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  searchable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'email' | 'password';
  required?: boolean;
  placeholder?: string;
  rows?: number;
  options?: { value: string; label: string }[];
}

export interface CrudFormProps<T> {
  fields: FormField[];
  initialData?: Partial<T>;
  onSubmit: (data: T) => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  acceptedTypes?: string;
  maxSizeMB?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface SearchFilterProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface AdminLayoutProps {
  title: string;
  modules: { name: string; path: string; icon?: string }[];
  children: ReactNode;
  user?: { name: string; role: string };
  onLogout?: () => void;
}
