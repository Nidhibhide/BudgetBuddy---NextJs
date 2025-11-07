"use client";

import React, { useState} from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, SelectBox, Button, showSuccess, showError} from "@/app/features/common/index";
import { TYPES } from "@/lib/constants";
import { Category, AddCategoryProps} from "@/app/types/appTypes";
import { createCategory, editCategory } from "@/app/lib/category";

const AddCategory: React.FC<AddCategoryProps> = ({
  open,
  onOpenChange,
  onCategoryAdded,
  category,
  onCategoryEdited,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!category;

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .required("Name is required"),
    budgetLimit: Yup.number().min(0, "Budget limit must be positive").max(1000000, "Budget limit too high"),
    goal: Yup.number().min(0, "Goal must be positive").max(1000000, "Goal too high"),
    ...(isEdit ? {} : {
        type: Yup.string()
          .oneOf(TYPES, "Invalid type")
          .required("Type is required"),
      }),
  });


  const handleSubmit = async (
    values: Category | { name: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    setIsLoading(true);
    try {
      const response = isEdit
        ? await editCategory(category._id!, values as Category)
        : await createCategory(values as Category);
      if (response.success) {
        showSuccess(response.message);
        resetForm();
        onOpenChange(false);
        if (isEdit) {
          onCategoryEdited?.();
        } else {
          onCategoryAdded?.();
        }
      } else {
        showError(response.message);
      }
    } catch {
      showError(
        `Something went wrong while ${isEdit ? "editing" : "creating"} category`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = () => {
    // No icon suggestions logic needed
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEdit ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={
            isEdit ? { name: category.name, budgetLimit: category.budgetLimit || 0, goal: category.goal || 0, type: category.type } : { name: "", type: TYPES[0], budgetLimit: 0, goal: 0 }
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, values }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="name" label="Category Name" onChange={handleNameChange} />
              {!isEdit && (
                <>
                  <SelectBox name="type" label="Type" options={TYPES} />
                </>
              )}
              {(isEdit ? category.type === "Expense" : values.type === "Expense") && (
                <InputBox name="budgetLimit" label="Budget Limit" type="number" />
              )}
              {(isEdit ? category.type === "Income" : values.type === "Income") && (
                <InputBox name="goal" label="Goal" type="number" />
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isLoading}>
                  {isEdit ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategory;
