// // backend/controllers/email.js
// import Email from "../models/email.js";
// import { sendEmail } from "../libs/send-email.js";

// export const sendProjectPDFEmail = async (req, res) => {
//   try {
//     const { recipients, subject, message, pdf } = req.body;
//     const userId = req.user._id;
    
//     // Parse recipients
//     const parsedRecipients = JSON.parse(recipients);
    
//     // Validate input
//     if (!parsedRecipients || !Array.isArray(parsedRecipients) || parsedRecipients.length === 0) {
//       return res.status(400).json({ message: "No recipients provided" });
//     }
    
//     if (!subject || !message) {
//       return res.status(400).json({ message: "Subject and message are required" });
//     }
    
//     if (!pdf) {
//       return res.status(400).json({ message: "PDF file is required" });
//     }
    
//     // Send email to each recipient
//     const emailPromises = parsedRecipients.map(async (recipient) => {
//       const emailBody = `
//         <div>
//           <h2>${subject}</h2>
//           <p>${message}</p>
//           <p>Please find the project details attached to this email.</p>
//           <p>Best regards,<br>TaskHub Team</p>
//         </div>
//       `;
      
//       return sendEmail(recipient.email, subject, emailBody, [
//         {
//           filename: 'project-details.pdf',
//           content: Buffer.from(await pdf.arrayBuffer()),
//           contentType: 'application/pdf'
//         }
//       ]);
//     });
    
//     await Promise.all(emailPromises);
    
//     // Save email record
//     const emailRecord = new Email({
//       name: 'Project Details',
//       email: parsedRecipients.map(r => r.email).join(', '),
//       owner: userId,
//       sentAt: new Date()
//     });
    
//     await emailRecord.save();
    
//     res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Error sending project PDF email:", error);
//     res.status(500).json({ message: "Failed to send email", error: error.message });
//   }
// };