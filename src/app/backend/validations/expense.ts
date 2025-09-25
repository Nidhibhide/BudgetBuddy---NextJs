import Joi from "joi";
import {
  stringValidator,
  selectValidator,
  numberValidator,
} from "../utils/GlobalValidation";
import { TYPES } from "../../../../constants";

const expense = Joi.object({
  title: stringValidator("Title", 3, 30, true),
  amount: numberValidator("Amount", 1, 100000, true),
  category: stringValidator("Category", 3, 30, true),
  type: selectValidator("Type", TYPES, true),
  description: stringValidator("Description", 3, 30, false, /^[a-zA-Z0-9\s]+$/),
});

export { expense };
