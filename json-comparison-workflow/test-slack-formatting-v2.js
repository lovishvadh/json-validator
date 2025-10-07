#!/usr/bin/env node

// Test script for improved Slack message formatting
const fs = require('fs');

// Mock results data
const mockResults = [
  {
    file: 'en_gb/View-all-cards.json',
    status: 'different',
    differences: [
      {
        kind: 'modified',
        description: 'Property \'title\' was changed from \'Old Title\' to \'New Title\''
      },
      {
        kind: 'added',
        description: 'Property \'description\' was added with value \'New description field\''
      }
    ]
  },
  {
    file: 'config/database.json',
    status: 'different',
    differences: [
      {
        kind: 'modified',
        description: 'Property \'host\' was changed from \'localhost\' to \'prod-db.company.com\''
      }
    ]
  },
  {
    file: 'api/settings.json',
    status: 'error',
    message: 'Failed to fetch remote file: 404 Not Found'
  }
];

// Mock the createSlackSummary function
function createSlackSummary(results) {
  const differentFiles = results.filter(r => r.status === 'different');
  const errorFiles = results.filter(r => r.status === 'error');
  
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
  
  // If no issues, show success message
  if (differentFiles.length === 0 && errorFiles.length === 0) {
    summary += `\n\n✅ All files are up to date!`;
    summary += `\nNo changes found in any configuration files.`;
  }
  
  return summary.trim();
}

// Test with long description
const mockResultsWithLongDescription = [
  {
    file: 'config/app.json',
    status: 'different',
    differences: [
      {
        kind: 'modified',
        description: 'Property \'very.long.nested.property.name.that.would.normally.make.the.message.too.long.and.hard.to.read.in.Slack.especially.on.mobile.devices\' was changed from \'This is a very long value that would normally make the message too long and hard to read in Slack especially on mobile devices where space is limited\' to \'New value\''
      }
    ]
  }
];

console.log('=== Testing Improved Slack Message Formatting ===\n');

console.log('1. Normal Results:');
console.log('==================');
const normalSummary = createSlackSummary(mockResults);
console.log(normalSummary);

console.log('\n\n2. Results with Long Descriptions (Truncated):');
console.log('===============================================');
const longSummary = createSlackSummary(mockResultsWithLongDescription);
console.log(longSummary);

console.log('\n\n3. Success Case (No Issues):');
console.log('=============================');
const successSummary = createSlackSummary([]);
console.log(successSummary);

console.log('\n\n=== Full Slack Message Preview ===');
console.log('===================================');
console.log('🔍 *Configuration Check Complete*');
console.log('');
console.log('📁 *What was checked:* `config`');
console.log('🌐 *Source:* `https://api.example.com/config`');
console.log('⏰ *Checked at:* `2024-12-21T14:30:45Z`');
console.log('');
console.log(normalSummary);
console.log('');
console.log('📊 *Detailed report attached below*');
console.log('');
console.log('_Need help? Reply in this channel or contact the team._');

console.log('\n\n=== Key Improvements ===');
console.log('========================');
console.log('✅ File names are now bold with *filename*');
console.log('✅ Line breaks added before each file (\\n\\n)');
console.log('✅ Long descriptions truncated to 100 characters');
console.log('✅ HTML report attached as file instead of link');
console.log('✅ Better visual hierarchy and readability');
