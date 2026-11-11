"use client";

import React, { useState, useCallback } from "react";
import { Formik } from "formik";
import { useSession } from "next-auth/react";
import { Edit, Trash2, Plus, Loader2, Repeat } from "lucide-react";
import {
  Table,
  CustomPagination,
  Button,
  SelectBox,
} from "@/app/features/common/index";
import { Confirmation } from "../../dialogs";
import { RecurringPayment as RecurringPaymentForm } from "@/app/features/forms";
import { useRecurringPayments } from "@/app/hooks";
import { RecurringPayment as RecurringPaymentType } from "@/app/types/appTypes";
import { deleteRecurringPayment } from "@/app/lib/recurringPayment";
import { useToast } from "@/app/features/common";

const RecurringPayment: React.FC = () => {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";
  const { showSuccess, showError } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("nextDueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const { recurringPayments, loading, pagination, refetch } =
    useRecurringPayments({
      status: selectedStatus,
      page: currentPage,
      limit: 10,
      sortBy,
      sortOrder,
    });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<RecurringPaymentType | null>(null);
  const [deleteRecurringPaymentId, setDeleteRecurringPaymentId] = useState<
    string | null
  >(null);
  const [deleting, setDeleting] = useState(false);

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

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
        <Formik
          initialValues={{ status: selectedStatus }}
          enableReinitialize
          onSubmit={() => {}}
        >
          {() => (
            <div className="w-full sm:w-[180px]">
              <SelectBox
                name="status"
                options={["All", "Active", "Inactive"]}
                value={selectedStatus}
                onChange={handleStatusChange}
              />
            </div>
          )}
        </Formik>
        {!loading && recurringPayments.length > 0 && (
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

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-btn-background" />
        </div>
      ) : recurringPayments.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Table
            data={recurringPayments as RecurringPaymentType[]}
            title="Recurring payments"
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
                render: (value) => (
                  <span
                    className={
                      (value as string) === "Active"
                        ? "text-success"
                        : "text-destructive"
                    }
                  >
                    {value as string}
                  </span>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (_value, row) => (
                  <div className="flex gap-1 justify-end md:justify-start">
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-btn-background/10 text-foreground transition-colors cursor-pointer"
                      title="Edit"
                      aria-label="Edit payment"
                      onClick={() => {
                        setSelectedPayment(
                          row as unknown as RecurringPaymentType
                        );
                        setIsOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(row._id as string)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                      title="Delete"
                      aria-label="Delete payment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ),
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
              No recurring payments yet
            </p>
            <p className="text-sm text-muted-foreground">
              Add a recurring payment to get reminded on schedule.
            </p>
          </div>
          <Button width="w-auto" className="shrink-0" onClick={openAddForm}>
            <Plus className="w-4 h-4" />
            Recurring Payment
          </Button>
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
