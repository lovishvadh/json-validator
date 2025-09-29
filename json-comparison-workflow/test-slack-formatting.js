// Test script to see how Slack formatting looks
function createSlackSummary(results) {
  const differentFiles = results.filter(r => r.status === 'different');
  const errorFiles = results.filter(r => r.status === 'error');
  
  let summary = '';
  
  // Only show files with actual issues (differences or errors)
  if (differentFiles.length > 0) {
    summary += `🚨 *Files with Changes (${differentFiles.length}):*`;
    summary += `\n\n`;
    
    differentFiles.forEach((file, index) => {
      summary += `*${index + 1}. ${file.file}*`;
      summary += `\n`;
      summary += `Found ${file.differences.length} change(s):`;
      summary += `\n`;
      
      // Show first 3 differences with proper formatting
      file.differences.slice(0, 3).forEach((diff, diffIndex) => {
        const icon = diff.kind === 'added' ? '➕' : diff.kind === 'removed' ? '➖' : '🔄';
        summary += `${diffIndex + 1}. ${icon} ${diff.description}`;
        summary += `\n`;
      });
      
      if (file.differences.length > 3) {
        summary += `... and ${file.differences.length - 3} more changes`;
        summary += `\n`;
      }
      
      summary += `\n`;
    });
  }
  
  if (errorFiles.length > 0) {
    summary += `⚠️ *Files with Problems (${errorFiles.length}):*`;
    summary += `\n\n`;
    
    errorFiles.forEach((file, index) => {
      summary += `*${index + 1}. ${file.file}*`;
      summary += `\n`;
      summary += `❌ ${file.message}`;
      summary += `\n\n`;
    });
  }
  
  // If no issues, show success message
  if (differentFiles.length === 0 && errorFiles.length === 0) {
    summary += `✅ *All files are up to date!*`;
    summary += `\n`;
    summary += `No changes found in any configuration files.`;
    summary += `\n\n`;
  }
  
  return summary.trim();
}

// Test data
const testResults = [
  {
    file: 'config/app.json',
    status: 'different',
    differences: [
      { kind: 'modified', description: "Property 'version' was changed from '1.0.0' to '1.1.0'" },
      { kind: 'added', description: "Property 'features.debug' was added" },
      { kind: 'removed', description: "Property 'features.legacy' was removed" }
    ]
  },
  {
    file: 'config/database.json',
    status: 'different',
    differences: [
      { kind: 'modified', description: "Property 'host' was changed from 'localhost' to 'prod-db.company.com'" }
    ]
  }
];

console.log('=== Slack Message Format Test ===\n');
console.log('Raw output:');
console.log('---');
const slackMessage = createSlackSummary(testResults);
console.log(slackMessage);
console.log('---\n');

console.log('Formatted for Slack:');
console.log('---');
console.log(slackMessage.replace(/\n/g, '\\n'));
console.log('---\n');

console.log('Character codes:');
console.log('---');
slackMessage.split('').forEach((char, index) => {
  if (char === '\n') {
    console.log(`${index}: \\n`);
  } else {
    console.log(`${index}: '${char}'`);
  }
});
console.log('---');
