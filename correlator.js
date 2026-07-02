const fs = require('fs');
const path = require('path');

const REPORT_PATH = path.join(__dirname, '.claude', 'reports', 'SECURITY_ASSESSMENT_REPORT.md');
const OUTPUT_PATH = path.join(__dirname, 'security_contract.json');

function parseReport(report) {
  const lines = report.split(/\r?\n/);
  const findings = [];
  let current = null;

  for (let line of lines) {
    const vulnMatch = line.match(/^###\s+(VULN-[0-9]+)\s+—\s+(.+)$/);
    if (vulnMatch) {
      if (current) {
        findings.push(current);
      }
      current = {
        vulnerabilityId: vulnMatch[1],
        vulnerabilityTitle: vulnMatch[2].trim(),
        cwe: null,
        severityScore: null,
        exploitabilityScore: null,
        controllerName: null,
        endpointPath: null,
        httpMethod: null,
        sourceFile: null,
        preFixBehavior: null,
        postFixBehavior: null,
        verificationStatus: 'claimed-but-unverified'
      }; 
      continue;
    }

    if (!current) {
      continue;
    }

    let fieldMatch;
    fieldMatch = line.match(/^-\s+\*\*CWE ID:\*\*\s*(.+)$/);
    if (fieldMatch) {
      current.cwe = fieldMatch[1].trim();
      continue;
    }

    fieldMatch = line.match(/^-\s+\*\*Affected File:\*\*\s*(.+)$/);
    if (fieldMatch) {
      current.sourceFile = fieldMatch[1].trim().replace(/^`|`$/g, '');
      continue;
    }

    fieldMatch = line.match(/^-\s+\*\*Affected Method \/ Class:\*\*\s*(.+)$/);
    if (fieldMatch) {
      current.controllerName = fieldMatch[1].trim();
      continue;
    }

    fieldMatch = line.match(/^-\s+\*\*Exact Vulnerable Code Snippet:\*\*/);
    if (fieldMatch) {
      // do nothing; optional context only
      continue;
    }

    if (/^-\s+\*\*Root Cause:\*\*/.test(line)) {
      current.preFixBehavior = line.replace(/^-\s+\*\*Root Cause:\*\*/,'').trim();
      continue;
    }

    fieldMatch = line.match(/^-\s+\*\*Exploitation Scenario:\*\*\s*(.+)$/);
    if (fieldMatch) {
      if (!current.preFixBehavior) {
        current.preFixBehavior = fieldMatch[1].trim();
      }
      continue;
    }

    fieldMatch = line.match(/^-\s+\*\*Business Impact:\*\*\s*(.+)$/);
    if (fieldMatch) {
      continue;
    }

    const httpMatch = line.match(/POST\s+(\/\S+)/);
    if (httpMatch && !current.endpointPath) {
      current.endpointPath = httpMatch[1];
      current.httpMethod = 'POST';
      continue;
    }
  }

  if (current) {
    findings.push(current);
  }

  return findings;
}

function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`Security assessment report not found at ${REPORT_PATH}`);
    process.exit(1);
  }

  const report = fs.readFileSync(REPORT_PATH, 'utf8');
  const parsed = parseReport(report);

  if (parsed.length === 0) {
    console.error('No vulnerabilities were parsed from the report.');
    process.exit(2);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsed, null, 2));
  console.log(`Generated ${OUTPUT_PATH} with ${parsed.length} contract entries.`);
}

main();
