// backend/libs/pdf-generator-fallback.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const generateProjectPDFFallback = async (projectData) => {
  try {
    console.log("Generating PDF using fallback method for project:", projectData.project_name);
    
    // Create a temporary file
    const tempDir = os.tmpdir();
    const fileName = `project-${projectData._id}-${Date.now()}.pdf`;
    const filePath = path.join(tempDir, fileName);
    console.log("Generating PDF at path:", filePath);
    
    // Create a PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });
    
    // Pipe the PDF to a file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    // Add content to the PDF
    doc.fontSize(20).text(projectData.project_name, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Project Details Report', { align: 'center' });
    doc.moveDown(2);
    
    // Project information
    doc.fontSize(14).text('Project Information:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Description: ${projectData.description || 'No description provided'}`);
    doc.text(`Status: ${projectData.status}`);
    doc.text(`Created At: ${new Date(projectData.created_at).toLocaleDateString()}`);
    doc.text(`Owner: ${projectData.owner.name}`);
    doc.moveDown(2);
    
    // Stages section
    if (projectData.stages && projectData.stages.length > 0) {
      doc.fontSize(14).text('Project Stages:', { underline: true });
      doc.moveDown(0.5);
      
      projectData.stages.forEach((stage, index) => {
        doc.fontSize(12).text(`${index + 1}. ${stage.stage.stage_name}`);
        if (stage.stage.description) {
          doc.text(`   Description: ${stage.stage.description}`);
        }
        doc.text(`   Status: ${stage.status}`);
        doc.text(`   Start Date: ${stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set'}`);
        if (stage.completion_date) {
          doc.text(`   Completion Date: ${new Date(stage.completion_date).toLocaleDateString()}`);
        }
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(12).text('No stages found for this project.');
    }
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.text('© 2025 TaskHub Project Management System', { align: 'center' });
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the stream to finish
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    
    console.log("PDF generated successfully using fallback method");
    
    return {
      filePath,
      fileName
    };
  } catch (error) {
    console.error('Error generating PDF with fallback method:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};