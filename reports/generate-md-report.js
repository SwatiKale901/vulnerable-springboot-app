const fs = require('fs');
const reportPath = 'reports/cucumber-report.json';
const outPath = 'reports/test-report.md';
if (!fs.existsSync(reportPath)) {
  console.error(`Missing report file: ${reportPath}`);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const scenarios = [];
let totalSteps = 0;
let passedSteps = 0;
let failedSteps = 0;
let skippedSteps = 0;
let undefinedSteps = 0;
let totalScenarios = 0;
let passedScenarios = 0;
let failedScenarios = 0;
let pendingScenarios = 0;
for (const feature of data) {
  for (const scenario of feature.elements || []) {
    if (scenario.type !== 'scenario') continue;
    totalScenarios += 1;
    const steps = scenario.steps.filter(s => !s.hidden);
    const scenarioStatus = steps.every(s => s.result.status === 'passed') ? 'passed' : (steps.some(s => s.result.status === 'failed') ? 'failed' : 'unknown');
    if (scenarioStatus === 'passed') passedScenarios += 1;
    if (scenarioStatus === 'failed') failedScenarios += 1;
    if (scenarioStatus === 'unknown') pendingScenarios += 1;
    for (const step of steps) {
      totalSteps += 1;
      if (step.result.status === 'passed') passedSteps += 1;
      if (step.result.status === 'failed') failedSteps += 1;
      if (step.result.status === 'skipped') skippedSteps += 1;
      if (step.result.status === 'undefined') undefinedSteps += 1;
    }
    scenarios.push({
      name: scenario.name,
      line: scenario.line,
      status: scenarioStatus,
      steps: steps.map(s => ({ keyword: s.keyword.trim(), text: s.name, status: s.result.status }))
    });
  }
}
const now = new Date().toISOString();
let md = '# Test Report\n\n';
md += `Generated: ${now}\\n`;
md += `Command: npx cucumber-js --require-module ts-node/register --require tests/support/**/*.ts --require tests/step-definitions/**/*.ts --format json:reports/cucumber-report.json features/test.feature\\n\n`;
md += '## Summary\n\n';
md += `- Features: ${data.length}\\n`;
md += `- Scenarios: ${totalScenarios}\\n`;
md += `  - Passed: ${passedScenarios}\\n`;
md += `  - Failed: ${failedScenarios}\\n`;
md += `  - Pending/Unknown: ${pendingScenarios}\\n`;
md += `- Steps: ${totalSteps}\\n`;
md += `  - Passed: ${passedSteps}\\n`;
md += `  - Failed: ${failedSteps}\\n`;
md += `  - Skipped: ${skippedSteps}\\n`;
md += `  - Undefined: ${undefinedSteps}\\n\n`;
md += '## Scenarios\n\n';
for (const scenario of scenarios) {
  md += `### ${scenario.name} (line ${scenario.line})\\n`;
  md += `- Status: **${scenario.status}**\\n`;
  md += '- Steps:\\n';
  for (const step of scenario.steps) {
    md += `  - ${step.keyword} ${step.text} — ${step.status}\\n`;
  }
  md += '\\n';
}
fs.writeFileSync(outPath, md, 'utf8');
console.log('Report written to', outPath);
