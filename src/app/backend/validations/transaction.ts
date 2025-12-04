import Joi from "joi";
import { TYPES } from "@/constants";
import { stringValidator, numberValidator, selectValidator } from "@/app/backend/utils/GlobalValidation";

export const CreateTransaction = (t: (key: string) => string) => Joi.object({
  date: Joi.date().iso().required().label(t("backend.validation.date")),
  title: stringValidator("backend.validation.title", 1, 100, true)(t),
  description: stringValidator("backend.validation.description", 2, 200, true)(t),
  category: stringValidator("backend.validation.category", 1, 50, true)(t),
  amount: numberValidator("backend.validation.amount", 0.01, 1000000, true)(t),
  type: selectValidator("backend.validation.type", TYPES, true)(t),
});

export const UpdateTransaction = (t: (key: string) => string) => Joi.object({
  date: Joi.date().iso().optional().label(t("backend.validation.date")),
  title: stringValidator("backend.validation.title", 1, 100, false)(t),
  description: stringValidator("backend.validation.description", 2, 200, false)(t),
  category: stringValidator("backend.validation.category", 1, 50, false)(t),
  amount: numberValidator("backend.validation.amount", 0.01, 1000000, false)(t),
});