"use client";

import React from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ViewTransactionProps } from "@/app/types/appTypes";
import { formatDate } from "@/app/lib/dateUtils";
import { FieldDisplay } from "@/app/features/common";

const ViewTransaction: React.FC<ViewTransactionProps> = ({
  open,
  onOpenChange,
  transaction,
}) => {
  const { data: session } = useSession();

  if (!transaction) return null;

  const currency = session?.user?.currency || "INR";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <DialogTitle>View Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          <FieldDisplay
            label="Date"
            value={transaction.date ? formatDate(transaction.date) : ""}
          />
          <FieldDisplay
            label="Title"
            value={transaction.title || ""}
          />
          <FieldDisplay
            label="Description"
            value={transaction.description || ""}
          />
          <FieldDisplay
            label="Category"
            value={String(transaction.category || "")}
          />
          <FieldDisplay
            label="Amount"
            value={`${transaction.amount} ${currency}`}
          />
          <FieldDisplay
            label="Type"
            value={transaction.type || ""}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTransaction;
