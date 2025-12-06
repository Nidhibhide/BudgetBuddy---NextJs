"use client";

import React, { useState, useCallback } from "react";
import { Formik } from "formik";
import { Edit, Trash2, Plus, Eye, Loader2 } from "lucide-react";
import {
  Table,
  CustomPagination,
  NotFound,
  Button,
  SelectBox,
} from "@/app/features/common/index";
import { ViewUpcomingBill,Confirmation } from "../../dialogs";
import { UpcomingBillForm } from "../../forms";
import { useUpcomingBills } from "@/app/hooks";
import { UpcomingBill as UpcomingBillType } from "@/app/types/appTypes";
import { deleteUpcomingBill } from "@/app/lib/upcomingBill";
import { useToast } from "@/app/features/common";
import { useTranslations } from "next-intl";

const UpcomingBill: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const { upcomingBills, loading, pagination, refetch } = useUpcomingBills({
    status: selectedStatus,
    page: currentPage,
    limit: 10,
    sortBy,
    sortOrder,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<UpcomingBillType | null>(
    null
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteUpcomingBillId, setDeleteUpcomingBillId] = useState<string | null>(
    null
  );
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

  const handleBillAdded = () => {
    refetch(); // Refresh the list after adding or editing a bill
    setSelectedBill(null); // Reset selected bill after operation
  };

  const handleDeleteClick = (id: string) => {
    setDeleteUpcomingBillId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUpcomingBillId) return;

    setDeleting(true);
    try {
      const response = await deleteUpcomingBill(deleteUpcomingBillId, t);
      if (response.success) {
        showSuccess(response.message);
        // Refresh upcoming bills
        refetch();
        setDeleteUpcomingBillId(null);
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
                    options={[tCommon('ui.all'), t('forms.options.paid'), t('forms.options.unpaid')]}
                    value={selectedStatus}
                    onChange={handleStatusChange}
                  />
                </div>
              )}
            </Formik>
            <Button
              width="w-full sm:w-[180px]"
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
      ) : upcomingBills.length > 0 ? (
        <>
          <Table
            data={upcomingBills as UpcomingBillType[]}
            columns={[
              {
                key: "dueDate",
                label: t('backend.validation.dueDate'),
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
                label: t('backend.validation.reminderDate'),
                sortable: true,
                render: (value) =>
                  value
                    ? new Date(
                        value as string | number | Date
                      ).toLocaleDateString("en-GB")
                    : "",
              },
              { key: "title", label: t('backend.validation.title') },
              {
                key: "status",
                label: t('backend.validation.status'),
                render: (value) => (
                  <span
                    className={
                      (value as string) === "Paid"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
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
                        setSelectedBill(row as unknown as UpcomingBillType);
                        setViewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-background/10 rounded transition-colors cursor-pointer"
                      title={t('forms.buttons.edit')}
                      onClick={() => {
                        setSelectedBill(row as unknown as UpcomingBillType);
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
      <UpcomingBillForm
        open={isOpen}
        onOpenChange={setIsOpen}
        onBillAdded={handleBillAdded}
        bill={selectedBill}
      />
      <ViewUpcomingBill
        open={viewOpen}
        onOpenChange={setViewOpen}
        bill={selectedBill}
      />

      <Confirmation
        open={!!deleteUpcomingBillId}
        onOpenChange={(open) => !open && setDeleteUpcomingBillId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        description={tCommon('pages.upcomingBill.delete.confirm')}
      />
    </div>
  );
};

export default UpcomingBill;
