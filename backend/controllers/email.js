// backend/controllers/email-controller.js
import Email from "../models/email.js";
import Project from "../models/project.js";
import User from "../models/user.js";
import { generateProjectPDF } from "../libs/pdf-generator.js";
import { sendEmailWithAttachment } from "../libs/send-email.js";
import fs from 'fs'; // Make sure to import fs

// Get all emails
export const getAllEmails = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let query = {};
    
    // Role-based access control
    if (userRole === "manager") {
      // Managers can see their own emails
      query.owner = userId;
    } else if (userRole === "user") {
      // Users can see emails of their manager
      const manager = await User.findById(userId);
      if (manager && manager.referredBy) {
        query.owner = manager.referredBy;
      } else {
        // If user doesn't have a manager, they can't see any emails
        return res.status(200).json([]);
      }
    }
    
    const emails = await Email.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ message: "Error fetching emails", error: error.message });
  }
};

// Add a new email
export const addEmail = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;
    
    const newEmail = new Email({
      name,
      email,
      owner: userId
    });
    
    await newEmail.save();
    res.status(201).json({ success: true, email: newEmail });
  } catch (error) {
    console.error("Error adding email:", error);
    res.status(500).json({ message: "Error adding email", error: error.message });
  }
};

// Update an email
export const updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const userId = req.user._id;
    
    const updatedEmail = await Email.findOneAndUpdate(
      { _id: id, owner: userId },
      { name, email },
      { new: true }
    );
    
    if (!updatedEmail) {
      return res.status(404).json({ message: "Email not found" });
    }
    
    res.status(200).json(updatedEmail);
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Error updating email", error: error.message });
  }
};

// Delete an email
export const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const deletedEmail = await Email.findOneAndDelete({ _id: id, owner: userId });
    
    if (!deletedEmail) {
      return res.status(404).json({ message: "Email not found" });
    }
    
    res.status(200).json({ message: "Email deleted successfully" });
  } catch (error) {
    console.error("Error deleting email:", error);
    res.status(500).json({ message: "Error deleting email", error: error.message });
  }
};

// Share project details via email with PDF attachment
export const shareProjectDetails = async (req, res) => {
  try {
    const { projectId, emailIds } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    console.log("Sharing project details:", { projectId, emailIds, userId, userRole });
    
    // Check if user has permission to share this project
    const project = await Project.findById(projectId)
      .populate({
        path: 'stages',
        populate: {
          path: 'stage',
          model: 'Stage'
        }
      })
      .populate('owner', 'name email');
    
    if (!project) {
      console.error("Project not found:", projectId);
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Only managers can share projects, and only their own projects
    if (userRole !== "manager" || project.owner._id.toString() !== userId.toString()) {
      console.error("Access denied for user:", userId, "on project:", projectId);
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Get email addresses
    const emails = await Email.find({ _id: { $in: emailIds }, owner: userId });
    
    if (emails.length === 0) {
      console.error("No valid email addresses found for IDs:", emailIds);
      return res.status(404).json({ message: "No valid email addresses found" });
    }
    
    console.log("Found emails:", emails.length);
    
    // Generate PDF with error handling
    let pdfResult;
    try {
      pdfResult = await generateProjectPDF(project.toObject());
      console.log("PDF generated successfully:", pdfResult.fileName);
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      return res.status(500).json({ 
        message: "Failed to generate PDF", 
        error: pdfError.message 
      });
    }
   
    
    // Send emails with PDF attachment
    const emailPromises = emails.map(email => {
      const subject = `Project Details: ${project.project_name}`;
      const body = `
        <p>Dear ${email.name},</p>
        <p>Please find attached the detailed report for the project "${project.project_name}".</p>
        <p>This report includes:</p>
        <ul>
          <li>Project information and status</li>
          <li>Complete stage details in both table and card views</li>
          <li>Progress tracking information</li>
        </ul>
        <p>If you have any questions about this project, please feel free to reach out.</p>
        <p>Best regards,<br>${req.user.name}</p>
      `;
      
      return sendEmailWithAttachment(
        email.email,
        subject,
        body,
        pdfResult.filePath,
        pdfResult.fileName
      );
    });
    
    try {
      await Promise.all(emailPromises);
      console.log("All emails sent successfully");
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Try to clean up the PDF file even if emails fail
      try {
        fs.unlinkSync(pdfResult.filePath);
      } catch (unlinkError) {
        console.error("Error deleting temporary PDF file:", unlinkError);
      }
      return res.status(500).json({ message: "Failed to send emails", error: emailError.message });
    }
    
    // Clean up temporary file
    try {
      fs.unlinkSync(pdfResult.filePath);
      console.log("Temporary PDF file deleted");
    } catch (unlinkError) {
      console.error("Error deleting temporary PDF file:", unlinkError);
      // Don't fail the request if we can't delete the temp file
    }
    
    res.status(200).json({ 
      message: `Project details shared successfully with ${emails.length} email address(es)` 
    });
  } catch (error) {
    console.error("Error sharing project details:", error);
    res.status(500).json({ message: "Error sharing project details", error: error.message });
  }
};
