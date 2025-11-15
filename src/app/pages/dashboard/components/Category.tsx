"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, MousePointer, Loader2, Pen, Trash2, AlertTriangle } from "lucide-react";
import {
  CustomPagination,
  NotFound,
  Table,
} from "@/app/features/common";
import { DeleteCategory,Category as CategoryForm } from "@/app/features/forms";
import { getTransactions } from "@/app/lib/transaction";
import { useCategories, useTransactions } from "@/app/hooks/index";
import type { Category } from "@/app/types/appTypes";
import { useTranslations } from 'next-intl'; // Import for internationalization

const Category: React.FC = React.memo(() => {
  const { data: session } = useSession();
  const [isExpense, setIsExpense] = useState(true);

  // Get translation function for the 'dashboard' namespace
  // This provides access to all dashboard-related translations
  const t = useTranslations('dashboard');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [categoryTransactionCount, setCategoryTransactionCount] =
    useState<number>(0);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const currentType = isExpense ? "Expense" : "Income";
  const currency = session?.user?.currency || "INR";

  const {
    categories: data,
    loading,
    refetch: refetchCategories,
  } = useCategories(currentType);
  const [currentPage, setCurrentPage] = useState(1);
  const {
    transactions,
    totals,
    pagination,
    refetch: refetchTransactions,
    refetchTotals,
  } = useTransactions({
    type: currentType,
    category: selectedCategory || undefined,
    page: currentPage,
    sortBy,
    sortOrder,
  });

  // Helper function to get category totals
  const getCategoryTotal = useCallback(
    (categoryName: string) => {
      const typeTotals = totals.find((t) => t.type === currentType);
      const categoryData = typeTotals?.categories.find((c) => c.category === categoryName);
      const category = data.find((c) => c.name === categoryName);
      const budgetLimit = category?.budgetLimit || 0;
      const goal = category?.goal || 0;
      const total = categoryData?.total || 0;
      let percentage = categoryData?.percentage || 0;

      if (currentType === "Expense" && budgetLimit > 0) {
        percentage = Math.min((total / budgetLimit) * 100, 100);
      } else if (currentType === "Income" && goal > 0) {
        percentage = Math.min((total / goal) * 100, 100);
      }

      return {
        total,
        percentage,
        budgetLimit,
        goal,
      };
    },
    [totals, currentType, data]
  );

  useEffect(() => {
    setSelectedCategory(null);
    setEditingCategory(null);
    setDeletingCategory(null);
    setCurrentPage(1);
  }, [currentType]);

  const handleSort = useCallback(
    (column: string) => {
      const newSortOrder =
        sortBy === column && sortOrder === "asc" ? "desc" : "asc";
      setSortBy(column);
      setSortOrder(newSortOrder);
      setCurrentPage(1);
    },
    [sortBy, sortOrder]
  );

  useEffect(() => {
    if (selectedCategory) {
      setRecordsLoading(true);
      refetchTransactions().finally(() => setRecordsLoading(false));
    }
  }, [selectedCategory, currentPage, sortBy, sortOrder, refetchTransactions]);

  return (
    <div className="w-full p-4 space-y-3">
      {/* Header with Switch */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {t('categoryOverview')}
        </h2>
        <div className="flex items-center space-x-3">
          <Label
            htmlFor="expense-income-switch"
            className="text-base font-medium text-foreground"
          >
            {t(currentType.toLowerCase())}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
          </div>
        ) : (
          <>
            {data?.map((category: Category, index: number) => {
              const { total, percentage, budgetLimit, goal } = getCategoryTotal(category.name);
              return (
                <Card
                  key={index}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    selectedCategory === category.name
                      ? "bg-selected-background"
                      : "bg-background"
                  } cursor-pointer`}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setCurrentPage(1);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-center  space-x-2">
                        <CardTitle className="text-xl font-semibold text-foreground">
                          {category.name}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Pen
                          className="w-4 h-4 text-foreground cursor-pointer hover:text-blue-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory(category);
                            setIsAddCategoryOpen(true);
                          }}
                        />
                        <Trash2
                          className={`w-4 h-4 text-foreground cursor-pointer hover:text-red-500 ${
                            deleteLoading ? "animate-spin" : ""
                          }`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setDeleteLoading(true);
                            try {
                              // Get transaction count for this category
                              let count = 0;
                              if (selectedCategory === category.name) {
                                count = pagination.totalTransactions;
                              } else {
                                const result = await getTransactions(
                                  currentType,
                                  category.name,
                                  1,
                                  1
                                );
                                count = result.pagination?.totalTransactions || 0;
                              }
                              setCategoryTransactionCount(count);
                              setDeletingCategory(category);
                            } finally {
                              setDeleteLoading(false);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-foreground">
                        {total.toLocaleString()} {currency}
                      </div>
                      {currentType === "Expense" && budgetLimit > 0 && (
                        <div className="text-sm text-foreground/70">
                          {t('budget')}: {budgetLimit.toLocaleString()} {currency}
                        </div>
                      )}
                      {currentType === "Income" && goal > 0 && (
                        <div className="text-sm text-foreground/70">
                          {t('goal')}: {goal.toLocaleString()} {currency}
                        </div>
                      )}
                      {(currentType === "Expense" && budgetLimit > 0) || (currentType === "Income" && goal > 0) ? (
                        <>
                          <div className="text-sm text-foreground">
                            {percentage.toFixed(1)}%
                          </div>
                          <div className="w-full bg-foreground rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                isExpense ? "bg-red-500" : "bg-green-500"
                              } transition-all duration-500`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-6 h-6 text-yellow-600" strokeWidth={3} />
                          <span className="text-base font-semibold text-foreground/60">
                            {currentType === "Expense" ? t('setBudgetToTrack') : t('setGoalToTrack')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                    {t('addCategory')}
                  </div>
                  <div className="text-sm text-foreground/70">
                    {t('createNewCategory')}
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
                  label: t('date'),
                  sortable: true,
                  render: (value) =>
                    value
                      ? new Date(
                          value as string | number | Date
                        ).toLocaleDateString("en-GB")
                      : "",
                },
                { key: "description", label: t('description') },
                {
                  key: "amount",
                  label: t('amount'),
                  sortable: true,
                  render: (value) => `${value} ${currency}`,
                },
                { key: "type", label: t('type') },
              ]}
              title={`${t('recordsFor')} ${selectedCategory}`}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
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
            title={t('noRecordsFound')}
            message={t('noRecordsMessage', { category: selectedCategory })}
          />
        )
      ) : (
        <NotFound
          title={t('selectCategory')}
          message={t('selectCategoryMessage')}
          icon={MousePointer}
        />
      )}

      <CategoryForm
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onCategoryAdded={() => refetchCategories()}
        category={editingCategory}
        onCategoryEdited={() => {
          refetchCategories();
          setEditingCategory(null);
        }}
      />

      <DeleteCategory
        open={!!deletingCategory}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDeletingCategory(null);
          }
        }}
        category={deletingCategory}
        onCategoryDeleted={() => {
          refetchCategories();
          refetchTransactions();
          refetchTotals();
          setSelectedCategory(null);
          setCurrentPage(1);
        }}
        categories={data}
        transactionCount={categoryTransactionCount}
      />
    </div>
  );
});

Category.displayName = "Category";

export default Category;

//useCallback makes your React app faster by remembering functions, so they don’t get recreated on every render.
// This stops child components from re-rendering again and again without need.

//React.memo stops a component from re-rendering if its props haven’t changed, so it only updates when needed.

//React.memo prevents a component from re-rendering if props don’t change, while useCallback keeps a function from being recreated on every render.
