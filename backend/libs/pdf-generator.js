import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const generateProjectPDF = async (projectData) => {
  try {
    console.log("Generating PDF for project:", projectData.project_name);
    
    // Create a temporary HTML file for the PDF content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Project Details - ${projectData.project_name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', Arial, sans-serif;
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
    
    // Try using Browserless if API key is available
    if (process.env.BROWSERLESS_API_KEY) {
      try {
        console.log("Attempting to use Browserless for PDF generation");
        const browser = await puppeteer.connect({
          browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        await page.pdf({
          path: filePath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          }
        });
        
        await browser.close();
        console.log("PDF generated successfully using Browserless");
        return { filePath, fileName };
      } catch (browserlessError) {
        console.error("Browserless error:", browserlessError.message);
        console.log("Falling back to local Puppeteer");
      }
    }
    
    // Fallback to local Puppeteer with better error handling
    let browser;
    try {
      console.log("Using local Puppeteer for PDF generation");
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--single-process'
        ],
        timeout: 60000,
        ignoreHTTPSErrors: true,
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Generate PDF with error handling
      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        timeout: 120000,
        preferCSSPageSize: true,
      });
      
      console.log("PDF generated successfully using local Puppeteer");
    } catch (browserError) {
      console.error("Error with Puppeteer:", browserError.message);
      throw new Error(`Failed to generate PDF: ${browserError.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    
    return {
      filePath,
      fileName
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};