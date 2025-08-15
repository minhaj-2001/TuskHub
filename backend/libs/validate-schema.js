import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  managerId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
});

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().min(1, "Color is required"),
});

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
});

// Project schemas
export const projectSchema = z.object({
  project_name: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(["Pending", "Ongoing", "Completed", "Archived"]).default("Pending"),
  created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  user_id: z.number().positive(),
});

export const projectIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const updateProjectSchema = z.object({
  project_name: z.string().min(3).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(["Pending", "Ongoing", "Completed", "Archived"]).optional(),
  created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});

export {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  emailSchema,
  workspaceSchema,
  taskSchema,
  inviteMemberSchema,
  tokenSchema,
};














// import { z } from "zod";

// const registerSchema = z.object({
//   name: z.string().min(3, "Name is required"),
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(8, "Password must be at least 8 characters long"),
// });

// const loginSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(1, "Password is required"),
// });

// const verifyEmailSchema = z.object({
//   token: z.string().min(1, "Token is required"),
// });

// const resetPasswordSchema = z.object({
//   token: z.string().min(1, "Token is required"),
//   newPassword: z.string().min(8, "Password must be at least 8 characters long"),
//   confirmPassword: z.string().min(1, "Confirm password is required"),
// });

// const emailSchema = z.object({
//   email: z.string().email("Invalid email address"),
// });

// const inviteMemberSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   role: z.enum(["admin", "member", "viewer"]),
// });

// const tokenSchema = z.object({
//   token: z.string().min(1, "Token is required"),
// });

// const workspaceSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   description: z.string().optional(),
//   color: z.string().min(1, "Color is required"),
// });



// const taskSchema = z.object({
//   title: z.string().min(1, "Task title is required"),
//   description: z.string().optional(),
//   status: z.enum(["To Do", "In Progress", "Done"]),
//   priority: z.enum(["Low", "Medium", "High"]),
//   dueDate: z.string().min(1, "Due date is required"),
//   assignees: z.array(z.string()).min(1, "At least one assignee is required"),
// });



// // Project schemas
// export const projectSchema = z.object({
//   project_name: z.string().min(3).max(255),
//   description: z.string().max(1000).optional(),
//   status: z.enum(["Pending", "Ongoing", "Completed", "Archived"]).default("Pending"),
//   created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
//   user_id: z.number().positive(),
// });

// export const projectIdSchema = z.object({
//   id: z.string().transform((val) => parseInt(val, 10)),
// });

// export const updateProjectSchema = z.object({
//   project_name: z.string().min(3).max(255).optional(),
//   description: z.string().max(1000).optional(),
//   status: z.enum(["Pending", "Ongoing", "Completed", "Archived"]).optional(),
//   created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
// }).refine((data) => Object.keys(data).length > 0, {
//   message: "At least one field must be provided for update",
// });

// // ... other existing schemas (workspaceSchema, inviteMemberSchema, etc.)

// export {
//   registerSchema,
//   loginSchema,
//   verifyEmailSchema,
//   resetPasswordSchema,
//   emailSchema,
//   workspaceSchema,
//   // projectSchema,
//   // projectIdSchema ,
//   // updateProjectSchema ,
//   taskSchema,
//   inviteMemberSchema,
//   tokenSchema,
// };
