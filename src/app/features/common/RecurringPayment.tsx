"use client";

import React, { useState } from "react";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import { Table, Button, ViewRecurringPayment, AddRecurringPaymentForm } from "@/app/features/common/index";
import { useSession } from "next-auth/react";

const RecurringPayment: React.FC = () => {
  const { data: session } = useSession();
  const [recurringPayments, setRecurringPayments] = useState([
    {
      id: "1",
      nextDueDate: "2023-12-01",
      reminderDate: "2023-11-28",
      title: "Gym Membership",
      description: "Monthly gym fee",
      amount: 500,
      frequency: "Monthly",
      status: "Active",
    },
    {
      id: "2",
      nextDueDate: "2023-12-15",
      reminderDate: "2023-12-10",
      title: "Insurance Premium",
      description: "Annual insurance payment",
      amount: 2000,
      frequency: "Yearly",
      status: "Active",
    },
    {
      id: "3",
      nextDueDate: "2023-12-20",
      reminderDate: "2023-12-15",
      title: "Subscription Service",
      description: "Monthly subscription",
      amount: 100,
      frequency: "Monthly",
      status: "Active",
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<typeof recurringPayments[0] | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const handlePaymentAdded = (data: { title: string; amount: number; frequency: string; nextDueDate: string; reminderDate: string; description?: string; status?: string }) => {
    setRecurringPayments([...recurringPayments, { id: Date.now().toString(), ...data, status: data.status || "Active", description: data.description || "" }]);
  };

  return (
    <div className="w-full p-4 space-y-3">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-end">
          <div className="flex gap-2">
            <Button
              width="w-full sm:w-[220px]"
              className="flex items-center justify-center gap-2"
              onClick={() => setIsOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Recurring Payment
            </Button>
          </div>
        </div>
      </div>

      <Table
        data={recurringPayments}
        columns={[
          {
            key: "nextDueDate",
            label: "Next Due Date",
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
            render: (value) => `${value} ${session?.user?.currency || 'INR'}`,
          },
          { key: "frequency", label: "Frequency" },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <span className={(value as string) === 'Active' ? 'text-green-500' : 'text-red-500'}>
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
                    setSelectedPayment(row as typeof recurringPayments[0]);
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
      <AddRecurringPaymentForm open={isOpen} onOpenChange={setIsOpen} onPaymentAdded={handlePaymentAdded} />
      <ViewRecurringPayment
        open={viewOpen}
        onOpenChange={setViewOpen}
        payment={selectedPayment}
      />
    </div>
  );
};
export default RecurringPayment;