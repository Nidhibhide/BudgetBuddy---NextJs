"use client";
import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Button, SelectBox } from "./index";
import { CategoryRemovalDialogProps } from "../types/appTypes";

const CategoryRemovalDialog: React.FC<CategoryRemovalDialogProps> = ({
  open,
  categoriesToRemove,
  reassignMap,
  availableCategories,
  onClose,
  onArchive,
  onReassign,
  onReassignMapChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="text-center font-bold">
        Remove Categories with Transactions
      </DialogTitle>
      <DialogContent className="text-center">
        <p className="mb-4">
          This category has {categoriesToRemove.length} transactions.
        </p>
        <p className="mb-6">Choose what you want to do:</p>
        <div className="flex flex-col gap-4">
          <Button
            onClick={onArchive}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            🟡 Archive this category (Hide it but keep old records)
          </Button>
          <div className="flex flex-col gap-2">
            <Button
              onClick={onReassign}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              🟢 Reassign records to another category
            </Button>
            <div className="mt-2 space-y-2">
              {categoriesToRemove.map((category) => (
                <div key={category} className="flex items-center justify-center gap-2">
                  <span className="font-medium">{category} →</span>
                  <SelectBox
                    label=""
                    value={reassignMap[category] || ""}
                    onChange={(e) => onReassignMapChange(category, e.target.value as string)}
                    options={availableCategories}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            🔵 Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryRemovalDialog;