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

const Register = () => Joi.object({
  name: stringValidator("Name", 3, 50, true),
  email: emailValidator("Email"),
  password: passwordValidator("Password"),
});

const Login = () => Joi.object({
  email: emailValidator("Email"),
  password: passwordValidator("Password"),
});

const Update = () => Joi.object({
  name: stringValidator("Name", 3, 50, true),
  email: emailValidator("Email", true),
  currency: selectValidator("Currency", CURRENCIES, true),
});

const ChangePassword = () => Joi.object({
  newPassword: passwordValidator("New Password"),
  oldPassword: passwordValidator("Old Password"),
});

const FinancialSettings = () => Joi.object({
  names: arraySelectValidator("Categories", CATEGORY_LIST, true, 4),
  currency: selectValidator("Currency", CURRENCIES, true),
  limit: numberValidator("Budget Limit", 0, Number.MAX_SAFE_INTEGER, true),
});

export { Register, Login, Update, ChangePassword, FinancialSettings };
