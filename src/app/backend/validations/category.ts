import Joi from "joi";
import { TYPES } from "@/constants";
import { stringValidator, selectValidator, numberValidator } from "@/app/backend/utils/GlobalValidation";

export const CreateCategory = (t: (key: string) => string) => Joi.object({
  name: stringValidator("backend.validation.name", 1, 50, true)(t),
  type: selectValidator("backend.validation.type", TYPES, true)(t),
  budgetLimit: numberValidator("backend.validation.budgetLimit", 0, 1000000, false)(t),
  goal: numberValidator("backend.validation.goal", 0, 1000000, false)(t),
});

export const EditCategory = (t: (key: string) => string) => Joi.object({
  name: stringValidator("backend.validation.name", 1, 50, true)(t),
  budgetLimit: numberValidator("backend.validation.budgetLimit", 0, 1000000, false)(t),
  goal: numberValidator("backend.validation.goal", 0, 1000000, false)(t),
  type: selectValidator("backend.validation.type", TYPES, false)(t),
});