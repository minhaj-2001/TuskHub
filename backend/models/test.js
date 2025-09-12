// // backend/libs/validate-schema.js
// import { z } from "zod";

// // Enhanced validation schemas with input sanitization
// export const sanitizeInput = (input) => {
//   // Remove potentially dangerous characters
//   return input
//     .replace(/[<>]/g, '') // Remove < and > characters
//     .replace(/[^\w\s@.-]/gi, '') // Keep only alphanumeric, spaces, @, ., and -
//     .trim(); // Remove leading/trailing whitespace
// };

// // Enhanced project schema with validation
// export const projectSchema = z.object({
//   project_name: z.string()
//     .min(3, "Project name must be at least 3 characters")
//     .max(100, "Project name must be less than 100 characters")
//     .transform(sanitizeInput),
//   description: z.string()
//     .max(1000, "Description must be less than 1000 characters")
//     .transform(sanitizeInput)
//     .optional(),
//   status: z.enum(["Pending", "Ongoing", "Completed", "Archived"])
//     .default("Pending"),
//   created_at: z.string()
//     .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
//   user_id: z.number().positive(),
// });

// // Enhanced stage schema
// export const stageSchema = z.object({
//   stage_name: z.string()
//     .min(3, "Stage name must be at least 3 characters")
//     .max(100, "Stage name must be less than 100 characters")
//     .transform(sanitizeInput),
//   description: z.string()
//     .max(1000, "Description must be less than 1000 characters")
//     .transform(sanitizeInput)
//     .optional(),
// });

// // Enhanced email schema
// export const emailSchema = z.object({
//   name: z.string()
//     .min(2, "Name must be at least 2 characters")
//     .max(100, "Name must be less than 100 characters")
//     .transform(sanitizeInput),
//   email: z.string()
//     .email("Invalid email address")
//     .transform(sanitizeInput),
// });

// // Enhanced user schemas
// export const registerSchema = z.object({
//   name: z.string()
//     .min(3, "Name must be at least 3 characters")
//     .max(50, "Name must be less than 50 characters")
//     .transform(sanitizeInput),
//   email: z.string()
//     .email("Invalid email address")
//     .transform(sanitizeInput),
//   password: z.string()
//     .min(8, "Password must be at least 8 characters")
//     .max(100, "Password must be less than 100 characters"),
//   confirmPassword: z.string()
//     .min(8, "Password must be at least 8 characters"),
//   ref: z.string().optional(),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"],
// });

// export const loginSchema = z.object({
//   email: z.string()
//     .email("Invalid email address")
//     .transform(sanitizeInput),
//   password: z.string()
//     .min(6, "Password is required")
//     .transform(sanitizeInput),
// });




// // backend/middleware/security-middleware.js
// import { Request, Response, NextFunction } from 'express';

// // SQL injection protection middleware
// export const preventInjection = (req: Request, res: Response, next: NextFunction) => {
//   // Check for common SQL injection patterns in query parameters
//   const checkForInjection = (value: any) => {
//     if (typeof value !== 'string') return false;
    
//     // Common SQL injection patterns
//     const sqlPatterns = [
//       /(\b(select|insert|update|delete|drop|alter|union|exec)\b)/i,
//       /(\b(or|and)\s+\d+\s*=\s*\d+)/i,
//       /(\b(;|--|\/\*|\*\/)\b)/i,
//       /(\b(xp_cmdshell|sp_oacreate|xp_regread)\b)/i,
//       /(\b(waitfor\s+delay|pg_sleep)\b)/i,
//       /(\b(char|nchar|varchar|nvarchar)\s*\()/i,
//     ];
    
//     return sqlPatterns.some(pattern => pattern.test(value));
//   };
  
//   // Check query parameters
//   const queryParams = { ...req.query, ...req.params };
  
//   for (const [key, value] of Object.entries(queryParams)) {
//     if (checkForInjection(value)) {
//       console.warn(`Potential SQL injection detected in ${key}:`, value);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid input detected. Please check your input and try again.'
//       });
//     }
//   }
  
//   // Check request body
//   if (req.body) {
//     for (const [key, value] of Object.entries(req.body)) {
//       if (typeof value === 'string' && checkForInjection(value)) {
//         console.warn(`Potential SQL injection detected in body ${key}:`, value);
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid input detected. Please check your input and try again.'
//         });
//       }
//     }
//   }
  
//   next();
// };

// // NoSQL injection protection for MongoDB
// export const preventNoSQLInjection = (req: Request, res: Response, next: NextFunction) => {
//   const checkForNoSQLInjection = (value: any) => {
//     if (typeof value !== 'string') return false;
    
//     // Common NoSQL injection patterns for MongoDB
//     const noSQLPatterns = [
//       /\$where/i,
//       /\$ne/i,
//       /\$gt/i,
//       /\$lt/i,
//       /\$gte/i,
//       /\$lte/i,
//       /\$in/i,
//       /\$nin/i,
//       /\$exists/i,
//       /\$or/i,
//       /\$and/i,
//       /\$not/i,
//       /\$nor/i,
//       /\$regex/i,
//       /\$options/i,
//       // MongoDB operators
//       /(\{.*\$where.*\})/i,
//       /(\{.*\$ne.*\})/i,
//       /(\{.*\$gt.*\})/i,
//       /(\{.*\$lt.*\})/i,
//       // JavaScript code injection
//       /(function|eval|setTimeout|setInterval)\s*\(/i,
//       /(\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4})/i,
//     ];
    
//     return noSQLPatterns.some(pattern => pattern.test(value));
//   };
  
//   // Check query parameters
//   const queryParams = { ...req.query, ...req.params };
  
//   for (const [key, value] of Object.entries(queryParams)) {
//     if (checkForNoSQLInjection(value)) {
//       console.warn(`Potential NoSQL injection detected in ${key}:`, value);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid input detected. Please check your input and try again.'
//       });
//     }
//   }
  
//   // Check request body
//   if (req.body) {
//     for (const [key, value] of Object.entries(req.body)) {
//       if (typeof value === 'string' && checkForNoSQLInjection(value)) {
//         console.warn(`Potential NoSQL injection detected in body ${key}:`, value);
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid input detected. Please check your input and try again.'
//         });
//       }
//     }
//   }
  
//   next();
// };



// // backend/index.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import { connectDB } from "./libs/index.js";
// import routes from "./routes/index.js";
// import { preventInjection, preventNoSQLInjection } from "./middleware/security-middleware.js";
// import { 
//   basicRateLimit, 
//   authRateLimit, 
//   strictRateLimit, 
//   ddosProtection,
//   progressiveRateLimit 
// } from "./middleware/rate-limiter.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB
// connectDB();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Apply security middleware to all routes
// app.use(preventInjection);
// app.use(preventNoSQLInjection);

// // Apply DDoS protection and progressive rate limiting to all routes
// app.use(ddosProtection);
// app.use(progressiveRateLimit);

// // Apply basic rate limiting to all routes
// app.use(basicRateLimit);

// // Routes
// app.use("/api-v1", routes);

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ success: false, message: 'Something went wrong!' });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });









// // backend/libs/security-utils.js
// import { z } from 'zod';

// // Comprehensive input sanitization
// export const sanitizeInput = (input: any): string => {
//   if (typeof input !== 'string') return '';
  
//   // Remove potentially dangerous characters
//   let sanitized = input
//     // Remove < and > to prevent HTML/script injection
//     .replace(/[<>]/g, '')
//     // Remove SQL comment characters
//     .replace(/(--|\/\*|\*\/)/g, '')
//     // Remove semicolons (often used in SQL injection)
//     .replace(/;/g, '')
//     // Remove single quotes
//     .replace(/'/g, '')
//     // Remove double quotes
//     .replace(/"/g, '')
//     // Remove backslashes
//     .replace(/\\/g, '')
//     // Remove pipe characters (used in SQL for union)
//     .replace(/\|/g, '')
//     // Remove null bytes
//     .replace(/\0/g, '')
//     // Remove newlines and carriage returns
//     .replace(/[\r\n]/g, '')
//     // Remove horizontal tabs
//     .replace(/[\t]/g, '')
//     // Remove vertical tabs
//     .replace(/[\v]/g, '')
//     // Remove form feed characters
//     .replace(/[\f]/g, '')
//     // Remove backspace characters
//     .replace(/[\b]/g, '');
  
//   // Trim whitespace
//   sanitized = sanitized.trim();
  
//   return sanitized;
// };

// // Validate email format
// export const isValidEmail = (email: string): boolean => {
//   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//   return emailRegex.test(email);
// };

// // Validate and sanitize email
// export const sanitizeAndValidateEmail = (email: string): { valid: boolean; sanitized: string } => {
//   const sanitized = sanitizeInput(email);
//   const valid = isValidEmail(sanitized);
//   return { valid, sanitized };
// };

// // Validate password strength
// export const validatePassword = (password: string): { valid: boolean; message: string } => {
//   if (typeof password !== 'string') {
//     return { valid: false, message: 'Password must be a string' };
//   }
  
//   if (password.length < 8) {
//     return { valid: false, message: 'Password must be at least 8 characters long' };
//   }
  
//   if (password.length > 100) {
//     return { valid: false, message: 'Password must be less than 100 characters' };
//   }
  
//   // Check for common weak passwords
//   const commonPasswords = [
//     'password', '12345678', '123456789', 'qwerty', 'abc123',
//     'password123', 'admin', 'welcome', 'letmein', 'monkey'
//   ];
  
//   if (commonPasswords.includes(password.toLowerCase())) {
//     return { valid: false, message: 'Password is too common' };
//   }
  
//   // Check for character variety
//   const hasLowercase = /[a-z]/.test(password);
//   const hasUppercase = /[A-Z]/.test(password);
//   const hasNumbers = /\d/.test(password);
//   const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
//   const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
//   if (varietyCount < 3) {
//     return { valid: false, message: 'Password must contain a mix of character types' };
//   }
  
//   return { valid: true, message: 'Password is strong' };
// };

// // Validate and sanitize project name
// export const sanitizeAndValidateProjectName = (name: string): { valid: boolean; sanitized: string; message?: string } => {
//   const sanitized = sanitizeInput(name);
  
//   if (sanitized.length < 3) {
//     return { valid: false, sanitized, message: 'Project name must be at least 3 characters' };
//   }
  
//   if (sanitized.length > 100) {
//     return { valid: false, sanitized, message: 'Project name must be less than 100 characters' };
//   }
  
//   // Check for potentially dangerous patterns
//   const dangerousPatterns = [
//     /script/i,
//     /javascript/i,
//     /eval/i,
//     /exec/i,
//     /expression/i,
//     /function/i,
//     /select/i,
//     /insert/i,
//     /update/i,
//     /delete/i,
//     /drop/i,
//     /union/i,
//   ];
  
//   if (dangerousPatterns.some(pattern => pattern.test(sanitized))) {
//     return { valid: false, sanitized, message: 'Project name contains invalid characters' };
//   }
  
//   return { valid: true, sanitized };
// };

// // Validate and validate stage name
// export const sanitizeAndValidateStageName = (name: string): { valid: boolean; sanitized: string; message?: string } => {
//   const sanitized = sanitizeInput(name);
  
//   if (sanitized.length < 3) {
//     return { valid: false, sanitized, message: 'Stage name must be at least 3 characters' };
//   }
  
//   if (sanitized.length > 100) {
//     return { valid: false, sanitized, message: 'Stage name must be less than 100 characters' };
//   }
  
//   // Check for potentially dangerous patterns
//   const dangerousPatterns = [
//     /script/i,
//     /javascript/i,
//     /eval/i,
//     /exec/i,
//     /expression/i,
//     /function/i,
//   ];
  
//   if (dangerousPatterns.some(pattern => pattern.test(sanitized))) {
//     return { valid: false, sanitized, message: 'Stage name contains invalid characters' };
//   }
  
//   return { valid: true, sanitized };
// };







// // backend/controllers/project.js (updated)
// import Project from "../models/project.js";
// import ProjectStage from "../models/projectStage.js";
// import StageConnection from "../models/stageConnection.js";
// import User from "../models/user.js";
// import { generateProjectPDF } from "../libs/pdf-generator.js";
// import { sendEmailWithAttachment } from "../libs/send-email.js";
// import { cacheWithPattern, generateCacheKey } from "../libs/redis-cache.js";
// import { 
//   sanitizeAndValidateProjectName, 
//   sanitizeAndValidateStageName 
// } from "../libs/security-utils.js";
// import fs from 'fs';

// // Create a new project with enhanced validation
// export const createProject = async (req, res) => {
//   try {
//     const { project_name, description, status, created_at } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Only managers can create projects
//     if (userRole !== "manager") {
//       return res.status(403).json({ success: false, error: "Only managers can create projects" });
//     }
    
//     // Validate and sanitize project name
//     const nameValidation = sanitizeAndValidateProjectName(project_name);
//     if (!nameValidation.valid) {
//       return res.status(400).json({ 
//         success: false, 
//         error: nameValidation.message || "Invalid project name" 
//       });
//     }
    
//     // Create a Date object at noon to avoid timezone issues
//     const createdAtDate = createLocalDate(created_at);
    
//     const newProject = new Project({
//       project_name: nameValidation.sanitized,
//       description: description ? description.trim() : "",
//       status: status || "Pending",
//       created_at: createdAtDate,
//       owner: userId
//     });
    
//     await newProject.save();
    
//     // Invalidate user projects cache
//     await invalidateUserProjectsCache(userId);
    
//     res.status(201).json({ success: true, project: newProject });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // Update project with enhanced validation
// export const updateProject = async (req, res) => {
//   const { id } = req.params;
//   const { project_name, description, status, created_at } = req.body;
//   const userId = req.user._id;
//   const userRole = req.user.role;
  
//   try {
//     console.log("Updating project:", { id, project_name, description, status, created_at });
    
//     // Check if user has permission to update this project
//     const project = await Project.findById(id);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can update projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     // Build update object dynamically based on provided fields
//     const updateData: any = {};
    
//     if (project_name) {
//       const nameValidation = sanitizeAndValidateProjectName(project_name);
//       if (!nameValidation.valid) {
//         return res.status(400).json({ 
//           success: false, 
//           error: nameValidation.message || "Invalid project name" 
//         });
//       }
//       updateData.project_name = nameValidation.sanitized;
//     }
    
//     if (description !== undefined) {
//       updateData.description = description ? description.trim() : "";
//     }
    
//     if (status) {
//       // Validate status is one of the allowed values
//       const validStatuses = ["Pending", "Ongoing", "Completed", "Archived"];
//       if (!validStatuses.includes(status)) {
//         return res.status(400).json({ success: false, error: "Invalid status value" });
//       }
//       updateData.status = status;
//     }
    
//     if (created_at) {
//       // Create a Date object at noon to avoid timezone issues
//       updateData.created_at = createLocalDate(created_at);
//     }
    
//     const updatedProject = await Project.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true }
//     ).populate({
//       path: 'stages',
//       populate: {
//         path: 'stage',
//         model: 'Stage'
//       }
//     }).populate('owner', 'name email');
    
//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Format date to YYYY-MM-DD for frontend in local timezone
//     const formattedProject = {
//       ...updatedProject.toObject(),
//       created_at: formatDateToLocal(updatedProject.created_at)
//     };
    
//     // Invalidate cache
//     await invalidateProjectCache(id);
//     await invalidateUserProjectsCache(userId);
    
//     res.status(200).json(formattedProject);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project", error });
//   }
// };









// // backend/libs/security-logger.js
// import fs from 'fs';
// import path from 'path';

// // Security event types
// export enum SecurityEventType {
//   SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
//   NOSQL_INJECTION_ATTEMPT = 'NOSQL_INJECTION_ATTEMPT',
//   XSS_ATTEMPT = 'XSS_ATTEMPT',
//   AUTH_FAILURE = 'AUTH_FAILURE',
//   RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
//   SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
//   VALIDATION_FAILURE = 'VALIDATION_FAILURE'
// }

// // Security log entry interface
// interface SecurityLogEntry {
//   timestamp: Date;
//   eventType: SecurityEventType;
//   ip: string;
//   userAgent?: string;
//   userId?: string;
//   endpoint: string;
//   method: string;
//   details: Record<string, any>;
//   severity: 'low' | 'medium' | 'high' | 'critical';
// }

// // Security logger class
// export class SecurityLogger {
//   private logFile: string;
  
//   constructor() {
//     // Create logs directory if it doesn't exist
//     const logsDir = path.join(process.cwd(), 'logs');
//     if (!fs.existsSync(logsDir)) {
//       fs.mkdirSync(logsDir, { recursive: true });
//     }
    
//     this.logFile = path.join(logsDir, 'security.log');
//   }
  
//   // Log security event
//   log(entry: Omit<SecurityLogEntry, 'timestamp'>): void {
//     const logEntry: SecurityLogEntry = {
//       timestamp: new Date(),
//       ...entry
//     };
    
//     const logMessage = `[${logEntry.timestamp.toISOString()}] [${logEntry.eventType}] [${logEntry.severity.toUpperCase()}] IP: ${logEntry.ip} Endpoint: ${logEntry.endpoint} Details: ${JSON.stringify(logEntry.details)}\n`;
    
//     try {
//       fs.appendFileSync(this.logFile, logMessage);
      
//       // Also log to console for immediate visibility
//       const consoleColor = this.getConsoleColor(logEntry.severity);
//       console[consoleColor](logMessage);
//     } catch (error) {
//       console.error('Failed to write security log:', error);
//     }
//   }
  
//   // Get console color based on severity
//   private getConsoleColor(severity: string): keyof Console {
//     switch (severity) {
//       case 'low':
//         return 'log';
//       case 'medium':
//         return 'warn';
//       case 'high':
//         return 'error';
//       case 'critical':
//         return 'error';
//       default:
//         return 'log';
//     }
//   }
  
//   // Get recent security logs
//   getRecentLogs(limit: number = 100): SecurityLogEntry[] {
//     try {
//       if (!fs.existsSync(this.logFile)) {
//         return [];
//       }
      
//       const content = fs.readFileSync(this.logFile, 'utf8');
//       const lines = content.split('\n').filter(line => line.trim() !== '');
      
//       const logs: SecurityLogEntry[] = [];
      
//       // Parse logs from newest to oldest
//       for (let i = lines.length - 1; i >= 0 && logs.length < limit; i--) {
//         try {
//           const line = lines[i];
//           const match = line.match(/^\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] IP: ([^\s]+) Endpoint: ([^\s]+) Details: (.+)$/);
          
//           if (match) {
//             const [, timestamp, eventType, severity, ip, endpoint, detailsStr] = match;
            
//             logs.push({
//               timestamp: new Date(timestamp),
//               eventType: eventType as SecurityEventType,
//               severity: severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
//               ip,
//               endpoint,
//               details: JSON.parse(detailsStr)
//             });
//           }
//         } catch (error) {
//           console.error('Error parsing security log line:', error, 'Line:', line);
//         }
//       }
      
//       return logs;
//     } catch (error) {
//       console.error('Error reading security logs:', error);
//       return [];
//     }
//   }
  
//   // Clear old logs (keep last 10,000 entries)
//   clearOldLogs(): void {
//     try {
//       if (!fs.existsSync(this.logFile)) {
//         return;
//       }
      
//       const content = fs.readFileSync(this.logFile, 'utf8');
//       const lines = content.split('\n').filter(line => line.trim() !== '');
      
//       // Keep only the last 10,000 lines
//       const linesToKeep = lines.slice(-10000);
      
//       fs.writeFileSync(this.logFile, linesToKeep.join('\n'));
//       console.log('Security logs cleared, kept last 10,000 entries');
//     } catch (error) {
//       console.error('Error clearing security logs:', error);
//     }
//   }
// }

// // Export singleton instance
// export const securityLogger = new SecurityLogger();









// // backend/middleware/security-middleware.js (updated)
// import { Request, Response, NextFunction } from 'express';
// import { securityLogger, SecurityEventType } from '../libs/security-logger.js';

// // SQL injection protection middleware with enhanced logging
// export const preventInjection = (req: Request, res: Response, next: NextFunction) => {
//   const ip = req.ip || req.connection.remoteAddress;
//   const userAgent = req.get('User-Agent');
  
//   // Check for common SQL injection patterns in query parameters
//   const checkForInjection = (value: any) => {
//     if (typeof value !== 'string') return false;
    
//     // Common SQL injection patterns
//     const sqlPatterns = [
//       /(\b(select|insert|update|delete|drop|alter|union|exec)\b)/i,
//       /(\b(or|and)\s+\d+\s*=\s*\d+)/i,
//       /(\b(;|--|\/\*|\*\/)\b)/i,
//       /(\b(xp_cmdshell|sp_oacreate|xp_regread)\b)/i,
//       /(\b(waitfor\s+delay|pg_sleep)\b)/i,
//       /(\b(char|nchar|varchar|nvarchar)\s*\()/i,
//     ];
    
//     return sqlPatterns.some(pattern => pattern.test(value));
//   };
  
//   // Check query parameters
//   const queryParams = { ...req.query, ...req.params };
  
//   for (const [key, value] of Object.entries(queryParams)) {
//     if (checkForInjection(value)) {
//       // Log security event
//       securityLogger.log({
//         eventType: SecurityEventType.SQL_INJECTION_ATTEMPT,
//         ip,
//         userAgent,
//         endpoint: req.path,
//         method: req.method,
//         details: {
//           parameter: key,
//           value,
//           url: req.originalUrl
//         },
//         severity: 'high'
//       });
      
//       console.warn(`Potential SQL injection detected in ${key}:`, value);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid input detected. Please check your input and try again.'
//       });
//     }
//   }
  
//   // Check request body
//   if (req.body) {
//     for (const [key, value] of Object.entries(req.body)) {
//       if (typeof value === 'string' && checkForInjection(value)) {
//         // Log security event
//         securityLogger.log({
//           eventType: SecurityEventType.SQL_INJECTION_ATTEMPT,
//           ip,
//           userAgent,
//           endpoint: req.path,
//           method: req.method,
//           details: {
//             parameter: key,
//             value,
//             url: req.originalUrl
//           },
//           severity: 'high'
//         });
        
//         console.warn(`Potential SQL injection detected in body ${key}:`, value);
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid input detected. Please check your input and try again.'
//         });
//       }
//     }
//   }
  
//   next();
// };

// // NoSQL injection protection for MongoDB with enhanced logging
// export const preventNoSQLInjection = (req: Request, res: Response, next: NextFunction) => {
//   const ip = req.ip || req.connection.remoteAddress;
//   const userAgent = req.get('User-Agent');
  
//   const checkForNoSQLInjection = (value: any) => {
//     if (typeof value !== 'string') return false;
    
//     // Common NoSQL injection patterns for MongoDB
//     const noSQLPatterns = [
//       /\$where/i,
//       /\$ne/i,
//       /\$gt/i,
//       /\$lt/i,
//       /\$gte/i,
//       /\$lte/i,
//       /\$in/i,
//       /\$nin/i,
//       /\$exists/i,
//       /\$or/i,
//       /\$and/i,
//       /\$not/i,
//       /\$nor/i,
//       /\$regex/i,
//       /\$options/i,
//       // MongoDB operators
//       /(\{.*\$where.*\})/i,
//       /(\{.*\$ne.*\})/i,
//       /(\{.*\$gt.*\})/i,
//       /(\{.*\$lt.*\})/i,
//       // JavaScript code injection
//       /(function|eval|setTimeout|setInterval)\s*\(/i,
//       /(\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4})/i,
//     ];
    
//     return noSQLPatterns.some(pattern => pattern.test(value));
//   };
  
//   // Check query parameters
//   const queryParams = { ...req.query, ...req.params };
  
//   for (const [key, value] of Object.entries(queryParams)) {
//     if (checkForNoSQLInjection(value)) {
//       // Log security event
//       securityLogger.log({
//         eventType: SecurityEventType.NOSQL_INJECTION_ATTEMPT,
//         ip,
//         userAgent,
//         endpoint: req.path,
//         method: req.method,
//         details: {
//           parameter: key,
//           value,
//           url: req.originalUrl
//         },
//         severity: 'high'
//       });
      
//       console.warn(`Potential NoSQL injection detected in ${key}:`, value);
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid input detected. Please check your input and try again.'
//       });
//     }
//   }
  
//   // Check request body
//   if (req.body) {
//     for (const [key, value] of Object.entries(req.body)) {
//       if (typeof value === 'string' && checkForNoSQLInjection(value)) {
//         // Log security event
//         securityLogger.log({
//           eventType: SecurityEventType.NOSQL_INJECTION_ATTEMPT,
//           ip,
//           userAgent,
//           endpoint: req.path,
//           method: req.method,
//           details: {
//             parameter: key,
//             value,
//             url: req.originalUrl
//           },
//           severity: 'high'
//         });
        
//         console.warn(`Potential NoSQL injection detected in body ${key}:`, value);
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid input detected. Please check your input and try again.'
//         });
//       }
//     }
//   }
  
//   next();
// };









// // frontend/app/component/security/SecurityDashboard.tsx
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Shield, AlertTriangle, Activity, RefreshCw, Database, Eye, EyeOff } from "lucide-react";
// import { fetchData } from "@/lib/fetch-util";

// interface SecurityLog {
//   timestamp: string;
//   eventType: string;
//   ip: string;
//   userAgent?: string;
//   endpoint: string;
//   method: string;
//   details: any;
//   severity: 'low' | 'medium' | 'high' | 'critical';
// }

// interface SecurityStats {
//   totalLogs: number;
//   todayLogs: number;
//   criticalEvents: number;
//   highEvents: number;
//   mediumEvents: number;
//   lowEvents: number;
// }

// const SecurityDashboard = () => {
//   const [logs, setLogs] = useState<SecurityLog[]>([]);
//   const [stats, setStats] = useState<SecurityStats | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [showDetails, setShowDetails] = useState<string | null>(null);

//   const fetchSecurityData = async () => {
//     setLoading(true);
//     try {
//       const [logsData, statsData] = await Promise.all([
//         fetchData<SecurityLog[]>('/api-v1/security/logs'),
//         fetchData<SecurityStats>('/api-v1/security/stats')
//       ]);
      
//       setLogs(logsData);
//       setStats(statsData);
//     } catch (error) {
//       console.error('Error fetching security data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSecurityData();
//   }, []);

//   const formatTimestamp = (timestamp: string) => {
//     return new Date(timestamp).toLocaleString();
//   };

//   const getSeverityColor = (severity?: string) => {
//     switch (severity) {
//       case 'critical': return 'bg-red-100 text-red-800 border-red-200';
//       case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
//       case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'low': return 'bg-green-100 text-green-800 border-green-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const getSeverityIcon = (severity?: string) => {
//     switch (severity) {
//       case 'critical':
//       case 'high':
//         return <AlertTriangle className="h-4 w-4 text-red-600" />;
//       case 'medium':
//         return <Shield className="h-4 w-4 text-yellow-600" />;
//       case 'low':
//         return <Activity className="h-4 w-4 text-green-600" />;
//       default:
//         return <Database className="h-4 w-4 text-blue-600" />;
//     }
//   };

//   const toggleDetails = (logId: string) => {
//     setShowDetails(showDetails === logId ? null : logId);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold flex items-center gap-2">
//           <Shield className="h-6 w-6 text-blue-600" />
//           Security Dashboard
//         </h2>
//         <Button onClick={fetchSecurityData} disabled={loading} className="flex items-center gap-2">
//           <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//           Refresh
//         </Button>
//       </div>

//       {/* Security Stats */}
//       {stats && (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium">Total Events</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.totalLogs}</div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium">Today</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.todayLogs}</div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-red-600">Critical</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-red-600">{stats.criticalEvents}</div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm font-medium text-orange-600">High</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-orange-600">{stats.highEvents}</div>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Security Logs */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Activity className="h-5 w-5 text-blue-600" />
//             Security Logs
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {logs.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               No security events detected
//             </div>
//           ) : (
//             <div className="space-y-3 max-h-96 overflow-y-auto">
//               {logs.map((log, index) => (
//                 <div key={index} className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${getSeverityColor(log.severity)}`}>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       {getSeverityIcon(log.severity)}
//                       <div>
//                         <div className="font-medium">{log.eventType.replace(/_/g, ' ')}</div>
//                         <div className="text-sm text-gray-600">
//                           {log.ip} • {log.endpoint}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Badge variant="outline" className={getSeverityColor(log.severity)}>
//                         {log.severity}
//                       </Badge>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => toggleDetails(log.timestamp)}
//                       >
//                         {showDetails === log.timestamp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                       </Button>
//                     </div>
//                   </div>
                  
//                   <div className="text-xs text-gray-500 mt-1">
//                     {formatTimestamp(log.timestamp)}
//                   </div>
                  
//                   {showDetails === log.timestamp && (
//                     <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
//                       <div className="font-medium mb-1">Details:</div>
//                       <pre className="whitespace-pre-wrap break-words">
//                         {JSON.stringify(log.details, null, 2)}
//                       </pre>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default SecurityDashboard;










// // backend/routes/security.js
// import express from "express";
// import authenticateUser from "../middleware/auth-middleware.js";
// import { isAdmin } from "../middleware/auth-middleware.js";
// import {
//   getSecurityLogs,
//   getSecurityStats,
//   clearAllLogs
// } from "../controllers/security-controller.js";

// const router = express.Router();

// // Apply authentication and admin middleware to all security routes
// router.use(authenticateUser);
// router.use(isAdmin);

// router.get("/logs", getSecurityLogs);
// router.get("/stats", getSecurityStats);
// router.post("/clear-logs", clearAllLogs);

// export default router;










// // backend/routes/index.js (updated)
// import express from "express";
// import authRoutes from "./auth.js";
// import projectRoutes from "./project.js";
// import userRoutes from "./user.js";
// import emailRoutes from "./email.js";
// import stageRoutes from "./stage.js";
// import cacheRoutes from "./cache.js";
// import securityRoutes from "./security.js"; // Add this import

// const router = express.Router();

// router.use("/auth", authRoutes);
// router.use("/projects", projectRoutes);
// router.use("/users", userRoutes);
// router.use("/emails", emailRoutes);
// router.use("/stages", stageRoutes);
// router.use("/cache", cacheRoutes);
// router.use("/security", securityRoutes); // Add this route

// export default router;



// Summary of SQL Injection Protection
// 1. Input Validation and Sanitization
// All user inputs are validated and sanitized
// Dangerous characters are removed
// Input formats are strictly enforced
// 2. Parameterized Queries
// Mongoose automatically protects against NoSQL injection
// All database queries use the ODM/ORM
// 3. Security Middleware
// Detects and blocks common injection patterns
// Logs all security events for monitoring
// Provides detailed error messages
// 4. Security Logging
// Comprehensive logging of all security events
// Tracks IP addresses, user agents, and timestamps
// Provides severity levels for different events
// 5. Security Dashboard
// Visual monitoring of security events
// Real-time updates of security status
// Detailed investigation capabilities
// 6. Least Privilege
// Database users have minimal required permissions
// Role-based access control
// 7. Rate Limiting
// Prevents brute force attacks
// Limits requests from suspicious IPs
// 8. Error Handling
// Generic error messages prevent information leakage
// No sensitive data exposed in error responses
// Testing Your Protection









































// import Project from "../models/project.js";
// import User from "../models/user.js";

// // Share a project with another manager
// export const shareProjectWithManager = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { managerEmail } = req.body;
//     const currentUserId = req.user._id;
    
//     // Find the project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ success: false, error: "Project not found" });
//     }
    
//     // Check if current user is the owner of the project
//     if (project.owner.toString() !== currentUserId.toString()) {
//       return res.status(403).json({ success: false, error: "Only project owner can share projects" });
//     }
    
//     // Find the manager to share with
//     const targetManager = await User.findOne({ 
//       email: managerEmail, 
//       role: "manager" 
//     });
    
//     if (!targetManager) {
//       return res.status(404).json({ success: false, error: "Manager not found" });
//     }
    
//     // Check if project is already shared with this manager
//     if (project.sharedWith && project.sharedWith.includes(targetManager._id)) {
//       return res.status(400).json({ success: false, error: "Project already shared with this manager" });
//     }
    
//     // Add manager to sharedWith array
//     if (!project.sharedWith) {
//       project.sharedWith = [];
//     }
//     project.sharedWith.push(targetManager._id);
//     await project.save();
    
//     res.status(200).json({ 
//       success: true, 
//       message: "Project shared successfully",
//       project 
//     });
//   } catch (error) {
//     console.error("Error sharing project:", error);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // Remove project sharing with a manager
// export const removeProjectSharing = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { managerId } = req.body;
//     const currentUserId = req.user._id;
    
//     // Find the project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ success: false, error: "Project not found" });
//     }
    
//     // Check if current user is the owner of the project
//     if (project.owner.toString() !== currentUserId.toString()) {
//       return res.status(403).json({ success: false, error: "Only project owner can remove sharing" });
//     }
    
//     // Remove manager from sharedWith array
//     if (project.sharedWith) {
//       project.sharedWith = project.sharedWith.filter(
//         id => id.toString() !== managerId
//       );
//       await project.save();
//     }
    
//     res.status(200).json({ 
//       success: true, 
//       message: "Project sharing removed successfully",
//       project 
//     });
//   } catch (error) {
//     console.error("Error removing project sharing:", error);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// // Get projects shared with current manager
// export const getSharedProjects = async (req, res) => {
//   try {
//     const managerId = req.user._id;
    
//     const projects = await Project.find({
//       $or: [
//         { owner: managerId },
//         { sharedWith: { $in: [managerId] } }
//       ]
//     }).populate('owner', 'name email')
//       .populate({
//         path: 'stages',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       })
//       .sort({ created_at: -1 });
    
//     res.status(200).json(projects);
//   } catch (error) {
//     console.error("Error fetching shared projects:", error);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };








// import mongoose, { Schema } from "mongoose";

// const projectSchema = new Schema(
//   {
//     project_name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     status: {
//       type: String,
//       enum: ["Pending", "Ongoing", "Completed", "Archived"],
//       default: "Pending",
//     },
//     created_at: {
//       type: Date,
//       required: true,
//     },
//     owner: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     sharedWith: [{
//       type: Schema.Types.ObjectId,
//       ref: "User"
//     }],
//     stages: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "ProjectStage",
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Project = mongoose.model("Project", projectSchema);

// export default Project;








// import express from "express";
// import {
//   createProject,
//   getAllProjects,
//   getProjectById,
//   updateProject,
//   deleteProject,
//   addStageToProject,
//   updateProjectStage,
//   deleteProjectStage,
//   createStageConnection,
//   getProjectStageConnections,
//   getProjectYears
// } from "../controllers/project.js";
// import {
//   shareProjectWithManager,
//   removeProjectSharing,
//   getSharedProjects
// } from "../controllers/projectSharing.js";

// const router = express.Router();

// // These routes should match what the frontend is calling
// router.post("/project", createProject);
// router.get("/all-projects", getAllProjects);
// router.get("/shared-projects", getSharedProjects);
// router.get("/project-years", getProjectYears);
// router.get("/:id", getProjectById);
// router.put("/:id", updateProject);
// router.delete("/delete-project/:id", deleteProject);
// router.post("/:projectId/stages", addStageToProject);
// router.put("/:projectId/stages/:stageId", updateProjectStage);
// router.delete("/:projectId/stages/:stageId", deleteProjectStage);
// router.post("/:projectId/connections", createStageConnection);
// router.get("/:projectId/connections", getProjectStageConnections);
// router.post("/:projectId/share", shareProjectWithManager);
// router.delete("/:projectId/share", removeProjectSharing);

// export default router;







// // Update a project stage
// export const updateProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const { status, start_date, completion_date } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to update stages in this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can update stages in projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Update fields based on status
//     if (status) projectStage.status = status;
    
//     // Always save start_date if provided
//     if (start_date) {
//       projectStage.start_date = createLocalDate(start_date);
//     }
    
//     // Save completion_date only if status is 'Completed'
//     if (status === 'Completed' && completion_date) {
//       projectStage.completion_date = createLocalDate(completion_date);
//     } else if (status !== 'Completed') {
//       // Clear completion_date if status is not 'Completed'
//       projectStage.completion_date = undefined;
//     }
    
//     await projectStage.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(projectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(200).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project stage", error });
//   }
// };

// // Add a stage to a project
// export const addStageToProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { stageId, status, start_date, completion_date } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to add stages to this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can add stages to projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     // Get the current highest order number
//     const highestOrderStage = await ProjectStage.findOne({ project: projectId })
//       .sort({ order: -1 });
    
//     const order = highestOrderStage ? highestOrderStage.order + 1 : 1;
    
//     // Create new project stage
//     const newProjectStage = new ProjectStage({
//       project: projectId,
//       stage: stageId,
//       status,
//       start_date: status === 'Ongoing' || status === 'Completed' ? createLocalDate(start_date) : undefined,
//       completion_date: status === 'Completed' ? createLocalDate(completion_date) : undefined,
//       order
//     });
    
//     await newProjectStage.save();
    
//     // Add stage to project
//     project.stages.push(newProjectStage._id);
//     await project.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(newProjectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(201).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding stage to project", error });
//   }
// };





// // Update a project stage
// export const updateProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const { status, start_date, completion_date } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to update stages in this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can update stages in projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Update fields based on status
//     if (status) projectStage.status = status;
    
//     // Always save start_date if provided
//     if (start_date) {
//       projectStage.start_date = createLocalDate(start_date);
//     }
    
//     // Save completion_date only if status is 'Completed'
//     if (status === 'Completed' && completion_date) {
//       projectStage.completion_date = createLocalDate(completion_date);
//     } else if (status !== 'Completed') {
//       // Clear completion_date if status is not 'Completed'
//       projectStage.completion_date = undefined;
//     }
    
//     await projectStage.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(projectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(200).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project stage", error });
//   }
// };

// // Add a stage to a project
// export const addStageToProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { stageId, status, start_date, completion_date } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to add stages to this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can add stages to projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     // Get the current highest order number
//     const highestOrderStage = await ProjectStage.findOne({ project: projectId })
//       .sort({ order: -1 });
    
//     const order = highestOrderStage ? highestOrderStage.order + 1 : 1;
    
//     // Create new project stage
//     const newProjectStage = new ProjectStage({
//       project: projectId,
//       stage: stageId,
//       status,
//       start_date: status === 'Ongoing' || status === 'Completed' ? createLocalDate(start_date) : undefined,
//       completion_date: status === 'Completed' ? createLocalDate(completion_date) : undefined,
//       order
//     });
    
//     await newProjectStage.save();
    
//     // Add stage to project
//     project.stages.push(newProjectStage._id);
//     await project.save();
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(newProjectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(201).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding stage to project", error });
//   }
// };












// import { useMutation, useQuery } from "@tanstack/react-query";
// import { postData, deleteData, fetchData } from "@/lib/fetch-util";

// export const useShareProject = () => {
//   return useMutation({
//     mutationFn: ({ projectId, managerEmail }: { projectId: string; managerEmail: string }) =>
//       postData(`/projects/${projectId}/share`, { managerEmail }),
//   });
// };

// export const useRemoveProjectSharing = () => {
//   return useMutation({
//     mutationFn: ({ projectId, managerId }: { projectId: string; managerId: string }) =>
//       deleteData(`/projects/${projectId}/share`, { managerId }),
//   });
// };

// export const useSharedProjects = () => {
//   return useQuery({
//     queryKey: ["shared-projects"],
//     queryFn: () => fetchData("/projects/shared-projects"),
//   });
// };










// //pDtails
// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Plus, Calendar, CheckCircle, Circle, Trash2, Edit, Table, CardTemplate } from "lucide-react";
// import { format } from "date-fns";
// import { useProjectDetail } from "@/hooks/useProjectDetail";
// import { useAuth } from "@/provider/auth-context";
// import { ProjectStageForm } from "./ProjectStageForm";
// import { ConnectionForm } from "./ConnectionForm";
// import { ProjectStageCard } from "./ProjectStageCard";
// import { ProjectStageTable } from "./ProjectStageTable";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";
// import { ShareProjectDialog } from "./ShareProjectDialog";

// export const ProjectDetail: React.FC = () => {
//   const { projectId } = useParams<{ projectId: string }>();
//   const navigate = useNavigate();
//   const { user } = useAuth();
  
//   const [showStageForm, setShowStageForm] = useState(false);
//   const [showConnectionForm, setShowConnectionForm] = useState(false);
//   const [showShareDialog, setShowShareDialog] = useState(false);
//   const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
//   const [editingStage, setEditingStage] = useState<string | null>(null);
//   const [preSelectedStageId, setPreSelectedStageId] = useState<string | null>(null);
  
//   const {
//     project,
//     stages,
//     connections,
//     availableStages,
//     isLoading,
//     error,
//     addStageToProject,
//     updateProjectStage,
//     deleteProjectStage,
//     createStageConnection
//   } = useProjectDetail(projectId || null);
  
//   // Determine if user can edit this project
//   const canEditProject = user?.role === "manager" && 
//     (project?.owner._id === user._id || 
//      (project.sharedWith && project.sharedWith.some(id => id.toString() === user._id.toString())));
  
//   const isOwner = user?.role === "manager" && project?.owner._id === user._id;
  
//   const handleAddStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     addStageToProject(stageId, status, startDate, completionDate);
//     setShowStageForm(false);
//     setPreSelectedStageId(null);
//   };
  
//   const handleStageClick = (stageId: string) => {
//     if (!canEditProject) return;
//     setPreSelectedStageId(stageId);
//     setShowStageForm(true);
//   };
  
//   const handleUpdateStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     updateProjectStage(stageId, status, startDate, completionDate);
//     setEditingStage(null);
//   };
  
//   const handleCreateConnection = (fromStageId: string, toStageId: string) => {
//     createStageConnection(fromStageId, toStageId);
//     setShowConnectionForm(false);
//   };
  
//   const handleMarkComplete = (stageId: string) => {
//     if (!canEditProject) return;
//     const stage = stages.find(s => s._id === stageId);
//     if (stage) {
//       // Show completion date picker
//       setEditingStage(stageId);
//     }
//   };
  
//   const formatDisplayDate = (dateString?: string) => {
//     if (!dateString) return "Not set";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }
  
//   if (error || !project) {
//     return (
//       <div className="container mx-auto p-4">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {error || "Project not found"}
//           </AlertDescription>
//         </Alert>
//         <Button className="mt-4" onClick={() => navigate("/projects")}>
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
//         </Button>
//       </div>
//     );
//   }
  
//   return (
//     <div className="container mx-auto p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <Button variant="ghost" onClick={() => navigate("/projects")} className="mr-4">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold">{project.project_name}</h1>
//             <div className="flex items-center mt-1">
//               <Badge className={getStatusColor(project.status || '')}>
//                 {project.status}
//               </Badge>
//               <span className="text-sm text-muted-foreground ml-2">
//                 Created: {formatDisplayDate(project.created_at)}
//               </span>
//               {project.owner && (
//                 <span className="text-sm text-muted-foreground ml-2">
//                   Owner: {project.owner.name}
//                 </span>
//               )}
//               {!isOwner && canEditProject && (
//                 <Badge variant="outline" className="ml-2">
//                   Shared
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           {canEditProject && (
//             <>
//               <Button 
//                 variant="outline" 
//                 onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
//               >
//                 {viewMode === 'cards' ? (
//                   <>
//                     <Table className="h-4 w-4 mr-1" />
//                     Table View
//                   </>
//                 ) : (
//                   <>
//                     <CardTemplate className="h-4 w-4 mr-1" />
//                     Card View
//                   </>
//                 )}
//               </Button>
//               <Button onClick={() => {
//                 setShowStageForm(true);
//                 setPreSelectedStageId(null);
//               }}>
//                 <Plus className="mr-2 h-4 w-4" /> Add Stage
//               </Button>
//               <Button 
//                 variant="outline" 
//                 onClick={() => setShowConnectionForm(true)}
//                 disabled={stages.length < 2}
//               >
//                 Connect Stages
//               </Button>
//               {isOwner && (
//                 <Button 
//                   variant="outline" 
//                   onClick={() => setShowShareDialog(true)}
//                 >
//                   Share Project
//                 </Button>
//               )}
//             </>
//           )}
//         </div>
//       </div>
      
//       {/* Available Stages */}
//       {canEditProject && availableStages.length > 0 && (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-lg">Available Stages</CardTitle>
//             <p className="text-sm text-muted-foreground">Click on a stage to add it to the project</p>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
//               {availableStages.map(stage => (
//                 <div 
//                   key={stage._id}
//                   className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors hover:shadow-sm"
//                   onClick={() => handleStageClick(stage._id)}
//                 >
//                   <div className="font-medium line-clamp-2">{stage.stage_name}</div>
//                   {stage.description && (
//                     <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
//                       {stage.description}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
      
//       {/* Project Stages */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg flex items-center">
//             Project Stages
//             <Badge variant="secondary" className="ml-2">
//               {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'}
//             </Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {stages.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               No stages added to this project yet.
//               {canEditProject && " Click on available stages above to add them."}
//             </div>
//           ) : viewMode === 'cards' ? (
//             <div className="relative">
//               {/* Connection lines for card view */}
//               <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
//                 {connections.map((conn, index) => {
//                   const fromElement = document.getElementById(`stage-card-${conn.from_stage._id}`);
//                   const toElement = document.getElementById(`stage-card-${conn.to_stage._id}`);
                  
//                   if (!fromElement || !toElement) return null;
                  
//                   const fromRect = fromElement.getBoundingClientRect();
//                   const toRect = toElement.getBoundingClientRect();
                  
//                   const containerRect = fromElement.parentElement?.getBoundingClientRect();
//                   if (!containerRect) return null;
                  
//                   const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
//                   const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
//                   const x2 = toRect.left + toRect.width / 2 - containerRect.left;
//                   const y2 = toRect.top + toRect.height / 2 - containerRect.top;
                  
//                   return (
//                     <line 
//                       key={index}
//                       x1={x1}
//                       y1={y1}
//                       x2={x2}
//                       y2={y2}
//                       stroke="#94a3b8"
//                       strokeWidth="2"
//                       markerEnd="url(#arrowhead)"
//                     />
//                   );
//                 })}
//                 <defs>
//                   <marker 
//                     id="arrowhead" 
//                     markerWidth="10" 
//                     markerHeight="7" 
//                     refX="9" 
//                     refY="3.5" 
//                     orient="auto"
//                   >
//                     <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
//                   </marker>
//                 </defs>
//               </svg>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative" style={{ zIndex: 1 }}>
//                 {stages.map(stage => (
//                   <ProjectStageCard 
//                     key={stage._id}
//                     stage={stage}
//                     onEdit={() => canEditProject && setEditingStage(stage._id)}
//                     onDelete={() => canEditProject && deleteProjectStage(stage._id)}
//                     onMarkComplete={() => canEditProject && handleMarkComplete(stage._id)}
//                     canEdit={canEditProject}
//                   />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <ProjectStageTable 
//               stages={stages}
//               onEdit={(stageId) => canEditProject && setEditingStage(stageId)}
//               onDelete={(stageId) => canEditProject && deleteProjectStage(stageId)}
//               onMarkComplete={(stageId) => canEditProject && handleMarkComplete(stageId)}
//               canEdit={canEditProject}
//             />
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Add Stage Form - Only for Managers with Edit Permission */}
//       {canEditProject && showStageForm && (
//         <ProjectStageForm
//           availableStages={availableStages}
//           onSubmit={handleAddStage}
//           onCancel={() => {
//             setShowStageForm(false);
//             setPreSelectedStageId(null);
//           }}
//           preSelectedStageId={preSelectedStageId || undefined}
//         />
//       )}
      
//       {/* Edit Stage Form - Only for Managers with Edit Permission */}
//       {canEditProject && editingStage && (
//         <ProjectStageForm
//           stage={stages.find(s => s._id === editingStage)}
//           isEditing={true}
//           onSubmit={(stageId, status, startDate, completionDate) => 
//             handleUpdateStage(editingStage, status, startDate, completionDate)
//           }
//           onCancel={() => setEditingStage(null)}
//         />
//       )}
      
//       {/* Connection Form - Only for Managers with Edit Permission */}
//       {canEditProject && showConnectionForm && (
//         <ConnectionForm
//           stages={stages}
//           connections={connections}
//           onSubmit={handleCreateConnection}
//           onCancel={() => setShowConnectionForm(false)}
//         />
//       )}
      
//       {/* Share Project Dialog - Only for Project Owners */}
//       {isOwner && showShareDialog && (
//         <ShareProjectDialog
//           project={project}
//           open={showShareDialog}
//           onOpenChange={setShowShareDialog}
//         />
//       )}
//     </div>
//   );
// };














// import React, { useState, useEffect } from "react";
// import { StatsCard } from "./StatsCard";
// import { ProjectStatusChart } from "./ProjectStatusChart";
// import { ProjectCountOverTime } from "./ProjectCountOverTime";
// import { ProjectStageInfo } from "./ProjectStageInfo";
// import { StageTimeTracking } from "./StageTimeTracking";
// import { RecentProjects } from "./RecentProjects";
// import { useDashboard, type TimePeriod } from "@/hooks/useDashboard";
// import { useOutletContext } from "react-router-dom";
// import { useProjects, useSharedProjects } from "@/hooks/use-projects";
// import { 
//   FolderKanban, 
//   Clock, 
//   CheckCircle, 
//   ListTodo, 
//   Loader2,
//   TrendingUp,
//   Calendar,
//   AlertCircle,
//   BarChart3
// } from "luacide-react";
// import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, getYear } from "date-fns";

// interface DashboardContext {
//   selectedProject: any;
// }

// const Dashboard = () => {
//   const { selectedProject } = useOutletContext<DashboardContext>();
//   const [timePeriod, setTimePeriod] = useState<TimePeriod>({
//     type: 'month',
//     value: new Date().getFullYear().toString()
//   });
  
//   // Get projects based on user role
//   const { projects, isLoading, error, fetchProjects, refetch } = useProjects();
//   const { projects: sharedProjects, isLoading: isLoadingShared } = useSharedProjects();
  
//   // Combine projects and shared projects for managers
//   const allProjects = selectedProject?.role === 'manager' 
//     ? [...projects, ...sharedProjects.filter(sp => 
//         !projects.some(p => p._id === sp._id)
//       )]
//     : projects;
  
//   const [localSelectedProject, setLocalSelectedProject] = useState(selectedProject);
  
//   // Use the useDashboard hook with all projects for the stats cards
//   const {
//     totalProjects,
//     ongoingProjects,
//     completedProjects,
//     pendingProjects,
//     totalStages,
//     ongoingStages,
//     completedStages,
//     projectStatusData,
//     recentProjects,
//     upcomingStages,
//     isLoading: dashboardLoading
//   } = useDashboard(undefined, allProjects); // Pass undefined as time period to get all projects
  
//   // Handle project selection
//   const handleProjectSelect = (project: any) => {
//     console.log("Dashboard handleProjectSelect:", project); // Debug log
//     setLocalSelectedProject(project);
//   };
  
//   // Handle time period change with useCallback to prevent unnecessary re-renders
//   const handleTimePeriodChange = React.useCallback((period: TimePeriod) => {
//     setTimePeriod(period);
//     console.log("Time period changed to:", period); // Debug log
//   }, []);
  
//   if (dashboardLoading || isLoading || isLoadingShared) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 space-y-4">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
//           <p className="text-gray-600">{error}</p>
//         </div>
//         <button 
//           onClick={() => {
//             fetchProjects();
//             refetch();
//           }}
//           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }
  
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <h1 className="text-2xl font-bold">Dashboard</h1>
        
//         {/* <div className="text-sm text-gray-500">
//           {timePeriod.type === 'year' 
//             ? `Showing data for ${timePeriod.value === 'all' ? 'all years' : timePeriod.value}` 
//             : `Showing data for ${timePeriod.value}`}
//         </div> */}
//       </div>
      
//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <StatsCard
//           title="Total Projects"
//           value={totalProjects}
//           icon={FolderKanban}
//           filterType="all"
//         />
//         <StatsCard
//           title="Ongoing Projects"
//           value={ongoingProjects}
//           icon={Clock}
//           description="Currently in progress"
//           filterType="ongoing"
//         />
//         <StatsCard
//           title="Completed Projects"
//           value={completedProjects}
//           icon={CheckCircle}
//           description="Successfully finished"
//           filterType="completed"
//         />
//         <StatsCard
//           title="Pending Projects"
//           value={pendingProjects}
//           icon={AlertCircle}
//           description="Not started yet"
//           filterType="pending"
//         />
//       </div>
      
//       {/* Charts and Project Info */}
//       <div className="grid gap-4 md:grid-cols-2">
//         <ProjectStatusChart data={projectStatusData} />
//         <ProjectStageInfo 
//           project={localSelectedProject} 
//           onProjectSelect={handleProjectSelect} 
//         />
//       </div>
      
//       {/* Recent Projects and Time-based Charts */}
//       <div className="grid gap-4 md:grid-cols-2">
//         <RecentProjects projects={recentProjects} />
//         <ProjectCountOverTime 
//           projects={allProjects} // Pass all projects, not filtered ones
//           onTimePeriodChange={handleTimePeriodChange} 
//         />
//       </div>
      
//       {/* Additional Time-based Chart */}
//       <div className="grid gap-4 md:grid-cols-1">
//         <StageTimeTracking 
//           projects={recentProjects} 
//           selectedProjectId={localSelectedProject?._id} 
//         />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;




















// import { useState, useEffect, useCallback } from "react";
// import { type ProjectEntry, projectSchema } from "@/lib/schema";
// import { z } from "zod";

// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjects = () => {
//   const [projects, setProjects] = useState<ProjectEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   // Memoize fetchProjects to prevent unnecessary re-renders
//   const fetchProjects = useCallback(async (filters?: { year?: string; month?: string }) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       // Build query string from filters
//       const queryParams = new URLSearchParams();
      
//       // Only add year filter if it's not "all" and not empty
//       if (filters?.year && filters.year !== 'all') {
//         queryParams.append('year', filters.year);
//       }
      
//       if (filters?.month) {
//         queryParams.append('month', filters.month);
//       }
      
//       const queryString = queryParams.toString();
//       const url = `${API_BASE_URL}/projects/all-projects${queryString ? `?${queryString}` : ''}`;
      
//       console.log("Fetching projects from:", url); // Debug log
      
//       const res = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to fetch projects.");
//       }
//       const data = await res.json();
//       console.log("Projects data received:", data); // Debug log
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//       setError(err instanceof Error ? err.message : "Failed to load projects. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);
  
//   // New function to fetch available years
//   const fetchProjectYears = useCallback(async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project-years`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       if (!res.ok) {
//         throw new Error("Failed to fetch project years.");
//       }
//       const data = await res.json();
//       return data;
//     } catch (err) {
//       console.error("Error fetching project years:", err);
//       setError(err instanceof Error ? err.message : "Failed to fetch project years.");
//       return [];
//     }
//   }, []);
  
//   const createProject = useCallback(async (newProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify(newProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to create project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error creating project:", err);
//       setError("Failed to create project. Please try again.");
//     }
//   }, [fetchProjects]);
  
//   // Update to handle partial updates
//   const updateProject = useCallback(async (id: string, updatedProject: Partial<z.infer<typeof projectSchema>>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify(updatedProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error updating project:", err);
//       setError("Failed to update project. Please try again.");
//     }
//   }, [fetchProjects]);
  
//   const deleteProject = useCallback(async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/delete-project/${id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error deleting project:", err);
//       setError("Failed to delete project. Please try again.");
//     }
//   }, [fetchProjects]);
  
//   // Initial fetch on mount
//   useEffect(() => {
//     fetchProjects();
//   }, [fetchProjects]);
  
//   return {
//     projects,
//     isLoading,
//     error,
//     createProject,
//     updateProject,
//     deleteProject,
//     fetchProjects,
//     fetchProjectYears,
//     refetch: fetchProjects
//   };
// };

// // Add this new hook for shared projects
// export const useSharedProjects = () => {
//   const [projects, setProjects] = useState<ProjectEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const fetchSharedProjects = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/shared-projects`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       if (!res.ok) {
//         throw new Error("Failed to fetch shared projects.");
//       }
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching shared projects:", err);
//       setError(err instanceof Error ? err.message : "Failed to load shared projects. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);
  
//   useEffect(() => {
//     fetchSharedProjects();
//   }, [fetchSharedProjects]);
  
//   return {
//     projects,
//     isLoading,
//     error,
//     refetch: fetchSharedProjects
//   };
// };





















// import express from "express";
// import authenticateUser from "../middleware/auth-middleware.js";
// import {
//   changePassword,
//   getUserProfile,
//   updateUserProfile,
//   getAllManagers,
// } from "../controllers/user.js";
// import {
//   getReferredUsers,
//   toggleUserStatus,
//   getReferralLink
// } from "../controllers/userManagement.js";
// import { z } from "zod";
// import { validateRequest } from "zod-express-middleware";

// const router = express.Router();

// // Profile routes
// router.get("/profile", authenticateUser, getUserProfile);
// router.put(
//   "/profile",
//   authenticateUser,
//   validateRequest({
//     body: z.object({
//       name: z.string(),
//       profilePicture: z.string().optional(),
//     }),
//   }),
//   updateUserProfile
// );
// router.put(
//   "/change-password",
//   authenticateUser,
//   validateRequest({
//     body: z.object({
//       currentPassword: z.string(),
//       newPassword: z.string(),
//       confirmPassword: z.string(),
//     }),
//   }),
//   changePassword
// );

// // User management routes (for managers)
// router.get("/referred-users", authenticateUser, getReferredUsers);
// router.put("/users/:userId/toggle-status", authenticateUser, toggleUserStatus);
// router.get("/referral-link", authenticateUser, getReferralLink);

// // Add this route to fetch all managers
// router.get("/managers", authenticateUser, getAllManagers);

// export default router;


















// import User from "../models/user.js";
// import bcrypt from "bcrypt";

// const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     delete user.password;
//     // jfkd
//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const updateUserProfile = async (req, res) => {
//   try {
//     const { name, profilePicture } = req.body;
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     user.name = name;
//     user.profilePicture = profilePicture;
//     await user.save();
//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Error updating user profile:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmPassword } = req.body;
//     const user = await User.findById(req.user._id).select("+password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     if (newPassword !== confirmPassword) {
//       return res
//         .status(400)
//         .json({ message: "New password and confirm password do not match" });
//     }
//     const isPasswordValid = await bcrypt.compare(
//       currentPassword,
//       user.password
//     );
//     if (!isPasswordValid) {
//       return res.status(403).json({ message: "Invalid old password" });
//     }
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     await user.save();
//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error("Error changing password:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Add this new function to fetch all managers
// const getAllManagers = async (req, res) => {
//   try {
//     const managers = await User.find({ role: "manager" }).select("-password");
//     res.status(200).json(managers);
//   } catch (error) {
//     console.error("Error fetching managers:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export { getUserProfile, updateUserProfile, changePassword, getAllManagers };














// import { fetchData, updateData } from "@/lib/fetch-util";
// import type {
//   ChangePasswordFormData,
//   ProfileFormData,
// } from "@/routes/user/profile";
// import { useMutation, useQuery, type QueryKey } from "@tanstack/react-query";

// const queryKey: QueryKey = ["user"];

// export const useUserProfileQuery = () => {
//   return useQuery({
//     queryKey,
//     queryFn: () => fetchData("/users/profile"),
//   });
// };

// export const useChangePassword = () => {
//   return useMutation({
//     mutationFn: (data: ChangePasswordFormData) =>
//       updateData("/users/change-password", data),
//   });
// };

// export const useUpdateUserProfile = () => {
//   return useMutation({
//     mutationFn: (data: ProfileFormData) => updateData("/users/profile", data),
//   });
// };

// // Add this new hook to fetch all managers
// export const useAllManagers = () => {
//   return useQuery({
//     queryKey: ["all-managers"],
//     queryFn: () => fetchData("/users/managers"),
//   });
// };












// import React, { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Clock, Timer } from "lucide-react";
// import { format, differenceInDays } from "date-fns";
// import { useProjects } from "@/hooks/use-projects";
// import { useAuth } from "@/provider/auth-context";

// interface StageTimeData {
//   name: string;
//   days: number;
// }

// interface StageTimeTrackingProps {
//   projects: any[];
//   selectedProjectId?: string;
// }

// export const StageTimeTracking: React.FC<StageTimeTrackingProps> = ({ 
//   projects, 
//   selectedProjectId 
// }) => {
//   const { user } = useAuth();
//   const [chartData, setChartData] = useState<StageTimeData[]>([]);
//   const [selectedProject, setSelectedProject] = useState<string>(selectedProjectId || 'all');
  
//   // Get all projects with stages for the dropdown
//   const projectOptions = [
//     { value: 'all', label: 'All Projects' },
//     ...projects.map(project => ({
//       value: project._id,
//       label: project.project_name
//     }))
//   ];
  
//   // Process stages data to calculate completion times
//   useEffect(() => {
//     const allStages: any[] = [];
    
//     // Collect all stages from projects
//     projects.forEach(project => {
//       if (project.stages && Array.isArray(project.stages)) {
//         project.stages.forEach((stage: any) => {
//           // Only include completed stages with both start and completion dates
//           if (stage.status === 'Completed' && stage.start_date && stage.completion_date) {
//             allStages.push({
//               ...stage,
//               project_name: project.project_name,
//               project_id: project._id
//             });
//           }
//         });
//       }
//     });
    
//     // Filter by selected project if not 'all'
//     const filteredStages = selectedProject === 'all' 
//       ? allStages 
//       : allStages.filter(stage => stage.project_id === selectedProject);
    
//     // Calculate completion time in days for each stage
//     const stageTimeData = filteredStages.map(stage => {
//       const startDate = new Date(stage.start_date);
//       const completionDate = new Date(stage.completion_date);
//       const days = differenceInDays(completionDate, startDate);
      
//       return {
//         name: stage.stage.stage_name,
//         days: days > 0 ? days : 1, // Ensure at least 1 day
//         project: stage.project_name
//       };
//     });
    
//     // Sort by days (ascending)
//     stageTimeData.sort((a, b) => a.days - b.days);
    
//     setChartData(stageTimeData);
//   }, [projects, selectedProject]);
  
//   const handleProjectChange = (value: string) => {
//     setSelectedProject(value);
//   };
  
//   return (
//     <Card className="col-span-1">
//       <CardHeader>
//         <div className="flex flex-col space-y-4">
//           <CardTitle className="flex items-center gap-2">
//             <Timer className="h-5 w-5 text-purple-600" />
//             Stage Completion Time
//           </CardTitle>
          
//           <div className="w-full">
//             <Select value={selectedProject} onValueChange={handleProjectChange}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select a project" />
//               </SelectTrigger>
//               <SelectContent>
//                 {projectOptions.map(option => (
//                   <SelectItem key={option.value} value={option.value} className="max-w-xs">
//                     <div className="break-words">{option.label}</div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="h-80">
//         {chartData.length > 0 ? (
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart
//               data={chartData}
//               margin={{
//                 top: 5,
//                 right: 30,
//                 left: 20,
//                 bottom: 5,
//               }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
//               <Tooltip 
//                 formatter={(value) => [`${value} days`, 'Completion Time']}
//                 labelFormatter={(label) => `Stage: ${label}`}
//               />
//               <Legend />
//               <Bar 
//                 dataKey="days" 
//                 fill="#8884d8" 
//                 name="Days to Complete"
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         ) : (
//           <div className="flex items-center justify-center h-full text-gray-500">
//             <div className="text-center">
//               <Timer className="h-12 w-12 mb-4 text-gray-400" />
//               <p className="mb-2">No stage completion data available</p>
//               <p className="text-sm">Complete some project stages to see completion times</p>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

















// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
//   preSelectedStageId?: string;
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   onSubmit,
//   onCancel,
//   preSelectedStageId
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
  
//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: preSelectedStageId || stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });
  
//   const watchedStatus = form.watch('status');
//   const watchedStartDate = form.watch('startDate');
//   const watchedCompletionDate = form.watch('completionDate');
  
//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus as 'Ongoing' | 'Completed');
//     }
//   }, [watchedStatus]);
  
//   const validateForm = () => {
//     if (status === 'Ongoing' && !watchedStartDate) {
//       setAlertMessage("Start date is required for Ongoing status");
//       setShowAlert(true);
//       return false;
//     }
    
//     if (status === 'Completed' && !watchedStartDate) {
//       setAlertMessage("Start date is required for Completed status");
//       setShowAlert(true);
//       return false;
//     }
    
//     if (status === 'Completed' && !watchedCompletionDate) {
//       setAlertMessage("Completion date is required for Completed status");
//       setShowAlert(true);
//       return false;
//     }
    
//     setShowAlert(false);
//     return true;
//   };
  
//   const handleSubmit = (values: StageFormValues) => {
//     if (!validateForm()) {
//       return;
//     }
    
//     // Always pass start date if provided
//     const startDate = values.startDate;
//     // Only pass completion date if status is 'Completed'
//     const completionDate = values.status === 'Completed' ? values.completionDate : undefined;
    
//     onSubmit(
//       values.stageId,
//       values.status,
//       startDate,
//       completionDate
//     );
//   };
  
//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing
//               ? "Update the stage details below."
//               : "Fill in the details to create a new stage."
//             }
//           </DialogDescription>
//         </DialogHeader>
        
//         {showAlert && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{alertMessage}</AlertDescription>
//           </Alert>
//         )}
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {!isEditing && (
//               <FormField
//                 control={form.control}
//                 name="stageId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stage</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger className="h-auto py-2">
//                           <SelectValue placeholder="Select a stage" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {availableStages.map(stage => (
//                           <SelectItem key={stage._id} value={stage._id} className="whitespace-normal">
//                             <div className="max-w-xs">
//                               <div className="whitespace-normal break-words">
//                                 {stage.stage_name}
//                               </div>
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={(value) => {
//                     field.onChange(value);
//                     setStatus(value as 'Ongoing' | 'Completed');
//                   }} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>Start Date {status === 'Ongoing' && <span className="text-red-500">*</span>}</FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn(
//                             "w-full pl-3 text-left font-normal",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value ? (
//                             format(new Date(field.value), "PPP")
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value ? new Date(field.value) : undefined}
//                         onSelect={(date) => {
//                           if (date) {
//                             field.onChange(format(date, 'yyyy-MM-dd'));
//                           }
//                         }}
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Completion Date <span className="text-red-500">*</span></FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };















// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { useShareProject, useRemoveProjectSharing } from "@/hooks/useProjectSharing";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { fetchData } from "@/lib/fetch-util";
// import { toast } from "sonner";
// import { X, Mail, UserPlus, Users } from "lucide-react";
// import type { ProjectEntry, User } from "@/lib/schema";

// interface ShareProjectDialogProps {
//   project: ProjectEntry;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export const ShareProjectDialog: React.FC<ShareProjectDialogProps> = ({
//   project,
//   open,
//   onOpenChange,
// }) => {
//   const [managerEmail, setManagerEmail] = useState("");
//   const { mutate: shareProject, isPending: isSharing } = useShareProject();
//   const { mutate: removeSharing, isPending: isRemoving } = useRemoveProjectSharing();
  
//   // Fetch all managers
//   const { data: allManagers = [] } = useQuery({
//     queryKey: ["all-managers"],
//     queryFn: () => fetchData("/users/managers"),
//     enabled: open,
//   });
  
//   // Fetch managers this project is already shared with
//   const sharedWithManagerIds = project.sharedWith?.map(id => id.toString()) || [];
//   const sharedManagers = allManagers.filter((manager: User) => 
//     sharedWithManagerIds.includes(manager._id)
//   );
  
//   const availableManagers = allManagers.filter((manager: User) => 
//     !sharedWithManagerIds.includes(manager._id) && 
//     manager._id !== project.owner._id
//   );
  
//   const handleShareProject = () => {
//     if (!managerEmail) return;
    
//     shareProject(
//       { projectId: project._id, managerEmail },
//       {
//         onSuccess: () => {
//           toast.success("Project shared successfully");
//           setManagerEmail("");
//         },
//         onError: (error: any) => {
//           const errorMessage = error.response?.data?.error || "Failed to share project";
//           toast.error(errorMessage);
//         },
//       }
//     );
//   };
  
//   const handleRemoveSharing = (managerId: string) => {
//     removeSharing(
//       { projectId: project._id, managerId },
//       {
//         onSuccess: () => {
//           toast.success("Project sharing removed");
//         },
//         onError: (error: any) => {
//           const errorMessage = error.response?.data?.error || "Failed to remove sharing";
//           toast.error(errorMessage);
//         },
//       }
//     );
//   };
  
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5" />
//             Share Project
//           </DialogTitle>
//           <DialogDescription>
//             Share this project with other managers to collaborate
//           </DialogDescription>
//         </DialogHeader>
        
//         <div className="space-y-4">
//           {/* Share with new manager */}
//           <div className="space-y-2">
//             <label className="text-sm font-medium">Share with Manager</label>
//             <div className="flex gap-2">
//               <Input
//                 placeholder="Enter manager email"
//                 value={managerEmail}
//                 onChange={(e) => setManagerEmail(e.target.value)}
//                 className="flex-1"
//               />
//               <Button 
//                 onClick={handleShareProject} 
//                 disabled={!managerEmail || isSharing}
//                 size="sm"
//               >
//                 <UserPlus className="h-4 w-4 mr-1" />
//                 Share
//               </Button>
//             </div>
//           </div>
          
//           {/* Already shared with */}
//           {sharedManagers.length > 0 && (
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Shared With</label>
//               <div className="space-y-2">
//                 {sharedManagers.map((manager: User) => (
//                   <div 
//                     key={manager._id} 
//                     className="flex items-center justify-between p-2 border rounded-md"
//                   >
//                     <div className="flex items-center gap-2">
//                       <Mail className="h-4 w-4 text-muted-foreground" />
//                       <span>{manager.email}</span>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleRemoveSharing(manager._id)}
//                       disabled={isRemoving}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           {/* Available managers */}
//           {availableManagers.length > 0 && (
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Available Managers</label>
//               <div className="space-y-2 max-h-40 overflow-y-auto">
//                 {availableManagers.map((manager: User) => (
//                   <div 
//                     key={manager._id} 
//                     className="flex items-center justify-between p-2 border rounded-md hover:bg-muted cursor-pointer"
//                     onClick={() => setManagerEmail(manager.email)}
//                   >
//                     <div className="flex items-center gap-2">
//                       <Mail className="h-4 w-4 text-muted-foreground" />
//                       <span>{manager.email}</span>
//                     </div>
//                     <Badge variant="outline">Click to add</Badge>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
        
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Close
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };















// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Plus, Calendar, CheckCircle, Circle, Trash2, Edit, Table, CardTemplate } from "lucide-react";
// import { format } from "date-fns";
// import { useProjectDetail } from "@/hooks/useProjectDetail";
// import { useAuth } from "@/provider/auth-context";
// import { ProjectStageForm } from "./ProjectStageForm";
// import { ConnectionForm } from "./ConnectionForm";
// import { ProjectStageCard } from "./ProjectStageCard";
// import { ProjectStageTable } from "./ProjectStageTable";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";
// import { ShareProjectDialog } from "./ShareProjectDialog";

// export const ProjectDetail: React.FC = () => {
//   const { projectId } = useParams<{ projectId: string }>();
//   const navigate = useNavigate();
//   const { user } = useAuth();
  
//   const [showStageForm, setShowStageForm] = useState(false);
//   const [showConnectionForm, setShowConnectionForm] = useState(false);
//   const [showShareDialog, setShowShareDialog] = useState(false);
//   const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
//   const [editingStage, setEditingStage] = useState<string | null>(null);
//   const [preSelectedStageId, setPreSelectedStageId] = useState<string | null>(null);
  
//   const {
//     project,
//     stages,
//     connections,
//     availableStages,
//     isLoading,
//     error,
//     addStageToProject,
//     updateProjectStage,
//     deleteProjectStage,
//     createStageConnection
//   } = useProjectDetail(projectId || null);
  
//   // Determine if user can edit this project
//   const canEditProject = user?.role === "manager" && 
//     (project?.owner._id === user._id || 
//      (project.sharedWith && project.sharedWith.some(id => id.toString() === user._id.toString())));
  
//   const isOwner = user?.role === "manager" && project?.owner._id === user._id;
  
//   const handleAddStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     addStageToProject(stageId, status, startDate, completionDate);
//     setShowStageForm(false);
//     setPreSelectedStageId(null);
//   };
  
//   const handleStageClick = (stageId: string) => {
//     if (!canEditProject) return;
//     setPreSelectedStageId(stageId);
//     setShowStageForm(true);
//   };
  
//   const handleUpdateStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     updateProjectStage(stageId, status, startDate, completionDate);
//     setEditingStage(null);
//   };
  
//   const handleCreateConnection = (fromStageId: string, toStageId: string) => {
//     createStageConnection(fromStageId, toStageId);
//     setShowConnectionForm(false);
//   };
  
//   const handleMarkComplete = (stageId: string) => {
//     if (!canEditProject) return;
//     const stage = stages.find(s => s._id === stageId);
//     if (stage) {
//       // Show completion date picker
//       setEditingStage(stageId);
//     }
//   };
  
//   const formatDisplayDate = (dateString?: string) => {
//     if (!dateString) return "Not set";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }
  
//   if (error || !project) {
//     return (
//       <div className="container mx-auto p-4">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {error || "Project not found"}
//           </AlertDescription>
//         </Alert>
//         <Button className="mt-4" onClick={() => navigate("/projects")}>
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
//         </Button>
//       </div>
//     );
//   }
  
//   return (
//     <div className="container mx-auto p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <Button variant="ghost" onClick={() => navigate("/projects")} className="mr-4">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold">{project.project_name}</h1>
//             <div className="flex items-center mt-1">
//               <Badge className={getStatusColor(project.status || '')}>
//                 {project.status}
//               </Badge>
//               <span className="text-sm text-muted-foreground ml-2">
//                 Created: {formatDisplayDate(project.created_at)}
//               </span>
//               {project.owner && (
//                 <span className="text-sm text-muted-foreground ml-2">
//                   Owner: {project.owner.name}
//                 </span>
//               )}
//               {!isOwner && canEditProject && (
//                 <Badge variant="outline" className="ml-2">
//                   Shared
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           {canEditProject && (
//             <>
//               <Button 
//                 variant="outline" 
//                 onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
//               >
//                 {viewMode === 'cards' ? (
//                   <>
//                     <Table className="h-4 w-4 mr-1" />
//                     Table View
//                   </>
//                 ) : (
//                   <>
//                     <CardTemplate className="h-4 w-4 mr-1" />
//                     Card View
//                   </>
//                 )}
//               </Button>
//               <Button onClick={() => {
//                 setShowStageForm(true);
//                 setPreSelectedStageId(null);
//               }}>
//                 <Plus className="mr-2 h-4 w-4" /> Add Stage
//               </Button>
//               <Button 
//                 variant="outline" 
//                 onClick={() => setShowConnectionForm(true)}
//                 disabled={stages.length < 2}
//               >
//                 Connect Stages
//               </Button>
//               {isOwner && (
//                 <Button 
//                   variant="outline" 
//                   onClick={() => setShowShareDialog(true)}
//                 >
//                   Share Project
//                 </Button>
//               )}
//             </>
//           )}
//         </div>
//       </div>
      
//       {/* Available Stages */}
//       {canEditProject && availableStages.length > 0 && (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-lg">Available Stages</CardTitle>
//             <p className="text-sm text-muted-foreground">Click on a stage to add it to the project</p>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
//               {availableStages.map(stage => (
//                 <div 
//                   key={stage._id}
//                   className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors hover:shadow-sm"
//                   onClick={() => handleStageClick(stage._id)}
//                 >
//                   <div className="font-medium line-clamp-2">{stage.stage_name}</div>
//                   {stage.description && (
//                     <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
//                       {stage.description}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
      
//       {/* Project Stages */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg flex items-center">
//             Project Stages
//             <Badge variant="secondary" className="ml-2">
//               {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'}
//             </Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {stages.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               No stages added to this project yet.
//               {canEditProject && " Click on available stages above to add them."}
//             </div>
//           ) : viewMode === 'cards' ? (
//             <div className="relative">
//               {/* Connection lines for card view */}
//               <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
//                 {connections.map((conn, index) => {
//                   const fromElement = document.getElementById(`stage-card-${conn.from_stage._id}`);
//                   const toElement = document.getElementById(`stage-card-${conn.to_stage._id}`);
                  
//                   if (!fromElement || !toElement) return null;
                  
//                   const fromRect = fromElement.getBoundingClientRect();
//                   const toRect = toElement.getBoundingClientRect();
                  
//                   const containerRect = fromElement.parentElement?.getBoundingClientRect();
//                   if (!containerRect) return null;
                  
//                   const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
//                   const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
//                   const x2 = toRect.left + toRect.width / 2 - containerRect.left;
//                   const y2 = toRect.top + toRect.height / 2 - containerRect.top;
                  
//                   return (
//                     <line 
//                       key={index}
//                       x1={x1}
//                       y1={y1}
//                       x2={x2}
//                       y2={y2}
//                       stroke="#94a3b8"
//                       strokeWidth="2"
//                       markerEnd="url(#arrowhead)"
//                     />
//                   );
//                 })}
//                 <defs>
//                   <marker 
//                     id="arrowhead" 
//                     markerWidth="10" 
//                     markerHeight="7" 
//                     refX="9" 
//                     refY="3.5" 
//                     orient="auto"
//                   >
//                     <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
//                   </marker>
//                 </defs>
//               </svg>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative" style={{ zIndex: 1 }}>
//                 {stages.map(stage => (
//                   <ProjectStageCard 
//                     key={stage._id}
//                     stage={stage}
//                     onEdit={() => canEditProject && setEditingStage(stage._id)}
//                     onDelete={() => canEditProject && deleteProjectStage(stage._id)}
//                     onMarkComplete={() => canEditProject && handleMarkComplete(stage._id)}
//                     canEdit={canEditProject}
//                   />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <ProjectStageTable 
//               stages={stages}
//               onEdit={(stageId) => canEditProject && setEditingStage(stageId)}
//               onDelete={(stageId) => canEditProject && deleteProjectStage(stageId)}
//               onMarkComplete={(stageId) => canEditProject && handleMarkComplete(stageId)}
//               canEdit={canEditProject}
//             />
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Add Stage Form - Only for Managers with Edit Permission */}
//       {canEditProject && showStageForm && (
//         <ProjectStageForm
//           availableStages={availableStages}
//           onSubmit={handleAddStage}
//           onCancel={() => {
//             setShowStageForm(false);
//             setPreSelectedStageId(null);
//           }}
//           preSelectedStageId={preSelectedStageId || undefined}
//         />
//       )}
      
//       {/* Edit Stage Form - Only for Managers with Edit Permission */}
//       {canEditProject && editingStage && (
//         <ProjectStageForm
//           stage={stages.find(s => s._id === editingStage)}
//           isEditing={true}
//           onSubmit={(stageId, status, startDate, completionDate) => 
//             handleUpdateStage(editingStage, status, startDate, completionDate)
//           }
//           onCancel={() => setEditingStage(null)}
//         />
//       )}
      
//       {/* Connection Form - Only for Managers with Edit Permission */}
//       {canEditProject && showConnectionForm && (
//         <ConnectionForm
//           stages={stages}
//           connections={connections}
//           onSubmit={handleCreateConnection}
//           onCancel={() => setShowConnectionForm(false)}
//         />
//       )}
      
//       {/* Share Project Dialog - Only for Project Owners */}
//       {isOwner && showShareDialog && (
//         <ShareProjectDialog
//           project={project}
//           open={showShareDialog}
//           onOpenChange={setShowShareDialog}
//         />
//       )}
//     </div>
//   );
// };













// // Add a new function to update project status based on stages
// const updateProjectStatusBasedOnStages = async (projectId) => {
//   try {
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return;
//     }
    
//     const stagesCount = await ProjectStage.countDocuments({ project: projectId });
    
//     // If no stages, set to Pending
//     if (stagesCount === 0) {
//       project.status = "Pending";
//       await project.save();
//       return;
//     }
    
//     // If this is the first stage being added, set to Ongoing
//     if (stagesCount === 1 && project.status === "Pending") {
//       project.status = "Ongoing";
//       await project.save();
//       return;
//     }
    
//     // Check if all stages are completed
//     const completedStagesCount = await ProjectStage.countDocuments({ 
//       project: projectId, 
//       status: "Completed" 
//     });
    
//     if (completedStagesCount === stagesCount) {
//       project.status = "Completed";
//     } else if (project.status === "Completed") {
//       // If not all stages are completed but project was marked as completed,
//       // change it back to Ongoing
//       project.status = "Ongoing";
//     }
    
//     await project.save();
//   } catch (error) {
//     console.error("Error updating project status:", error);
//   }
// };

// // Update addStageToProject function
// export const addStageToProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { stageId, status, start_date, completion_date } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to add stages to this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can add stages to projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     // Get the current highest order number
//     const highestOrderStage = await ProjectStage.findOne({ project: projectId })
//       .sort({ order: -1 });
    
//     const order = highestOrderStage ? highestOrderStage.order + 1 : 1;
    
//     // Create new project stage
//     const newProjectStage = new ProjectStage({
//       project: projectId,
//       stage: stageId,
//       status,
//       start_date: status === 'Ongoing' || status === 'Completed' ? createLocalDate(start_date) : undefined,
//       completion_date: status === 'Completed' ? createLocalDate(completion_date) : undefined,
//       order
//     });
    
//     await newProjectStage.save();
    
//     // Add stage to project
//     project.stages.push(newProjectStage._id);
//     await project.save();
    
//     // Update project status based on stages
//     await updateProjectStatusBasedOnStages(projectId);
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(newProjectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(201).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding stage to project", error });
//   }
// };

// // Update deleteProjectStage function
// export const deleteProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to delete stages from this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can delete stages from projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Delete all connections related to this stage
//     await StageConnection.deleteMany({ 
//       $or: [
//         { from_stage: stageId },
//         { to_stage: stageId }
//       ]
//     });
    
//     // Remove stage from project
//     await Project.findByIdAndUpdate(projectId, {
//       $pull: { stages: stageId }
//     });
    
//     // Delete the stage
//     await ProjectStage.findByIdAndDelete(stageId);
    
//     // Update project status based on remaining stages
//     await updateProjectStatusBasedOnStages(projectId);
    
//     res.status(200).json({ message: "Project stage deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error deleting project stage", error });
//   }
// };

// // Also update updateProjectStage function to handle status changes
// export const updateProjectStage = async (req, res) => {
//   try {
//     const { projectId, stageId } = req.params;
//     const { status, start_date, completion_date } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;
    
//     // Check if user has permission to update stages in this project
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }
    
//     // Only managers can update stages in projects, and only their own projects
//     if (userRole !== "manager" || project.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }
    
//     const projectStage = await ProjectStage.findOne({ 
//       _id: stageId, 
//       project: projectId 
//     });
    
//     if (!projectStage) {
//       return res.status(404).json({ message: "Project stage not found" });
//     }
    
//     // Update fields based on status
//     if (status) projectStage.status = status;
    
//     // Always save start_date if provided
//     if (start_date) {
//       projectStage.start_date = createLocalDate(start_date);
//     }
    
//     // Save completion_date only if status is 'Completed'
//     if (status === 'Completed' && completion_date) {
//       projectStage.completion_date = createLocalDate(completion_date);
//     } else if (status !== 'Completed') {
//       // Clear completion_date if status is not 'Completed'
//       projectStage.completion_date = undefined;
//     }
    
//     await projectStage.save();
    
//     // Update project status based on stages
//     await updateProjectStatusBasedOnStages(projectId);
    
//     // Populate stage details
//     const populatedStage = await ProjectStage.findById(projectStage._id)
//       .populate('stage');
    
//     // Format dates
//     const formattedStage = {
//       ...populatedStage.toObject(),
//       start_date: formatDateToLocal(populatedStage.start_date),
//       completion_date: formatDateToLocal(populatedStage.completion_date)
//     };
    
//     res.status(200).json(formattedStage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating project stage", error });
//   }
// };








// frontend/app/hooks/useProjectDetail.ts




// import { useState, useEffect } from "react";
// import { type ProjectEntry, type ProjectStageEntry, type StageEntry, type StageConnectionEntry } from "@/lib/schema";

// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjectDetail = (projectId: string | null) => {
//   const [project, setProject] = useState<ProjectEntry | null>(null);
//   const [stages, setStages] = useState<ProjectStageEntry[]>([]);
//   const [connections, setConnections] = useState<StageConnectionEntry[]>([]);
//   const [availableStages, setAvailableStages] = useState<StageEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const fetchProjectDetail = async () => {
//     if (!projectId) return;
    
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       // Fetch project details
//       const projectRes = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
      
//       if (!projectRes.ok) {
//         if (projectRes.status === 403) {
//           throw new Error("Access denied. You don't have permission to view this project.");
//         }
//         throw new Error("Failed to fetch project");
//       }
      
//       const projectData = await projectRes.json();
//       setProject(projectData);
      
//       // Fetch project stages and sort by date
//       if (projectData.stages) {
//         // Sort stages by date (oldest first)
//         const sortedStages = [...projectData.stages].sort((a, b) => {
//           const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
//           const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
//           return dateA - dateB;
//         });
//         setStages(sortedStages);
//       }
      
//       // Fetch stage connections
//       const connectionsRes = await fetch(`${API_BASE_URL}/projects/${projectId}/connections`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
      
//       if (connectionsRes.ok) {
//         const connectionsData = await connectionsRes.json();
//         setConnections(connectionsData);
//       }
      
//       // Fetch all available stages
//       const stagesRes = await fetch(`${API_BASE_URL}/stages/all-stages`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
      
//       if (stagesRes.ok) {
//         const allStages = await stagesRes.json();
        
//         // Filter out stages already added to the project
//         const addedStageIds = projectData.stages?.map((s: ProjectStageEntry) => s.stage._id) || [];
//         const filteredStages = allStages.filter((stage: StageEntry) => 
//           !addedStageIds.includes(stage._id)
//         );
        
//         setAvailableStages(filteredStages);
//       }
//     } catch (err) {
//       console.error("Error fetching project detail:", err);
//       setError(err instanceof Error ? err.message : "Failed to load project details. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   const addStageToProject = async (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${projectId}/stages`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           stageId,
//           status,
//           start_date: status === 'Ongoing' ? startDate : undefined,
//           completion_date: status === 'Completed' ? completionDate : undefined
//         }),
//       });
      
//       if (!res.ok) {
//         if (res.status === 403) {
//           throw new Error("Access denied. You don't have permission to modify this project.");
//         }
//         throw new Error("Failed to add stage to project");
//       }
      
//       // Refresh project data to get updated status
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error adding stage to project:", err);
//       setError(err instanceof Error ? err.message : "Failed to add stage to project. Please try again.");
//       return false;
//     }
//   };
  
//   const updateProjectStage = async (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${projectId}/stages/${stageId}`, {
//         method: "PUT",
//         headers: { 
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           status,
//           start_date: startDate,
//           completion_date: status === 'Completed' ? completionDate : undefined
//         }),
//       });
      
//       if (!res.ok) {
//         if (res.status === 403) {
//           throw new Error("Access denied. You don't have permission to modify this project.");
//         }
//         throw new Error("Failed to update project stage");
//       }
      
//       // Refresh project data to get updated status
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error updating project stage:", err);
//       setError(err instanceof Error ? err.message : "Failed to update project stage. Please try again.");
//       return false;
//     }
//   };
  
//   const deleteProjectStage = async (stageId: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${projectId}/stages/${stageId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
      
//       if (!res.ok) {
//         if (res.status === 403) {
//           throw new Error("Access denied. You don't have permission to modify this project.");
//         }
//         throw new Error("Failed to delete project stage");
//       }
      
//       // Refresh project data to get updated status
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error deleting project stage:", err);
//       setError(err instanceof Error ? err.message : "Failed to delete project stage. Please try again.");
//       return false;
//     }
//   };
  
//   const createStageConnection = async (fromStageId: string, toStageId: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${projectId}/connections`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           fromStageId,
//           toStageId
//         }),
//       });
      
//       if (!res.ok) {
//         if (res.status === 403) {
//           throw new Error("Access denied. You don't have permission to modify this project.");
//         }
//         throw new Error("Failed to create stage connection");
//       }
      
//       // Refresh project data
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error creating stage connection:", err);
//       setError(err instanceof Error ? err.message : "Failed to create stage connection. Please try again.");
//       return false;
//     }
//   };
  
//   useEffect(() => {
//     fetchProjectDetail();
//   }, [projectId]);
  
//   return {
//     project,
//     stages,
//     connections,
//     availableStages,
//     isLoading,
//     error,
//     addStageToProject,
//     updateProjectStage,
//     deleteProjectStage,
//     createStageConnection,
//     refetch: fetchProjectDetail
//   };
// };








// frontend/app/component/projects/ProjectStageForm.tsx


// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
//   preSelectedStageId?: string;
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   onSubmit,
//   onCancel,
//   preSelectedStageId
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
  
//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: preSelectedStageId || stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });
  
//   const watchedStatus = form.watch('status');
//   const watchedStartDate = form.watch('startDate');
//   const watchedCompletionDate = form.watch('completionDate');
  
//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus as 'Ongoing' | 'Completed');
//     }
//   }, [watchedStatus]);
  
//   // Update form validation based on status
//   useEffect(() => {
//     if (status === 'Ongoing' && !watchedStartDate) {
//       setAlertMessage("Start date is required for Ongoing status");
//       setShowAlert(true);
//     } else if (status === 'Completed' && !watchedStartDate) {
//       setAlertMessage("Start date is required for Completed status");
//       setShowAlert(true);
//     } else if (status === 'Completed' && !watchedCompletionDate) {
//       setAlertMessage("Completion date is required for Completed status");
//       setShowAlert(true);
//     } else {
//       setShowAlert(false);
//     }
//   }, [status, watchedStartDate, watchedCompletionDate]);
  
//   const handleSubmit = (values: StageFormValues) => {
//     if (showAlert) {
//       return;
//     }
    
//     // Always pass start date if provided
//     const startDate = values.startDate;
//     // Only pass completion date if status is 'Completed'
//     const completionDate = values.status === 'Completed' ? values.completionDate : undefined;
    
//     onSubmit(
//       values.stageId,
//       values.status,
//       startDate,
//       completionDate
//     );
//   };
  
//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing
//               ? "Update the stage details below."
//               : "Fill in the details to create a new stage."
//             }
//           </DialogDescription>
//         </DialogHeader>
        
//         {showAlert && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{alertMessage}</AlertDescription>
//           </Alert>
//         )}
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {!isEditing && (
//               <FormField
//                 control={form.control}
//                 name="stageId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stage</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger className="h-auto py-2">
//                           <SelectValue placeholder="Select a stage" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {availableStages.map(stage => (
//                           <SelectItem key={stage._id} value={stage._id} className="whitespace-normal">
//                             <div className="max-w-xs">
//                               <div className="whitespace-normal break-words">
//                                 {stage.stage_name}
//                               </div>
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={(value) => {
//                     field.onChange(value);
//                     setStatus(value as 'Ongoing' | 'Completed');
//                   }} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>
//                     Start Date 
//                     {(status === 'Ongoing' || status === 'Completed') && (
//                       <span className="text-red-500">*</span>
//                     )}
//                   </FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn(
//                             "w-full pl-3 text-left font-normal",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value ? (
//                             format(new Date(field.value), "PPP")
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value ? new Date(field.value) : undefined}
//                         onSelect={(date) => {
//                           if (date) {
//                             field.onChange(format(date, 'yyyy-MM-dd'));
//                           }
//                         }}
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>
//                       Completion Date 
//                       <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={showAlert}>
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };






// frontend/app/component/projects/project-management.tsx

// // Update the handleSubmit function to refresh data after project operations
// const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//   if (currentProject) {
//     await updateProject(currentProject._id, values);
//   } else {
//     await createProject(values);
//   }
//   setShowForm(false);
//   // Refresh projects data to get updated status
//   fetchProjects();
// };

// // Update the handleConfirmDelete function to refresh data after deletion
// const handleConfirmDelete = async () => {
//   if (projectToDelete) {
//     await deleteProject(projectToDelete);
//   }
//   setShowDeleteDialog(false);
//   setProjectToDelete(null);
//   // Refresh projects data to get updated status
//   fetchProjects();
// };













// frontend/app/component/projects/ProjectDetail.tsx



// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Plus, Calendar, CheckCircle, Circle, Trash2, Edit, Table, CardTemplate } from "lucide-react";
// import { format } from "date-fns";
// import { useProjectDetail } from "@/hooks/useProjectDetail";
// import { useAuth } from "@/provider/auth-context";
// import { ProjectStageForm } from "./ProjectStageForm";
// import { ConnectionForm } from "./ConnectionForm";
// import { ProjectStageCard } from "./ProjectStageCard";
// import { ProjectStageTable } from "./ProjectStageTable";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle, CheckCircle as CheckCircleIcon } from "lucide-react";
// import { ShareProjectDialog } from "./ShareProjectDialog";
// import { toast } from "sonner";

// export const ProjectDetail: React.FC = () => {
//   const { projectId } = useParams<{ projectId: string }>();
//   const navigate = useNavigate();
//   const { user } = useAuth();
  
//   const [showStageForm, setShowStageForm] = useState(false);
//   const [showConnectionForm, setShowConnectionForm] = useState(false);
//   const [showShareDialog, setShowShareDialog] = useState(false);
//   const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
//   const [editingStage, setEditingStage] = useState<string | null>(null);
//   const [preSelectedStageId, setPreSelectedStageId] = useState<string | null>(null);
//   const [previousStatus, setPreviousStatus] = useState<string>('');
  
//   const {
//     project,
//     stages,
//     connections,
//     availableStages,
//     isLoading,
//     error,
//     addStageToProject,
//     updateProjectStage,
//     deleteProjectStage,
//     createStageConnection,
//     refetch
//   } = useProjectDetail(projectId || null);
  
//   // Track project status changes
//   useEffect(() => {
//     if (project && project.status !== previousStatus) {
//       // Show notification when status changes
//       if (previousStatus) {
//         toast.success(`Project status changed from "${previousStatus}" to "${project.status}"`, {
//           description: "The project status has been automatically updated based on its stages.",
//           icon: <CheckCircleIcon className="h-4 w-4" />,
//         });
//       }
//       setPreviousStatus(project.status);
//     }
//   }, [project, previousStatus]);
  
//   // Determine if user can edit this project
//   const canEditProject = user?.role === "manager" && 
//     (project?.owner._id === user._id || 
//      (project.sharedWith && project.sharedWith.some(id => id.toString() === user._id.toString())));
  
//   const isOwner = user?.role === "manager" && project?.owner._id === user._id;
  
//   const handleAddStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     addStageToProject(stageId, status, startDate, completionDate)
//       .then(() => {
//         setShowStageForm(false);
//         setPreSelectedStageId(null);
//       });
//   };
  
//   const handleStageClick = (stageId: string) => {
//     if (!canEditProject) return;
//     setPreSelectedStageId(stageId);
//     setShowStageForm(true);
//   };
  
//   const handleUpdateStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     updateProjectStage(stageId, status, startDate, completionDate)
//       .then(() => {
//         setEditingStage(null);
//       });
//   };
  
//   const handleCreateConnection = (fromStageId: string, toStageId: string) => {
//     createStageConnection(fromStageId, toStageId)
//       .then(() => {
//         setShowConnectionForm(false);
//       });
//   };
  
//   const handleMarkComplete = (stageId: string) => {
//     if (!canEditProject) return;
//     const stage = stages.find(s => s._id === stageId);
//     if (stage) {
//       // Show completion date picker
//       setEditingStage(stageId);
//     }
//   };
  
//   const formatDisplayDate = (dateString?: string) => {
//     if (!dateString) return "Not set";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }
  
//   if (error || !project) {
//     return (
//       <div className="container mx-auto p-4">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {error || "Project not found"}
//           </AlertDescription>
//         </Alert>
//         <Button className="mt-4" onClick={() => navigate("/projects")}>
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
//         </Button>
//       </div>
//     );
//   }
  
//   return (
//     <div className="container mx-auto p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <Button variant="ghost" onClick={() => navigate("/projects")} className="mr-4">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold">{project.project_name}</h1>
//             <div className="flex items-center mt-1">
//               <Badge className={getStatusColor(project.status || '')}>
//                 {project.status}
//               </Badge>
//               <span className="text-sm text-muted-foreground ml-2">
//                 Created: {formatDisplayDate(project.created_at)}
//               </span>
//               {project.owner && (
//                 <span className="text-sm text-muted-foreground ml-2">
//                   Owner: {project.owner.name}
//                 </span>
//               )}
//               {!isOwner && canEditProject && (
//                 <Badge variant="outline" className="ml-2">
//                   Shared
//                 </Badge>
//               )}
//             </div>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           {canEditProject && (
//             <>
//               <Button 
//                 variant="outline" 
//                 onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
//               >
//                 {viewMode === 'cards' ? (
//                   <>
//                     <Table className="h-4 w-4 mr-1" />
//                     Table View
//                   </>
//                 ) : (
//                   <>
//                     <CardTemplate className="h-4 w-4 mr-1" />
//                     Card View
//                   </>
//                 )}
//               </Button>
//               <Button onClick={() => {
//                 setShowStageForm(true);
//                 setPreSelectedStageId(null);
//               }}>
//                 <Plus className="mr-2 h-4 w-4" /> Add Stage
//               </Button>
//               <Button 
//                 variant="outline" 
//                 onClick={() => setShowConnectionForm(true)}
//                 disabled={stages.length < 2}
//               >
//                 Connect Stages
//               </Button>
//               {isOwner && (
//                 <Button 
//                   variant="outline" 
//                   onClick={() => setShowShareDialog(true)}
//                 >
//                   Share Project
//                 </Button>
//               )}
//             </>
//           )}
//         </div>
//       </div>
      
//       {/* Available Stages */}
//       {canEditProject && availableStages.length > 0 && (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-lg">Available Stages</CardTitle>
//             <p className="text-sm text-muted-foreground">Click on a stage to add it to the project</p>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
//               {availableStages.map(stage => (
//                 <div 
//                   key={stage._id}
//                   className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors hover:shadow-sm"
//                   onClick={() => handleStageClick(stage._id)}
//                 >
//                   <div className="font-medium line-clamp-2">{stage.stage_name}</div>
//                   {stage.description && (
//                     <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
//                       {stage.description}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
      
//       {/* Project Stages */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg flex items-center">
//             Project Stages
//             <Badge variant="secondary" className="ml-2">
//               {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'}
//             </Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {stages.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               No stages added to this project yet.
//               {canEditProject && " Click on available stages above to add them."}
//             </div>
//           ) : viewMode === 'cards' ? (
//             <div className="relative">
//               {/* Connection lines for card view */}
//               <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
//                 {connections.map((conn, index) => {
//                   const fromElement = document.getElementById(`stage-card-${conn.from_stage._id}`);
//                   const toElement = document.getElementById(`stage-card-${conn.to_stage._id}`);
                  
//                   if (!fromElement || !toElement) return null;
                  
//                   const fromRect = fromElement.getBoundingClientRect();
//                   const toRect = toElement.getBoundingClientRect();
                  
//                   const containerRect = fromElement.parentElement?.getBoundingClientRect();
//                   if (!containerRect) return null;
                  
//                   const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
//                   const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
//                   const x2 = toRect.left + toRect.width / 2 - containerRect.left;
//                   const y2 = toRect.top + toRect.height / 2 - containerRect.top;
                  
//                   return (
//                     <line 
//                       key={index}
//                       x1={x1}
//                       y1={y1}
//                       x2={x2}
//                       y2={y2}
//                       stroke="#94a3b8"
//                       strokeWidth="2"
//                       markerEnd="url(#arrowhead)"
//                     />
//                   );
//                 })}
//                 <defs>
//                   <marker 
//                     id="arrowhead" 
//                     markerWidth="10" 
//                     markerHeight="7" 
//                     refX="9" 
//                     refY="3.5" 
//                     orient="auto"
//                   >
//                     <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
//                   </marker>
//                 </defs>
//               </svg>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative" style={{ zIndex: 1 }}>
//                 {stages.map(stage => (
//                   <ProjectStageCard 
//                     key={stage._id}
//                     stage={stage}
//                     onEdit={() => canEditProject && setEditingStage(stage._id)}
//                     onDelete={() => canEditProject && deleteProjectStage(stage._id)}
//                     onMarkComplete={() => canEditProject && handleMarkComplete(stage._id)}
//                     canEdit={canEditProject}
//                   />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <ProjectStageTable 
//               stages={stages}
//               onEdit={(stageId) => canEditProject && setEditingStage(stageId)}
//               onDelete={(stageId) => canEditProject && deleteProjectStage(stageId)}
//               onMarkComplete={(stageId) => canEditProject && handleMarkComplete(stageId)}
//               canEdit={canEditProject}
//             />
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Add Stage Form - Only for Managers with Edit Permission */}
//       {canEditProject && showStageForm && (
//         <ProjectStageForm
//           availableStages={availableStages}
//           onSubmit={handleAddStage}
//           onCancel={() => {
//             setShowStageForm(false);
//             setPreSelectedStageId(null);
//           }}
//           preSelectedStageId={preSelectedStageId || undefined}
//         />
//       )}
      
//       {/* Edit Stage Form - Only for Managers with Edit Permission */}
//       {canEditProject && editingStage && (
//         <ProjectStageForm
//           stage={stages.find(s => s._id === editingStage)}
//           isEditing={true}
//           onSubmit={(stageId, status, startDate, completionDate) => 
//             handleUpdateStage(editingStage, status, startDate, completionDate)
//           }
//           onCancel={() => setEditingStage(null)}
//         />
//       )}
      
//       {/* Connection Form - Only for Managers with Edit Permission */}
//       {canEditProject && showConnectionForm && (
//         <ConnectionForm
//           stages={stages}
//           connections={connections}
//           onSubmit={handleCreateConnection}
//           onCancel={() => setShowConnectionForm(false)}
//         />
//       )}
      
//       {/* Share Project Dialog - Only for Project Owners */}
//       {isOwner && showShareDialog && (
//         <ShareProjectDialog
//           project={project}
//           open={showShareDialog}
//           onOpenChange={setShowShareDialog}
//         />
//       )}
//     </div>
//   );
// };

















