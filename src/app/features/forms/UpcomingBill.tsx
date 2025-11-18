"use client";

import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputBox, TextareaBox, SelectBox, Button, showSuccess, showError } from "@/app/features/common/index";
import { addUpcomingBill, editUpcomingBill } from "@/app/lib/upcomingBill";
import { AddUpcomingBillProps, UpcomingBill } from "@/app/types/appTypes";

const UpcomingBillForm: React.FC<AddUpcomingBillProps> = ({ open, onOpenChange, onBillAdded, bill }) => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    dueDate: Yup.date()
      .required(t('form.dateRequired'))
      .min(new Date(), t('form.dateCannotBeFuture')),
    reminderDate: Yup.date()
      .required(t('form.dateRequired'))
      .min(new Date(), t('form.dateCannotBeFuture'))
      .when('dueDate', (dueDate, schema) => dueDate ? schema.max(Yup.ref('dueDate'), 'Reminder date must be before due date') : schema),
    title: Yup.string()
      .min(1, t('form.titleMinLength'))
      .max(100, t('form.titleMaxLength'))
      .required(t('form.titleRequired')),
    description: Yup.string()
      .min(2, t('form.descriptionMinLength'))
      .max(200, t('form.descriptionMaxLength'))
      .required(t('form.descriptionRequired')),
    amount: Yup.number()
      .positive(t('form.amountPositive'))
      .required(t('form.amountRequired')),
    status: Yup.string()
      .oneOf(["Paid", "Unpaid"], t('form.validation.invalidStatus'))
      .optional(),
  });

  const handleSubmit = async (values: UpcomingBill) => {
    setLoading(true);
    try {
      const response = bill?._id
        ? await editUpcomingBill(bill._id, values)
        : await addUpcomingBill(values);
      if (response.success) {
        showSuccess(response.message);
        onBillAdded(values);
        onOpenChange(false);
      } else {
        showError(response.message || `Failed to ${bill?._id ? 'update' : 'add'} upcoming bill`);
      }
    } catch {
      showError(bill?._id ? t('somethingWentWrongEditing', { item: 'upcoming bill', ns: 'common' }) : t('somethingWentWrongCreating', { item: 'upcoming bill', ns: 'common' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {bill?._id ? t('form.upcomingBill.edit') : t('form.upcomingBill.add')}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            dueDate: bill?.dueDate ? new Date(bill.dueDate).toISOString().split("T")[0] : "",
            reminderDate: bill?.reminderDate ? new Date(bill.reminderDate).toISOString().split("T")[0] : "",
            title: bill?.title || "",
            description: bill?.description || "",
            amount: bill?.amount || 1,
            status: bill?.status || "Unpaid",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="dueDate" label={t('form.date')} type="date" />
              <InputBox name="reminderDate" label={t('form.date')} type="date" />
              <p className="text-sm text-gray-600 -mt-2">{t('common.ui.notificationsStartFrom')}</p>
              <InputBox name="title" label={t('form.title')} />
              <TextareaBox name="description" label={t('form.description')} />
              <InputBox name="amount" label={t('form.amount')} type="number" />
              <SelectBox
                name="status"
                label={t('form.status')}
                options={["Unpaid", "Paid"]}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  {t('common.actions.cancel')}
                </Button>
                <Button type="submit" loading={loading}>
                  {bill?._id ? t('form.upcomingBill.update') : t('form.upcomingBill.addBill')}
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