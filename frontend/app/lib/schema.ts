import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required"),
});

export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be 8 characters"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    confirmPassword: z.string().min(8, "Password must be 8 characters"),
    ref: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be 8 characters"),
    confirmPassword: z.string().min(8, "Password must be 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Project schema
export const projectSchema = z.object({
  project_name: z.string().min(1, { message: "Project name is required" }),
  description: z.string().optional(),
  status: z.enum(['Pending', 'Ongoing', 'Completed', 'Archived']).optional(),
  created_at: z.string().min(1, { message: "Created at date is required" }),
});

export type ProjectEntry = z.infer<typeof projectSchema> & {
  _id: string;
  stages?: ProjectStageEntry[];
  owner: {
    _id: string;
    name: string;
    email: string;
  };
};

// Stage schema
export const stageSchema = z.object({
  stage_name: z.string().min(1, { message: "Stage name is required" }),
  description: z.string().optional(),
  isCustom: z.boolean().optional(),
  projectId: z.string().optional(),
});

export type StageEntry = z.infer<typeof stageSchema> & {
  _id: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  isCustom: boolean;
  projectSpecific: string | null;
};

// Project Stage schema
export const projectStageSchema = z.object({
  status: z.enum(['Ongoing', 'Completed']),
  start_date: z.string().optional(),
  completion_date: z.string().optional(),
  order: z.number(),
});

export type ProjectStageEntry = z.infer<typeof projectStageSchema> & {
  _id: string;
  project: string;
  stage: StageEntry;
  connections?: StageConnectionEntry[];
};

// Stage Connection schema
export const stageConnectionSchema = z.object({
  from_stage: z.string(),
  to_stage: z.string(),
});

export type StageConnectionEntry = z.infer<typeof stageConnectionSchema> & {
  _id: string;
  project: string;
  from_stage: ProjectStageEntry;
  to_stage: ProjectStageEntry;
};

// Email schema
export const emailSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
});

export type EmailEntry = z.infer<typeof emailSchema> & {
  _id: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
};