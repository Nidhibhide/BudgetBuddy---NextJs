"use client";

import React from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
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
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle>{bill.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          <FieldDisplay label="Due Date" value={formatDate(bill.dueDate)} />
          <FieldDisplay
            label="Reminder Date"
            value={formatDate(bill.reminderDate)}
          />
          <FieldDisplay label="Description" value={bill.description || "—"} />
          <FieldDisplay
            label="Amount"
            value={`${bill.amount} ${currency}`}
          />
          <FieldDisplay
            label="Status"
            value={bill.status}
            valueClassName={
              bill.status === "Paid" ? "text-success" : "text-destructive"
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUpcomingBill;
