const fs = require('fs');
const path = require('path');
const reportPath = path.join(__dirname, 'cucumber-report.json');
const outPath = path.join(__dirname, 'test-report.html');
if (!fs.existsSync(reportPath)) {
  console.error(`Missing report file: ${reportPath}`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
let totalFeatures = data.length;
let totalScenarios = 0;
let passedScenarios = 0;
let failedScenarios = 0;
let pendingScenarios = 0;
let totalSteps = 0;
let passedSteps = 0;
let failedSteps = 0;
let skippedSteps = 0;
let undefinedSteps = 0;
const scenarios = [];
for (const feature of data) {
  for (const element of feature.elements || []) {
    if (element.type !== 'scenario') continue;
    totalScenarios += 1;
    const visibleSteps = (element.steps || []).filter(s => !s.hidden);
    const scenarioStatus = visibleSteps.every(s => s.result.status === 'passed')
      ? 'passed'
      : visibleSteps.some(s => s.result.status === 'failed')
      ? 'failed'
      : 'unknown';
    if (scenarioStatus === 'passed') passedScenarios += 1;
    if (scenarioStatus === 'failed') failedScenarios += 1;
    if (scenarioStatus === 'unknown') pendingScenarios += 1;
    for (const step of visibleSteps) {
      totalSteps += 1;
      if (step.result.status === 'passed') passedSteps += 1;
      if (step.result.status === 'failed') failedSteps += 1;
      if (step.result.status === 'skipped') skippedSteps += 1;
      if (step.result.status === 'undefined') undefinedSteps += 1;
    }
    scenarios.push({
      featureName: feature.name || 'Unnamed feature',
      name: element.name,
      line: element.line,
      status: scenarioStatus,
      steps: visibleSteps.map(step => ({
        keyword: step.keyword.trim(),
        text: step.name,
        status: step.result.status
      }))
    });
  }
}
const title = 'Cucumber Test Report';
const generatedAt = new Date().toLocaleString();
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #1a1a1a; background: #f8f9fb; }
    h1, h2, h3 { color: #0f4c81; }
    .summary, .scenario { background: white; border: 1px solid #d8dee7; border-radius: 8px; padding: 18px; margin-bottom: 18px; box-shadow: 0 2px 6px rgba(15,23,42,0.06); }
    .summary ul, .scenario ul { list-style: none; padding-left: 0; }
    .summary li, .scenario li { margin: 6px 0; }
    .status-pill { display: inline-flex; align-items: center; gap: 0.5rem; padding: 4px 10px; border-radius: 999px; color: white; font-weight: 600; text-transform: uppercase; font-size: 0.78rem; }
    .passed { background: #16a34a; }
    .failed { background: #dc2626; }
    .unknown { background: #f59e0b; }
    .step-list { margin: 0; padding-left: 0; }
    .step-list li { margin: 4px 0; padding: 8px 12px; border-radius: 6px; background: #f3f4f6; }
    .step-list li .step-status { font-weight: 700; }
    .footer { color: #475569; font-size: 0.95rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="footer">Generated: ${generatedAt}</p>
  <div class="summary">
    <h2>Summary</h2>
    <ul>
      <li><strong>Features:</strong> ${totalFeatures}</li>
      <li><strong>Scenarios:</strong> ${totalScenarios}</li>
      <li><strong>Passed:</strong> ${passedScenarios}</li>
      <li><strong>Failed:</strong> ${failedScenarios}</li>
      <li><strong>Pending/Unknown:</strong> ${pendingScenarios}</li>
      <li><strong>Steps:</strong> ${totalSteps}</li>
      <li><strong>Passed steps:</strong> ${passedSteps}</li>
      <li><strong>Failed steps:</strong> ${failedSteps}</li>
      <li><strong>Skipped steps:</strong> ${skippedSteps}</li>
      <li><strong>Undefined steps:</strong> ${undefinedSteps}</li>
    </ul>
  </div>
  ${scenarios.map(s => `
    <div class="scenario">
      <h2>${s.name}</h2>
      <p><strong>Feature:</strong> ${s.featureName}</p>
      <p><strong>Line:</strong> ${s.line}</p>
      <p><span class="status-pill ${s.status}">${s.status}</span></p>
      <h3>Steps</h3>
      <ul class="step-list">
        ${s.steps.map(step => `<li><strong>${step.keyword}</strong> ${step.text} <span class="step-status">${step.status}</span></li>`).join('')}
      </ul>
    </div>
  `).join('')}
</body>
</html>`;
fs.writeFileSync(outPath, html, 'utf8');
console.log('HTML report written to', outPath);
