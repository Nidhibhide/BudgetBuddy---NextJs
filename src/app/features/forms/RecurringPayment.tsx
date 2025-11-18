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
import { useSession } from "next-auth/react";
import { addRecurringPayment, editRecurringPayment } from "@/app/lib/recurringPayment";
import { AddRecurringPaymentProps } from "@/app/types/appTypes";
import type { RecurringPayment } from "@/app/types/appTypes";

const RecurringPaymentForm: React.FC<AddRecurringPaymentProps> = ({ open, onOpenChange, onPaymentAdded, payment }) => {
  const { data: session } = useSession();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    nextDueDate: Yup.date()
      .required(t('form.dateRequired'))
      .min(new Date(), t('form.dateCannotBeFuture')),
    reminderDate: Yup.date()
      .required(t('form.dateRequired'))
      .min(new Date(), t('form.dateCannotBeFuture'))
      .when('nextDueDate', (nextDueDate, schema) => nextDueDate ? schema.max(Yup.ref('nextDueDate'), 'Reminder date must be before next due date') : schema),
    title: Yup.string()
      .min(1, t('form.titleMinLength'))
      .max(100, t('form.titleMaxLength'))
      .required(t('form.titleRequired')),
    description: Yup.string()
      .min(2, t('form.descriptionMinLength'))
      .max(200, t('form.descriptionMaxLength'))
      .optional(),
    amount: Yup.number()
      .positive(t('form.amountPositive'))
      .required(t('form.amountRequired')),
    frequency: Yup.string()
      .oneOf(["Weekly", "Monthly", "Yearly"], t('form.validation.invalidFrequency'))
      .required(t('form.validation.frequencyRequired')),
    status: Yup.string()
      .oneOf(["Active", "Inactive"], t('form.validation.invalidStatus'))
      .optional(),
  });

  const handleSubmit = async (values: RecurringPayment) => {
    setLoading(true);
    try {
      const response = payment?._id
        ? await editRecurringPayment(payment._id, values)
        : await addRecurringPayment(values);
      if (response.success) {
        showSuccess(response.message);
        onPaymentAdded(values);
        onOpenChange(false);
      } else {
        showError(response.message || `Failed to ${payment?._id ? 'update' : 'add'} recurring payment`);
      }
    } catch {
      showError(payment?._id ? t('somethingWentWrongEditing', { item: 'recurring payment', ns: 'common' }) : t('somethingWentWrongCreating', { item: 'recurring payment', ns: 'common' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {payment?._id ? t('form.recurringPayment.edit') : t('form.recurringPayment.add')}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            nextDueDate: payment?.nextDueDate ? new Date(payment.nextDueDate).toISOString().split("T")[0] : "",
            reminderDate: payment?.reminderDate ? new Date(payment.reminderDate).toISOString().split("T")[0] : "",
            title: payment?.title || "",
            description: payment?.description || "",
            amount: payment?.amount || 1,
            frequency: payment?.frequency || "",
            status: payment?.status || "Active",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="nextDueDate" label={t('form.date')} type="date" />
              <InputBox name="reminderDate" label={t('form.date')} type="date" />
              <p className="text-sm text-gray-600 -mt-2">{t('ui.notificationsStartFrom', { ns: 'common' })}</p>
              <InputBox name="title" label={t('form.title')} />
              <TextareaBox name="description" label={t('form.description')} />
              <InputBox name="amount" label={`${t('form.amount')} (${session?.user?.currency || 'INR'})`} type="number" />
              <SelectBox name="frequency" label={t('form.fields.type')} options={["Weekly", "Monthly", "Yearly"]} />
              <SelectBox
                name="status"
                label={t('form.status')}
                options={["Active", "Inactive"]}
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
                  {payment?._id ? t('form.recurringPayment.update') : t('form.recurringPayment.addPayment')}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default RecurringPaymentForm;