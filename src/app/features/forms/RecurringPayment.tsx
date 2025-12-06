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
import { useSession } from "next-auth/react";
import { addRecurringPayment, editRecurringPayment } from "@/app/lib/recurringPayment";
import { AddRecurringPaymentProps } from "@/app/types/appTypes";
import type { RecurringPayment } from "@/app/types/appTypes";

const RecurringPaymentForm: React.FC<AddRecurringPaymentProps> = ({ open, onOpenChange, onPaymentAdded, payment }) => {
  const { data: session } = useSession();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const t = useTranslations();

  const validationSchema = Yup.object().shape({
    nextDueDate: Yup.date()
      .required(t('forms.validation.dateRequired'))
      .min(new Date(), t('forms.validation.dateNotPast')),
    reminderDate: Yup.date()
      .required(t('forms.validation.dateRequired'))
      .min(new Date(), t('forms.validation.dateNotPast'))
      .when('nextDueDate', (nextDueDate, schema) => nextDueDate ? schema.max(Yup.ref('nextDueDate'), t('forms.validation.reminderBeforeNextDue')) : schema),
    title: Yup.string()
      .min(1, t('forms.validation.titleMin1'))
      .max(100, t('forms.validation.titleMax100'))
      .required(t('forms.validation.titleRequired')),
    description: Yup.string()
      .min(2, t('forms.validation.descriptionMin2'))
      .max(200, t('forms.validation.descriptionMax200'))
      .optional(),
    amount: Yup.number()
      .positive(t('forms.validation.amountPositive'))
      .required(t('forms.validation.amountRequired')),
    frequency: Yup.string()
      .oneOf([t('forms.options.weekly'), t('forms.options.monthly'), t('forms.options.yearly')], t('forms.validation.invalidFrequency'))
      .required(t('forms.validation.frequencyRequired')),
    status: Yup.string()
      .oneOf([t('forms.options.active'), t('forms.options.inactive')], t('forms.validation.invalidStatus'))
      .optional(),
  });

  const handleSubmit = async (values: RecurringPayment) => {
    setLoading(true);
    try {
      const response = payment?._id
        ? await editRecurringPayment(payment._id, values, t)
        : await addRecurringPayment(values, t);
      if (response.success) {
        showSuccess(response.message);
        onPaymentAdded(values);
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
            {payment?._id ? t('forms.titles.editForm') : t('forms.titles.addForm')}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            nextDueDate: payment?.nextDueDate ? new Date(payment.nextDueDate).toISOString().split("T")[0] : "",
            reminderDate: payment?.reminderDate ? new Date(payment.reminderDate).toISOString().split("T")[0] : "",
            title: payment?.title || "",
            description: payment?.description || "",
            amount: payment?.amount || 1,
            frequency: payment?.frequency ? (
              payment.frequency === 'Weekly' ? t('forms.options.weekly') :
              payment.frequency === 'Monthly' ? t('forms.options.monthly') :
              t('forms.options.yearly')
            ) : "",
            status: payment?.status ? (payment.status === 'Active' ? t('forms.options.active') : t('forms.options.inactive')) : t('forms.options.active'),
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputBox name="nextDueDate" label={t('backend.validation.nextDueDate')} type="date" />
              <InputBox name="reminderDate" label={t('backend.validation.reminderDate')} type="date" />
              <p className="text-sm text-gray-600 -mt-2">{t('forms.labels.notificationsStartFromDate')}</p>
              <InputBox name="title" label={t('backend.validation.title')} />
              <TextareaBox name="description" label={t('backend.validation.description')} />
              <InputBox name="amount" label={`${t('backend.validation.amount')} (${session?.user?.currency || 'INR'})`} type="number" />
              <SelectBox name="frequency" label={t('backend.validation.frequency')} options={[t('forms.options.weekly'), t('forms.options.monthly'), t('forms.options.yearly')]} />
              <SelectBox
                name="status"
                label={t('backend.validation.status')}
                options={[t('forms.options.active'), t('forms.options.inactive')]}
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
                  {payment?._id ? t('forms.buttons.update') : t('forms.buttons.add')}
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