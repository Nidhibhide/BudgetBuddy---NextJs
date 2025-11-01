import Joi from "joi";
import { TYPES } from "@/lib/constants";
import { stringValidator, numberValidator, selectValidator } from "@/app/backend/utils/GlobalValidation";

export const CreateTransaction = Joi.object({
  date: Joi.date().iso().required().label("Date"),
  title: stringValidator("Title", 1, 100, true),
  description: stringValidator("Description", 2, 200, true),
  category: stringValidator("Category", 1, 50, true),
  amount: numberValidator("Amount", 0.01, 1000000, true),
  type: selectValidator("Type", TYPES, true),
});

export const UpdateTransaction = Joi.object({
  date: Joi.date().iso().optional().label("Date"),
  title: stringValidator("Title", 1, 100, false),
  description: stringValidator("Description", 2, 200, false),
  category: stringValidator("Category", 1, 50, false),
  amount: numberValidator("Amount", 0.01, 1000000, false),
});