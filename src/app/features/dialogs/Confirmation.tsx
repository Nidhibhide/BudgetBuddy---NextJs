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
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-foreground text-background">
        <AlertDialogHeader>
          <AlertDialogTitle>{title || "Confirm Action"}</AlertDialogTitle>
          <AlertDialogDescription className="text-base font-medium">{description || "Are you sure you want to proceed with this action?"}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-red-500 hover:bg-red-600 cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-btn-background hover:bg-btn-hover cursor-pointer" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-background" />
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Confirmation;