"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, ArrowUp } from "lucide-react";
import { TYPES, CATEGORY_LIST } from "@/lib/constants";
import { AddCategory, CustomPagination } from "@/app/components/index";
import { Table } from "@/app/components/index";

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

const dummyExpenseData: CategoryData[] = [
  { name: "Shopping", amount: 2500, percentage: 40 },
  { name: "Transport", amount: 1200, percentage: 20 },
  { name: "Groceries", amount: 1800, percentage: 30 },
  { name: "Entertainment", amount: 500, percentage: 10 },
];

const dummyIncomeData: CategoryData[] = [
  { name: "Salary", amount: 50000, percentage: 80 },
  { name: "Freelance", amount: 10000, percentage: 15 },
  { name: "Investment", amount: 2500, percentage: 4 },
];

interface CategoryRecord extends Record<string, string | number> {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
}

const dummyShoppingRecords: CategoryRecord[] = [
  {
    id: 1,
    date: "2023-10-01",
    description: "Grocery shopping",
    amount: 500,
    type: "Expense",
  },
  {
    id: 2,
    date: "2023-10-05",
    description: "Clothing",
    amount: 1200,
    type: "Expense",
  },
  {
    id: 3,
    date: "2023-10-10",
    description: "Electronics",
    amount: 1500,
    type: "Expense",
  },
];

const dummyTransportRecords: CategoryRecord[] = [
  {
    id: 1,
    date: "2023-10-02",
    description: "Bus fare",
    amount: 200,
    type: "Expense",
  },
  {
    id: 2,
    date: "2023-10-07",
    description: "Taxi",
    amount: 800,
    type: "Expense",
  },
  {
    id: 3,
    date: "2023-10-12",
    description: "Fuel",
    amount: 400,
    type: "Expense",
  },
];

const dummyGroceriesRecords: CategoryRecord[] = [
  {
    id: 1,
    date: "2023-10-03",
    description: "Weekly groceries",
    amount: 800,
    type: "Expense",
  },
  {
    id: 2,
    date: "2023-10-08",
    description: "Fruits and vegetables",
    amount: 600,
    type: "Expense",
  },
  {
    id: 3,
    date: "2023-10-13",
    description: "Dairy products",
    amount: 400,
    type: "Expense",
  },
];

const dummyEntertainmentRecords: CategoryRecord[] = [
  {
    id: 1,
    date: "2023-10-04",
    description: "Movie tickets",
    amount: 300,
    type: "Expense",
  },
  {
    id: 2,
    date: "2023-10-09",
    description: "Concert",
    amount: 200,
    type: "Expense",
  },
];

const dummySalaryRecords: CategoryRecord[] = [
  {
    id: 1,
    date: "2023-10-01",
    description: "Monthly salary",
    amount: 50000,
    type: "Income",
  },
];

const dummyFreelanceRecords: CategoryRecord[] = [
  {
    id: 1,
    date: "2023-10-15",
    description: "Web development project",
    amount: 10000,
    type: "Income",
  },
];

const dummyInvestmentRecords: CategoryRecord[] = [
  {
    id: 1,
    date: "2023-10-20",
    description: "Stock dividends",
    amount: 2500,
    type: "Income",
  },
];

const getRecordsForCategory = (categoryName: string): CategoryRecord[] => {
  switch (categoryName) {
    case "Shopping":
      return dummyShoppingRecords;
    case "Transport":
      return dummyTransportRecords;
    case "Groceries":
      return dummyGroceriesRecords;
    case "Entertainment":
      return dummyEntertainmentRecords;
    case "Salary":
      return dummySalaryRecords;
    case "Freelance":
      return dummyFreelanceRecords;
    case "Investment":
      return dummyInvestmentRecords;
    default:
      return [];
  }
};

const Category: React.FC = () => {
  const [isExpense, setIsExpense] = useState(true);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const data = isExpense ? dummyExpenseData : dummyIncomeData;

  return (
    <div className="w-full p-4 space-y-3">
      {/* Header with Switch */}
      <div className="flex items-center justify-between ">
        <h2 className="text-2xl font-bold text-foreground">
          Category Overview
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
            className="bg-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
        {data.map((category, index) => (
          <Card
            key={index}
            className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 bg-background cursor-pointer"
            onClick={() => {
              setSelectedCategory(category.name);
              setCurrentPage(1);
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {category.name}
                </CardTitle>
                <div className="w-4 h-4 rounded-full bg-foreground"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-foreground">
                  ₹{category.amount.toLocaleString()}
                </div>
                <div className="text-sm text-foreground">
                  {category.percentage}% of total
                </div>
                <div className="w-full bg-foreground rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      isExpense ? "bg-red-500" : "bg-green-500"
                    } transition-all duration-500`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {data.length < 4 && (
          <Card
            className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 bg-background border-dashed border-2 border-foreground/50 cursor-pointer"
            onClick={() => setIsAddCategoryOpen(true)}
          >
            <CardContent className="flex flex-col items-center justify-center h-full py-8">
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-foreground" />
              </div>
              <div className="text-lg font-semibold text-foreground">
                Add Category
              </div>
              <div className="text-sm text-foreground/70">
                Create a new category
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Table Section */}
      {selectedCategory ? (
        <>
          <Table
            data={getRecordsForCategory(selectedCategory).slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            )}
            columns={[
              { key: "date", label: "Date", sortable: true },
              { key: "description", label: "Description" },
              { key: "amount", label: "Amount", sortable: true },
              { key: "type", label: "Type" },
            ]}
            title={`Records for ${selectedCategory}`}
          />
          <div className="flex justify-end mt-4">
            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(getRecordsForCategory(selectedCategory).length / itemsPerPage)}
              onPageChange={setCurrentPage}
              className="justify-end"
            />
          </div>
        </>
      ) : (
        <Card className="w-full mt-8 bg-background/50 border-dashed border-2 border-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-2">
            <ArrowUp className="w-8 h-8 text-foreground/70 animate-bounce" />
            <span className="text-lg font-medium text-foreground/80 text-center">
              Select a category above to display its records
            </span>
          </CardContent>
        </Card>
      )}

      <AddCategory
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
      />
    </div>
  );
};

export default Category;
