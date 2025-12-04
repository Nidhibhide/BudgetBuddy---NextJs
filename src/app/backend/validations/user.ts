import Joi from "joi";
import {
  stringValidator,
  emailValidator,
  passwordValidator,
  selectValidator,
  numberValidator,
  arraySelectValidator,
} from "../utils/GlobalValidation";
import { CURRENCIES, CATEGORY_LIST } from "@/constants";

const Register = (t: (key: string) => string) => Joi.object({
  name: stringValidator("backend.validation.name", 3, 50, true)(t),

  email: emailValidator()(t),

  password: passwordValidator()(t),
});
const Login = (t: (key: string) => string) => Joi.object({
  email: emailValidator()(t),
  password: passwordValidator()(t),
});
const Update = (t: (key: string) => string) => Joi.object({
  name: stringValidator("backend.validation.name", 3, 50, true)(t),
  email: emailValidator("backend.validation.email", true)(t),
  currency: selectValidator("backend.validation.currency", CURRENCIES, true)(t),
});
const ChangePassword = (t: (key: string) => string) => Joi.object({
  newPassword: passwordValidator()(t),
  oldPassword: passwordValidator()(t),
});
const FinancialSettings = (t: (key: string) => string) => Joi.object({
  names: arraySelectValidator("backend.validation.categories", CATEGORY_LIST, true, 4)(t),
  currency: selectValidator("backend.validation.currency", CURRENCIES, true)(t),
  limit: numberValidator("backend.validation.limit", 0, Number.MAX_SAFE_INTEGER, true)(t),
});
export { Register, Login, Update, ChangePassword, FinancialSettings };
