"use client";

import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('form');
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

  const selectedCategoryName = categories.find((cat) => cat._id === reassignCategoryId)?.name || "";

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
          console.error(t('category.failedToDelete'), result.message);
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
            ? t('category.deleteAllTransactions')
            : t('category.reassignToCategory'),
        reassignCategoryId: selectedCategoryName,
      }}
      onSubmit={() => {}}
      enableReinitialize
    >
      <Confirmation
        open={open}
        onOpenChange={onOpenChange}
        onConfirm={handleConfirm}
        title={t('category.delete')}
        loading={loading}
        description={
          transactionCount > 0 ? (
            <div className="space-y-4">
              {/* <p>
                Are you sure you want to delete &quot;{category?.name}&quot;?
              </p> */}
              <p>
                {t('category.deleteConfirmation', { name: category?.name || '' })}
              </p>
              <p>
                {t('category.associatedTransactions', { count: transactionCount })}
              </p>
              <div>
                <label className="text-sm font-medium">
                  {t('category.chooseAction')}
                </label>
                <SelectBox
                  name="deleteAction"
                  label=""
                  options={
                    categories.length > 1
                      ? [
                          t('category.deleteAllTransactions'),
                          t('category.reassignToCategory'),
                        ]
                      : [t('category.deleteAllTransactions')]
                  }
                  value={
                    deleteAction === "delete"
                      ? t('category.deleteAllTransactions')
                      : t('category.reassignToCategory')
                  }
                  onChange={(value) => {
                    const newAction =
                      value === t('category.deleteAllTransactions')
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
                    label={t('category.selectCategory')}
                    options={categories
                      .filter(
                        (cat) =>
                          cat._id !== category?._id && cat.name.trim() !== ""
                      )
                      .map((cat) => cat.name)}
                    value={selectedCategoryName}
                    onChange={(value) => {
                      const cat = categories.find((cat) => cat.name === value);
                      setReassignCategoryId(cat?._id || "");
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            t('category.noAssociatedTransactions', { name: category?.name || '', type: category?.type || '' })
          )
        }
      />
    </Formik>
  );
};

export default DeleteCategory;
