const { z } = require("zod");

const roles = ["Manager", "Support", "Engineer", "QA", "Analyst"];
const statuses = ["Active", "Inactive"];

const phoneRegex = /^[0-9+\-() ]{7,20}$/;

const userBase = z.object({
  firstName: z.string().trim().min(2, "First name is required (min 2 chars)").max(50),
  lastName: z.string().trim().min(2, "Last name is required (min 2 chars)").max(50),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().regex(phoneRegex, "Please enter a valid phone number"),
  role: z.enum(roles, { message: "Please choose a valid role" }),
  status: z.enum(statuses, { message: "Please choose a valid status" })
});

const createUserSchema = userBase;
const updateUserSchema = userBase.partial().refine((v) => Object.keys(v).length > 0, {
  message: "At least one field is required to update"
});

module.exports = { roles, statuses, createUserSchema, updateUserSchema };

