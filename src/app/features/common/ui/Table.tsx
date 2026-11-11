"use client";
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GenericTableProps } from "@/app/types/appTypes";

export const Table: React.FC<GenericTableProps> = ({
  data,
  columns,
  title,
  keyField = "id",
  onSort,
  sortBy,
  sortOrder,
}) => {

  return (
    <div className="w-full mt-2 text-foreground">
      {title && (
        <h3 className="text-base font-semibold mb-3 text-foreground">{title}</h3>
      )}

      {/* Mobile-friendly stacked cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, index) => (
          <div
            key={`mobile-${String(row[keyField] || index)}`}
            className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 shadow-sm"
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground shrink-0 font-medium">
                  {column.label}
                </span>
                <div className="text-right min-w-0 break-words">
                  {column.render
                    ? column.render(row[column.key], row)
                    : column.key === "amount"
                      ? row[column.key]?.toLocaleString()
                      : row[column.key]
                        ? String(row[column.key])
                        : ""}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
      <ShadcnTable className="bg-card border border-border min-w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.key} className="text-sm font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <button onClick={() => onSort && onSort(column.key)} className="cursor-pointer">
                      {sortBy === column.key && sortOrder === "asc" ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={String(row[keyField] || index)} className="hover:bg-btn-background/10 transition-colors">
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render
                    ? column.render(row[column.key], row)
                    : column.key === "amount"
                    ? row[column.key]?.toLocaleString()
                    : row[column.key] ? String(row[column.key]) : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </ShadcnTable>
      </div>
    </div>
  );
};