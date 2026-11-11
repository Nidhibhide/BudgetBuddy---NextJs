"use client";

import React, { useState, useCallback } from "react";
import { Formik } from "formik";
import { useSession } from "next-auth/react";
import { Edit, Trash2, Plus, Loader2, Receipt } from "lucide-react";
import {
  Table,
  CustomPagination,
  Button,
  SelectBox,
} from "@/app/features/common/index";
import { Confirmation } from "../../dialogs";
import { UpcomingBillForm } from "../../forms";
import { useUpcomingBills } from "@/app/hooks";
import { UpcomingBill as UpcomingBillType } from "@/app/types/appTypes";
import { deleteUpcomingBill } from "@/app/lib/upcomingBill";
import { useToast } from "@/app/features/common";

const UpcomingBill: React.FC = () => {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";
  const { showSuccess, showError } = useToast();
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
  const [deleteUpcomingBillId, setDeleteUpcomingBillId] = useState<
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
    setSelectedBill(null);
    setIsOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setSelectedBill(null);
  };

  const handleBillAdded = () => {
    refetch();
    setSelectedBill(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteUpcomingBillId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUpcomingBillId) return;

    setDeleting(true);
    try {
      const response = await deleteUpcomingBill(deleteUpcomingBillId);
      if (response.success) {
        showSuccess(response.message);
        refetch();
        setDeleteUpcomingBillId(null);
      } else {
        showError(
          response.message || "Couldn’t delete this bill. Please try again."
        );
      }
    } catch {
      showError("Couldn’t delete this bill. Please try again.");
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
                options={["All", "Paid", "Unpaid"]}
                value={selectedStatus}
                onChange={handleStatusChange}
              />
            </div>
          )}
        </Formik>
        {!loading && upcomingBills.length > 0 && (
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
      ) : upcomingBills.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Table
            data={upcomingBills as UpcomingBillType[]}
            title="Upcoming bills"
            columns={[
              {
                key: "dueDate",
                label: "Due Date",
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
                key: "status",
                label: "Status",
                render: (value) => (
                  <span
                    className={
                      (value as string) === "Paid"
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
                      aria-label="Edit bill"
                      onClick={() => {
                        setSelectedBill(row as unknown as UpcomingBillType);
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
                      aria-label="Delete bill"
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
            <Receipt className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-lg font-semibold text-foreground">
              No upcoming bills yet
            </p>
            <p className="text-sm text-muted-foreground">
              Add a bill reminder so you never miss a due date.
            </p>
          </div>
          <Button width="w-auto" className="shrink-0" onClick={openAddForm}>
            <Plus className="w-4 h-4" />
            Upcoming Bill
          </Button>
        </div>
      )}

      <UpcomingBillForm
        open={isOpen}
        onOpenChange={handleFormOpenChange}
        onBillAdded={handleBillAdded}
        bill={selectedBill}
      />
      <Confirmation
        open={!!deleteUpcomingBillId}
        onOpenChange={(open) => !open && setDeleteUpcomingBillId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        description="Are you sure you want to delete this upcoming bill? This action cannot be undone."
      />
    </div>
  );
};

export default UpcomingBill;
