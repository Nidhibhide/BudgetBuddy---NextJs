import Joi from "joi";

export const stringArrayValidator = (
  label: string,
  required: boolean,
  maxLength: number
) => {
  let schema = Joi.array()
    .items(Joi.string().required())
    .max(maxLength)
    .label(label);
  if (required) {
    schema = schema.required();
  }
  return schema;
};

export const stringValidator = (
  label: string,
  min: number,
  max: number,
  required: boolean,
  regex?: RegExp
) => {
  let schema = Joi.string().min(min).max(max).label(label);
  if (regex) {
    schema = schema.pattern(regex);
  }
  if (required) {
    schema = schema.required();
  }
  return schema;
};

export const numberValidator = (
  label: string,
  min: number,
  max: number,
  required: boolean
) => {
  let schema = Joi.number().min(min).max(max).label(label);
  if (required) {
    schema = schema.required();
  }
  return schema;
};

export const selectValidator = (
  label: string,
  options: string[],
  required: boolean
) => {
  let schema = Joi.string().valid(...options).label(label);
  if (required) {
    schema = schema.required();
  }
  return schema;
};

export const emailValidator = (
  label: string = "Email",
  required: boolean = true
) => {
  let schema = Joi.string().email().label(label);
  if (required) {
    schema = schema.required();
  }
  return schema;
};

export const passwordValidator = (
  label: string = "Password",
  required: boolean = true
) => {
  let schema = Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .messages({
      "string.pattern.base": `${label} must contain at least one letter and one number`,
      "string.min": `${label} must be at least 8 characters`,
      "string.max": `${label} must be at most 100 characters`,
    })
    .label(label);
  if (required) {
    schema = schema.required();
  }
  return schema;
};

export const arraySelectValidator = (
  label: string,
  options: string[],
  required: boolean,
  maxLength: number
) => {
  let schema = Joi.array()
    .items(Joi.string().valid(...options))
    .max(maxLength)
    .label(label);
  if (required) {
    schema = schema.required();
  }
  return schema;
};
