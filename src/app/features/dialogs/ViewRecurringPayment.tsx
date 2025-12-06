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

import { ViewRecurringPaymentProps } from "@/app/types/appTypes";

const ViewRecurringPayment: React.FC<ViewRecurringPaymentProps> = ({
  open,
  onOpenChange,
  payment,
}) => {
  const t = useTranslations();

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <DialogTitle>{payment.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          <FieldDisplay
            label={t('backend.validation.nextDueDate')}
            value={formatDate(payment.nextDueDate)}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label={t('backend.validation.reminderDate')}
            value={formatDate(payment.reminderDate)}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label={t('backend.validation.description')}
            value={payment.description}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label={t('backend.validation.amount')}
            value={`${payment.amount} INR`}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label={t('backend.validation.frequency')}
            value={payment.frequency}
            labelWidth="w-[130px]"
          />
          <FieldDisplay
            label={t('backend.validation.status')}
            value={payment.status}
            valueClassName={
              payment.status === "Active" ? "text-green-500" : "text-red-500"
            }
            labelWidth="w-[130px]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRecurringPayment;
