"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Formik } from "formik";
import { useSession } from "next-auth/react";
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  Repeat,
  Play,
  Pause,
  Info,
  Search,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from "lucide-react";
import {
  Table,
  CustomPagination,
  Button,
  SelectBox,
  InputBox,
  Tooltip,
} from "@/app/features/common/index";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Confirmation } from "../../dialogs";
import { RecurringPayment as RecurringPaymentForm } from "@/app/features/forms";
import { useRecurringPayments, useDebounce } from "@/app/hooks";
import { RecurringPayment as RecurringPaymentType } from "@/app/types/appTypes";
import {
  deleteRecurringPayment,
  toggleRecurringPaymentStatus,
  createRecurringPaymentOrder,
  verifyRecurringPayment,
} from "@/app/lib/recurringPayment";
import { useToast } from "@/app/features/common";

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const RecurringPayment: React.FC = () => {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";
  const canPayOnline = currency.toUpperCase() === "INR";
  const { showSuccess, showError } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("nextDueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
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

  const validateFilters = useCallback((newFilters: typeof filters) => {
    const nextErrors: { [key: string]: string } = {};
    if (
      newFilters.dateFrom &&
      newFilters.dateTo &&
      new Date(newFilters.dateFrom) > new Date(newFilters.dateTo)
    ) {
      nextErrors.dateTo = "To date must be after From date";
    }
    if (
      newFilters.minAmount &&
      newFilters.maxAmount &&
      parseFloat(newFilters.minAmount) > parseFloat(newFilters.maxAmount)
    ) {
      nextErrors.maxAmount = "Max amount must be greater than Min amount";
    }
    if (newFilters.minAmount && parseFloat(newFilters.minAmount) < 0) {
      nextErrors.minAmount = "Min amount cannot be negative";
    }
    if (newFilters.maxAmount && parseFloat(newFilters.maxAmount) < 0) {
      nextErrors.maxAmount = "Max amount cannot be negative";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, []);

  const hasValidFilters = Object.keys(errors).length === 0;

  const { recurringPayments, loading, pagination, refetch } =
    useRecurringPayments({
      status: selectedStatus,
      page: currentPage,
      limit: 10,
      sortBy,
      sortOrder,
      search: debouncedSearch,
      dateFrom: hasValidFilters ? filters.dateFrom : undefined,
      dateTo: hasValidFilters ? filters.dateTo : undefined,
      minAmount: hasValidFilters ? filters.minAmount : undefined,
      maxAmount: hasValidFilters ? filters.maxAmount : undefined,
    });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<RecurringPaymentType | null>(null);
  const [deleteRecurringPaymentId, setDeleteRecurringPaymentId] = useState<
    string | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(
    null
  );

  useEffect(() => {
    validateFilters(filters);
  }, [filters, validateFilters]);

  useEffect(() => {
    if (Object.keys(errors).length === 0) {
      setCurrentPage(1);
    }
  }, [
    debouncedSearch,
    selectedStatus,
    filters.dateFrom,
    filters.dateTo,
    filters.minAmount,
    filters.maxAmount,
    errors,
  ]);

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

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const openAddForm = () => {
    setSelectedPayment(null);
    setIsOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setSelectedPayment(null);
  };

  const handlePaymentAdded = () => {
    refetch();
    setSelectedPayment(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteRecurringPaymentId(id);
  };

  const handleToggleStatus = async (payment: RecurringPaymentType) => {
    if (!payment._id || togglingStatusId || payingId) return;

    const nextStatus = payment.status === "Active" ? "Inactive" : "Active";
    setTogglingStatusId(payment._id);
    try {
      const response = await toggleRecurringPaymentStatus(
        payment._id,
        nextStatus
      );
      if (response.success) {
        showSuccess(response.message || `Payment set to ${nextStatus}`);
        refetch();
      } else {
        showError(
          response.message ||
            "Couldn’t update payment status. Please try again."
        );
      }
    } catch {
      showError("Couldn’t update payment status. Please try again.");
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handlePayNow = async (payment: RecurringPaymentType) => {
    if (!payment._id || payingId || togglingStatusId) return;
    if (!canPayOnline) {
      showError("Online payments are available only in INR.");
      return;
    }
    if (payment.status !== "Active") {
      showError("Only active recurring payments can be paid");
      return;
    }

    setPayingId(payment._id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showError("Could not load payment checkout. Please try again.");
        setPayingId(null);
        return;
      }

      const orderResponse = await createRecurringPaymentOrder(payment._id);
      if (!orderResponse.success || !orderResponse.data) {
        showError(orderResponse.message || "Could not start payment");
        setPayingId(null);
        return;
      }

      const orderData = orderResponse.data as {
        orderId: string;
        amount: number;
        currency: string;
        key: string;
        recurringPaymentId: string;
        paymentTitle: string;
        prefill?: { name?: string; email?: string };
      };

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BudgetBuddy",
        description: orderData.paymentTitle || "Recurring payment",
        order_id: orderData.orderId,
        prefill: {
          name: orderData.prefill?.name || session?.user?.name || "",
          email: orderData.prefill?.email || session?.user?.email || "",
        },
        theme: { color: "#2563eb" },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyResponse = await verifyRecurringPayment({
              recurringPaymentId: payment._id!,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyResponse.success) {
              showSuccess(
                verifyResponse.message ||
                  "Payment successful. Next due date updated."
              );
              refetch();
            } else {
              showError(
                verifyResponse.message || "Payment verification failed"
              );
            }
          } catch {
            showError("Payment verification failed");
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        showError("Payment failed. Please try again.");
        setPayingId(null);
      });
      rzp.open();
    } catch {
      showError("Could not start payment. Please try again.");
      setPayingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteRecurringPaymentId) return;

    setDeleting(true);
    try {
      const response = await deleteRecurringPayment(deleteRecurringPaymentId);
      if (response.success) {
        showSuccess(response.message);
        refetch();
        setDeleteRecurringPaymentId(null);
      } else {
        showError(
          response.message ||
            "Couldn’t delete this payment. Please try again."
        );
      }
    } catch {
      showError("Couldn’t delete this payment. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters =
    !!debouncedSearch ||
    selectedStatus !== "All" ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    !!filters.minAmount ||
    !!filters.maxAmount;

  const autoUpdateNote = (
    <span className="inline-flex max-w-full w-fit items-center gap-1.5 rounded-full border border-btn-background/20 bg-btn-background/10 px-2.5 py-1 text-xs sm:text-sm font-medium text-btn-background dark:border-white/25 dark:bg-white/10 dark:text-white">
      <Info className="w-3.5 h-3.5 shrink-0" />
      Next due and reminder dates update automatically after each due date.
    </span>
  );

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-start sm:justify-center">
          <div className="w-full sm:max-w-2xl flex flex-col gap-1.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <InputBox
                name="search"
                type="text"
                label=""
                placeholder="Search recurring payments..."
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
              initialValues={{ status: selectedStatus }}
              enableReinitialize
              onSubmit={() => {}}
            >
              {() => (
                <SelectBox
                  name="status"
                  options={["All", "Active", "Inactive"]}
                  value={selectedStatus}
                  onChange={handleStatusChange}
                />
              )}
            </Formik>
          </div>
          {!loading && (recurringPayments.length > 0 || hasActiveFilters) && (
            <Button
              width="w-full sm:w-auto"
              className="shrink-0"
              onClick={openAddForm}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          )}
        </div>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleContent>
            <div className="w-full rounded-xl border border-border dark:border-white/20 bg-card p-4 space-y-3">
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
                        label="Due From"
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
                        label="Due To"
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
      ) : recurringPayments.length > 0 ? (
        <div className="flex flex-col gap-2">
          {autoUpdateNote}
          <h3 className="text-base font-semibold text-foreground mt-0.5">
            Recurring payments
          </h3>
          <Table
            data={recurringPayments as RecurringPaymentType[]}
            columns={[
              {
                key: "nextDueDate",
                label: "Next Due Date",
                sortable: true,
                render: (value) =>
                  value
                    ? new Date(
                        value as string | number | Date
                      ).toLocaleDateString("en-GB")
                    : "",
              },
              {
                key: "reminderDate",
                label: "Reminder Date",
                sortable: true,
                render: (value) =>
                  value
                    ? new Date(
                        value as string | number | Date
                      ).toLocaleDateString("en-GB")
                    : "",
              },
              { key: "title", label: "Title" },
              {
                key: "amount",
                label: "Amount",
                sortable: true,
                render: (value) => `${value} ${currency}`,
              },
              {
                key: "frequency",
                label: "Frequency",
              },
              {
                key: "status",
                label: "Status",
                render: (value) => {
                  const isActive = (value as string) === "Active";
                  return (
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {value as string}
                    </span>
                  );
                },
              },
              {
                key: "actions",
                label: "Actions",
                render: (_value, row) => {
                  const payment = row as unknown as RecurringPaymentType;
                  const isActive = payment.status === "Active";
                  const isToggling = togglingStatusId === payment._id;
                  const isPaying = payingId === payment._id;
                  return (
                    <div className="flex items-center w-full gap-2">
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                            isActive
                              ? "hover:bg-slate-500/10 text-slate-600 dark:text-slate-300"
                              : "hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                          title={isActive ? "Set Inactive" : "Set Active"}
                          aria-label={
                            isActive ? "Set Inactive" : "Set Active"
                          }
                          disabled={!!togglingStatusId || !!payingId}
                          onClick={() => handleToggleStatus(payment)}
                        >
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isActive ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded-lg hover:bg-btn-background/10 text-foreground transition-colors cursor-pointer"
                          title="Edit"
                          aria-label="Edit payment"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            payment._id && handleDeleteClick(payment._id)
                          }
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                          title="Delete"
                          aria-label="Delete payment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {isActive ? (
                        <div className="flex-1 flex justify-center min-w-0">
                          {(() => {
                            const payButton = (
                              <button
                                type="button"
                                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                                  canPayOnline
                                    ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                                    : "bg-red-100 text-red-700 border border-red-200 cursor-not-allowed dark:bg-red-500/25 dark:text-red-200/80 dark:border dark:border-red-400/30"
                                }`}
                                title={canPayOnline ? "Pay Now" : undefined}
                                aria-label={
                                  canPayOnline
                                    ? "Pay recurring payment now"
                                    : "Pay Now unavailable. Online payments are available only in INR."
                                }
                                disabled={
                                  !canPayOnline ||
                                  !!payingId ||
                                  !!togglingStatusId
                                }
                                onClick={() => handlePayNow(payment)}
                              >
                                {isPaying ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CreditCard className="w-3.5 h-3.5" />
                                )}
                                Pay Now
                              </button>
                            );

                            if (!canPayOnline) {
                              return (
                                <Tooltip
                                  variant="warning"
                                  side="top"
                                  label="Online payments are available only in INR."
                                >
                                  <span className="inline-flex">{payButton}</span>
                                </Tooltip>
                              );
                            }

                            return payButton;
                          })()}
                        </div>
                      ) : (
                        <div className="flex-1" />
                      )}
                    </div>
                  );
                },
              },
            ]}
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
            <Repeat className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-lg font-semibold text-foreground">
              {hasActiveFilters
                ? "No matching recurring payments"
                : "No recurring payments yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try changing your search or filters."
                : "Add a recurring payment to get reminded on schedule."}
            </p>
          </div>
          {!hasActiveFilters && (
            <Button width="w-auto" className="shrink-0" onClick={openAddForm}>
              <Plus className="w-4 h-4" />
              Recurring Payment
            </Button>
          )}
        </div>
      )}

      <RecurringPaymentForm
        open={isOpen}
        onOpenChange={handleFormOpenChange}
        onPaymentAdded={handlePaymentAdded}
        payment={selectedPayment}
      />
      <Confirmation
        open={!!deleteRecurringPaymentId}
        onOpenChange={(open) => !open && setDeleteRecurringPaymentId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        description="Are you sure you want to delete this recurring payment? This action cannot be undone."
      />
    </div>
  );
};

export default RecurringPayment;
