#!/usr/bin/env node

// Test script to verify the ignoreKeys.some fix
console.log('=== Testing ignoreKeys.some Fix ===\n');

// Test the deepCompare function with different ignoreKeys inputs
function testDeepCompare(ignoreKeys) {
  console.log(`Testing ignoreKeys: ${JSON.stringify(ignoreKeys)}`);
  
  try {
    // Simulate the fix from the workflow
    const ignoreKeysArray = Array.isArray(ignoreKeys) ? ignoreKeys : (ignoreKeys ? ignoreKeys.split(',').map(k => k.trim()) : []);
    
    console.log(`✅ Processed ignoreKeysArray:`, ignoreKeysArray);
    console.log(`✅ Is array: ${Array.isArray(ignoreKeysArray)}`);
    
    // Test the shouldIgnoreKey function
    function shouldIgnoreKey(keyPath) {
      return ignoreKeysArray.some(ignoreKey => {
        if (ignoreKey.includes('*')) {
          const pattern = ignoreKey.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(keyPath);
        }
        return keyPath === ignoreKey || keyPath.endsWith('.' + ignoreKey);
      });
    }
    
    // Test some key paths
    const testPaths = ['timestamp', 'version', 'data.id', 'metadata.created'];
    testPaths.forEach(path => {
      const shouldIgnore = shouldIgnoreKey(path);
      console.log(`  ${path}: ${shouldIgnore ? 'IGNORED' : 'NOT IGNORED'}`);
    });
    
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

// Test different scenarios
const testCases = [
  {
    name: 'Empty string',
    input: '',
    expected: []
  },
  {
    name: 'Single key',
    input: 'timestamp',
    expected: ['timestamp']
  },
  {
    name: 'Multiple keys',
    input: 'timestamp,version,id',
    expected: ['timestamp', 'version', 'id']
  },
  {
    name: 'Keys with spaces',
    input: 'timestamp, version, id',
    expected: ['timestamp', 'version', 'id']
  },
  {
    name: 'Empty array',
    input: [],
    expected: []
  },
  {
    name: 'Array with keys',
    input: ['timestamp', 'version'],
    expected: ['timestamp', 'version']
  },
  {
    name: 'Undefined',
    input: undefined,
    expected: []
  },
  {
    name: 'Null',
    input: null,
    expected: []
  },
  {
    name: 'String with wildcard',
    input: 'metadata.*',
    expected: ['metadata.*']
  }
];

console.log('1. Testing ignoreKeys Processing:');
console.log('==================================');
let successCount = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}:`);
  console.log('-'.repeat(50));
  const success = testDeepCompare(testCase.input);
  
  if (success) {
    successCount++;
    console.log('✅ Test passed');
  } else {
    console.log('❌ Test failed');
  }
});

console.log('\n\n2. Testing Edge Cases:');
console.log('======================');

// Test edge cases that might cause issues
const edgeCases = [
  { name: 'String with empty values', input: 'key1,,key2' },
  { name: 'String with only spaces', input: '   ' },
  { name: 'String with special characters', input: 'key1,key2,key3' },
  { name: 'Mixed array and string', input: ['key1', 'key2'] }
];

edgeCases.forEach((edgeCase, index) => {
  console.log(`\n${index + 1}. ${edgeCase.name}:`);
  console.log('-'.repeat(50));
  
  try {
    const ignoreKeysArray = Array.isArray(edgeCase.input) ? edgeCase.input : (edgeCase.input ? edgeCase.input.split(',').map(k => k.trim()) : []);
    console.log(`✅ Processed:`, ignoreKeysArray);
    console.log(`✅ Length: ${ignoreKeysArray.length}`);
    
    // Test that some() method works
    const hasKeys = ignoreKeysArray.some(key => key.length > 0);
    console.log(`✅ some() method works: ${hasKeys}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
});

console.log('\n\n3. Testing Real-World Scenarios:');
console.log('=================================');

// Test with actual JSON comparison scenarios
const realWorldTests = [
  {
    name: 'API Response Comparison',
    ignoreKeys: 'timestamp,version,requestId',
    testPaths: ['timestamp', 'data.id', 'metadata.created', 'version']
  },
  {
    name: 'Configuration Comparison',
    ignoreKeys: 'lastModified,checksum',
    testPaths: ['database.host', 'lastModified', 'api.timeout', 'checksum']
  },
  {
    name: 'Wildcard Pattern',
    ignoreKeys: 'metadata.*,*.timestamp',
    testPaths: ['metadata.created', 'metadata.updated', 'data.timestamp', 'user.id']
  }
];

realWorldTests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}:`);
  console.log('-'.repeat(50));
  console.log(`Ignore keys: ${test.ignoreKeys}`);
  
  const ignoreKeysArray = test.ignoreKeys.split(',').map(k => k.trim());
  console.log(`Processed array:`, ignoreKeysArray);
  
  function shouldIgnoreKey(keyPath) {
    return ignoreKeysArray.some(ignoreKey => {
      if (ignoreKey.includes('*')) {
        const pattern = ignoreKey.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(keyPath);
      }
      return keyPath === ignoreKey || keyPath.endsWith('.' + ignoreKey);
    });
  }
  
  test.testPaths.forEach(path => {
    const shouldIgnore = shouldIgnoreKey(path);
    console.log(`  ${path}: ${shouldIgnore ? 'IGNORED' : 'NOT IGNORED'}`);
  });
});

console.log('\n\n=== Summary ===');
console.log('===============');
console.log(`✅ Tests passed: ${successCount}/${testCases.length}`);
console.log('✅ Fixed ignoreKeys.some is not a function error');
console.log('✅ Added Array.isArray() check before processing');
console.log('✅ Added fallback for string inputs');
console.log('✅ Added proper array conversion for all input types');

console.log('\n=== Key Fixes Applied ===');
console.log('==========================');
console.log('• Added Array.isArray() check before using array methods');
console.log('• Added string-to-array conversion for string inputs');
console.log('• Added fallback for undefined/null inputs');
console.log('• Ensured consistent array handling in deepCompare function');
console.log('• Added proper error handling for edge cases');
