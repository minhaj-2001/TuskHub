///setup-chromium.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function setupChromium() {
  console.log('Setting up Chromium for PDF generation...');
  
  try {
    // Check if we're on Linux
    if (process.platform === 'linux') {
      // Try to install Chromium if not already installed
      try {
        execSync('which chromium', { stdio: 'pipe' });
        console.log('Chromium is already installed');
      } catch (e) {
        console.log('Installing Chromium...');
        execSync('apt-get update && apt-get install -y chromium', { 
          stdio: 'inherit',
          timeout: 120000
        });
        console.log('Chromium installed successfully');
      }
    }
  } catch (error) {
    console.error('Error setting up Chromium:', error.message);
    // Don't throw the error, just log it and continue
  }
}

// Run the setup
setupChromium();