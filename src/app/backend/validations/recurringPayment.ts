import Joi from "joi";
import { stringValidator, numberValidator, selectValidator } from "@/app/backend/utils/GlobalValidation";

export const UpdateRecurringPayment = Joi.object({
  nextDueDate: Joi.date().iso().optional().label("Next Due Date"),
  reminderDate: Joi.date().iso().optional().label("Reminder Date"),
  title: stringValidator("Title", 1, 100, false),
  description: stringValidator("Description", 2, 200, false),
  amount: numberValidator("Amount", 1, 1000000, false),
  frequency: selectValidator("Frequency", ["Weekly", "Monthly", "Yearly"], false),
  status: selectValidator("Status", ["Active", "Inactive"], false),
});

export const CreateRecurringPayment = Joi.object({
  nextDueDate: Joi.date().iso().required().label("Next Due Date"),
  reminderDate: Joi.date().iso().required().label("Reminder Date"),
  title: stringValidator("Title", 1, 100, true),
  description: stringValidator("Description", 2, 200, true),
  amount: numberValidator("Amount", 1, 1000000, true),
  frequency: selectValidator("Frequency", ["Weekly", "Monthly", "Yearly"], true),
  status: selectValidator("Status", ["Active", "Inactive"], false),
});