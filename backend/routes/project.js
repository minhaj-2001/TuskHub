import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addStageToProject,
  updateProjectStage,
  deleteProjectStage,
  createStageConnection,
  getProjectStageConnections,
  getProjectYears
} from "../controllers/project.js";

const router = express.Router();

// Apply authentication middleware to all project routes
router.use(authenticateUser);

router.post("/project", createProject);
router.get("/all-projects", getAllProjects);
router.get("/project-years", getProjectYears);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/delete-project/:id", deleteProject);
router.post("/:projectId/stages", addStageToProject);
router.put("/:projectId/stages/:stageId", updateProjectStage);
router.delete("/:projectId/stages/:stageId", deleteProjectStage);
router.post("/:projectId/connections", createStageConnection);
router.get("/:projectId/connections", getProjectStageConnections);

export default router;








// // frontend/app/hooks/usePDF.ts
// import { useMutation } from "@tanstack/react-query";
// import { postData } from "@/lib/fetch-util";

// export const useShareProjectPDF = () => {
//   return useMutation({
//     mutationFn: (data: { projectId: string; emailIds: string[] }) => {
//       console.log('Sending share request:', data);
//       return postData("/projects/share-project", data);
//     },
//     onError: (error) => {
//       console.error('Error sharing project:', error);
//     },
//     onSuccess: (data) => {
//       console.log('Share successful:', data);
//     }
//   });
// };








// // backend/controllers/simplePdfController.js
// import Project from '../models/project.js';
// import ProjectStage from '../models/projectStage.js';
// import StageConnection from '../models/stageConnection.js';
// import User from '../models/user.js';
// import Email from '../models/email.js';
// import { sendEmail } from '../libs/send-email.js';
// import formatDateToLocal from '../utils/dateFormat.js';

// const generateSimpleProjectPDF = async (req, res) => {
//   try {
//     console.log('Simple PDF generation request received:', req.body);
    
//     const { projectId, emailIds } = req.body;
//     const managerId = req.user._id;
    
//     // Check if user is a manager
//     if (req.user.role !== 'manager') {
//       return res.status(403).json({ success: false, error: "Only managers can share projects" });
//     }
    
//     // Check if project exists and belongs to the manager
//     const project = await Project.findOne({ _id: projectId, owner: managerId })
//       .populate({
//         path: 'stages',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       })
//       .populate('owner', 'name email');
    
//     if (!project) {
//       return res.status(404).json({ success: false, error: "Project not found or access denied" });
//     }
    
//     // Fetch stage connections
//     const connections = await StageConnection.find({ project: projectId })
//       .populate({
//         path: 'from_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       })
//       .populate({
//         path: 'to_stage',
//         populate: {
//           path: 'stage',
//           model: 'Stage'
//         }
//       });
    
//     // Fetch emails to send the PDF
//     const emails = await Email.find({ 
//       _id: { $in: emailIds },
//       owner: managerId 
//     });
    
//     if (emails.length === 0) {
//       return res.status(404).json({ success: false, error: "No valid emails found" });
//     }
    
//     // Generate a simple text report instead of PDF
//     const reportContent = generateTextReport(project, connections);
    
//     // Send email with text attachment
//     const emailSubject = `Project Details: ${project.project_name}`;
//     const emailBody = `
//       <p>Hello,</p>
//       <p>Please find attached the project details for <strong>${project.project_name}</strong>.</p>
//       <p>This project was shared with you by ${req.user.name}.</p>
//       <p>The project details are attached as a text file.</p>
//       <p>Best regards,<br>${req.user.name}</p>
//     `;
    
//     const reportFilename = `${project.project_name.replace(/\s+/g, '_')}_Details.txt`;
    
//     // Send emails to all selected recipients
//     const emailPromises = emails.map(email => {
//       return sendEmailWithAttachment(
//         email.email,
//         emailSubject,
//         emailBody,
//         Buffer.from(reportContent, 'utf8'),
//         reportFilename,
//         'text/plain'
//       );
//     });
    
//     await Promise.all(emailPromises);
    
//     res.status(200).json({ 
//       success: true, 
//       message: `Project details shared with ${emails.length} recipient(s)` 
//     });
    
//   } catch (error) {
//     console.error('Error generating project report:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Helper function to generate text report
// const generateTextReport = (project, connections) => {
//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     return formatDateToLocal(new Date(dateString));
//   };
  
//   // Sort stages by order
//   const sortedStages = [...project.stages].sort((a, b) => a.order - b.order);
  
//   let report = `PROJECT DETAILS\n`;
//   report += `================\n\n`;
//   report += `Project Name: ${project.project_name}\n`;
//   report += `Status: ${project.status}\n`;
//   report += `Created Date: ${formatDate(project.created_at)}\n`;
//   report += `Owner: ${project.owner.name}\n`;
//   report += `Owner Email: ${project.owner.email}\n\n`;
  
//   if (project.description) {
//     report += `DESCRIPTION\n`;
//     report += `-----------\n`;
//     report += `${project.description}\n\n`;
//   }
  
//   if (sortedStages.length > 0) {
//     report += `PROJECT STAGES\n`;
//     report += `==============\n\n`;
    
//     sortedStages.forEach((stage, index) => {
//       report += `${index + 1}. ${stage.stage.stage_name}\n`;
//       report += `   Status: ${stage.status}\n`;
//       report += `   Start Date: ${formatDate(stage.start_date)}\n`;
//       report += `   Completion Date: ${formatDate(stage.completion_date)}\n`;
      
//       if (stage.stage.description) {
//         report += `   Description: ${stage.stage.description}\n`;
//       }
      
//       report += `\n`;
//     });
//   }
  
//   if (connections.length > 0) {
//     report += `STAGE CONNECTIONS\n`;
//     report += `=================\n\n`;
    
//     connections.forEach((conn, index) => {
//       report += `${index + 1}. ${conn.from_stage.stage.stage_name} → ${conn.to_stage.stage.stage_name}\n`;
//     });
//   }
  
//   report += `\nGenerated on ${new Date().toLocaleDateString()} by TaskHub\n`;
  
//   return report;
// };

// // Helper function to send email with attachment
// const sendEmailWithAttachment = async (to, subject, html, attachmentBuffer, filename, mimeType = 'text/plain') => {
//   try {
//     const nodemailer = require('nodemailer');
    
//     const transporter = nodemailer.createTransporter({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });
    
//     const mailOptions = {
//       from: `TaskHub <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//       attachments: [
//         {
//           filename,
//           content: attachmentBuffer,
//           encoding: 'base64',
//           contentType: mimeType
//         }
//       ]
//     };
    
//     const result = await transporter.sendMail(mailOptions);
//     return result;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error;
//   }
// };

// export { generateSimpleProjectPDF };








// // backend/routes/project.js
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

// const router = express.Router();

// // These routes should match what the frontend is calling
// router.post("/project", createProject);
// router.get("/all-projects", getAllProjects);
// router.get("/project-years", getProjectYears); // Add this route
// router.get("/:id", getProjectById);
// router.put("/:id", updateProject);
// router.delete("/delete-project/:id", deleteProject);
// router.post("/:projectId/stages", addStageToProject);
// router.put("/:projectId/stages/:stageId", updateProjectStage);
// router.delete("/:projectId/stages/:stageId", deleteProjectStage);
// router.post("/:projectId/connections", createStageConnection);
// router.get("/:projectId/connections", getProjectStageConnections);

// export default router;