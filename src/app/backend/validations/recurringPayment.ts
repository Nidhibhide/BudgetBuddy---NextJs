import Joi from "joi";
import { stringValidator, numberValidator, selectValidator } from "@/app/backend/utils/GlobalValidation";

export const UpdateRecurringPayment = (t: (key: string) => string) => Joi.object({
  nextDueDate: Joi.date().iso().optional().label(t("backend.validation.nextDueDate")),
  reminderDate: Joi.date().iso().optional().label(t("backend.validation.reminderDate")),
  title: stringValidator("backend.validation.title", 1, 100, false)(t),
  description: stringValidator("backend.validation.description", 2, 200, false)(t),
  amount: numberValidator("backend.validation.amount", 1, 1000000, false)(t),
  frequency: selectValidator("backend.validation.frequency", ["Weekly", "Monthly", "Yearly"], false)(t),
  status: selectValidator("backend.validation.status", ["Active", "Inactive"], false)(t),
});

export const CreateRecurringPayment = (t: (key: string) => string) => Joi.object({
  nextDueDate: Joi.date().iso().required().label(t("backend.validation.nextDueDate")),
  reminderDate: Joi.date().iso().required().label(t("backend.validation.reminderDate")),
  title: stringValidator("backend.validation.title", 1, 100, true)(t),
  description: stringValidator("backend.validation.description", 2, 200, true)(t),
  amount: numberValidator("backend.validation.amount", 1, 1000000, true)(t),
  frequency: selectValidator("backend.validation.frequency", ["Weekly", "Monthly", "Yearly"], true)(t),
  status: selectValidator("backend.validation.status", ["Active", "Inactive"], false)(t),
});