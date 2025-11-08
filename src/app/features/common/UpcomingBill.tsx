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
import { ViewUpcomingBill,Confirmation } from "../dialogs";
import { UpcomingBillForm } from "../forms";
import { useUpcomingBills } from "@/app/hooks";
import { UpcomingBill as UpcomingBillType } from "@/app/types/appTypes";
import { deleteUpcomingBill } from "@/app/lib/upcomingBill";
import { showSuccess, showError } from "@/app/features/common";

const UpcomingBill: React.FC = () => {
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
      const response = await deleteUpcomingBill(deleteUpcomingBillId);
      if (response.success) {
        showSuccess(response.message);
        // Refresh upcoming bills
        refetch();
        setDeleteUpcomingBillId(null);
      } else {
        showError(response.message || "Failed to delete upcoming bill");
      }
    } catch (error) {
      console.error("Error deleting upcoming bill:", error);
      showError("An unexpected error occurred while deleting the upcoming bill");
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
                    options={["All", "Paid", "Unpaid"]}
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
              Add Upcoming Bill
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
                key: "status",
                label: "Status",
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
                label: "Actions",
                render: (value, row) => (
                  <div className="flex gap-2">
                    <button
                      className="p-1 hover:bg-background/10 rounded transition-colors cursor-pointer"
                      title="View"
                      onClick={() => {
                        setSelectedBill(row as unknown as UpcomingBillType);
                        setViewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-background/10 rounded transition-colors cursor-pointer"
                      title="Edit"
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
          title="No Upcoming Bills Found"
          message="It looks like there are no upcoming bills. Add your first upcoming bill to get started!"
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
        description={`Are you sure you want to delete this upcoming bill? This action cannot be undone.`}
      />
    </div>
  );
};

export default UpcomingBill;
