"use client";

import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, SelectBox, Button, showSuccess } from "./index";
import { TYPES, CATEGORY_LIST } from "@/lib/constants";
import {
  AddTransactionFormValues,
  AddTransactionProps,
} from "@/app/types/appTypes";

const AddTransaction: React.FC<AddTransactionProps> = ({
  open,
  onOpenChange,
}) => {
  const validationSchema = Yup.object().shape({
    date: Yup.date()
      .required("Date is required")
      .max(new Date(), "Date cannot be in the future"),
    description: Yup.string()
      .min(2, "Description must be at least 2 characters")
      .max(200, "Description must not exceed 200 characters")
      .required("Description is required"),
    category: Yup.string()
      .oneOf(CATEGORY_LIST, "Invalid category")
      .required("Category is required"),
    amount: Yup.number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    type: Yup.string()
      .oneOf(TYPES, "Invalid type")
      .required("Type is required"),
  });

  const handleSubmit = (values: AddTransactionFormValues) => {
    // For now, just show success and close dialog
    showSuccess("Transaction added successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add New Transaction
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            date: new Date().toISOString().split("T")[0],
            description: "",
            category: CATEGORY_LIST[0],
            amount: 0,
            type: TYPES[0],
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="date" label="Date" type="date" />
              <InputBox name="description" label="Description" />
              <SelectBox name="type" label="Type" options={TYPES} />
              <SelectBox
                name="category"
                label="Category"
                options={CATEGORY_LIST}
              />
              <InputBox name="amount" label="Amount" type="number" />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit">Add Transaction</Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransaction;
