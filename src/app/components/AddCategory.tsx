"use client";

import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, SelectBox, Button, showSuccess, showError, IconComponent } from "./index";
import { TYPES } from "@/lib/constants";
import { Category, AddCategoryProps} from "@/app/types/appTypes";
import { createCategory, editCategory, getIconSuggestions } from "@/app/lib/category";

const AddCategory: React.FC<AddCategoryProps> = ({
  open,
  onOpenChange,
  onCategoryAdded,
  category,
  onCategoryEdited,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [iconSuggestions, setIconSuggestions] = useState<string[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [isFetchingIcons, setIsFetchingIcons] = useState(false);
  const isEdit = !!category;

  useEffect(() => {
    if (isEdit && category.icon) {
      setSelectedIcon(category.icon);
    } else {
      setSelectedIcon("");
    }
  }, [isEdit, category]);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .required("Name is required"),
    icon: Yup.string().required("Icon is required"),
    budgetLimit: Yup.number().min(0, "Budget limit must be positive").max(1000000, "Budget limit too high"),
    goal: Yup.number().min(0, "Goal must be positive").max(1000000, "Goal too high"),
    ...(isEdit ? {} : {
        type: Yup.string()
          .oneOf(TYPES, "Invalid type")
          .required("Type is required"),
      }),
  });

  useEffect(() => {
    if (isEdit && category.name) {
      fetchIconSuggestions(category.name);
    }
  }, [isEdit, category]);

  const handleSubmit = async (
    values: Category | { name: string },
    { resetForm, setFieldValue }: { resetForm: () => void; setFieldValue: (field: string, value: string) => void }
  ) => {
    if (!selectedIcon) {
      showError("Icon is required");
      setFieldValue("icon", "");
      return;
    }
    setIsLoading(true);
    try {
      const response = isEdit
        ? await editCategory(category._id!, values as Category)
        : await createCategory(values as Category);
      if (response.success) {
        showSuccess(response.message);
        resetForm();
        setIconSuggestions([]);
        setSelectedIcon("");
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

  const fetchIconSuggestions = async (name: string) => {
    if (name.length < 2) return;
    setIsFetchingIcons(true);
    try {
      const response = await getIconSuggestions(name);
      if (response.success) {
        setIconSuggestions(response.data.suggestions);
      } else {
        showError("Failed to fetch icon suggestions");
      }
    } catch {
      showError("Something went wrong while fetching icon suggestions");
    } finally {
      setIsFetchingIcons(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    fetchIconSuggestions(name);
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
            isEdit ? { name: category.name, icon: category.icon, budgetLimit: category.budgetLimit || 0, goal: category.goal || 0, type: category.type } : { name: "", type: TYPES[0], icon: "", budgetLimit: 0, goal: 0 }
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, setFieldValue, values }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="name" label="Category Name" onChange={handleNameChange} />
              {!isEdit && (
                <>
                  <p className="text-sm text-foreground/70">Enter a category name to generate icon suggestions.</p>
                  <SelectBox name="type" label="Type" options={TYPES} />
                </>
              )}
              {(isEdit ? category.type === "Expense" : values.type === "Expense") && (
                <InputBox name="budgetLimit" label="Budget Limit" type="number" />
              )}
              {(isEdit ? category.type === "Income" : values.type === "Income") && (
                <InputBox name="goal" label="Goal" type="number" />
              )}
              {isFetchingIcons && (
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <Loader2 className="animate-spin text-foreground" size={16} />
                  <span>Generating suggestions...</span>
                </div>
              )}
              {iconSuggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Select Icon</label>
                    <button
                      type="button"
                      onClick={() => fetchIconSuggestions(values.name)}
                      disabled={isFetchingIcons || values.name.length < 2}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={isFetchingIcons ? "animate-spin" : ""} />
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    {iconSuggestions.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(iconName);
                          setFieldValue("icon", iconName);
                        }}
                        className={`p-2 border rounded ${
                          selectedIcon === iconName ? "border-btn-background bg-selected-background" : "border-foreground bg-background"
                        }`}
                      >
                        <IconComponent iconName={iconName} size={24} className="text-foreground cursor-pointer" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isLoading} disabled={!selectedIcon}>
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
