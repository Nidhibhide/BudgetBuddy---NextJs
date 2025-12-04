import Joi from "joi";
import { stringValidator, numberValidator, selectValidator } from "@/app/backend/utils/GlobalValidation";

export const CreateUpcomingBill = (t: (key: string) => string) => Joi.object({
  dueDate: Joi.date().iso().required().label(t("backend.validation.dueDate")),
  reminderDate: Joi.date().iso().required().label(t("backend.validation.reminderDate")),
  title: stringValidator("backend.validation.title", 1, 100, true)(t),
  description: stringValidator("backend.validation.description", 2, 200, true)(t),
  amount: numberValidator("backend.validation.amount", 1, 1000000, true)(t),
  status: selectValidator("backend.validation.status", ["Paid", "Unpaid"], true)(t),
});

export const UpdateUpcomingBill = (t: (key: string) => string) => Joi.object({
  dueDate: Joi.date().iso().optional().label(t("backend.validation.dueDate")),
  reminderDate: Joi.date().iso().optional().label(t("backend.validation.reminderDate")),
  title: stringValidator("backend.validation.title", 1, 100, false)(t),
  description: stringValidator("backend.validation.description", 2, 200, false)(t),
  amount: numberValidator("backend.validation.amount", 1, 1000000, false)(t),
  status: selectValidator("backend.validation.status", ["Paid", "Unpaid"], false)(t),
});