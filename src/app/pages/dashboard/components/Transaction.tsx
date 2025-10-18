"use client";

import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button, SelectBox } from "@/app/components/FormElements";
import { Plus, Edit, Trash2, SearchX } from "lucide-react";
import { TYPES, CATEGORY_LIST } from "@/lib/constants";
import { Table, CustomPagination, NotFound, AddTransaction } from "@/app/components/index";

interface TransactionRecord extends Record<string, string | number> {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: string;
}

const dummyTransactions: TransactionRecord[] = [
  {
    id: 1,
    date: "2023-10-01",
    description: "Grocery shopping",
    category: "Groceries",
    amount: 500,
    type: "Expense",
  },
  {
    id: 2,
    date: "2023-10-02",
    description: "Bus fare",
    category: "Transport",
    amount: 200,
    type: "Expense",
  },
  {
    id: 3,
    date: "2023-10-03",
    description: "Weekly groceries",
    category: "Groceries",
    amount: 800,
    type: "Expense",
  },
  {
    id: 4,
    date: "2023-10-04",
    description: "Movie tickets",
    category: "Entertainment",
    amount: 300,
    type: "Expense",
  },
  {
    id: 5,
    date: "2023-10-05",
    description: "Clothing",
    category: "Shopping",
    amount: 1200,
    type: "Expense",
  },
  {
    id: 6,
    date: "2023-10-06",
    description: "Monthly salary",
    category: "Salary",
    amount: 50000,
    type: "Income",
  },
  {
    id: 7,
    date: "2023-10-07",
    description: "Taxi",
    category: "Transport",
    amount: 800,
    type: "Expense",
  },
  {
    id: 8,
    date: "2023-10-08",
    description: "Fruits and vegetables",
    category: "Groceries",
    amount: 600,
    type: "Expense",
  },
  {
    id: 9,
    date: "2023-10-09",
    description: "Concert",
    category: "Entertainment",
    amount: 200,
    type: "Expense",
  },
  {
    id: 10,
    date: "2023-10-10",
    description: "Electronics",
    category: "Shopping",
    amount: 1500,
    type: "Expense",
  },
  {
    id: 11,
    date: "2023-10-11",
    description: "Fuel",
    category: "Transport",
    amount: 400,
    type: "Expense",
  },
  {
    id: 12,
    date: "2023-10-12",
    description: "Web development project",
    category: "Freelance",
    amount: 10000,
    type: "Income",
  },
  {
    id: 13,
    date: "2023-10-13",
    description: "Dairy products",
    category: "Groceries",
    amount: 400,
    type: "Expense",
  },
  {
    id: 14,
    date: "2023-10-14",
    description: "Investment returns",
    category: "Investment",
    amount: 2500,
    type: "Income",
  },
  {
    id: 15,
    date: "2023-10-15",
    description: "Restaurant dinner",
    category: "Entertainment",
    amount: 1500,
    type: "Expense",
  },
];

const Transaction: React.FC = () => {
  const [isExpense, setIsExpense] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const itemsPerPage = 5;

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const filteredTransactions = dummyTransactions.filter((transaction) => {
    const matchesType = isExpense
      ? transaction.type === "Expense"
      : transaction.type === "Income";
    const matchesCategory =
      selectedCategory === "All" || transaction.category === selectedCategory;
    return matchesType && matchesCategory;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (id: number) => {
    console.log("Edit transaction:", id);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: number) => {
    console.log("Delete transaction:", id);
    // TODO: Implement delete functionality
  };

  return (
    <div className="w-full p-4 space-y-3">
      {/* Header with Switch */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
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
                  options={["All", ...CATEGORY_LIST]}
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
      {filteredTransactions.length > 0 ? (
        <>
          <Table
            data={paginatedTransactions}
            columns={[
              { key: "date", label: "Date", sortable: true },
              { key: "description", label: "Description" },
              { key: "category", label: "Category" },
              { key: "amount", label: "Amount", sortable: true },
              { key: "type", label: "Type" },
              {
                key: "actions",
                label: "Actions",
                render: (value, row) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(row.id as number)}
                      className="p-1 hover:bg-background/10 hover:text-foreground rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id as number)}
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
              currentPage={currentPage}
              totalPages={Math.ceil(filteredTransactions.length / itemsPerPage)}
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
