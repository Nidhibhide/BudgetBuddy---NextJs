"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputBox,
  SelectBox,
  TextareaBox,
  Button,
  useToast,
} from "@/app/features/common/index";
import { TYPES } from "@/constants";
import { getCategoryDetails } from "@/app/lib/category";
import { addTransaction, editTransaction } from "@/app/lib/transaction";
import {
  Transaction as TransactionType,
  AddTransactionProps,
  Category,
} from "@/app/types/appTypes";

const SyncDefaultCategory: React.FC<{
  categories: Category[];
  isEdit: boolean;
}> = ({ categories, isEdit }) => {
  const { values, setFieldValue } = useFormikContext<TransactionType>();

  useEffect(() => {
    if (!isEdit && categories.length > 0 && !values.category) {
      setFieldValue("category", categories[0].name);
    }
  }, [categories, isEdit, values.category, setFieldValue]);

  return null;
};

const Transaction: React.FC<AddTransactionProps> = ({
  open,
  onOpenChange,
  onTransactionAdded,
  transaction,
}) => {
  const { data: session } = useSession();
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const isEdit = !!transaction?._id;

  const validationSchema = Yup.object().shape({
    date: Yup.date()
      .required("Date is required")
      .max(new Date(), "Date cannot be in the future"),
    title: Yup.string()
      .min(1, "Title must be at least 1 character")
      .max(100, "Title must be at most 100 characters")
      .required("Title is required"),
    description: Yup.string()
      .transform((value) => (value === "" ? undefined : value))
      .min(2, "Description must be at least 2 characters")
      .max(200, "Description must be at most 200 characters")
      .optional(),
    category: Yup.string().required("Category is required"),
    amount: Yup.number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    type: Yup.string()
      .oneOf(["Expense", "Income"], "Invalid type")
      .required("Type is required"),
  });

  const fetchCategories = useCallback(
    async (
      type: string,
      setFieldValue?: (field: string, value: string) => void
    ) => {
      try {
        const response = await getCategoryDetails(type);
        if (response.success) {
          const list = response.data || [];
          setCategories(list);
          if (setFieldValue) {
            setFieldValue("category", list[0]?.name || "");
          }
        } else {
          setCategories([]);
          if (setFieldValue) setFieldValue("category", "");
        }
      } catch {
        setCategories([]);
        if (setFieldValue) setFieldValue("category", "");
      }
    },
    []
  );

  const handleTypeChange = (
    value: string,
    setFieldValue: (field: string, value: string) => void
  ) => {
    setFieldValue("type", value);
    setFieldValue("category", "");
    fetchCategories(value, setFieldValue);
  };

  useEffect(() => {
    if (open) {
      const typeToFetch = transaction?.type || TYPES[0];
      fetchCategories(typeToFetch);
    } else {
      setCategories([]);
    }
  }, [open, transaction, fetchCategories]);

  const handleSubmit = async (values: TransactionType) => {
    if (!values.category) {
      showError("Please select a category");
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...values,
        date: new Date(values.date as string | Date).toISOString(),
        description: values.description?.trim() || "",
      };
      const response = transaction?._id
        ? await editTransaction(transaction._id, data)
        : await addTransaction(data);
      if (response.success) {
        showSuccess(response.message);
        onOpenChange(false);
        onTransactionAdded?.();
      } else {
        showError(response.message);
      }
    } catch {
      showError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const categoryValue =
    typeof transaction?.category === "string"
      ? transaction.category
      : (transaction?.category as { name?: string } | undefined)?.name || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEdit ? "Edit Form" : "Add Form"}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            date: new Date(transaction?.date || Date.now())
              .toISOString()
              .split("T")[0],
            title: transaction?.title || "",
            description: transaction?.description || "",
            category: categoryValue,
            amount: transaction?.amount || 1,
            type: transaction?.type || "Expense",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <SyncDefaultCategory categories={categories} isEdit={isEdit} />
              <InputBox name="date" label="Date" type="date" />
              <SelectBox
                name="type"
                label="Type"
                options={["Expense", "Income"]}
                onChange={(value) => handleTypeChange(value, setFieldValue)}
              />
              <SelectBox
                name="category"
                label="Category"
                options={categories.map((cat) => cat.name)}
              />
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground -mt-2">
                  No categories yet. Add a category first.
                </p>
              )}
              <InputBox name="title" label="Title" />
              <TextareaBox name="description" label="Description" />
              <InputBox
                name="amount"
                label={`Amount (${session?.user?.currency || "INR"})`}
                type="number"
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  bgColor="bg-transparent border border-border"
                  hoverColor="hover:bg-sidebar-hover"
                  className="text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={categories.length === 0 && !isEdit}
                >
                  {isEdit ? "Update" : "Add"}
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
