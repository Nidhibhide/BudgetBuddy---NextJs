import Joi from "joi";
import { stringArrayValidator } from "../utils/GlobalValidation";

const category = Joi.object({
  names: stringArrayValidator("Categories", true, 4),
});

export { category };
