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
import { getCategoryDetails } from "@/app/lib/category";
import { getTransactions, deleteTransaction } from "@/app/lib/transaction";
import { Category, Transaction as TransactionType } from "@/app/types/appTypes";
import { showSuccess, showError } from "@/app/components/Utils";

const Transaction: React.FC = () => {
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    limit: 10,
  });
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchCategories = async (type: string) => {
    try {
      const response = await getCategoryDetails(type);
      if (response.success) {
        setCategories(response.data || []);
      } else {
        console.error("Failed to fetch categories:", response.message);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchTransactions = useCallback(
    async (
      type: string,
      category: string,
      page: number = 1,
      sortByParam?: string,
      sortOrderParam?: "asc" | "desc"
    ) => {
      setLoading(true);
      try {
        const response = await getTransactions(
          type,
          category,
          page,
          10,
          sortByParam || sortBy,
          sortOrderParam || sortOrder
        );
        if (response.success) {
          setTransactions(response.data || []);
          setPagination((prev) => response.pagination || prev);
        } else {
          console.error("Failed to fetch transactions:", response.message);
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [sortBy, sortOrder]
  );

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleEditClick = (transaction: TransactionType) => {
    setEditTransactionData(transaction);
    setIsAddTransactionOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTransactionId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTransactionId) return;

    try {
      const response = await deleteTransaction(deleteTransactionId);
      if (response.success) {
        showSuccess(response.message);
        // Refresh transactions
        fetchTransactions(
          isExpense ? "Expense" : "Income",
          selectedCategory,
          currentPage
        );
        setDeleteTransactionId(null);
      } else {
        showError(response.message || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      showError("An unexpected error occurred while deleting the transaction");
    }
  };

  useEffect(() => {
    setSelectedCategory("All");
    setCurrentPage(1);
  }, [isExpense]);

  useEffect(() => {
    const type = isExpense ? "Expense" : "Income";
    fetchCategories(type);
  }, [isExpense]);

  useEffect(() => {
    const type = isExpense ? "Expense" : "Income";
    fetchTransactions(type, selectedCategory, currentPage);
  }, [
    isExpense,
    selectedCategory,
    currentPage,
    sortBy,
    sortOrder,
    fetchTransactions,
    session?.user?.currency,
  ]);

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
          <Loader2 className="w-8 h-8 animate-spin" />
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
          fetchTransactions(
            isExpense ? "Expense" : "Income",
            selectedCategory,
            1
          );
        }}
      />

      <Confirmation
        open={!!deleteTransactionId}
        onOpenChange={(open) => !open && setDeleteTransactionId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Transaction;
