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
import { useToast } from "@/app/features/common";
import { useTranslations } from "next-intl";

const RecurringPayment: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const t = useTranslations();
  const tCommon = useTranslations('common');
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
      const response = await deleteRecurringPayment(deleteRecurringPaymentId, t);
      if (response.success) {
        showSuccess(response.message);
        // Refresh recurring payments
        refetch();
        setDeleteRecurringPaymentId(null);
      } else {
        showError(response.message || t('backend.api.errorOccurred'));
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {

      showError(t('backend.api.errorOccurred'));
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
                    options={[tCommon('ui.all'), t('forms.options.active'), t('forms.options.inactive')]}
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
              {t('forms.buttons.add')}
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
              label: t('backend.validation.nextDueDate'),
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
              label: t('backend.validation.reminderDate'),
              sortable: true,
              render: (value) =>
                value
                  ? new Date(value as string | number | Date).toLocaleDateString(
                      "en-GB"
                    )
                  : "",
            },
            { key: "title", label: t('backend.validation.title') },
            {
              key: "status",
              label: t('backend.validation.status'),
              render: (value) => (
                <span className={(value as string) === 'Active' ? 'text-green-500' : 'text-red-500'}>
                  {value as string}
                </span>
              ),
            },
            {
              key: "actions",
              label: tCommon('ui.actions'),
              render: (value, row) => (
                <div className="flex gap-2">
                  <button
                    className="p-1 hover:bg-background/10 rounded transition-colors cursor-pointer"
                    title={t('forms.buttons.view')}
                    onClick={() => {
                      setSelectedPayment(row as unknown as RecurringPaymentType);
                      setViewOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-background/10 rounded transition-colors cursor-pointer"
                    title={t('forms.buttons.edit')}
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
                    title={t('forms.buttons.delete')}
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
         title={tCommon('notFound.defaultTitle')}
          message={tCommon('notFound.defaultMessage')}
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
        description={tCommon('pages.recurringPayment.delete.confirm')}
      />
    </div>
  );
};
export default RecurringPayment;