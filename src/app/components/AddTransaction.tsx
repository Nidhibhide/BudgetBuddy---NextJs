"use client";

import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, SelectBox, TextareaBox, Button, showSuccess, showError } from "./index";
import { TYPES} from "@/lib/constants";
import { getCategoryDetails } from "@/app/lib/category";
import { addTransaction } from "@/app/lib/transaction";
import {
  AddTransactionFormValues,
  AddTransactionProps,
  Category,
} from "@/app/types/appTypes";

const AddTransaction: React.FC<AddTransactionProps> = ({
  open,
  onOpenChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    date: Yup.date()
      .required("Date is required")
      .max(new Date(), "Date cannot be in the future"),
    title: Yup.string()
      .min(1, "Title must be at least 1 character")
      .max(100, "Title must not exceed 100 characters")
      .required("Title is required"),
    description: Yup.string()
      .min(2, "Description must be at least 2 characters")
      .max(200, "Description must not exceed 200 characters")
      .required("Description is required"),
    category: Yup.string().required("Category is required"),
    amount: Yup.number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    type: Yup.string()
      .oneOf(TYPES, "Invalid type")
      .required("Type is required"),
  });

  const fetchCategories = async (
    type: string,
    setFieldValue?: (field: string, value: string) => void
  ) => {
    setLoadingCategories(true);
    try {
      const response = await getCategoryDetails(type);
      if (response.success) {
        setCategories(response.data || []);
        if (setFieldValue && response.data && response.data.length > 0) {
          setFieldValue("category", response.data[0].name);
        }
      } else {
        console.error("Failed to fetch categories:", response.message);
        setCategories([]);
        // TODO: Show user-friendly error message
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      // TODO: Show user-friendly error message
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleTypeChange = (
    value: string,
    setFieldValue: (field: string, value: string) => void
  ) => {
    fetchCategories(value, setFieldValue);
  };

  useEffect(() => {
    if (open) {
      fetchCategories(TYPES[0]); // Fetch categories for default type (Expense)
    }
  }, [open]);

  const handleSubmit = async (values: AddTransactionFormValues) => {
    setLoading(true);
    try {
      const response = await addTransaction(values);
      if (response.success) {
        showSuccess("Transaction added successfully");
        onOpenChange(false);
      } else {
        showError(response.message || "Failed to add transaction");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      showError("An unexpected error occurred while adding the transaction");
    } finally {
      setLoading(false);
    }
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
            title: "",
            description: "",
            category: categories[0]?.name || "",
            amount: 1,
            type: TYPES[0],
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="date" label="Date" type="date" />
              <SelectBox
                name="type"
                label="Type"
                options={TYPES}
                onChange={(value) => handleTypeChange(value, setFieldValue)}
              />
              <SelectBox
                name="category"
                label="Category"
                options={
                  loadingCategories
                    ? ["Loading..."]
                    : categories.map((cat) => cat.name)
                }
              />
              <InputBox name="title" label="Title" />

              <TextareaBox name="description" label="Description" />
              <InputBox name="amount" label="Amount" type="number" />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Transaction"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransaction;
