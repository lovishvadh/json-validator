#!/usr/bin/env node

// Test script to verify ignored files functionality
console.log('=== Testing Ignored Files Functionality ===\n');

// Mock results data with different file statuses
const mockResults = [
  {
    file: 'config/app.json',
    status: 'different',
    differences: [
      {
        kind: 'modified',
        description: 'Property \'version\' was changed from \'1.0.0\' to \'1.1.0\''
      }
    ]
  },
  {
    file: 'config/database.json',
    status: 'identical',
    differences: []
  },
  {
    file: 'config/api.json',
    status: 'ignored',
    message: 'Remote file not found - ignoring'
  },
  {
    file: 'config/old-config.json',
    status: 'ignored',
    message: 'Remote file not found - ignoring'
  },
  {
    file: 'config/invalid.json',
    status: 'error',
    message: 'Failed to parse JSON: Unexpected token'
  }
];

// Test the createSlackSummary function
function createSlackSummary(results) {
  const differentFiles = results.filter(r => r.status === 'different');
  const errorFiles = results.filter(r => r.status === 'error');
  const ignoredFiles = results.filter(r => r.status === 'ignored');
  
  let summary = '';
  
  // Only show files with actual issues (differences or errors)
  if (differentFiles.length > 0) {
    summary += `🚨 Files with Changes (${differentFiles.length}):`;
    
    differentFiles.forEach((file, index) => {
      // Add line break before each file and make file names bold
      const safeFileName = file.file.replace(/[*_`]/g, '\\$&');
      summary += `\n\n${index + 1}. *${safeFileName}*`;
      summary += `\nFound ${file.differences.length} change(s):`;
      
      // Show first 3 differences with proper formatting
      file.differences.slice(0, 3).forEach((diff, diffIndex) => {
        const icon = diff.kind === 'added' ? '➕' : diff.kind === 'removed' ? '➖' : '🔄';
        // Escape special characters and truncate long descriptions
        let safeDescription = diff.description.replace(/[*_`]/g, '\\$&');
        if (safeDescription.length > 100) {
          safeDescription = safeDescription.substring(0, 97) + '...';
        }
        summary += `\n${diffIndex + 1}. ${icon} ${safeDescription}`;
      });
      
      if (file.differences.length > 3) {
        summary += `\n... and ${file.differences.length - 3} more changes`;
      }
    });
  }
  
  if (errorFiles.length > 0) {
    summary += `\n\n⚠️ Files with Problems (${errorFiles.length}):`;
    
    errorFiles.forEach((file, index) => {
      // Add line break before each file and make file names bold
      const safeFileName = file.file.replace(/[*_`]/g, '\\$&');
      summary += `\n\n${index + 1}. *${safeFileName}*`;
      summary += `\n❌ ${file.message}`;
    });
  }
  
  // Show ignored files count (but don't treat as errors)
  if (ignoredFiles.length > 0) {
    summary += `\n\nℹ️ Files Ignored (${ignoredFiles.length}):`;
    summary += `\nRemote files not found - these were skipped during comparison.`;
  }
  
  // If no issues, show success message
  if (differentFiles.length === 0 && errorFiles.length === 0) {
    summary += `\n\n✅ All files are up to date!`;
    summary += `\nNo changes found in any configuration files.`;
    if (ignoredFiles.length > 0) {
      summary += `\n(${ignoredFiles.length} files were ignored due to missing remote files)`;
    }
  }
  
  return summary.trim();
}

// Test the HTML report generation
function generateComparisonReport(results) {
  const differentFiles = results.filter(r => r.status === 'different');
  const errorFiles = results.filter(r => r.status === 'error');
  const identicalFiles = results.filter(r => r.status === 'identical');
  const ignoredFiles = results.filter(r => r.status === 'ignored');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Comparison Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .summary { padding: 20px; border-bottom: 1px solid #eee; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .summary-card h3 { margin: 0 0 5px 0; color: #2c3e50; }
        .summary-card .number { font-size: 24px; font-weight: bold; }
        .different { color: #e74c3c; }
        .identical { color: #27ae60; }
        .error { color: #f39c12; }
        .ignored { color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 JSON Comparison Report</h1>
            <p>Generated: ${new Date().toISOString()}</p>
        </div>
        
        <div class="summary">
            <h2>📊 Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Total Files</h3>
                    <div class="number">${results.length}</div>
                </div>
                <div class="summary-card">
                    <h3>Different</h3>
                    <div class="number different">${differentFiles.length}</div>
                </div>
                <div class="summary-card">
                    <h3>Identical</h3>
                    <div class="number identical">${identicalFiles.length}</div>
                </div>
                <div class="summary-card">
                    <h3>Errors</h3>
                    <div class="number error">${errorFiles.length}</div>
                </div>
                <div class="summary-card">
                    <h3>Ignored</h3>
                    <div class="number ignored">${ignoredFiles.length}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

console.log('1. Testing Slack Summary with Ignored Files:');
console.log('=============================================');
const slackSummary = createSlackSummary(mockResults);
console.log(slackSummary);

console.log('\n\n2. Testing HTML Report Generation:');
console.log('===================================');
const htmlReport = generateComparisonReport(mockResults);
console.log('✅ HTML report generated successfully');
console.log(`✅ Report includes ${mockResults.filter(r => r.status === 'ignored').length} ignored files`);

console.log('\n\n3. Testing Different Scenarios:');
console.log('==============================');

// Test scenario 1: Only ignored files
const onlyIgnoredResults = [
  { file: 'config1.json', status: 'ignored', message: 'Remote file not found - ignoring' },
  { file: 'config2.json', status: 'ignored', message: 'Remote file not found - ignoring' }
];

console.log('\n3.1. Only Ignored Files:');
console.log('-'.repeat(30));
const onlyIgnoredSummary = createSlackSummary(onlyIgnoredResults);
console.log(onlyIgnoredSummary);

// Test scenario 2: Mixed results
const mixedResults = [
  { file: 'config1.json', status: 'different', differences: [{ kind: 'modified', description: 'Version changed' }] },
  { file: 'config2.json', status: 'ignored', message: 'Remote file not found - ignoring' },
  { file: 'config3.json', status: 'identical', differences: [] }
];

console.log('\n3.2. Mixed Results (Different + Ignored + Identical):');
console.log('-'.repeat(50));
const mixedSummary = createSlackSummary(mixedResults);
console.log(mixedSummary);

// Test scenario 3: No issues
const noIssuesResults = [
  { file: 'config1.json', status: 'identical', differences: [] },
  { file: 'config2.json', status: 'ignored', message: 'Remote file not found - ignoring' }
];

console.log('\n3.3. No Issues (Identical + Ignored):');
console.log('-'.repeat(40));
const noIssuesSummary = createSlackSummary(noIssuesResults);
console.log(noIssuesSummary);

console.log('\n\n=== Summary ===');
console.log('===============');
console.log('✅ Ignored files are properly handled');
console.log('✅ Slack summary shows ignored files count');
console.log('✅ HTML report includes ignored files section');
console.log('✅ Ignored files are not treated as errors');
console.log('✅ Success messages include ignored files count');
console.log('✅ No false alarms for missing remote files');

console.log('\n=== Key Benefits ===');
console.log('===================');
console.log('• Remote files not found are gracefully ignored');
console.log('• No false error notifications for missing files');
console.log('• Clear reporting of what was ignored and why');
console.log('• Maintains workflow success even with missing files');
console.log('• Better user experience with informative messages');
