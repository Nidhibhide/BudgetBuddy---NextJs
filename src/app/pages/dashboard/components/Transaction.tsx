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
  Loader2,
  Download,
  Eye,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Table,
  CustomPagination,
  NotFound,
  useToast,
} from "@/app/features/common";
import { Confirmation, ViewTransaction } from "@/app/features/dialogs";
import { Transaction as TransactionForm } from "@/app/features/forms";
import { TransactionPDF } from "@/app/features/common";
import { deleteTransaction } from "@/app/lib/transaction";
import { Transaction as TransactionType } from "@/app/types/appTypes";
import { useCategories, useTransactions, useDebounce } from "@/app/hooks";
import { useTranslations } from 'next-intl'; // Import for internationalization

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
    link.download = "budgetbuddy.pdf";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

const Transaction: React.FC = React.memo(() => {
  const { data: session } = useSession();
  const [isExpense, setIsExpense] = useState(true);

  // Get translation function for all namespaces
  const t = useTranslations();
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
  const [isViewTransactionOpen, setIsViewTransactionOpen] = useState(false);
  const [viewTransactionData, setViewTransactionData] =
    useState<TransactionType | null>(null);
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
      newErrors.dateTo = t('common.messages.toDateAfterFrom');
    }
    if (
      newFilters.minAmount &&
      newFilters.maxAmount &&
      parseFloat(newFilters.minAmount) > parseFloat(newFilters.maxAmount)
    ) {
      newErrors.maxAmount = t('common.messages.maxGreaterThanMin');
    }
    if (newFilters.minAmount && parseFloat(newFilters.minAmount) < 0) {
      newErrors.minAmount = t('common.messages.minPositive');
    }
    if (newFilters.maxAmount && parseFloat(newFilters.maxAmount) < 0) {
      newErrors.maxAmount = t('common.messages.maxPositive');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [t]);

  const handleEditClick = (transaction: TransactionType) => {
    setEditTransactionData(transaction);
    setIsAddTransactionOpen(true);
  };

  const handleViewClick = (transaction: TransactionType) => {
    setViewTransactionData(transaction);
    setIsViewTransactionOpen(true);
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
      showError("Unexpected error deleting transaction");
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
            {t(isExpense ? 'constants.types.expense' : 'constants.types.income')}
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end">
           <div className="w-full sm:w-[180px]">
             <Formik
               initialValues={{ category: selectedCategory }}
               onSubmit={() => {}}
             >
               {() => (
                 <SelectBox
                   name="category"
                   options={[t('common.ui.all'), ...categories.map((cat) => cat.name)]}
                   value={selectedCategory}
                   onChange={handleCategoryChange}
                 />
               )}
             </Formik>
           </div>
           <Button
             width="w-full sm:w-[180px]"
             className="flex items-center justify-center gap-2"
             onClick={() => setIsAddTransactionOpen(true)}
           >
             <Plus className="w-4 h-4" />
             Add Transaction
           </Button>
         </div>
        <div className="flex justify-end">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="text-foreground underline font-bold text-base cursor-pointer flex items-center gap-2"
          >
            Advanced Search
            {isAdvancedOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-4 h-4 z-10" />
                  <InputBox
                    name="search"
                    type="text"
                    label=""
                    placeholder="Search transactions"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    inputClassName="pl-8 rounded-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="flex flex-col w-full">
                   <InputBox
                     name="from"
                     type="date"
                     label="From"
                     value={filters.dateFrom}
                     onChange={(e) =>
                       setFilters((prev) => ({
                         ...prev,
                         dateFrom: e.target.value,
                       }))
                     }
                   />
                   {errors.dateFrom && (
                     <p className="text-red-500 text-sm">{errors.dateFrom}</p>
                   )}
                 </div>
                 <div className="flex flex-col w-full">
                   <InputBox
                     name="to"
                     type="date"
                     label="To"
                     value={filters.dateTo}
                     onChange={(e) =>
                       setFilters((prev) => ({
                         ...prev,
                         dateTo: e.target.value,
                       }))
                     }
                   />
                   {errors.dateTo && (
                     <p className="text-red-500 text-sm">{errors.dateTo}</p>
                   )}
                 </div>
                 <div className="flex flex-col w-full">
                   <InputBox
                     name="min"
                     type="number"
                     label="Min"
                     placeholder="Min amount"
                     value={filters.minAmount}
                     onChange={(e) =>
                       setFilters((prev) => ({
                         ...prev,
                         minAmount: e.target.value,
                       }))
                     }
                   />
                   {errors.minAmount && (
                     <p className="text-red-500 text-sm">{errors.minAmount}</p>
                   )}
                 </div>
                 <div className="flex flex-col w-full">
                   <InputBox
                     name="max"
                     type="number"
                     label="Max"
                     placeholder="Max amount"
                     value={filters.maxAmount}
                     onChange={(e) =>
                       setFilters((prev) => ({
                         ...prev,
                         maxAmount: e.target.value,
                       }))
                     }
                   />
                   {errors.maxAmount && (
                     <p className="text-red-500 text-sm">{errors.maxAmount}</p>
                   )}
                 </div>
               </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
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
              { key: "title", label: "Title" },
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
              {
                key: "actions",
                label: "Actions",
                render: (value, row) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewClick(row as TransactionType)}
                      className="p-1 hover:bg-background/10 rounded transition-colors cursor-pointer"
                      title={t('common.actions.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(row as TransactionType)}
                      className="p-1 hover:bg-background/10  rounded transition-colors cursor-pointer"
                      title={t('common.actions.edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(row._id as string)}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      title={t('common.actions.delete')}
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

          {/* Download PDF Button */}
          <div className="flex justify-center mt-4">
            <Button
              width="w-full sm:w-[180px]"
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
              onClick={() =>
                handlePDFDownload(
                  transactions,
                  selectedCategory,
                  currentType,
                  session?.user?.currency || "INR",
                  categories.map((cat) => cat.name)
                )
              }
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </>
      ) : (
        <NotFound
          title="No Transactions Found"
          message="You haven't added any transactions yet. Start by adding your first transaction."
        />
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

      <ViewTransaction
        open={isViewTransactionOpen}
        onOpenChange={setIsViewTransactionOpen}
        transaction={viewTransactionData}
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
