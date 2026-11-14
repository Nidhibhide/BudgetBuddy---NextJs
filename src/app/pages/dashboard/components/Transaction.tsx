"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Formik } from "formik";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Button, SelectBox, InputBox } from "@/app/features/common";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Loader2,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
} from "lucide-react";
import {
  Table,
  CustomPagination,
  useToast,
} from "@/app/features/common";
import { Confirmation } from "@/app/features/dialogs";
import { Transaction as TransactionForm } from "@/app/features/forms";
import { TransactionPDF } from "@/app/features/common";
import { deleteTransaction } from "@/app/lib/transaction";
import { Transaction as TransactionType } from "@/app/types/appTypes";
import { useCategories, useTransactions, useDebounce } from "@/app/hooks";

const handlePDFDownload = async (
  transactions: TransactionType[],
  selectedCategory: string,
  currentType: string,
  currency: string,
  categories: string[]
) => {
  try {
    const { pdf } = await import("@react-pdf/renderer");
    const blob = await pdf(
      <TransactionPDF
        transactions={transactions}
        selectedCategory={selectedCategory}
        currentType={currentType}
        currency={currency}
        categories={categories}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.pdf";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error Occurred:", error);
  }
};

const Transaction: React.FC = React.memo(() => {
  const { data: session } = useSession();
  const [isExpense, setIsExpense] = useState(true);

  const { showSuccess, showError } = useToast();
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [datePreset, setDatePreset] = useState<
    "today" | "week" | "month" | "custom" | null
  >(null);

  const toInputDate = useCallback((d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const applyDatePreset = useCallback(
    (preset: "today" | "week" | "month" | "custom") => {
      if (preset === "custom") {
        if (datePreset === "custom") {
          setDatePreset(null);
          setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
        } else {
          setDatePreset("custom");
        }
        return;
      }

      if (datePreset === preset) {
        setDatePreset(null);
        setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let from = new Date(today);

      if (preset === "week") {
        const day = today.getDay();
        const diff = day === 0 ? 6 : day - 1;
        from.setDate(today.getDate() - diff);
      } else if (preset === "month") {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
      }

      setDatePreset(preset);
      setFilters((prev) => ({
        ...prev,
        dateFrom: toInputDate(from),
        dateTo: toInputDate(today),
      }));
    },
    [datePreset, toInputDate]
  );

  const currentType = isExpense ? "Expense" : "Income";
  const { categories } = useCategories(currentType);
  const {
    transactions,
    loading,
    pagination,
    refetch: refetchTransactions,
  } = useTransactions({
    type: currentType,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    page: currentPage,
    limit: 10,
    sortBy,
    sortOrder,
    search: debouncedSearch,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
  });

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(column);
        setSortOrder("asc");
      }
      setCurrentPage(1);
    },
    [sortBy, sortOrder]
  );

  const validateFilters = useCallback((newFilters: typeof filters) => {
    const newErrors: { [key: string]: string } = {};
    if (
      newFilters.dateFrom &&
      newFilters.dateTo &&
      new Date(newFilters.dateFrom) > new Date(newFilters.dateTo)
    ) {
      newErrors.dateTo = "To date must be after from date";
    }
    if (
      newFilters.minAmount &&
      newFilters.maxAmount &&
      parseFloat(newFilters.minAmount) > parseFloat(newFilters.maxAmount)
    ) {
      newErrors.maxAmount = "Max amount must be greater than min amount";
    }
    if (newFilters.minAmount && parseFloat(newFilters.minAmount) < 0) {
      newErrors.minAmount = "Min amount must be positive";
    }
    if (newFilters.maxAmount && parseFloat(newFilters.maxAmount) < 0) {
      newErrors.maxAmount = "Max amount must be positive";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleEditClick = (transaction: TransactionType) => {
    setEditTransactionData(transaction);
    setIsAddTransactionOpen(true);
  };

  const handleDuplicateClick = (transaction: TransactionType) => {
    const { _id: _unused, ...rest } = transaction;
    setEditTransactionData(rest as TransactionType);
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
        showError(response.message || "An error occurred. Please try again.");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
    
      showError("An error occurred. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    setSelectedCategory("All");
    setCurrentPage(1);
  }, [isExpense]);

  useEffect(() => {
    validateFilters(filters);
  }, [filters, validateFilters]);

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      setCurrentPage(1);
    }
  }, [
    debouncedSearch,
    filters.dateFrom,
    filters.dateTo,
    filters.minAmount,
    filters.maxAmount,
    errors,
  ]);

  const currency = session?.user?.currency || "INR";

  return (
    <div className="w-full p-4 sm:p-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track income and expenses in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
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
          {!loading && transactions.length > 0 && (
            <Button
              width="w-auto"
              className="shrink-0"
              onClick={() => setIsAddTransactionOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-start sm:justify-center">
          <div className="w-full sm:max-w-2xl flex flex-col gap-1.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <InputBox
                name="search"
                type="text"
                label=""
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputClassName="pl-9"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="text-sm font-medium text-btn-background hover:text-btn-hover cursor-pointer inline-flex items-center gap-1.5"
              >
                Advanced filters
                {isAdvancedOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="w-full sm:w-[180px]">
            <Formik
              initialValues={{ category: selectedCategory }}
              enableReinitialize
              onSubmit={() => {}}
            >
              {() => (
                <SelectBox
                  name="category"
                  options={["All", ...categories.map((cat) => cat.name)]}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                />
              )}
            </Formik>
          </div>
          {!loading && transactions.length > 0 && (
            <Button
              width="w-auto"
              className="shrink-0 w-full sm:w-auto"
              onClick={() =>
                handlePDFDownload(
                  transactions,
                  selectedCategory,
                  currentType,
                  currency,
                  categories.map((cat) => cat.name)
                )
              }
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          )}
        </div>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleContent>
            <div className="rounded-xl border border-border dark:border-white/20 bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { key: "today", label: "Today" },
                    { key: "week", label: "This Week" },
                    { key: "month", label: "This Month" },
                    { key: "custom", label: "Custom Date" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyDatePreset(key)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer border ${
                      datePreset === key
                        ? "bg-btn-background text-white border-btn-background"
                        : "bg-background text-foreground border-border dark:border-white/20 hover:border-btn-background/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {datePreset === "custom" && (
                  <>
                    <div className="min-w-0 w-full">
                      <InputBox
                        name="from"
                        type="date"
                        label="From"
                        value={filters.dateFrom}
                        onChange={(e) => {
                          setDatePreset("custom");
                          setFilters((prev) => ({
                            ...prev,
                            dateFrom: e.target.value,
                          }));
                        }}
                        inputClassName="w-full min-w-0 bg-card border-border dark:border-white/20"
                      />
                      {errors.dateFrom && (
                        <p className="text-destructive text-sm">
                          {errors.dateFrom}
                        </p>
                      )}
                    </div>
                    <div className="min-w-0 w-full">
                      <InputBox
                        name="to"
                        type="date"
                        label="To"
                        value={filters.dateTo}
                        onChange={(e) => {
                          setDatePreset("custom");
                          setFilters((prev) => ({
                            ...prev,
                            dateTo: e.target.value,
                          }));
                        }}
                        inputClassName="w-full min-w-0 bg-card border-border dark:border-white/20"
                      />
                      {errors.dateTo && (
                        <p className="text-destructive text-sm">
                          {errors.dateTo}
                        </p>
                      )}
                    </div>
                  </>
                )}
                <div className="min-w-0 w-full">
                  <InputBox
                    name="min"
                    type="number"
                    label="Min Amount"
                    placeholder="Enter min amount"
                    value={filters.minAmount}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minAmount: e.target.value,
                      }))
                    }
                    inputClassName="w-full min-w-0 bg-card border-border dark:border-white/20"
                  />
                  {errors.minAmount && (
                    <p className="text-destructive text-sm">
                      {errors.minAmount}
                    </p>
                  )}
                </div>
                <div className="min-w-0 w-full">
                  <InputBox
                    name="max"
                    type="number"
                    label="Max Amount"
                    placeholder="Enter max amount"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxAmount: e.target.value,
                      }))
                    }
                    inputClassName="w-full min-w-0 bg-card border-border dark:border-white/20"
                  />
                  {errors.maxAmount && (
                    <p className="text-destructive text-sm">
                      {errors.maxAmount}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-btn-background" />
        </div>
      ) : transactions.length > 0 ? (
        <div className="flex flex-col gap-2">
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
              { key: "title", label: "Title" },
              { key: "category", label: "Category" },
              {
                key: "amount",
                label: "Amount",
                sortable: true,
                render: (value) => `${value} ${currency}`,
              },
              {
                key: "actions",
                label: "Actions",
                render: (_value, row) => (
                  <div className="flex gap-1 justify-end md:justify-start">
                    <button
                      type="button"
                      onClick={() => handleEditClick(row as TransactionType)}
                      className="p-2 rounded-lg hover:bg-btn-background/10 text-foreground transition-colors cursor-pointer"
                      title="Edit"
                      aria-label="Edit transaction"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDuplicateClick(row as TransactionType)
                      }
                      className="p-2 rounded-lg hover:bg-btn-background/10 text-foreground transition-colors cursor-pointer"
                      title="Duplicate"
                      aria-label="Duplicate transaction"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(row._id as string)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                      title="Delete"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            title={`${currentType} list`}
            keyField="_id"
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />

          <div className="flex justify-end">
            <CustomPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
              className="justify-end"
            />
          </div>
        </div>
      ) : (
        <div className="px-6 py-16 flex flex-col items-center text-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-btn-background/15 text-btn-background">
            <Receipt className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-lg font-semibold text-foreground">
              No {currentType.toLowerCase()} transactions yet
            </p>
            <p className="text-sm text-muted-foreground">
              Add your first transaction to start tracking your money.
            </p>
          </div>
          <Button
            width="w-auto"
            className="shrink-0"
            onClick={() => setIsAddTransactionOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Transaction
          </Button>
        </div>
      )}

      <TransactionForm
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

Transaction.displayName = "Transaction";

export default Transaction;
