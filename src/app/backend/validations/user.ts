import Joi from "joi";
import {
  stringValidator,
  emailValidator,
  passwordValidator,
  selectValidator,
  stringArrayValidator,
  numberValidator,
  arraySelectValidator,
} from "../utils/GlobalValidation";
import { CURRENCIES, CATEGORY_LIST } from "../../../lib/constants";

const Register = Joi.object({
  name: stringValidator("Name", 3, 50, true),

  email: emailValidator(),

  password: passwordValidator(),
});
const Login = Joi.object({
  email: emailValidator(),
  password: passwordValidator(),
});
const Update = Joi.object({
  name: stringValidator("Name", 3, 50, false),
  email: emailValidator("Email", false),
});
const ChangePassword = Joi.object({
  newPassword: passwordValidator(),
  oldPassword: passwordValidator(),
});
const FinancialSettings = Joi.object({
  names: arraySelectValidator("Categories", CATEGORY_LIST, true, 4),
  currency: selectValidator("Currency", CURRENCIES, true),
  limit: numberValidator("Limit", 0, Number.MAX_SAFE_INTEGER, true),
});
export { Register, Login, Update, ChangePassword, FinancialSettings };
