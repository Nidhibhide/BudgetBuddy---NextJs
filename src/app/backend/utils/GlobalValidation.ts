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
  labelKey: string,
  min: number,
  max: number,
  required: boolean,
  regex?: RegExp
) => {
  return (t: (key: string) => string) => {
    let schema = Joi.string().min(min).max(max).label(t(labelKey));
    if (regex) {
      schema = schema.pattern(regex);
    }
    if (required) {
      schema = schema.required();
    }
    return schema;
  };
};

export const numberValidator = (
  labelKey: string,
  min: number,
  max: number,
  required: boolean
) => {
  return (t: (key: string) => string) => {
    let schema = Joi.number().min(min).max(max).label(t(labelKey));
    if (required) {
      schema = schema.required();
    }
    return schema;
  };
};

export const selectValidator = (
  labelKey: string,
  options: string[],
  required: boolean
) => {
  return (t: (key: string) => string) => {
    let schema = Joi.string().valid(...options).label(t(labelKey));
    if (required) {
      schema = schema.required();
    }
    return schema;
  };
};

export const emailValidator = (
  labelKey: string = "backend.validation.email",
  required: boolean = true
) => {
  return (t: (key: string) => string) => {
    let schema = Joi.string().email().label(t(labelKey));
    if (required) {
      schema = schema.required();
    }
    return schema;
  };
};

export const passwordValidator = (
  labelKey: string = "backend.validation.password",
  required: boolean = true
) => {
  return (t: (key: string) => string) => {
    let schema = Joi.string().min(5).max(100).label(t(labelKey));
    if (required) {
      schema = schema.required();
    }
    return schema;
  };
};

export const arraySelectValidator = (
  labelKey: string,
  options: string[],
  required: boolean,
  maxLength: number
) => {
  return (t: (key: string) => string) => {
    let schema = Joi.array()
      .items(Joi.string().valid(...options))
      .max(maxLength)
      .label(t(labelKey));
    if (required) {
      schema = schema.required();
    }
    return schema;
  };
};
