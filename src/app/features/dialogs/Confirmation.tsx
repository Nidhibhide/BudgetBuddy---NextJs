"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ConfirmationProps } from "@/app/types/appTypes";
import { Loader2 } from "lucide-react";

const Confirmation: React.FC<ConfirmationProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  loading = false,
}) => {
  const t = useTranslations();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-foreground text-background">
        <AlertDialogHeader>
          <AlertDialogTitle>{title || t('dialogs.confirmation.title')}</AlertDialogTitle>
          <AlertDialogDescription className="text-base font-medium">{description || t('dialogs.confirmation.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-red-500 hover:bg-red-600 cursor-pointer">{t('forms.buttons.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-btn-background hover:bg-btn-hover cursor-pointer" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-background" />
              </>
            ) : (
              t('forms.buttons.delete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Confirmation;