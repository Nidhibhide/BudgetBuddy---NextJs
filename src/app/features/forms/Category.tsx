"use client";

import React, { useState} from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, SelectBox, Button, showSuccess, showError} from "@/app/features/common/index";
import { TYPES } from "@/constants";
import { Category as CategoryType, AddCategoryProps} from "@/app/types/appTypes";
import { createCategory, editCategory } from "@/app/lib/category";

const Category: React.FC<AddCategoryProps> = ({
  open,
  onOpenChange,
  onCategoryAdded,
  category,
  onCategoryEdited,
}) => {
  const t = useTranslations('form');
  const tConstants = useTranslations('constants');
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!category;

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, t('category.nameMinLength'))
      .max(50, t('category.nameMaxLength'))
      .required(t('category.nameRequired')),
    budgetLimit: Yup.number().min(0, t('category.budgetLimitPositive')).max(1000000, t('category.budgetLimitTooHigh')),
    goal: Yup.number().min(0, t('category.goalPositive')).max(1000000, t('category.goalTooHigh')),
    ...(isEdit ? {} : {
        type: Yup.string()
          .oneOf(TYPES, t('transaction.invalidType'))
          .required(t('transaction.typeRequired')),
      }),
  });


  const handleSubmit = async (
    values: CategoryType| { name: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    setIsLoading(true);
    try {
      const response = isEdit
        ? await editCategory(category._id!, values as CategoryType)
        : await createCategory(values as CategoryType);
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
      isEdit ? t('somethingWentWrongEditing', { item: 'category' }) : t('somethingWentWrongCreating', { item: 'category' })
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
            {isEdit ? t('category.edit') : t('category.addNew')}
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
              <InputBox name="name" label={t('category.name')} onChange={handleNameChange} />
              {!isEdit && (
                <>
                  <SelectBox name="type" label={t('fields.type')} options={[tConstants('types.expense'), tConstants('types.income')]} />
                </>
              )}
              {(isEdit ? category.type === "Expense" : values.type === "Expense") && (
                <InputBox name="budgetLimit" label={t('category.budgetLimit')} type="number" />
              )}
              {(isEdit ? category.type === "Income" : values.type === "Income") && (
                <InputBox name="goal" label={t('category.goal')} type="number" />
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" loading={isLoading}>
                  {isEdit ? t('category.update') : t('category.add')}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default Category;
