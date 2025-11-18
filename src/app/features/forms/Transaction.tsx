"use client";

import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, SelectBox, TextareaBox, Button, showSuccess, showError } from "@/app/features/common/index";
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
  const t = useTranslations();
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);

  const translatedTypes = [t('constants.types.expense'), t('constants.types.income')];

  const validationSchema = Yup.object().shape({
    date: Yup.date()
      .required(t('form.transaction.dateRequired'))
      .max(new Date(), t('form.transaction.dateCannotBeFuture')),
    title: Yup.string()
      .min(1, t('form.transaction.titleMinLength'))
      .max(100, t('form.transaction.titleMaxLength'))
      .required(t('form.transaction.titleRequired')),
    description: Yup.string()
      .min(2, t('form.transaction.descriptionMinLength'))
      .max(200, t('form.transaction.descriptionMaxLength'))
      .required(t('form.transaction.descriptionRequired')),
    category: Yup.string().required(t('form.transaction.categoryRequired')),
    amount: Yup.number()
      .positive(t('form.transaction.amountPositive'))
      .required(t('form.transaction.amountRequired')),
    type: Yup.string()
      .oneOf(translatedTypes, t('form.transaction.invalidType'))
      .required(t('form.transaction.typeRequired')),
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
      showError(t('common.messages.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {transaction?._id ? t('form.transaction.edit') : t('form.transaction.addNew')}
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
              <InputBox name="date" label={t('common.fields.date')} type="date" />
              <SelectBox
                name="type"
                label={t('common.fields.type')}
                options={translatedTypes}
                onChange={(value) => handleTypeChange(value, setFieldValue)}
              />
              <SelectBox
                name="category"
                label={t('common.fields.category')}
                options={categories.length === 0 ? ["NA"] : categories.map((cat) => cat.name)}
              />
              <InputBox name="title" label={t('common.fields.title')} />

              <TextareaBox name="description" label={t('common.fields.description')} />
              <InputBox name="amount" label={`${t('common.fields.amount')} (${session?.user?.currency || 'INR'})`} type="number" />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  {t('common.actions.cancel')}
                </Button>
                <Button type="submit" loading={loading}>
                  {transaction?._id ? t('form.transaction.update') : t('form.transaction.add')}
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
