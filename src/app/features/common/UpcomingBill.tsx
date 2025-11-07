"use client";

import React, { useState } from "react";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import { Table, Button, ViewUpcomingBill, AddUpcomingBillForm } from "@/app/features/common/index";

const UpcomingBill: React.FC = () => {
  const [upcomingBills, setUpcomingBills] = useState([
    {
      id: "1",
      dueDate: "2023-12-01",
      reminderDate: "2023-11-30",
      title: "Electricity Bill",
      description: "Monthly electricity bill",
      amount: 150,
      status: "Unpaid",
    },
    {
      id: "2",
      dueDate: "2023-12-15",
      reminderDate: "2023-12-10",
      title: "Internet Bill",
      description: "Monthly internet bill",
      amount: 50,
      status: "Unpaid",
    },
    {
      id: "3",
      dueDate: "2023-12-20",
      reminderDate: "2023-12-15",
      title: "Rent",
      description: "Monthly rent payment",
      amount: 1000,
      status: "Unpaid",
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<typeof upcomingBills[0] | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const handleBillAdded = (data: { dueDate: string; title: string; description: string; amount: number; reminderDate: string; status?: string }) => {
    setUpcomingBills([...upcomingBills, { id: Date.now().toString(), ...data, status: data.status || "Unpaid" }]);
  };

  return (
    <div className="w-full p-4 space-y-3">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-end">
          <div className="flex gap-2">
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

      <Table
        data={upcomingBills}
        columns={[
          {
            key: "dueDate",
            label: "Due Date",
            render: (value) =>
              value
                ? new Date(value as string | number | Date).toLocaleDateString(
                    "en-GB"
                  )
                : "",
          },
          {
            key: "reminderDate",
            label: "Reminder Date",
            render: (value) =>
              value
                ? new Date(value as string | number | Date).toLocaleDateString(
                    "en-GB"
                  )
                : "",
          },
          { key: "title", label: "Title" },
          { key: "description", label: "Description" },
          {
            key: "amount",
            label: "Amount",
            render: (value) => `${value} INR`,
          },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <span className={(value as string) === 'Paid' ? 'text-green-500' : 'text-red-500'}>
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
                    setSelectedBill(row as typeof upcomingBills[0]);
                    setViewOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-background/10 rounded transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ),
          },
        ]}

      />
      <AddUpcomingBillForm open={isOpen} onOpenChange={setIsOpen} onBillAdded={handleBillAdded} />
      <ViewUpcomingBill
        open={viewOpen}
        onOpenChange={setViewOpen}
        bill={selectedBill}
      />
    </div>
  );
};

export default UpcomingBill;
