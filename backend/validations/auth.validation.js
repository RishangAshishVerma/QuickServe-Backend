import joi from "joi";

export const userSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  phoneNo: joi.string().min(10).required(),
  password: joi.string().min(8).required(),
  avatar: joi.string().uri(),
  role: joi
    .string()
    .valid("user", "rider", "warehouseOwner", "support", "admin")
    .required(),
});

export function validateUser(req, res, next) {
  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false, 
    stripUnknown: true, 
  });

  if (error) {
    const errors = error.details.map((d) => ({
      message: d.message,
      path: d.path.join("."),
      type: d.type,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.body = value;
  next();
}
