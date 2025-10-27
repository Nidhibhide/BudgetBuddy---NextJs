"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, MousePointer, Loader2 } from "lucide-react";
import {
  AddCategory,
  CustomPagination,
  NotFound,
} from "@/app/components/index";
import { Table } from "@/app/components/index";
import { getCategoryDetails } from "@/app/lib/category";
import { getTransactions } from "@/app/lib/transaction";
import type { Category, Transaction as TransactionType } from "@/app/types/appTypes";

const Category: React.FC = () => {
  const { data: session } = useSession();
  const [isExpense, setIsExpense] = useState(true);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [data, setData] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    limit: 10,
  });
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch category details
  const fetchCategoryDetails = useCallback(async (type: string) => {
    try {
      setLoading(true);
      const result = await getCategoryDetails(type);
      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Error fetching category details:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch transactions for selected category
  const fetchTransactions = useCallback(async (
    type: string,
    category: string,
    page: number = 1,
    sortByParam?: string,
    sortOrderParam?: "asc" | "desc"
  ) => {
    setRecordsLoading(true);
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
        setPagination(prev => response.pagination || prev);
      } else {
        console.error("Failed to fetch transactions:", response.message);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setRecordsLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchCategoryDetails(isExpense ? "Expense" : "Income");
    setSelectedCategory(null); // Reset selected category when type changes
  }, [isExpense,fetchCategoryDetails]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchTransactions(isExpense ? "Expense" : "Income", selectedCategory, pagination.currentPage);
    }
  }, [selectedCategory, pagination.currentPage, isExpense, sortBy, sortOrder,fetchTransactions]);

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
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
          </div>
        ) : (
          <>
            {data?.map((category, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${selectedCategory === category.name ? 'bg-selected-background' : 'bg-background'} cursor-pointer`}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
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
                      {/* ₹{category.amount.toLocaleString()} */} 400
                    </div>
                    <div className="text-sm text-foreground">
                      {/* {category.percentage}% of total */}40%
                    </div>
                    <div className="w-full bg-foreground rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isExpense ? "bg-red-500" : "bg-green-500"
                        } transition-all duration-500`}
                        // style={{ width: `${category.percentage}%` }}
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
          </>
        )}
      </div>

      {/* Table Section */}
      {selectedCategory ? (
        recordsLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
          </div>
        ) : transactions.length > 0 ? (
          <>
            <Table
              data={transactions}
              columns={[
                {
                  key: "date",
                  label: "Date",
                  sortable: true,
                  render: (value) => value ? new Date(value).toLocaleDateString('en-GB') : ''
                },
                { key: "description", label: "Description" },
                {
                  key: "amount",
                  label: "Amount",
                  sortable: true,
                  render: (value) => {
                    const currency = session?.user?.currency || 'INR';
                    return `${value} ${currency}`;
                  }
                },
                { key: "type", label: "Type" },
              ]}
              title={`Records for ${selectedCategory}`}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
            <div className="flex justify-end mt-4">
              <CustomPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                className="justify-end"
              />
            </div>
          </>
        ) : (
          <NotFound
            title="No Records Found"
            message={`There are no transaction records available for ${selectedCategory}. Try selecting a different category or add some transactions.`}
          />
        )
      ) : (
        <NotFound
          title="Select a Category"
          message="Click on any category card above to view its detailed transaction records and insights."
          icon={MousePointer}
        />
      )}

      <AddCategory
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
      />
    </div>
  );
};

export default Category;
