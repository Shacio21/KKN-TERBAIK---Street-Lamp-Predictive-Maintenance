import { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, DatabaseIcon } from 'lucide-react';
import { SkeletonTable } from './Skeleton';
import EmptyState from './EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  pagination,
  onPageChange,
  onSort,
  emptyMessage = 'Tidak ada data untuk ditampilkan',
  onRowClick,
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = useCallback((key) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  }, [sortKey, sortDir, onSort]);

  if (isLoading) return <SkeletonTable rows={8} cols={columns.length || 5} />;

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;
  const currentPage = pagination?.page || 1;

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground ${col.className || ''}`}
              >
                {col.sortable ? (
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors group uppercase h-auto p-1 font-semibold text-xs text-muted-foreground"
                  >
                    {col.label}
                    <span className="text-muted-foreground group-hover:text-foreground">
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </span>
                  </Button>
                ) : (
                  col.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <EmptyState
                  icon={DatabaseIcon}
                  title="Tidak Ada Data"
                  description={emptyMessage}
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow
                key={row.id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`border-border/40 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={`py-3 text-sm text-foreground/80 ${col.className || ''}`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? '-')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
          <span className="text-muted-foreground">
            Menampilkan {Math.min((currentPage - 1) * pagination.pageSize + 1, pagination.total)}–
            {Math.min(currentPage * pagination.pageSize, pagination.total)} dari {pagination.total} data
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'outline' : 'ghost'}
                  size="icon-sm"
                  onClick={() => onPageChange?.(page)}
                  className={page === currentPage ? 'border-primary text-primary' : ''}
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
