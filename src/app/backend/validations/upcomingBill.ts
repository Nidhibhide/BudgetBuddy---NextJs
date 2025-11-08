import Joi from "joi";
import { stringValidator, numberValidator, selectValidator } from "@/app/backend/utils/GlobalValidation";

export const CreateUpcomingBill = Joi.object({
  dueDate: Joi.date().iso().required().label("Due Date"),
  reminderDate: Joi.date().iso().required().label("Reminder Date"),
  title: stringValidator("Title", 1, 100, true),
  description: stringValidator("Description", 2, 200, true),
  amount: numberValidator("Amount", 1, 1000000, true),
  status: selectValidator("Status", ["Paid", "Unpaid"], true),
});

export const UpdateUpcomingBill = Joi.object({
  dueDate: Joi.date().iso().optional().label("Due Date"),
  reminderDate: Joi.date().iso().optional().label("Reminder Date"),
  title: stringValidator("Title", 1, 100, false),
  description: stringValidator("Description", 2, 200, false),
  amount: numberValidator("Amount", 1, 1000000, false),
  status: selectValidator("Status", ["Paid", "Unpaid"], false),
});