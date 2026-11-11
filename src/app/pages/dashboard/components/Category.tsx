"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus,
  MousePointer,
  Loader2,
  Pen,
  Trash2,
  AlertTriangle,
  Tags,
  Receipt,
} from "lucide-react";
import { CustomPagination, Table } from "@/app/features/common";
import { DeleteCategory, Category as CategoryForm } from "@/app/features/forms";
import { getTransactions } from "@/app/lib/transaction";
import { useCategories, useTransactions } from "@/app/hooks/index";
import type { Category } from "@/app/types/appTypes";

const CATEGORY_COLORS = [
  {
    stripe: "bg-emerald-500",
    badge: "bg-emerald-500 text-white",
    amount: "text-emerald-700 dark:text-emerald-400",
    track: "bg-emerald-500/20 dark:bg-white/15",
    fill: "bg-emerald-500",
    hover: "hover:border-emerald-700 hover:shadow-md hover:shadow-emerald-500/15 dark:hover:border-emerald-400",
    selected: "border-emerald-700 ring-2 ring-emerald-500/40 shadow-md shadow-emerald-500/10 dark:border-emerald-400",
  },
  {
    stripe: "bg-amber-500",
    badge: "bg-amber-500 text-white",
    amount: "text-amber-700 dark:text-amber-400",
    track: "bg-amber-500/20 dark:bg-white/15",
    fill: "bg-amber-500",
    hover: "hover:border-amber-700 hover:shadow-md hover:shadow-amber-500/15 dark:hover:border-amber-400",
    selected: "border-amber-700 ring-2 ring-amber-500/40 shadow-md shadow-amber-500/10 dark:border-amber-400",
  },
  {
    stripe: "bg-rose-500",
    badge: "bg-rose-500 text-white",
    amount: "text-rose-700 dark:text-rose-400",
    track: "bg-rose-500/20 dark:bg-white/15",
    fill: "bg-rose-500",
    hover: "hover:border-rose-700 hover:shadow-md hover:shadow-rose-500/15 dark:hover:border-rose-400",
    selected: "border-rose-700 ring-2 ring-rose-500/40 shadow-md shadow-rose-500/10 dark:border-rose-400",
  },
  {
    stripe: "bg-teal-500",
    badge: "bg-teal-500 text-white",
    amount: "text-teal-700 dark:text-teal-400",
    track: "bg-teal-500/20 dark:bg-white/15",
    fill: "bg-teal-500",
    hover: "hover:border-teal-700 hover:shadow-md hover:shadow-teal-500/15 dark:hover:border-teal-400",
    selected: "border-teal-700 ring-2 ring-teal-500/40 shadow-md shadow-teal-500/10 dark:border-teal-400",
  },
] as const;

const Category: React.FC = React.memo(() => {
  const { data: session } = useSession();
  const [isExpense, setIsExpense] = useState(true);

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

  const getCategoryTotal = useCallback(
    (categoryName: string) => {
      const typeTotals = totals.find((t) => t.type === currentType);
      const categoryData = typeTotals?.categories.find(
        (c) => c.category === categoryName
      );
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

  const handleDeleteClick = async (
    e: React.MouseEvent,
    category: Category
  ) => {
    e.stopPropagation();
    setDeleteLoading(true);
    try {
      let count = 0;
      if (selectedCategory === category.name) {
        count = pagination.totalTransactions;
      } else {
        const result = await getTransactions(currentType, category.name, 1, 1);
        count = result.pagination?.totalTransactions || 0;
      }
      setCategoryTransactionCount(count);
      setDeletingCategory(category);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categories</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Group spending and income so budgets stay clear.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label
            htmlFor="expense-income-switch"
            className="text-base font-medium text-foreground"
          >
            {currentType}
          </Label>
          <Switch
            id="expense-income-switch"
            checked={isExpense}
            onCheckedChange={setIsExpense}
            className="bg-btn-background"
          />
          {data.length < 4 && data.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setIsAddCategoryOpen(true);
              }}
              className="ml-auto sm:ml-2 inline-flex items-center gap-2 rounded-xl bg-btn-background px-3.5 py-2 text-sm font-medium text-white hover:bg-btn-hover transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-btn-background" />
        </div>
      ) : data.length === 0 ? (
        <div className="px-6 py-14 sm:py-16 flex flex-col items-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-btn-background/15 text-btn-background">
            <Tags className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="text-lg font-semibold text-foreground">
              No {currentType.toLowerCase()} categories yet
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create your first category to organize money and track progress
              toward a budget or goal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setIsAddCategoryOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-btn-background px-5 py-2.5 text-sm font-medium text-white hover:bg-btn-hover cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MousePointer className="w-3.5 h-3.5 text-btn-background" />
            After you add one, tap it to see transactions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl">
            {data.map((category: Category, index: number) => {
              const { total, percentage, budgetLimit, goal } = getCategoryTotal(
                category.name
              );
              const isSelected = selectedCategory === category.name;
              const hasLimit =
                (currentType === "Expense" && budgetLimit > 0) ||
                (currentType === "Income" && goal > 0);
              const initial = category.name.charAt(0).toUpperCase();
              const color =
                CATEGORY_COLORS[index % CATEGORY_COLORS.length];

              return (
                <li key={category._id || category.name}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setCurrentPage(1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedCategory(category.name);
                        setCurrentPage(1);
                      }
                    }}
                    className={`relative h-full text-left rounded-xl border border-border bg-card overflow-hidden pl-4 pr-3.5 py-4 transition-all duration-200 cursor-pointer ${
                      isSelected ? color.selected : color.hover
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${color.stripe}`}
                      aria-hidden
                    />

                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold ${color.badge}`}
                          aria-hidden
                        >
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {category.name}
                          </h3>
                          <p
                            className={`text-base font-bold tabular-nums ${color.amount}`}
                          >
                            {total.toLocaleString()} {currency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center shrink-0 -mr-1">
                        <button
                          type="button"
                          title="Edit"
                          aria-label={`Edit ${category.name}`}
                          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-foreground cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCategory(category);
                            setIsAddCategoryOpen(true);
                          }}
                        >
                          <Pen className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          aria-label={`Delete ${category.name}`}
                          className={`p-2 rounded-md hover:bg-destructive/10 text-destructive cursor-pointer ${
                            deleteLoading ? "animate-spin" : ""
                          }`}
                          onClick={(e) => handleDeleteClick(e, category)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {hasLimit ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            {currentType === "Expense" ? "Budget" : "Goal"}{" "}
                            {(currentType === "Expense"
                              ? budgetLimit
                              : goal
                            ).toLocaleString()}{" "}
                            {currency}
                          </span>
                          <span className="tabular-nums font-medium text-foreground/80">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div
                          className={`h-2 w-full rounded-full overflow-hidden ${color.track}`}
                        >
                          <div
                            className={`h-full rounded-full ${color.fill} transition-all duration-500`}
                            style={{
                              width: `${Math.max(
                                Math.min(percentage, 100),
                                percentage > 0 ? 2 : 0
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
                        <span>
                          {currentType === "Expense"
                            ? "Set a budget"
                            : "Set a goal"}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {!selectedCategory && (
            <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <MousePointer className="w-4 h-4 text-btn-background shrink-0" />
              Tap a category to view its transactions.
            </p>
          )}

          {selectedCategory &&
            (recordsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-btn-background" />
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
                      render: (value) =>
                        value
                          ? new Date(
                              value as string | number | Date
                            ).toLocaleDateString("en-GB")
                          : "",
                    },
                    { key: "description", label: "Description" },
                    {
                      key: "amount",
                      label: "Amount",
                      sortable: true,
                      render: (value) => `${value} ${currency}`,
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
                    onPageChange={setCurrentPage}
                    className="justify-end"
                  />
                </div>
              </>
            ) : (
              <div className="px-4 py-10 flex flex-col items-center text-center gap-2">
                <Receipt className="w-8 h-8 text-btn-background" />
                <p className="text-lg font-semibold text-foreground">
                  No transactions yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Nothing recorded under {selectedCategory} so far.
                </p>
              </div>
            ))}
        </div>
      )}

      <CategoryForm
        open={isAddCategoryOpen}
        onOpenChange={(open) => {
          setIsAddCategoryOpen(open);
          if (!open) setEditingCategory(null);
        }}
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
