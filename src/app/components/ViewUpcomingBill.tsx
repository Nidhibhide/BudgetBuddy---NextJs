"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewUpcomingBillProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: {
    id: string;
    dueDate: string;
    reminderDate: string;
    title: string;
    description: string;
    amount: number;
    status: string;
  } | null;
}

const ViewUpcomingBill: React.FC<ViewUpcomingBillProps> = ({
  open,
  onOpenChange,
  bill,
}) => {
  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{bill.title}</DialogTitle>
          <DialogDescription>Bill Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Due Date:</label>
            <p>{new Date(bill.dueDate).toLocaleDateString("en-GB")}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Reminder Date:</label>
            <p>{new Date(bill.reminderDate).toLocaleDateString("en-GB")}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Description:</label>
            <p>{bill.description}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Amount:</label>
            <p>{bill.amount} INR</p>
          </div>
          <div>
            <label className="text-sm font-medium">Status:</label>
            <p className={bill.status === 'Paid' ? 'text-green-500' : 'text-red-500'}>
              {bill.status}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUpcomingBill;