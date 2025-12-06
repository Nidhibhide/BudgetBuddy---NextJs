"use client";

import React, { useState} from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, SelectBox, Button, useToast} from "@/app/features/common/index";
import { Category as CategoryType, AddCategoryProps} from "@/app/types/appTypes";
import { createCategory, editCategory } from "@/app/lib/category";

const Category: React.FC<AddCategoryProps> = ({
  open,
  onOpenChange,
  onCategoryAdded,
  category,
  onCategoryEdited,
}) => {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!category;
  const t = useTranslations();
  const tCommon = useTranslations('common');

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, t('forms.validation.nameMin2'))
      .max(50, t('forms.validation.nameMax50'))
      .required(t('forms.validation.nameRequired')),
    budgetLimit: Yup.number().min(0, t('forms.validation.budgetLimitPositive')).max(1000000, t('forms.validation.budgetLimitTooHigh')),
    goal: Yup.number().min(0, t('forms.validation.goalPositive')).max(1000000, t('forms.validation.goalTooHigh')),
    ...(isEdit ? {} : {
        type: Yup.string()
          .oneOf([tCommon('ui.expense'), tCommon('ui.income')], t('forms.validation.invalidType'))
          .required(t('forms.validation.typeRequired')),
      }),
  });


  const handleSubmit = async (
    values: CategoryType| { name: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    setIsLoading(true);
    try {
      // Map translated type back to English for API
      const englishType = (values as CategoryType).type === tCommon('ui.expense') ? 'Expense' : 'Income';
      const data = { ...values, type: englishType };
      const response = isEdit
        ? await editCategory(category._id!, data as CategoryType, t)
        : await createCategory(data as CategoryType, t);
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
      showError(t('forms.messages.errorOccurred'));
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
            {isEdit ? t('forms.titles.editForm') : t('forms.titles.addForm')}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={
            isEdit ? { name: category.name, budgetLimit: category.budgetLimit || 0, goal: category.goal || 0, type: category.type.toLowerCase() === 'expense' ? tCommon('ui.expense') : tCommon('ui.income') } : { name: "", type: tCommon('ui.expense'), budgetLimit: 0, goal: 0 }
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, values }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="name" label={t('backend.validation.name')} onChange={handleNameChange} />
              {!isEdit && (
                <>
                  <SelectBox name="type" label={t('backend.validation.type')} options={[tCommon('ui.expense'), tCommon('ui.income')]} />
                </>
              )}
              {(isEdit ? category.type === "Expense" : values.type === tCommon('ui.expense')) && (
                <InputBox name="budgetLimit" label={t('backend.validation.budgetLimit')} type="number" />
              )}
              {(isEdit ? category.type === "Income" : values.type === tCommon('ui.income')) && (
                <InputBox name="goal" label={t('backend.validation.goal')} type="number" />
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  {t('forms.buttons.cancel')}
                </Button>
                <Button type="submit" loading={isLoading}>
                  {isEdit ? t('forms.buttons.update') : t('forms.buttons.add')}
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
