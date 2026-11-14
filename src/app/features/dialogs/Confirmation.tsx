"use client";

import React from "react";
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
  confirmLabel = "Delete",
}) => {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (loading && !nextOpen) return;
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent className="bg-card text-foreground border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{title || "Confirm Action"}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-base font-medium text-muted-foreground">
              {description ||
                "Are you sure you want to proceed with this action?"}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="bg-muted border border-border dark:border-white/20 text-foreground hover:bg-muted/80 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!loading) onConfirm();
            }}
            className="bg-btn-background text-white hover:bg-btn-hover cursor-pointer"
            disabled={loading}
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            )}
            {confirmLabel}

          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Confirmation;
