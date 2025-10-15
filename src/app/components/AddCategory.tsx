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
import { TYPES } from "@/lib/constants";
import { AddCategoryFormValues, AddCategoryProps } from "@/app/types/appTypes";

const AddCategory: React.FC<AddCategoryProps> = ({ open, onOpenChange }) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .required("Name is required"),
    type: Yup.string()
      .oneOf(TYPES, "Invalid type")
      .required("Type is required"),
  });

  const handleSubmit = (values: AddCategoryFormValues) => {
    // For now, just show success and close dialog
    showSuccess("Category added successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add New Category
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{ name: "", type: TYPES[0] }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="name" label="Category Name" />
              <SelectBox name="type" label="Type" options={TYPES} />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit">Add Category</Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategory;
