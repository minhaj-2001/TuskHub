// backend/libs/send-email.js
import nodemailer from 'nodemailer';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `TaskHub <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

export const sendEmailWithAttachment = async (to, subject, html, attachmentData, fileName) => {
  let attachment;
  
  // Check if attachmentData is a buffer or file path
  if (Buffer.isBuffer(attachmentData)) {
    attachment = {
      filename: fileName,
      content: attachmentData,
    };
  } else if (typeof attachmentData === 'string' && fs.existsSync(attachmentData)) {
    attachment = {
      filename: fileName,
      path: attachmentData,
    };
  } else {
    console.error('❌ Invalid attachment data');
    return false;
  }

  const mailOptions = {
    from: `TaskHub <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [attachment],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email with attachment sent:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending email with attachment:', error);
    return false;
  }
};











// // backend/libs/pdf-generator.js
// import puppeteer from 'puppeteer';
// import fs from 'fs';
// import path from 'path';
// import os from 'os';
// import { Buffer } from 'buffer';

// export const generateProjectPDF = async (projectData) => {
//   try {
//     console.log("Generating PDF for project:", projectData.project_name);
    
//     // Create the HTML content (exactly as in your original)
//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Project Details - ${projectData.project_name}</title>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             max-width: 800px;
//             margin: 0 auto;
//             padding: 20px;
//           }
//           .header {
//             text-align: center;
//             margin-bottom: 30px;
//             border-bottom: 2px solid #eee;
//             padding-bottom: 20px;
//           }
//           .project-title {
//             font-size: 24px;
//             font-weight: bold;
//             color: #2c3e50;
//             margin-bottom: 10px;
//           }
//           .project-info {
//             display: flex;
//             justify-content: space-between;
//             margin-bottom: 20px;
//           }
//           .info-item {
//             margin-bottom: 10px;
//           }
//           .info-label {
//             font-weight: bold;
//             color: #34495e;
//           }
//           .stages-section {
//             margin-top: 30px;
//           }
//           .section-title {
//             font-size: 18px;
//             font-weight: bold;
//             color: #2c3e50;
//             margin-bottom: 15px;
//             border-bottom: 1px solid #eee;
//             padding-bottom: 5px;
//           }
//           .stage-card {
//             border: 1px solid #ddd;
//             border-radius: 5px;
//             padding: 15px;
//             margin-bottom: 15px;
//             background-color: #f9f9f9;
//           }
//           .stage-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 10px;
//           }
//           .stage-name {
//             font-weight: bold;
//             font-size: 16px;
//           }
//           .stage-status {
//             padding: 3px 8px;
//             border-radius: 12px;
//             font-size: 12px;
//             font-weight: bold;
//             color: white;
//           }
//           .status-ongoing {
//             background-color: #3498db;
//           }
//           .status-completed {
//             background-color: #2ecc71;
//           }
//           .stage-description {
//             margin-bottom: 10px;
//             color: #555;
//           }
//           .stage-dates {
//             font-size: 14px;
//             color: #777;
//           }
//           .stage-table {
//             width: 100%;
//             border-collapse: collapse;
//             margin-top: 20px;
//           }
//           .stage-table th, .stage-table td {
//             border: 1px solid #ddd;
//             padding: 8px;
//             text-align: left;
//           }
//           .stage-table th {
//             background-color: #f2f2f2;
//             font-weight: bold;
//           }
//           .stage-table tr:nth-child(even) {
//             background-color: #f9f9f9;
//           }
//           .footer {
//             margin-top: 30px;
//             text-align: center;
//             font-size: 12px;
//             color: #777;
//             border-top: 1px solid #eee;
//             padding-top: 10px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h1 class="project-title">${projectData.project_name}</h1>
//           <p>Project Details Report</p>
//         </div>
        
//         <div class="project-info">
//           <div>
//             <div class="info-item">
//               <span class="info-label">Description:</span> ${projectData.description || 'No description provided'}
//             </div>
//             <div class="info-item">
//               <span class="info-label">Status:</span> ${projectData.status}
//             </div>
//             <div class="info-item">
//               <span class="info-label">Created At:</span> ${new Date(projectData.created_at).toLocaleDateString()}
//             </div>
//             <div class="info-item">
//               <span class="info-label">Owner:</span> ${projectData.owner.name}
//             </div>
//           </div>
//         </div>
        
//         <div class="stages-section">
//           <h2 class="section-title">Project Stages</h2>
          
//           <!-- Stage Table View -->
//           <table class="stage-table">
//             <thead>
//               <tr>
//                 <th>Stage Name</th>
//                 <th>Description</th>
//                 <th>Status</th>
//                 <th>Start Date</th>
//                 <th>Completion Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${projectData.stages && projectData.stages.length > 0 ? projectData.stages.map(stage => `
//                 <tr>
//                   <td>${stage.stage.stage_name}</td>
//                   <td>${stage.stage.description || 'No description'}</td>
//                   <td>
//                     <span class="stage-status status-${stage.status.toLowerCase()}">${stage.status}</span>
//                   </td>
//                   <td>${stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set'}</td>
//                   <td>${stage.completion_date ? new Date(stage.completion_date).toLocaleDateString() : 'Not set'}</td>
//                 </tr>
//               `).join('') : '<tr><td colspan="5" style="text-align: center;">No stages found</td></tr>'}
//             </tbody>
//           </table>
          
//           <!-- Stage Card View -->
//           <div style="margin-top: 30px;">
//             ${projectData.stages && projectData.stages.length > 0 ? projectData.stages.map(stage => `
//               <div class="stage-card">
//                 <div class="stage-header">
//                   <div class="stage-name">${stage.stage.stage_name}</div>
//                   <span class="stage-status status-${stage.status.toLowerCase()}">${stage.status}</span>
//                 </div>
//                 ${stage.stage.description ? `<div class="stage-description">${stage.stage.description}</div>` : ''}
//                 <div class="stage-dates">
//                   <div><strong>Start Date:</strong> ${stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set'}</div>
//                   ${stage.completion_date ? `<div><strong>Completion Date:</strong> ${new Date(stage.completion_date).toLocaleDateString()}</div>` : ''}
//                 </div>
//               </div>
//             `).join('') : '<p style="text-align: center;">No stages found</p>'}
//           </div>
//         </div>
        
//         <div class="footer">
//           <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
//           <p>© 2025 TaskHub Project Management System</p>
//         </div>
//       </body>
//       </html>
//     `;
    
//     // Try to generate PDF using Puppeteer with serverless-compatible options
//     let browser;
//     let pdfBuffer;
    
//     try {
//       // Check if we're in a serverless environment
//       const isServerless = process.env.VERCEL || process.env.RENDER;
      
//       if (isServerless) {
//         // Use a remote browser service for serverless environments
//         console.log("Using remote browser service for PDF generation");
        
//         // We'll use Browserless.io as an example, but you can use any similar service
//         const browserlessAPIKey = process.env.BROWSERLESS_API_KEY;
//         if (!browserlessAPIKey) {
//           throw new Error("Browserless API key not configured for serverless environment");
//         }
        
//         const browserlessUrl = `https://chrome.browserless.io/pdf?token=${browserlessAPIKey}`;
        
//         const response = await fetch(browserlessUrl, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             html: htmlContent,
//             options: {
//               format: 'A4',
//               printBackground: true,
//               margin: {
//                 top: '20mm',
//                 right: '20mm',
//                 bottom: '20mm',
//                 left: '20mm'
//               },
//               preferCSSPageSize: true
//             }
//           })
//         });
        
//         if (!response.ok) {
//           throw new Error(`Browserless API error: ${response.status} ${response.statusText}`);
//         }
        
//         pdfBuffer = Buffer.from(await response.arrayBuffer());
//         console.log("PDF generated successfully with Browserless");
//       } else {
//         // Local environment - use Puppeteer directly
//         console.log("Using local Puppeteer for PDF generation");
        
//         const puppeteerOptions = {
//           headless: true,
//           args: [
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--disable-dev-shm-usage',
//             '--disable-gpu',
//             '--disable-software-rasterizer',
//             '--disable-extensions',
//             '--single-process',
//             '--no-zygote',
//             '--disable-web-security',
//             '--disable-features=VizDisplayCompositor'
//           ],
//           timeout: 30000
//         };
        
//         browser = await puppeteer.launch(puppeteerOptions);
//         const page = await browser.newPage();
        
//         // Set viewport size
//         await page.setViewport({ width: 800, height: 1129 });
        
//         // Set content with proper error handling
//         await page.setContent(htmlContent, { 
//           waitUntil: 'networkidle0',
//           timeout: 30000 
//         });
        
//         // Generate PDF as buffer
//         pdfBuffer = await page.pdf({
//           format: 'A4',
//           printBackground: true,
//           margin: {
//             top: '20mm',
//             right: '20mm',
//             bottom: '20mm',
//             left: '20mm'
//           },
//           preferCSSPageSize: true
//         });
        
//         console.log("PDF generated successfully with Puppeteer");
        
//         // Close browser
//         await browser.close();
//       }
//     } catch (error) {
//       console.error("Error generating PDF:", error);
      
//       // Fallback to jsPDF with improved layout
//       console.log("Attempting fallback PDF generation with improved layout");
      
//       const { jsPDF } = await import('jspdf');
//       const doc = new jsPDF('p', 'mm', 'a4');
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       const margin = 15;
//       let yPosition = margin;
      
//       // Helper function to calculate text height
//       const getTextHeight = (text, fontSize, maxWidth) => {
//         doc.setFontSize(fontSize);
//         const lines = doc.splitTextToSize(text, maxWidth);
//         return lines.length * (fontSize * 0.5) + 2;
//       };
      
//       // Helper function to add wrapped text
//       const addWrappedText = (text, x, y, fontSize = 10, maxWidth = pageWidth - (2 * margin)) => {
//         doc.setFontSize(fontSize);
//         const lines = doc.splitTextToSize(text, maxWidth);
//         doc.text(lines, x, y);
//         return lines.length * (fontSize * 0.5) + 2;
//       };
      
//       // Helper function to add colored text
//       const addColoredText = (text, x, y, color, fontSize = 10) => {
//         doc.setTextColor(color.r, color.g, color.b);
//         doc.setFontSize(fontSize);
//         doc.text(text, x, y);
//         doc.setTextColor(0, 0, 0); // Reset to black
//       };
      
//       // Helper function to draw a table cell with proper text wrapping
//       const drawTableCell = (text, x, y, width, height, align = 'left', fontSize = 9, padding = 2) => {
//         doc.setFontSize(fontSize);
//         const availableWidth = width - (2 * padding);
//         const lines = doc.splitTextToSize(text, availableWidth);
//         const lineHeight = fontSize * 0.5;
//         const textHeight = lines.length * lineHeight;
//         const textY = y + (height / 2) - (textHeight / 2) + (fontSize * 0.2);
        
//         if (align === 'center') {
//           doc.text(lines, x + (width / 2), textY, { align: 'center' });
//         } else if (align === 'right') {
//           doc.text(lines, x + width - padding, textY, { align: 'right' });
//         } else {
//           doc.text(lines, x + padding, textY);
//         }
        
//         return textHeight;
//       };
      
//       // Helper function to draw a stage card
//       const drawStageCard = (x, y, width, height, stage) => {
//         // Card border
//         doc.setDrawColor(221, 221, 221);
//         doc.rect(x, y, width, height);
        
//         // Card background
//         doc.setFillColor(249, 249, 249);
//         doc.rect(x, y, width, height, 'F');
        
//         // Stage name
//         doc.setFont('helvetica', 'bold', 11);
//         const stageName = stage.stage.stage_name.length > 20 ? 
//           stage.stage.stage_name.substring(0, 17) + '...' : 
//           stage.stage.stage_name;
//         doc.text(stageName, x + 3, y + 5);
        
//         // Status badge
//         const statusColor = stage.status === 'Completed' ? {r:46, g:204, b:113} : {r:52, g:152, b:219};
//         addColoredText(stage.status, x + width - 18, y + 5, statusColor, 8);
        
//         // Description (wrapped)
//         if (stage.stage.description) {
//           doc.setFont('helvetica', 'normal', 8);
//           const descLines = doc.splitTextToSize(stage.stage.description, width - 6);
//           doc.text(descLines, x + 3, y + 12);
//         }
        
//         // Dates
//         doc.setFont('helvetica', 'normal', 8);
//         doc.text(`Start: ${stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set'}`, x + 3, y + height - 8);
        
//         if (stage.completion_date) {
//           doc.text(`End: ${new Date(stage.completion_date).toLocaleDateString()}`, x + 3, y + height - 4);
//         }
//       };
      
//       // Header
//       doc.setFont('helvetica', 'bold', 20);
//       doc.text(projectData.project_name, pageWidth / 2, yPosition, { align: 'center' });
//       yPosition += 12;
      
//       doc.setFont('helvetica', 'normal', 12);
//       doc.text('Project Details Report', pageWidth / 2, yPosition, { align: 'center' });
//       yPosition += 20;
      
//       // Project Info
//       doc.setFont('helvetica', 'bold', 14);
//       doc.text('Project Information', margin, yPosition);
//       yPosition += 8;
      
//       doc.setFont('helvetica', 'normal', 10);
//       yPosition += addWrappedText(`Description: ${projectData.description || 'No description provided'}`, margin, yPosition);
//       yPosition += addWrappedText(`Status: ${projectData.status}`, margin, yPosition);
//       yPosition += addWrappedText(`Created At: ${new Date(projectData.created_at).toLocaleDateString()}`, margin, yPosition);
//       yPosition += addWrappedText(`Owner: ${projectData.owner.name}`, margin, yPosition);
//       yPosition += 15;
      
//       // Stages Section
//       if (projectData.stages && projectData.stages.length > 0) {
//         doc.setFont('helvetica', 'bold', 14);
//         doc.text('Project Stages', margin, yPosition);
//         yPosition += 10;
        
//         // Table Header
//         const tableStart = yPosition;
//         const tableWidth = pageWidth - (2 * margin);
//         const colWidths = [0.15, 0.35, 0.15, 0.175, 0.175]; // Percentage widths
//         const headers = ['Stage Name', 'Description', 'Status', 'Start Date', 'Completion Date'];
        
//         // Draw table header background
//         doc.setFillColor(240, 240, 240);
//         doc.rect(margin, tableStart, tableWidth, 10, 'F');
        
//         // Draw table header text
//         doc.setFont('helvetica', 'bold', 9);
//         let xPos = margin;
//         headers.forEach((header, i) => {
//           const colWidth = tableWidth * colWidths[i];
//           drawTableCell(header, xPos, tableStart, colWidth, 10, 'center', 9);
//           xPos += colWidth;
//         });
        
//         yPosition = tableStart + 10;
        
//         // Table rows
//         projectData.stages.forEach(stage => {
//           if (yPosition > pageHeight - 50) {
//             doc.addPage();
//             yPosition = margin;
//           }
          
//           // Calculate row height based on content
//           let rowHeight = 10;
//           let maxCellHeight = 10;
          
//           // Check each cell for text height
//           const cells = [
//             { text: stage.stage.stage_name, width: tableWidth * colWidths[0] },
//             { text: stage.stage.description || 'No description', width: tableWidth * colWidths[1] },
//             { text: stage.status, width: tableWidth * colWidths[2] },
//             { text: stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set', width: tableWidth * colWidths[3] },
//             { text: stage.completion_date ? new Date(stage.completion_date).toLocaleDateString() : 'Not set', width: tableWidth * colWidths[4] }
//           ];
          
//           cells.forEach(cell => {
//             const cellHeight = getTextHeight(cell.text, 8, cell.width - 4);
//             if (cellHeight > maxCellHeight) {
//               maxCellHeight = cellHeight;
//             }
//           });
          
//           rowHeight = Math.max(10, maxCellHeight + 4);
          
//           // Alternate row colors
//           if ((projectData.stages.indexOf(stage) % 2) === 0) {
//             doc.setFillColor(249, 249, 249);
//             doc.rect(margin, yPosition, tableWidth, rowHeight, 'F');
//           }
          
//           doc.setFont('helvetica', 'normal', 8);
//           let xPos = margin;
          
//           // Draw each cell with proper text wrapping
//           cells.forEach((cell, i) => {
//             const colWidth = tableWidth * colWidths[i];
//             drawTableCell(cell.text, xPos, yPosition, colWidth, rowHeight, 'left', 8, 2);
//             xPos += colWidth;
//           });
          
//           yPosition += rowHeight;
//         });
        
//         yPosition += 15;
        
//  // Stage Cards Section
// doc.setFont('helvetica', 'bold', 14);
// doc.text('Stage Details', margin, yPosition);
// yPosition += 10;

// // Calculate card dimensions for 4 cards per row
// const cardWidth = 42;
// const cardHeight = 32;
// const cardSpacing = 4;
// const cardsPerRow = 4;
// const rowWidth = (cardWidth * cardsPerRow) + (cardSpacing * (cardsPerRow - 1));
// const startX = (pageWidth - rowWidth) / 2;

// // Track current row for proper pagination
// let currentRow = 0;

// projectData.stages.forEach((stage, index) => {
//   const col = index % cardsPerRow;
  
//   // Check if we need to move to a new row (except for the first card)
//   if (col === 0 && index > 0) {
//     currentRow++;
//   }
  
//   const cardX = startX + (col * (cardWidth + cardSpacing));
//   let cardY = yPosition + (currentRow * (cardHeight + cardSpacing));
  
//   // Check if we need a new page
//   if (cardY + cardHeight > pageHeight - 30) {
//     doc.addPage();
//     yPosition = margin;
//     currentRow = 0; // Reset row counter for new page
//     cardY = yPosition; // Position at the top of the new page
//   }
  
//   drawStageCard(cardX, cardY, cardWidth, cardHeight, stage);
// });

// yPosition += ((currentRow + 1) * (cardHeight + cardSpacing)) + 20;
//       } else {
//         doc.setFont('helvetica', 'normal', 12);
//         doc.text('No stages found', margin, yPosition);
//       }
      
//       // Footer
//       const pageCount = doc.internal.getNumberOfPages();
//       for (let i = 1; i <= pageCount; i++) {
//         doc.setPage(i);
//         doc.setFont('helvetica', 'normal', 9);
//         doc.text(
//           `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
//           pageWidth / 2,
//           pageHeight - 15,
//           { align: 'center' }
//         );
//         doc.text(
//           '© 2025 TaskHub Project Management System',
//           pageWidth / 2,
//           pageHeight - 10,
//           { align: 'center' }
//         );
//       }
      
//       pdfBuffer = Buffer.from(doc.output('arraybuffer'));
//       console.log("Fallback PDF generated successfully with improved layout");
//     }
    
//     // Create file path for compatibility
//     const fileName = `project-${projectData._id}-${Date.now()}.pdf`;
//     const filePath = path.join(os.tmpdir(), fileName);
    
//     // Write buffer to file for compatibility with existing email sending logic
//     fs.writeFileSync(filePath, pdfBuffer);
    
//     return {
//       filePath,
//       fileName,
//       pdfBuffer
//     };
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     throw new Error(`Failed to generate PDF: ${error.message}`);
//   }
// };