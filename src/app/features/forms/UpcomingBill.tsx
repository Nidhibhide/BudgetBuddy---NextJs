"use client";

import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, TextareaBox, SelectBox, Button, useToast } from "@/app/features/common/index";
import { addUpcomingBill, editUpcomingBill } from "@/app/lib/upcomingBill";
import { AddUpcomingBillProps, UpcomingBill } from "@/app/types/appTypes";

const UpcomingBillForm: React.FC<AddUpcomingBillProps> = ({ open, onOpenChange, onBillAdded, bill }) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const t = useTranslations();

  const validationSchema = Yup.object().shape({
    dueDate: Yup.date()
      .required(t('forms.validation.dateRequired'))
      .min(new Date(), t('forms.validation.dateNotPast')),
    reminderDate: Yup.date()
      .required(t('forms.validation.dateRequired'))
      .min(new Date(), t('forms.validation.dateNotPast'))
      .when('dueDate', (dueDate, schema) => dueDate ? schema.max(Yup.ref('dueDate'), t('forms.validation.reminderBeforeDue')) : schema),
    title: Yup.string()
      .min(1, t('forms.validation.titleMin1'))
      .max(100, t('forms.validation.titleMax100'))
      .required(t('forms.validation.titleRequired')),
    description: Yup.string()
      .min(2, t('forms.validation.descriptionMin2'))
      .max(200, t('forms.validation.descriptionMax200'))
      .required(t('forms.validation.descriptionRequired')),
    amount: Yup.number()
      .positive(t('forms.validation.amountPositive'))
      .required(t('forms.validation.amountRequired')),
    status: Yup.string()
      .oneOf([t('forms.options.paid'), t('forms.options.unpaid')], t('forms.validation.invalidStatus'))
      .optional(),
  });

  const handleSubmit = async (values: UpcomingBill) => {
    setLoading(true);
    try {
      const response = bill?._id
        ? await editUpcomingBill(bill._id, values, t)
        : await addUpcomingBill(values, t);
      if (response.success) {
        showSuccess(response.message);
        onBillAdded(values);
        onOpenChange(false);
      } else {
        showError(response.message || t('forms.messages.errorOccurred'));
      }
    } catch {
      showError(t('forms.messages.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {bill?._id ? t('forms.titles.editForm') : t('forms.titles.addForm')}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            dueDate: bill?.dueDate ? new Date(bill.dueDate).toISOString().split("T")[0] : "",
            reminderDate: bill?.reminderDate ? new Date(bill.reminderDate).toISOString().split("T")[0] : "",
            title: bill?.title || "",
            description: bill?.description || "",
            amount: bill?.amount || 1,
            status: bill?.status ? (bill.status === 'Unpaid' ? t('forms.options.unpaid') : t('forms.options.paid')) : t('forms.options.unpaid'),
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="dueDate" label={t('backend.validation.dueDate')} type="date" />
              <InputBox name="reminderDate" label={t('backend.validation.reminderDate')} type="date" />
              <p className="text-sm text-gray-600 -mt-2">{t('forms.labels.notificationsStartFromDate')}</p>
              <InputBox name="title" label={t('backend.validation.title')} />
              <TextareaBox name="description" label={t('backend.validation.description')} />
              <InputBox name="amount" label={t('backend.validation.amount')} type="number" />
              <SelectBox
                name="status"
                label={t('backend.validation.status')}
                options={[t('forms.options.unpaid'), t('forms.options.paid')]}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  {t('forms.buttons.cancel')}
                </Button>
                <Button type="submit" loading={loading}>
                  {bill?._id ? t('forms.buttons.update') : t('forms.buttons.add')}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default UpcomingBillForm;