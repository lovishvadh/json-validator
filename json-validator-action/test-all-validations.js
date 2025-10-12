// Comprehensive test script for all validation types
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing JSON Validator - All Validation Types\n');

// Test 1: Duplicate Keys
console.log('📋 Test 1: Duplicate Keys');
const duplicateTest = {
  "name": "test",
  "version": "1.0.0",
  "name": "duplicate"
};
fs.writeFileSync('test-duplicate.json', JSON.stringify(duplicateTest, null, 2));

// Test 2: Invalid HTML
console.log('📋 Test 2: Invalid HTML');
const htmlTest = {
  "content": "<div><p>Unclosed paragraph",
  "valid": "<div><p>Valid HTML</p></div>"
};
fs.writeFileSync('test-invalid-html.json', JSON.stringify(htmlTest, null, 2));

// Test 3: Valid JSON
console.log('📋 Test 3: Valid JSON');
const validTest = {
  "name": "valid",
  "html": "<div><span>Properly closed</span></div>",
  "data": [1, 2, 3]
};
fs.writeFileSync('test-valid.json', JSON.stringify(validTest, null, 2));

// Test 4: Syntax Error
console.log('📋 Test 4: Syntax Error');
fs.writeFileSync('test-syntax.json', '{"broken": "json",}');

console.log('\n🚀 Running validation tests...\n');

// Run tests
const tests = [
  { file: 'test-duplicate.json', shouldFail: true, type: 'Duplicate Key' },
  { file: 'test-invalid-html.json', shouldFail: true, type: 'Invalid HTML' },
  { file: 'test-valid.json', shouldFail: false, type: 'Valid JSON' },
  { file: 'test-syntax.json', shouldFail: true, type: 'Syntax Error' }
];

let completedTests = 0;
let passedTests = 0;

tests.forEach((test, index) => {
  exec(`node validator.js ${test.file}`, (error, stdout, stderr) => {
    completedTests++;
    const failed = error && error.code === 1;
    const passed = failed === test.shouldFail;
    
    if (passed) {
      passedTests++;
      console.log(`✅ Test ${index + 1} (${test.type}): PASSED`);
    } else {
      console.log(`❌ Test ${index + 1} (${test.type}): FAILED`);
    }
    
    console.log(`   Expected to ${test.shouldFail ? 'fail' : 'pass'}, actually ${failed ? 'failed' : 'passed'}`);
    console.log(`   Output:\n${stdout || stderr}\n`);
    
    // Clean up test files
    if (completedTests === tests.length) {
      ['test-duplicate.json', 'test-invalid-html.json', 'test-valid.json', 'test-syntax.json'].forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
      
      console.log('\n' + '='.repeat(60));
      console.log(`📊 Test Summary: ${passedTests}/${tests.length} tests passed`);
      console.log('='.repeat(60));
      
      if (passedTests === tests.length) {
        console.log('✅ All tests passed!');
        process.exit(0);
      } else {
        console.log('❌ Some tests failed!');
        process.exit(1);
      }
    }
  });
});
