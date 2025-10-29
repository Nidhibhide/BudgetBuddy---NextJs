import Joi from "joi";
import { TYPES } from "@/lib/constants";
import { stringValidator, numberValidator, selectValidator } from "@/app/backend/utils/GlobalValidation";

export const CreateTransaction = Joi.object({
  date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required().label("Date"),
  title: stringValidator("Title", 1, 100, true),
  description: stringValidator("Description", 2, 200, true),
  category: stringValidator("Category", 1, 50, true),
  amount: numberValidator("Amount", 1, 1000000, true), // Assuming max amount
  type: selectValidator("Type", TYPES, true),
});

export const UpdateTransaction = Joi.object({
  date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().label("Date"),
  title: stringValidator("Title", 1, 100, false),
  description: stringValidator("Description", 2, 200, false),
  category: stringValidator("Category", 1, 50, false),
  amount: numberValidator("Amount", 1, 1000000, false),
});