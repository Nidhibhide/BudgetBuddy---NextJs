"use client";

import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { SelectBox } from "@/app/features/common/index";
import { deleteCategory } from "@/app/lib/category";
import { Confirmation } from "../dialogs";
import { DeleteCategoryProps } from "@/app/types/appTypes";

const DeleteCategory: React.FC<DeleteCategoryProps> = ({
  open,
  onOpenChange,
  category,
  onCategoryDeleted,
  categories,
  transactionCount,
}) => {
  const [reassignCategoryId, setReassignCategoryId] = useState<string>("");
  const [deleteAction, setDeleteAction] = useState<"delete" | "reassign">(
    "delete"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setReassignCategoryId("");
      setDeleteAction("delete");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (category && category._id) {
      if (deleteAction === "reassign" && !reassignCategoryId) {
        return;
      }
      setLoading(true);
      try {
        const result = await deleteCategory(
          category._id,
          deleteAction === "reassign" ? reassignCategoryId : undefined
        );
        if (result.success) {
          onCategoryDeleted();
          onOpenChange(false);
        } else {
          console.error("Failed to delete category:", result.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Formik
      initialValues={{
        deleteAction:
          deleteAction === "delete"
            ? "Delete all transactions"
            : "Reassign to another category",
        reassignCategoryId:
          categories.find((cat) => cat._id === reassignCategoryId)?.name || "",
      }}
      onSubmit={() => {}}
      enableReinitialize
    >
      <Confirmation
        open={open}
        onOpenChange={onOpenChange}
        onConfirm={handleConfirm}
        title="Delete Category"
        loading={loading}
        description={
          transactionCount > 0 ? (
            <div className="space-y-4">
              <p>
                Are you sure you want to delete &quot;{category?.name}&quot;?
              </p>
              <p>
                This category has {transactionCount} associated transaction(s).
              </p>
              <div>
                <label className="text-sm font-medium">
                  Choose what to do with transactions:
                </label>
                <SelectBox
                  name="deleteAction"
                  label=""
                  options={
                    categories.length > 1
                      ? [
                          "Delete all transactions",
                          "Reassign to another category",
                        ]
                      : ["Delete all transactions"]
                  }
                  value={
                    deleteAction === "delete"
                      ? "Delete all transactions"
                      : "Reassign to another category"
                  }
                  onChange={(value) => {
                    const newAction =
                      value === "Delete all transactions"
                        ? "delete"
                        : "reassign";
                    setDeleteAction(newAction);
                    if (newAction === "delete") {
                      setReassignCategoryId("");
                    }
                  }}
                />
                {deleteAction === "reassign" && (
                  <SelectBox
                    name="reassignCategoryId"
                    label="Select a category"
                    options={categories
                      .filter(
                        (cat) =>
                          cat._id !== category?._id && cat.name.trim() !== ""
                      )
                      .map((cat) => cat.name)}
                    value={
                      categories.find((cat) => cat._id === reassignCategoryId)
                        ?.name || ""
                    }
                    onChange={(value) => {
                      const cat = categories.find((cat) => cat.name === value);
                      setReassignCategoryId(cat?._id || "");
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            `Are you sure you want to delete "${category?.name}" (${category?.type})? This category has no associated transactions.`
          )
        }
      />
    </Formik>
  );
};

export default DeleteCategory;
