"use client";
import React, { useState } from "react";
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
}) => {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="w-full mt-10 text-foreground overflow-x-auto">
      {title && (
        <h3 className="text-xl font-semibold  mb-3">{title}</h3>
      )}
      <ShadcnTable className="bg-background border border-foreground min-w-full">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="text-lg font-bold">
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <button onClick={toggleSort} className="cursor-pointer">
                      {sortDirection === "asc" ? (
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
            <TableRow key={row[keyField] || index} className="hover:bg-foreground hover:text-background cursor-pointer transition-colors">
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.key === "amount"
                    ? `₹${row[column.key].toLocaleString()}`
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </ShadcnTable>
    </div>
  );
};