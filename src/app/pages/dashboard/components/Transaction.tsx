"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Formik } from "formik";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button, SelectBox } from "@/app/components/FormElements";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  CustomPagination,
  NotFound,
  AddTransaction,
} from "@/app/components/index";
import { getCategoryDetails } from "@/app/lib/category";
import { getTransactions } from "@/app/lib/transaction";
import { Category, Transaction as TransactionType } from "@/app/types/appTypes";

const Transaction: React.FC = () => {
  const [isExpense, setIsExpense] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    limit: 10,
  });

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

  const fetchTransactions = useCallback(async (
    type: string,
    category: string,
    page: number = 1
  ) => {
    setLoading(true);
    try {
      const response = await getTransactions(
        type,
        category,
        page,
        10
      );
      if (response.success) {
        setTransactions(response.data || []);
        setPagination(prev => response.pagination || prev);
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
  }, []);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    fetchTransactions(isExpense ? "Expense" : "Income", value, 1);
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
  }, [isExpense, selectedCategory, currentPage, fetchTransactions]);

  return (
    <div className="w-full p-4 space-y-3">
      {/* Header with Switch */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Transactions Overview</h2>
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
              { key: "date", label: "Date", sortable: true },
              { key: "description", label: "Description" },
              { key: "category", label: "Category" },
              { key: "amount", label: "Amount", sortable: true },
              { key: "type", label: "Type" },
              {
                key: "actions",
                label: "Actions",
                render: () => (
                  <div className="flex gap-2">
                    <button
                      // onClick={() => handleEdit(row.id as number)}
                      className="p-1 hover:bg-background/10 hover:text-foreground rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      // onClick={() => handleDelete(row.id as number)}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ),
              },
            ]}
            title="Transaction Records"
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
        onOpenChange={setIsAddTransactionOpen}
      />
    </div>
  );
};

export default Transaction;
