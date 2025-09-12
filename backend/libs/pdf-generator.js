// backend/libs/pdf-generator.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Buffer } from 'buffer';

export const generateProjectPDF = async (projectData) => {
  try {
    console.log("Generating PDF for project:", projectData.project_name);
    
    // Create the HTML content (exactly as in your original)
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
    
    // Try to generate PDF using Puppeteer with serverless-compatible options
    let browser;
    let pdfBuffer;
    
    try {
      // Check if we're in a serverless environment
      const isServerless = process.env.VERCEL || process.env.RENDER;
      
      if (isServerless) {
        // Use a remote browser service for serverless environments
        console.log("Using remote browser service for PDF generation");
        
        // We'll use Browserless.io as an example, but you can use any similar service
        const browserlessAPIKey = process.env.BROWSERLESS_API_KEY;
        if (!browserlessAPIKey) {
          throw new Error("Browserless API key not configured for serverless environment");
        }
        
        const browserlessUrl = `https://chrome.browserless.io/pdf?token=${browserlessAPIKey}`;
        
        const response = await fetch(browserlessUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html: htmlContent,
            options: {
              format: 'A4',
              printBackground: true,
              margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
              },
              preferCSSPageSize: true
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Browserless API error: ${response.status} ${response.statusText}`);
        }
        
        pdfBuffer = Buffer.from(await response.arrayBuffer());
        console.log("PDF generated successfully with Browserless");
      } else {
        // Local environment - use Puppeteer directly
        console.log("Using local Puppeteer for PDF generation");
        
        const puppeteerOptions = {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--single-process',
            '--no-zygote',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ],
          timeout: 30000
        };
        
        browser = await puppeteer.launch(puppeteerOptions);
        const page = await browser.newPage();
        
        // Set viewport size
        await page.setViewport({ width: 800, height: 1129 });
        
        // Set content with proper error handling
        await page.setContent(htmlContent, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Generate PDF as buffer
        pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          },
          preferCSSPageSize: true
        });
        
        console.log("PDF generated successfully with Puppeteer");
        
        // Close browser
        await browser.close();
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Fallback to jsPDF if all else fails
      console.log("Attempting fallback PDF generation with jsPDF");
      
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // Helper function to add text with word wrap
      const addText = (text, x, y, fontSize = 12, maxWidth = pageWidth - 40) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * (fontSize * 0.5) + 5;
      };
      
      // Helper function to add colored text
      const addColoredText = (text, x, y, color, fontSize = 12) => {
        doc.setTextColor(color.r, color.g, color.b);
        doc.setFontSize(fontSize);
        doc.text(text, x, y);
        doc.setTextColor(0, 0, 0); // Reset to black
      };
      
      // Header
      doc.setFontSize(24);
      doc.text(projectData.project_name, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      doc.setFontSize(14);
      doc.text('Project Details Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Project Info
      doc.setFontSize(16);
      doc.text('Project Information', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      yPosition += addText(`Description: ${projectData.description || 'No description provided'}`, 20, yPosition);
      yPosition += addText(`Status: ${projectData.status}`, 20, yPosition);
      yPosition += addText(`Created At: ${new Date(projectData.created_at).toLocaleDateString()}`, 20, yPosition);
      yPosition += addText(`Owner: ${projectData.owner.name}`, 20, yPosition);
      yPosition += 20;
      
      // Stages Section
      if (projectData.stages && projectData.stages.length > 0) {
        doc.setFontSize(16);
        doc.text('Project Stages', 20, yPosition);
        yPosition += 15;
        
        // Table Header
        const tableStart = yPosition;
        const cellHeight = 8;
        const colWidths = [40, 60, 30, 30, 30];
        const headers = ['Stage Name', 'Description', 'Status', 'Start Date', 'Completion Date'];
        
        // Draw table header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, tableStart, pageWidth - 40, cellHeight, 'F');
        
        doc.setFontSize(10);
        let xPos = 20;
        headers.forEach((header, i) => {
          doc.text(header, xPos, tableStart + cellHeight / 2 + 2);
          xPos += colWidths[i];
        });
        
        yPosition = tableStart + cellHeight;
        
        // Table rows
        projectData.stages.forEach(stage => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Alternate row colors
          if ((projectData.stages.indexOf(stage) % 2) === 0) {
            doc.setFillColor(249, 249, 249);
            doc.rect(20, yPosition, pageWidth - 40, cellHeight, 'F');
          }
          
          doc.setFontSize(9);
          xPos = 20;
          
          // Stage Name
          const stageNameLines = doc.splitTextToSize(stage.stage.stage_name, colWidths[0]);
          doc.text(stageNameLines, xPos, yPosition + cellHeight / 2 + 2);
          xPos += colWidths[0];
          
          // Description
          const descLines = doc.splitTextToSize(stage.stage.description || 'No description', colWidths[1]);
          doc.text(descLines, xPos, yPosition + cellHeight / 2 + 2);
          xPos += colWidths[1];
          
          // Status
          const statusColor = stage.status === 'Completed' ? {r:46, g:204, b:113} : {r:52, g:152, b:219};
          addColoredText(stage.status, xPos, yPosition + cellHeight / 2 + 2, statusColor, 9);
          xPos += colWidths[2];
          
          // Start Date
          doc.text(stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set', 
                   xPos, yPosition + cellHeight / 2 + 2);
          xPos += colWidths[3];
          
          // Completion Date
          doc.text(stage.completion_date ? new Date(stage.completion_date).toLocaleDateString() : 'Not set', 
                   xPos, yPosition + cellHeight / 2 + 2);
          
          yPosition += cellHeight;
        });
        
        yPosition += 15;
        
        // Card View Section
        doc.setFontSize(16);
        doc.text('Stage Details', 20, yPosition);
        yPosition += 15;
        
        projectData.stages.forEach(stage => {
          if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Card border
          doc.setDrawColor(221, 221, 221);
          doc.rect(20, yPosition, pageWidth - 40, 30);
          
          // Stage name and status
          doc.setFontSize(12);
          doc.text(stage.stage.stage_name, 25, yPosition + 10);
          
          const statusColor = stage.status === 'Completed' ? {r:46, g:204, b:113} : {r:52, g:152, b:219};
          addColoredText(stage.status, pageWidth - 60, yPosition + 10, statusColor, 10);
          
          // Description
          if (stage.stage.description) {
            doc.setFontSize(10);
            yPosition += addText(stage.stage.description, 25, yPosition + 20, 10, pageWidth - 70);
          }
          
          // Dates
          doc.setFontSize(9);
          doc.text(`Start Date: ${stage.start_date ? new Date(stage.start_date).toLocaleDateString() : 'Not set'}`, 
                   25, yPosition);
          yPosition += 5;
          
          if (stage.completion_date) {
            doc.text(`Completion Date: ${new Date(stage.completion_date).toLocaleDateString()}`, 
                     25, yPosition);
            yPosition += 5;
          }
          
          yPosition += 10;
        });
      } else {
        doc.setFontSize(12);
        doc.text('No stages found', 20, yPosition);
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          pageWidth / 2,
          pageHeight - 15,
          { align: 'center' }
        );
        doc.text(
          '© 2025 TaskHub Project Management System',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      console.log("Fallback PDF generated successfully");
    }
    
    // Create file path for compatibility
    const fileName = `project-${projectData._id}-${Date.now()}.pdf`;
    const filePath = path.join(os.tmpdir(), fileName);
    
    // Write buffer to file for compatibility with existing email sending logic
    fs.writeFileSync(filePath, pdfBuffer);
    
    return {
      filePath,
      fileName,
      pdfBuffer
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};