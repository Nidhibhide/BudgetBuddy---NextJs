import Joi from "joi";
import { TYPES } from "@/lib/constants";
import { stringValidator, selectValidator } from "@/app/backend/utils/GlobalValidation";

export const CreateCategory = Joi.object({
  name: stringValidator("Name", 1, 50, true),
  type: selectValidator("Type", TYPES, true),
});

export const EditCategory = Joi.object({
  name: stringValidator("Name", 1, 50, true),
});