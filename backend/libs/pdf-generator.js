// backend/libs/pdf-generator.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const generateProjectPDF = async (projectData) => {
  try {
    console.log("Generating PDF for project:", projectData.project_name);
    
    // Create the HTML content (same as your original design)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Project Details - ${projectData.project_name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
          }
          .project-title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .project-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #34495e;
          }
          .stages-section {
            margin-top: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .stage-card {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #f9f9f9;
          }
          .stage-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .stage-name {
            font-weight: bold;
            font-size: 16px;
          }
          .stage-status {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            color: white;
          }
          .status-ongoing {
            background-color: #3498db;
          }
          .status-completed {
            background-color: #2ecc71;
          }
          .stage-description {
            margin-bottom: 10px;
            color: #555;
          }
          .stage-dates {
            font-size: 14px;
            color: #777;
          }
          .stage-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .stage-table th, .stage-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .stage-table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .stage-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="project-title">${projectData.project_name}</h1>
          <p>Project Details Report</p>
        </div>
        
        <div class="project-info">
          <div>
            <div class="info-item">
              <span class="info-label">Description:</span> ${projectData.description || 'No description provided'}
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span> ${projectData.status}
            </div>
            <div class="info-item">
              <span class="info-label">Created At:</span> ${new Date(projectData.created_at).toLocaleDateString()}
            </div>
            <div class="info-item">
              <span class="info-label">Owner:</span> ${projectData.owner.name}
            </div>
          </div>
        </div>
        
        <div class="stages-section">
          <h2 class="section-title">Project Stages</h2>
          
          <!-- Stage Table View -->
          <table class="stage-table">
            <thead>
              <tr>
                <th>Stage Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Completion Date</th>
              </tr>
            </thead>
            <tbody>
              ${projectData.stages && projectData.stages.length > 0 ? projectData.stages.map(stage => `
                <tr>
                  <td>${stage.stage.stage_name}</td>
                  <td>${stage.stage.description || 'No description'}</td>
                  <td>
                    <span class="stage-status status-${stage.status.toLowerCase()}">${stage.status}</span>
                  </td>
                  <td>${stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set'}</td>
                  <td>${stage.completion_date ? new Date(stage.completion_date).toLocaleDateString() : 'Not set'}</td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align: center;">No stages found</td></tr>'}
            </tbody>
          </table>
          
          <!-- Stage Card View -->
          <div style="margin-top: 30px;">
            ${projectData.stages && projectData.stages.length > 0 ? projectData.stages.map(stage => `
              <div class="stage-card">
                <div class="stage-header">
                  <div class="stage-name">${stage.stage.stage_name}</div>
                  <span class="stage-status status-${stage.status.toLowerCase()}">${stage.status}</span>
                </div>
                ${stage.stage.description ? `<div class="stage-description">${stage.stage.description}</div>` : ''}
                <div class="stage-dates">
                  <div><strong>Start Date:</strong> ${stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set'}</div>
                  ${stage.completion_date ? `<div><strong>Completion Date:</strong> ${new Date(stage.completion_date).toLocaleDateString()}</div>` : ''}
                </div>
              </div>
            `).join('') : '<p style="text-align: center;">No stages found</p>'}
          </div>
        </div>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>© 2025 TaskHub Project Management System</p>
        </div>
      </body>
      </html>
    `;
    
    // Create a temporary file
    const tempDir = os.tmpdir();
    const fileName = `project-${projectData._id}-${Date.now()}.pdf`;
    const filePath = path.join(tempDir, fileName);
    console.log("Generating PDF at path:", filePath);
    
    // Use PDFShift API to convert HTML to PDF
    const response = await axios.post(
      'https://api.pdfshift.io/v3/convert/pdf',
      {
        source: htmlContent,
        filename: fileName,
        format: 'pdf',
        options: {
          marginTop: '20mm',
          marginRight: '20mm',
          marginBottom: '20mm',
          marginLeft: '20mm',
          printBackground: true,
          landscape: false,
          scale: 1
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PDFSHIFT_API_KEY}`
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Save the PDF
    fs.writeFileSync(filePath, Buffer.from(response.data));
    
    console.log("PDF generated successfully");
    
    return {
      filePath,
      fileName
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to a simpler PDF generation if PDFShift fails
    try {
      console.log("Attempting fallback PDF generation...");
      return await generateSimplePDF(projectData);
    } catch (fallbackError) {
      console.error('Fallback PDF generation also failed:', fallbackError);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }
};

// Fallback PDF generation using pdfkit
async function generateSimplePDF(projectData) {
  const PDFDocument = require('pdfkit');
  
  const tempDir = os.tmpdir();
  const fileName = `project-${projectData._id}-${Date.now()}.pdf`;
  const filePath = path.join(tempDir, fileName);
  
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4'
  });
  
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  
  // Add title
  doc.fontSize(24).fillColor('#2c3e50').text(projectData.project_name, { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).fillColor('#666').text('Project Details Report', { align: 'center' });
  doc.moveDown(2);
  
  // Add project information
  doc.fontSize(16).fillColor('#333').text('Project Information', { underline: true });
  doc.moveDown(0.5);
  
  doc.fontSize(12).fillColor('#555');
  if (projectData.description) {
    doc.text(`Description: ${projectData.description}`, { align: 'left' });
  }
  doc.text(`Status: ${projectData.status}`, { align: 'left' });
  doc.text(`Created: ${new Date(projectData.created_at).toLocaleDateString()}`, { align: 'left' });
  doc.text(`Owner: ${projectData.owner.name}`, { align: 'left' });
  doc.moveDown(1.5);
  
  // Add stages section
  if (projectData.stages && projectData.stages.length > 0) {
    doc.fontSize(16).fillColor('#333').text('Project Stages', { underline: true });
    doc.moveDown(0.5);
    
    projectData.stages.forEach((stage) => {
      doc.fontSize(14).fillColor('#333').text(stage.stage.stage_name, { underline: true });
      doc.moveDown(0.3);
      
      if (stage.stage.description) {
        doc.fontSize(12).fillColor('#555').text(`Description: ${stage.stage.description}`);
        doc.moveDown(0.2);
      }
      
      doc.fontSize(12).fillColor('#555').text(`Status: ${stage.status}`);
      doc.text(`Start Date: ${stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set'}`);
      doc.text(`Completion Date: ${stage.completion_date ? new Date(stage.completion_date).toLocaleDateString() : 'Not set'}`);
      doc.moveDown(0.5);
    });
  } else {
    doc.fontSize(12).fillColor('#666').text('No stages found for this project.');
    doc.moveDown(1);
  }
  
  // Add footer
  doc.fontSize(10).fillColor('#999');
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
  doc.text('© 2025 TaskHub Project Management System', { align: 'center' });
  
  doc.end();
  
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  
  console.log("Fallback PDF generated successfully");
  
  return {
    filePath,
    fileName
  };
}

// Helper function to generate text report as final fallback
function generateTextReport(projectData) {
  const tempDir = os.tmpdir();
  const fileName = `project-${projectData._id}-${Date.now()}.txt`;
  const filePath = path.join(tempDir, fileName);
  
  let report = `PROJECT DETAILS REPORT\n`;
  report += `=====================\n\n`;
  report += `Project Name: ${projectData.project_name}\n`;
  report += `Description: ${projectData.description || 'No description provided'}\n`;
  report += `Status: ${projectData.status}\n`;
  report += `Created: ${new Date(projectData.created_at).toLocaleDateString()}\n`;
  report += `Owner: ${projectData.owner.name}\n\n`;
  
  if (projectData.stages && projectData.stages.length > 0) {
    report += `PROJECT STAGES\n`;
    report += `==============\n\n`;
    
    projectData.stages.forEach((stage, index) => {
      report += `${index + 1}. ${stage.stage.stage_name}\n`;
      report += `   Status: ${stage.status}\n`;
      report += `   Start Date: ${stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set'}\n`;
      report += `   Completion Date: ${stage.completion_date ? new Date(stage.completion_date).toLocaleDateString() : 'Not set'}\n`;
      if (stage.stage.description) {
        report += `   Description: ${stage.stage.description}\n`;
      }
      report += `\n`;
    });
  } else {
    report += `No stages found for this project.\n\n`;
  }
  
  report += `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
  report += `© 2025 TaskHub Project Management System\n`;
  
  fs.writeFileSync(filePath, report);
  
  return {
    filePath,
    fileName
  };
}