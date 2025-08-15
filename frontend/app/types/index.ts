export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  isEmailVerified: boolean;
  updatedAt: Date;
  profilePicture?: string;
  role: "manager" | "user";
  referredBy?: string;
  referralLink?: string;
  isActive: boolean;
}

export enum ProjectStatus {
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
}

// Project types
export interface Project {
  _id: string;
  project_name: string;
  description: string;
  status: 'Pending' | 'Ongoing' | 'Completed' | 'Archived';
  created_at: string;
  updated_at: string | null;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
}

// Form types
export interface ProjectFormData {
  project_name: string;
  description: string;
  created_at: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  _id: string;
}

export type ResourceType =
  | "Project"
  | "User";

export interface StatsCardProps {
  totalProjects: number;
  totalTasks: number;
  totalProjectInProgress: number;
  totalTaskCompleted: number;
  totalTaskToDo: number;
  totalTaskInProgress: number;
}

export interface ProjectStatusData {
  name: string;
  value: number;
  color: string;
}










// export interface User {
//   _id: string;
//   email: string;
//   name: string;
//   createdAt: Date;
//   isEmailVerified: boolean;
//   updatedAt: Date;
//   profilePicture?: string;
// }


// export enum ProjectStatus {
//   PLANNING = "Planning",
//   IN_PROGRESS = "In Progress",
//   ON_HOLD = "On Hold",
//   COMPLETED = "Completed",
//   CANCELLED = "Cancelled",
// }

// // Project types
// export interface Project {
//   _id: string;
//   project_name: string;
//   description: string;
//   status: 'Pending' | 'Ongoing' | 'Completed' | 'Archived';
//   created_at: string;
//   updated_at: string | null;
//   owner: {
//     _id: string;
//     name: string;
//     email: string;
//   };
// }

// // Form types
// export interface ProjectFormData {
//   project_name: string;
//   description: string;
//   created_at: string;
// }

// // API response types
// export interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
// }

// // Auth types
// export interface AuthState {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
// }

// export interface Subtask {
//   _id: string;
//   title: string;
//   completed: boolean;
//   createdAt: Date;
// }



// export interface Attachment {
//   fileName: string;
//   fileUrl: string;
//   fileType: string;
//   fileSize: number;
//   uploadedBy: string;
//   uploadedAt: Date;
//   _id: string;
// }

// export interface MemberProps {
//   _id: string;
//   user: User;
//   role: "admin" | "member" | "owner" | "viewer";
//   joinedAt: Date;
// }

// export type ResourceType =
//   | "Project"
//   | "User";


// export interface StatsCardProps {
//   totalProjects: number;
//   totalTasks: number;
//   totalProjectInProgress: number;
//   totalTaskCompleted: number;
//   totalTaskToDo: number;
//   totalTaskInProgress: number;
// }



// export interface ProjectStatusData {
//   name: string;
//   value: number;
//   color: string;
// }

