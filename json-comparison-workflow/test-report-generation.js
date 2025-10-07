#!/usr/bin/env node

// Test script to verify report generation logic
console.log('=== Testing Report Generation Logic ===\n');

// Mock results data with different scenarios
const testScenarios = [
  {
    name: 'Only Differences',
    results: [
      { file: 'config1.json', status: 'different', differences: [{ kind: 'modified', description: 'Version changed' }] },
      { file: 'config2.json', status: 'identical', differences: [] }
    ],
    expected: { shouldGenerate: true, reason: 'Has differences' }
  },
  {
    name: 'Only Identical Files',
    results: [
      { file: 'config1.json', status: 'identical', differences: [] },
      { file: 'config2.json', status: 'identical', differences: [] }
    ],
    expected: { shouldGenerate: true, reason: 'Has results (even if identical)' }
  },
  {
    name: 'Only Ignored Files',
    results: [
      { file: 'config1.json', status: 'ignored', message: 'Remote file not found' },
      { file: 'config2.json', status: 'ignored', message: 'Remote file not found' }
    ],
    expected: { shouldGenerate: true, reason: 'Has results (even if ignored)' }
  },
  {
    name: 'Only Errors',
    results: [
      { file: 'config1.json', status: 'error', message: 'Failed to parse JSON' },
      { file: 'config2.json', status: 'error', message: 'Network error' }
    ],
    expected: { shouldGenerate: true, reason: 'Has results (even if errors)' }
  },
  {
    name: 'Mixed Results',
    results: [
      { file: 'config1.json', status: 'different', differences: [{ kind: 'modified', description: 'Version changed' }] },
      { file: 'config2.json', status: 'identical', differences: [] },
      { file: 'config3.json', status: 'ignored', message: 'Remote file not found' },
      { file: 'config4.json', status: 'error', message: 'Failed to parse JSON' }
    ],
    expected: { shouldGenerate: true, reason: 'Has mixed results' }
  },
  {
    name: 'No Results',
    results: [],
    expected: { shouldGenerate: false, reason: 'No files to process' }
  }
];

// Function to simulate the old logic (only generate for differences)
function shouldGenerateReportOld(results) {
  const hasDifferences = results.some(r => r.status === 'different');
  const hasErrors = results.some(r => r.status === 'error');
  
  return hasDifferences || hasErrors;
}

// Function to simulate the new logic (always generate for any results)
function shouldGenerateReportNew(results) {
  return results.length > 0;
}

// Function to simulate the enhanced logic (generate for differences, errors, or ignored)
function shouldGenerateReportEnhanced(results) {
  const hasDifferences = results.some(r => r.status === 'different');
  const hasErrors = results.some(r => r.status === 'error');
  const hasIgnored = results.some(r => r.status === 'ignored');
  
  return hasDifferences || hasErrors || hasIgnored;
}

console.log('1. Testing Report Generation Logic:');
console.log('===================================');

testScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}:`);
  console.log('-'.repeat(50));
  console.log(`Results: ${scenario.results.length} files`);
  console.log(`  - Different: ${scenario.results.filter(r => r.status === 'different').length}`);
  console.log(`  - Identical: ${scenario.results.filter(r => r.status === 'identical').length}`);
  console.log(`  - Ignored: ${scenario.results.filter(r => r.status === 'ignored').length}`);
  console.log(`  - Errors: ${scenario.results.filter(r => r.status === 'error').length}`);
  
  const oldLogic = shouldGenerateReportOld(scenario.results);
  const newLogic = shouldGenerateReportNew(scenario.results);
  const enhancedLogic = shouldGenerateReportEnhanced(scenario.results);
  
  console.log(`\nOld Logic (differences/errors only): ${oldLogic ? '✅ Generate' : '❌ Skip'}`);
  console.log(`New Logic (any results): ${newLogic ? '✅ Generate' : '❌ Skip'}`);
  console.log(`Enhanced Logic (differences/errors/ignored): ${enhancedLogic ? '✅ Generate' : '❌ Skip'}`);
  
  const expected = scenario.expected.shouldGenerate;
  console.log(`Expected: ${expected ? '✅ Generate' : '❌ Skip'} (${scenario.expected.reason})`);
  
  // Check which logic matches the expected behavior
  const oldMatch = oldLogic === expected;
  const newMatch = newLogic === expected;
  const enhancedMatch = enhancedLogic === expected;
  
  console.log(`${oldMatch ? '✅' : '❌'} Old logic matches expected: ${oldMatch}`);
  console.log(`${newMatch ? '✅' : '❌'} New logic matches expected: ${newMatch}`);
  console.log(`${enhancedMatch ? '✅' : '❌'} Enhanced logic matches expected: ${enhancedMatch}`);
});

console.log('\n\n2. Testing Edge Cases:');
console.log('======================');

const edgeCases = [
  {
    name: 'Single Identical File',
    results: [{ file: 'config.json', status: 'identical', differences: [] }],
    expected: { shouldGenerate: true, reason: 'User should see that file was checked' }
  },
  {
    name: 'Single Ignored File',
    results: [{ file: 'config.json', status: 'ignored', message: 'Remote file not found' }],
    expected: { shouldGenerate: true, reason: 'User should see what was ignored' }
  },
  {
    name: 'Single Error File',
    results: [{ file: 'config.json', status: 'error', message: 'Failed to parse' }],
    expected: { shouldGenerate: true, reason: 'User should see the error' }
  }
];

edgeCases.forEach((edgeCase, index) => {
  console.log(`\n${index + 1}. ${edgeCase.name}:`);
  console.log('-'.repeat(40));
  
  const newLogic = shouldGenerateReportNew(edgeCase.results);
  const expected = edgeCase.expected.shouldGenerate;
  
  console.log(`New Logic: ${newLogic ? '✅ Generate' : '❌ Skip'}`);
  console.log(`Expected: ${expected ? '✅ Generate' : '❌ Skip'} (${edgeCase.expected.reason})`);
  console.log(`${newLogic === expected ? '✅' : '❌'} Matches expected: ${newLogic === expected}`);
});

console.log('\n\n3. Testing Real-World Scenarios:');
console.log('=================================');

const realWorldScenarios = [
  {
    name: 'All Files Identical (Success Case)',
    results: [
      { file: 'config/app.json', status: 'identical', differences: [] },
      { file: 'config/database.json', status: 'identical', differences: [] },
      { file: 'config/api.json', status: 'identical', differences: [] }
    ],
    description: 'User should get a report showing all files are up to date'
  },
  {
    name: 'Some Files Missing Remotely',
    results: [
      { file: 'config/app.json', status: 'identical', differences: [] },
      { file: 'config/new-feature.json', status: 'ignored', message: 'Remote file not found' },
      { file: 'config/experimental.json', status: 'ignored', message: 'Remote file not found' }
    ],
    description: 'User should get a report showing what was ignored'
  },
  {
    name: 'Mixed Success and Issues',
    results: [
      { file: 'config/app.json', status: 'identical', differences: [] },
      { file: 'config/database.json', status: 'different', differences: [{ kind: 'modified', description: 'Host changed' }] },
      { file: 'config/old-config.json', status: 'ignored', message: 'Remote file not found' }
    ],
    description: 'User should get a comprehensive report of all findings'
  }
];

realWorldScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}:`);
  console.log('-'.repeat(50));
  console.log(`Description: ${scenario.description}`);
  
  const newLogic = shouldGenerateReportNew(scenario.results);
  const oldLogic = shouldGenerateReportOld(scenario.results);
  
  console.log(`Old Logic: ${oldLogic ? '✅ Generate' : '❌ Skip'}`);
  console.log(`New Logic: ${newLogic ? '✅ Generate' : '❌ Skip'}`);
  
  console.log(`Recommendation: ${newLogic ? '✅ Always generate report' : '❌ Skip report generation'}`);
});

console.log('\n\n=== Summary ===');
console.log('===============');
console.log('✅ New logic: Always generate report when there are results');
console.log('✅ This ensures users always get a detailed report');
console.log('✅ Even identical files should be reported (shows what was checked)');
console.log('✅ Ignored files should be reported (shows what was skipped)');
console.log('✅ Errors should be reported (shows what failed)');

console.log('\n=== Key Benefits of Always Generating Reports ===');
console.log('==================================================');
console.log('• Users always get visibility into what was checked');
console.log('• Success cases are properly documented');
console.log('• Ignored files are clearly reported');
console.log('• Consistent user experience regardless of results');
console.log('• Better audit trail and transparency');
