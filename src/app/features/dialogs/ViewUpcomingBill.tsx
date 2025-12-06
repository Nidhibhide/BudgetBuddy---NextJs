"use client";

import React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <DialogTitle>{bill.title}</DialogTitle>
          
        </DialogHeader>
        <div className="space-y-1">
          <FieldDisplay
            label={t('backend.validation.dueDate')}
            value={formatDate(bill.dueDate)}
          />
          <FieldDisplay
            label={t('backend.validation.reminderDate')}
            value={formatDate(bill.reminderDate)}
          />
          <FieldDisplay
            label={t('backend.validation.description')}
            value={bill.description}
          />
          <FieldDisplay
            label={t('backend.validation.amount')}
            value={`${bill.amount} INR`}
          />
          <FieldDisplay
            label={t('backend.validation.status')}
            value={bill.status}
            valueClassName={bill.status === 'Paid' ? 'text-green-500' : 'text-red-500'}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUpcomingBill;