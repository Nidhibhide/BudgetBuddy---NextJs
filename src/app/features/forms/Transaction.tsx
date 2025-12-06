"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, SelectBox, TextareaBox, Button, useToast } from "@/app/features/common/index";
import { TYPES} from "@/constants";
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
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const t = useTranslations();
  const tCommon = useTranslations('common');

  const translatedTypes = [tCommon('ui.expense'), tCommon('ui.income')];

  const validationSchema = Yup.object().shape({
    date: Yup.date()
      .required(t('forms.validation.dateRequired'))
      .max(new Date(), t('forms.validation.dateNotFuture')),
    title: Yup.string()
      .min(1, t('forms.validation.titleMin1'))
      .max(100, t('forms.validation.titleMax100'))
      .required(t('forms.validation.titleRequired')),
    description: Yup.string()
      .min(2, t('forms.validation.descriptionMin2'))
      .max(200, t('forms.validation.descriptionMax200'))
      .required(t('forms.validation.descriptionRequired')),
    category: Yup.string().required(t('forms.validation.categoryRequired')),
    amount: Yup.number()
      .positive(t('forms.validation.amountPositive'))
      .required(t('forms.validation.amountRequired')),
    type: Yup.string()
      .oneOf(translatedTypes, t('forms.validation.invalidType'))
      .required(t('forms.validation.typeRequired')),
  });

  const fetchCategories = useCallback(async (
    type: string,
    setFieldValue?: (field: string, value: string) => void
  ) => {

    try {
      const response = await getCategoryDetails(type, t);
      if (response.success) {
        setCategories(response.data || []);
        if (setFieldValue && response.data && response.data.length > 0) {
          setFieldValue("category", response.data[0].name);
        }
      } else {
        console.error(t('forms.messages.errorOccurred') + ":", response.message);
        setCategories([]);
        // TODO: Show user-friendly error message
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {

      setCategories([]);
      // TODO: Show user-friendly error message
    } finally {

    }
  }, [t]);

  const handleTypeChange = (
    value: string,
    setFieldValue: (field: string, value: string) => void
  ) => {
    const englishType = value === tCommon('ui.expense') ? 'Expense' : 'Income';
    fetchCategories(englishType, setFieldValue);
  };

  useEffect(() => {
    if (open) {
      const typeToFetch = transaction?.type || TYPES[0];
      fetchCategories(typeToFetch);
    }
  }, [open, transaction, fetchCategories]);

  const handleSubmit = async (values: TransactionType) => {
    setLoading(true);
    try {
      const englishType = values.type === tCommon('ui.expense') ? 'Expense' : 'Income';
      const data = { ...values, type: englishType };
      const response = transaction?._id
        ? await editTransaction(transaction._id, data, t)
        : await addTransaction(data, t);
      if (response.success) {
        showSuccess(response.message);
        onOpenChange(false);
        onTransactionAdded?.();
      } else {
        showError(response.message);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {

      showError(t('forms.messages.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {transaction?._id ? t('forms.titles.editForm') : t('forms.titles.addForm')}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            date: new Date(transaction?.date || Date.now()).toISOString().split("T")[0],
            title: transaction?.title || "",
            description: transaction?.description || "",
            category: transaction?.category || "",
            amount: transaction?.amount || 1,
            type: transaction?.type ? (transaction.type === 'Expense' ? tCommon('ui.expense') : tCommon('ui.income')) : tCommon('ui.expense'),
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="date" label={t('backend.validation.date')} type="date" />
              <SelectBox
                name="type"
                label={t('backend.validation.type')}
                options={translatedTypes}
                onChange={(value) => handleTypeChange(value, setFieldValue)}
              />
              <SelectBox
                name="category"
                label={t('backend.validation.category')}
                options={categories.map((cat) => cat.name)}
              />
              <InputBox name="title" label={t('backend.validation.title')} />

              <TextareaBox name="description" label={t('backend.validation.description')} />
              <InputBox name="amount" label={`${t('backend.validation.amount')} (${session?.user?.currency || 'INR'})`} type="number" />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  {t('forms.buttons.cancel')}
                </Button>
                <Button type="submit" loading={loading}>
                  {transaction?._id ? t('forms.buttons.update') : t('forms.buttons.add')}
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
