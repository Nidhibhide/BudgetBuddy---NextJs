"use client";

import React, { useState, useCallback } from "react";
import { Formik } from "formik";
import { Edit, Trash2, Plus, Eye, Loader2 } from "lucide-react";
import { Table, CustomPagination, NotFound, Button, SelectBox } from "@/app/features/common/index";
import { Confirmation,ViewRecurringPayment } from "../../dialogs";
import { RecurringPayment as RecurringPaymentForm } from "@/app/features/forms";
import { useRecurringPayments } from "@/app/hooks";
import { RecurringPayment as RecurringPaymentType } from "@/app/types/appTypes";
import { deleteRecurringPayment } from "@/app/lib/recurringPayment";
import { showSuccess, showError } from "@/app/features/common";
import { useTranslations } from 'next-intl';

const RecurringPayment: React.FC = () => {
  const t = useTranslations('pages');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("nextDueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const { recurringPayments, loading, pagination, refetch } = useRecurringPayments({
    status: selectedStatus,
    page: currentPage,
    limit: 10,
    sortBy,
    sortOrder,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RecurringPaymentType | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteRecurringPaymentId, setDeleteRecurringPaymentId] = useState<string | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  }, [sortBy, sortOrder]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handlePaymentAdded = () => {
    refetch();
    setSelectedPayment(null); // Reset selected payment after operation
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
        // Refresh recurring payments
        refetch();
        setDeleteRecurringPaymentId(null);
      } else {
        showError(response.message || "Failed to delete recurring payment");
      }
    } catch (error) {
      console.error("Error deleting recurring payment:", error);
      showError("An unexpected error occurred while deleting the recurring payment");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full p-4 space-y-3">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-end">
          <div className="flex gap-2">
            <Formik
              initialValues={{ status: selectedStatus }}
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
            <Button
              width="w-full sm:w-[220px]"
              className="flex items-center justify-center gap-2"
              onClick={() => setIsOpen(true)}
            >
              <Plus className="w-4 h-4" />
              {t('recurringPayment.addRecurringPayment')}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      ) : recurringPayments.length > 0 ? (
        <>
          <Table
            data={recurringPayments as RecurringPaymentType[]}
            columns={[
            {
              key: "nextDueDate",
              label: t('recurringPayment.nextDueDate'),
              sortable: true,
              render: (value) =>
                value
                  ? new Date(value as string | number | Date).toLocaleDateString(
                      "en-GB"
                    )
                  : "",
            },
            {
              key: "reminderDate",
              label: t('recurringPayment.reminderDate'),
              sortable: true,
              render: (value) =>
                value
                  ? new Date(value as string | number | Date).toLocaleDateString(
                      "en-GB"
                    )
                  : "",
            },
            { key: "title", label: t('recurringPayment.title') },
            {
              key: "status",
              label: t('recurringPayment.status'),
              render: (value) => (
                <span className={(value as string) === 'Active' ? 'text-green-500' : 'text-red-500'}>
                  {value as string}
                </span>
              ),
            },
            {
              key: "actions",
              label: t('recurringPayment.actions'),
              render: (value, row) => (
                <div className="flex gap-2">
                  <button
                    className="p-1 hover:bg-background/10 rounded transition-colors cursor-pointer"
                    title="View"
                    onClick={() => {
                      setSelectedPayment(row as unknown as RecurringPaymentType);
                      setViewOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-background/10 rounded transition-colors cursor-pointer"
                    title="Edit"
                    onClick={() => {
                      setSelectedPayment(row as unknown as RecurringPaymentType);
                      setIsOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(row._id as string)}
                    className="p-1 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ),
            },
          ]}
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
        </>
      ) : (
        <NotFound
          title={t('recurringPayment.noRecurringPaymentsFound')}
          message={t('recurringPayment.noRecurringPaymentsMessage')}
        />
      )}
      <RecurringPaymentForm open={isOpen} onOpenChange={setIsOpen} onPaymentAdded={handlePaymentAdded} payment={selectedPayment} />
      <ViewRecurringPayment
        open={viewOpen}
        onOpenChange={setViewOpen}
        payment={selectedPayment}
      />

      <Confirmation
        open={!!deleteRecurringPaymentId}
        onOpenChange={(open) => !open && setDeleteRecurringPaymentId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        description={t('recurringPayment.deleteConfirmation')}
      />
    </div>
  );
};
export default RecurringPayment;