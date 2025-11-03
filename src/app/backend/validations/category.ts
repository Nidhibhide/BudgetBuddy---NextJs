import Joi from "joi";
import { TYPES } from "@/lib/constants";
import { stringValidator, selectValidator, numberValidator } from "@/app/backend/utils/GlobalValidation";

export const CreateCategory = Joi.object({
  name: stringValidator("Name", 1, 50, true),
  type: selectValidator("Type", TYPES, true),
  icon: stringValidator("Icon", 1, 100, true),
  budgetLimit: numberValidator("Budget Limit", 0, 1000000, false),
  goal: numberValidator("Goal", 0, 1000000, false),
});

export const EditCategory = Joi.object({
  name: stringValidator("Name", 1, 50, true),
  icon: stringValidator("Icon", 1, 100, true),
  budgetLimit: numberValidator("Budget Limit", 0, 1000000, false),
  goal: numberValidator("Goal", 0, 1000000, false),
  type: selectValidator("Type", TYPES, false),
});