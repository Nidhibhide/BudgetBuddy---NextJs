"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Formik } from "formik";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button, SelectBox } from "@/app/components/Elements";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  CustomPagination,
  NotFound,
  AddTransaction,
  Confirmation,
} from "@/app/components/index";
import { deleteTransaction } from "@/app/lib/transaction";
import { Transaction as TransactionType } from "@/app/types/appTypes";
import { showSuccess, showError } from "@/app/components/Utils";
import { useCategories, useTransactions } from "@/app/hooks";

const Transaction: React.FC = React.memo(() => {
  const { data: session } = useSession();
  const [isExpense, setIsExpense] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editTransactionData, setEditTransactionData] =
    useState<TransactionType | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const currentType = isExpense ? "Expense" : "Income";
  const { categories } = useCategories(currentType);
  const { transactions, loading, pagination, refetch: refetchTransactions } = useTransactions({
    type: currentType,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    page: currentPage,
    limit: 10,
    sortBy,
    sortOrder,
  });

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  }, [sortBy, sortOrder]);

  const handleEditClick = (transaction: TransactionType) => {
    setEditTransactionData(transaction);
    setIsAddTransactionOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTransactionId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTransactionId) return;

    setDeleting(true);
    try {
      const response = await deleteTransaction(deleteTransactionId);
      if (response.success) {
        showSuccess(response.message);
        // Refresh transactions
        refetchTransactions();
        setDeleteTransactionId(null);
      } else {
        showError(response.message || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      showError("An unexpected error occurred while deleting the transaction");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    setSelectedCategory("All");
    setCurrentPage(1);
  }, [isExpense]);

  return (
    <div className="w-full p-4 space-y-3">
      {/* Header with Switch */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Transactions Overview
        </h2>
        <div className="flex items-center space-x-3">
          <Label
            htmlFor="expense-income-switch"
            className="text-base font-medium text-foreground"
          >
            {isExpense ? "Expense" : "Income"}
          </Label>
          <Switch
            id="expense-income-switch"
            checked={isExpense}
            onCheckedChange={setIsExpense}
            className="bg-foreground"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-end">
          <Formik
            initialValues={{ category: selectedCategory }}
            onSubmit={() => {}}
          >
            {() => (
              <div className="w-full sm:w-[180px]">
                <SelectBox
                  name="category"
                  options={["All", ...categories.map((cat) => cat.name)]}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                />
              </div>
            )}
          </Formik>

          <Button
            width="w-full sm:w-[180px]"
            className="flex items-center justify-center gap-2"
            onClick={() => setIsAddTransactionOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      ) : transactions.length > 0 ? (
        <>
          <Table
            data={transactions as TransactionType[]}
            columns={[
              {
                key: "date",
                label: "Date",
                sortable: true,
                render: (value) =>
                  value
                    ? new Date(
                        value as string | number | Date
                      ).toLocaleDateString("en-GB")
                    : "",
              },
              { key: "description", label: "Description" },
              { key: "category", label: "Category" },
              {
                key: "amount",
                label: "Amount",
                sortable: true,
                render: (value) => {
                  const currency = session?.user?.currency || "INR";
                  return `${value} ${currency}`;
                },
              },
              { key: "type", label: "Type" },
              {
                key: "actions",
                label: "Actions",
                render: (value, row) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(row as TransactionType)}
                      className="p-1 hover:bg-background/10  rounded transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(row._id as string)}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ),
              },
            ]}
            title="Transaction Records"
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />

          {/* Pagination */}
          <div className="flex justify-end mt-4">
            <CustomPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              className="justify-end"
            />
          </div>
        </>
      ) : (
        <NotFound
          title="No Transactions Found"
          message="It looks like there are no transactions matching your current filters. Try selecting a different category or add your first transaction to get started!"
        />
      )}

      <AddTransaction
        open={isAddTransactionOpen}
        onOpenChange={(open) => {
          setIsAddTransactionOpen(open);
          if (!open) setEditTransactionData(null);
        }}
        transaction={editTransactionData}
        onTransactionAdded={() => {
          setCurrentPage(1);
          refetchTransactions();
        }}
      />

      <Confirmation
        open={!!deleteTransactionId}
        onOpenChange={(open) => !open && setDeleteTransactionId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
});

Transaction.displayName = 'Transaction';

export default Transaction;
