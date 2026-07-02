const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const reports = [
  path.join(__dirname, '..', 'reports', 'test-report.html'),
  path.join(__dirname, '..', 'reports', 'test-report.md'),
  path.join(__dirname, '..', 'reports', 'test-report.html')
];

const existing = reports.find(p => fs.existsSync(p));
if (!existing) {
  console.error('No report found to open');
  process.exit(1);
}

const openCommand = process.platform === 'win32' ? `start "" "${existing}"` : process.platform === 'darwin' ? `open "${existing}"` : `xdg-open "${existing}"`;
exec(openCommand, (err) => {
  if (err) {
    console.error('Failed to open report:', err.message);
    process.exit(1);
  }
  console.log('Opened report:', existing);
});
