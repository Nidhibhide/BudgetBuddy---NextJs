"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();

  if (!transaction) return null;

  const currency = session?.user?.currency || "INR";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground">
        <DialogHeader>
          <DialogTitle>{transaction.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          <FieldDisplay
            label={t('backend.validation.date')}
            value={transaction.date ? formatDate(transaction.date) : ""}
          />
          <FieldDisplay
            label={t('backend.validation.title')}
            value={transaction.title || ""}
          />
          <FieldDisplay
            label={t('backend.validation.description')}
            value={transaction.description || ""}
          />
          <FieldDisplay
            label={t('backend.validation.category')}
            value={String(transaction.category || "")}
          />
          <FieldDisplay
            label={t('backend.validation.amount')}
            value={`${transaction.amount} ${currency}`}
          />
          <FieldDisplay
            label={t('backend.validation.type')}
            value={transaction.type === "Expense" ? t('common.ui.expense') : t('common.ui.income')}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTransaction;
