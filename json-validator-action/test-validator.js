// Simple test script to verify the validator works
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a test JSON file with an error
const testJson = `{
  "name": "test",
  "version": "1.0.0",
  "name": "duplicate"
}`;

const testFile = 'test.json';
fs.writeFileSync(testFile, testJson);

console.log('🧪 Testing JSON validator...\n');

// Test the validator
exec(`node validator.js ${testFile}`, (error, stdout, stderr) => {
  console.log('STDOUT:', stdout);
  console.log('STDERR:', stderr);
  console.log('Exit code:', error ? error.code : 0);
  
  // Clean up
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }
  
  if (error && error.code === 1) {
    console.log('✅ Test passed - validator correctly detected duplicate key');
  } else {
    console.log('❌ Test failed - validator should have detected duplicate key');
  }
});
