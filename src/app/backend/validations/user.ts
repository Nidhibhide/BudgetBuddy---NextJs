import Joi from "joi";
import {
  stringValidator,
  emailValidator,
  passwordValidator,
  selectValidator,
} from "../utils/GlobalValidation";
import { CURRENCIES } from "../../../../constants";

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
  currency: selectValidator("Currency", CURRENCIES, false),
});
const Email = Joi.object({
  email: emailValidator(),
});
const ChangePassword = Joi.object({
  newPassword: passwordValidator(),
  oldPassword: passwordValidator(),
});
export { Register, Login, Update, Email, ChangePassword };
