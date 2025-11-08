"use client";

import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, SelectBox, TextareaBox, Button, showSuccess, showError } from "@/app/features/common/index";
import { TYPES} from "@/lib/constants";
import { getCategoryDetails } from "@/app/lib/category";
import { addTransaction, editTransaction } from "@/app/lib/transaction";
import {
Transaction as TransactionType,
  AddTransactionProps,
  Category,
} from "@/app/types/appTypes";

const Transaction: React.FC<AddTransactionProps> = ({
  open,
  onOpenChange,
  onTransactionAdded,
  transaction,
}) => {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  
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
      const typeToFetch = transaction?.type || TYPES[0];
      fetchCategories(typeToFetch);
    }
  }, [open, transaction]);

  const handleSubmit = async (values: TransactionType) => {
    setLoading(true);
    try {
      const response = transaction?._id
        ? await editTransaction(transaction._id, { ...values, type: undefined })
        : await addTransaction(values);
      if (response.success) {
        showSuccess(response.message);
        onOpenChange(false);
        onTransactionAdded?.();
      } else {
        showError(response.message);
      }
    } catch (error) {
      console.error(`Error ${transaction?._id ? 'updating' : 'adding'} transaction:`, error);
      showError("An unexpected error occurred while processing the transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {transaction?._id ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            date: new Date(transaction?.date || Date.now()).toISOString().split("T")[0],
            title: transaction?.title || "",
            description: transaction?.description || "",
            category: transaction?.category || "NA",
            amount: transaction?.amount || 1,
            type: transaction?.type || TYPES[0],
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
                options={categories.length === 0 ? ["NA"] : categories.map((cat) => cat.name)}
              />
              <InputBox name="title" label="Title" />

              <TextareaBox name="description" label="Description" />
              <InputBox name="amount" label={`Amount (${session?.user?.currency || 'INR'})`} type="number" />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  {transaction?._id ? "Update Transaction" : "Add Transaction"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default Transaction;
