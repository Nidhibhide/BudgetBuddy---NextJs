"use client";

import React from "react";
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('common');
  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <DialogTitle>{bill.title}</DialogTitle>
          <DialogDescription>{t('ui.billDetails')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1">
          <FieldDisplay
            label={t('fields.date')}
            value={formatDate(bill.dueDate)}
          />
          <FieldDisplay
            label={t('fields.date')}
            value={formatDate(bill.reminderDate)}
          />
          <FieldDisplay
            label={t('fields.description')}
            value={bill.description}
          />
          <FieldDisplay
            label={t('fields.amount')}
            value={`${bill.amount} INR`}
          />
          <FieldDisplay
            label={t('fields.status')}
            value={bill.status}
            valueClassName={bill.status === 'Paid' ? 'text-green-500' : 'text-red-500'}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUpcomingBill;