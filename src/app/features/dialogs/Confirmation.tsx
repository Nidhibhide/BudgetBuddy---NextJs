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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card text-foreground border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{title || "Confirm Action"}</AlertDialogTitle>
          <AlertDialogDescription className="text-base font-medium text-muted-foreground">
            {description ||
              "Are you sure you want to proceed with this action?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border border-border text-foreground hover:bg-sidebar-hover cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-btn-background text-white hover:bg-btn-hover cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Confirmation;
