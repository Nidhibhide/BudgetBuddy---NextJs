"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/app/lib/dateUtils";
import { FieldDisplay } from "@/app/features/common";

import { ViewUpcomingBillProps } from "@/app/types/appTypes";

const ViewUpcomingBill: React.FC<ViewUpcomingBillProps> = ({
  open,
  onOpenChange,
  bill,
}) => {
  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <DialogTitle>{bill.title}</DialogTitle>
          <DialogDescription>Bill Details</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <FieldDisplay
            label="Due Date"
            value={formatDate(bill.dueDate)}
          />
          <FieldDisplay
            label="Reminder Date"
            value={formatDate(bill.reminderDate)}
          />
          <FieldDisplay
            label="Description"
            value={bill.description}
          />
          <FieldDisplay
            label="Amount"
            value={`${bill.amount} INR`}
          />
          <FieldDisplay
            label="Status"
            value={bill.status}
            valueClassName={bill.status === 'Paid' ? 'text-green-500' : 'text-red-500'}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUpcomingBill;