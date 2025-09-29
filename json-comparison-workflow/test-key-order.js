// Test script to verify key order independence
const fs = require('fs');

// Test the deepCompare function
function deepCompare(obj1, obj2, path = []) {
  const differences = [];
  
  // Handle null/undefined cases
  if (obj1 === null && obj2 === null) return differences;
  if (obj1 === null || obj2 === null) {
    differences.push({
      path: path.join('.'),
      kind: 'E',
      lhs: obj1,
      rhs: obj2,
      description: `Value changed from ${JSON.stringify(obj1)} to ${JSON.stringify(obj2)}`
    });
    return differences;
  }
  
  // Handle different types
  if (typeof obj1 !== typeof obj2) {
    differences.push({
      path: path.join('.'),
      kind: 'E',
      lhs: obj1,
      rhs: obj2,
      description: `Type changed from ${typeof obj1} to ${typeof obj2}`
    });
    return differences;
  }
  
  // Handle primitives
  if (typeof obj1 !== 'object') {
    if (obj1 !== obj2) {
      differences.push({
        path: path.join('.'),
        kind: 'E',
        lhs: obj1,
        rhs: obj2,
        description: `Value changed from ${JSON.stringify(obj1)} to ${JSON.stringify(obj2)}`
      });
    }
    return differences;
  }
  
  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      differences.push({
        path: path.join('.'),
        kind: 'E',
        lhs: obj1,
        rhs: obj2,
        description: `Array length changed from ${obj1.length} to ${obj2.length}`
      });
      return differences;
    }
    
    for (let i = 0; i < obj1.length; i++) {
      const itemPath = [...path, i];
      differences.push(...deepCompare(obj1[i], obj2[i], itemPath));
    }
    return differences;
  }
  
  // Handle objects - compare all keys from both objects
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  
  for (const key of allKeys) {
    const keyPath = [...path, key];
    const hasKey1 = key in obj1;
    const hasKey2 = key in obj2;
    
    if (!hasKey1 && hasKey2) {
      // Key added
      differences.push({
        path: keyPath.join('.'),
        kind: 'N',
        lhs: undefined,
        rhs: obj2[key],
        description: `Property '${keyPath.join('.')}' was added`
      });
    } else if (hasKey1 && !hasKey2) {
      // Key removed
      differences.push({
        path: keyPath.join('.'),
        kind: 'D',
        lhs: obj1[key],
        rhs: undefined,
        description: `Property '${keyPath.join('.')}' was removed`
      });
    } else {
      // Key exists in both - compare values
      differences.push(...deepCompare(obj1[key], obj2[key], keyPath));
    }
  }
  
  return differences;
}

function compareJsonFiles(localJson, remoteJson, options = {}) {
  // Use deep comparison that ignores key order completely
  const differences = deepCompare(localJson, remoteJson);
  
  if (differences.length === 0) {
    return { identical: true, differences: [] };
  }
  
  return {
    identical: false,
    differences: differences.map(d => ({
      path: d.path,
      kind: d.kind,
      description: d.description
    }))
  };
}

// Test cases
console.log('=== Testing Key Order Independence ===\n');

// Test 1: Same content, different key order
const local1 = { a: 1, b: 2, c: 3 };
const remote1 = { b: 2, a: 1, c: 3 };
const result1 = compareJsonFiles(local1, remote1);
console.log('Test 1 - Same content, different key order:');
console.log('Local:', JSON.stringify(local1));
console.log('Remote:', JSON.stringify(remote1));
console.log('Result:', result1.identical ? 'IDENTICAL' : 'DIFFERENT');
if (!result1.identical) {
  console.log('Differences:', result1.differences);
}
console.log('');

// Test 2: Different content
const local2 = { a: 1, b: 2, c: 3 };
const remote2 = { a: 1, b: 2, c: 4 };
const result2 = compareJsonFiles(local2, remote2);
console.log('Test 2 - Different content:');
console.log('Local:', JSON.stringify(local2));
console.log('Remote:', JSON.stringify(remote2));
console.log('Result:', result2.identical ? 'IDENTICAL' : 'DIFFERENT');
if (!result2.identical) {
  console.log('Differences:', result2.differences);
}
console.log('');

// Test 3: Missing key
const local3 = { a: 1, b: 2, c: 3 };
const remote3 = { a: 1, b: 2 };
const result3 = compareJsonFiles(local3, remote3);
console.log('Test 3 - Missing key:');
console.log('Local:', JSON.stringify(local3));
console.log('Remote:', JSON.stringify(remote3));
console.log('Result:', result3.identical ? 'IDENTICAL' : 'DIFFERENT');
if (!result3.identical) {
  console.log('Differences:', result3.differences);
}
console.log('');

// Test 4: Nested objects
const local4 = { user: { name: 'John', age: 30 }, active: true };
const remote4 = { active: true, user: { age: 30, name: 'John' } };
const result4 = compareJsonFiles(local4, remote4);
console.log('Test 4 - Nested objects, different key order:');
console.log('Local:', JSON.stringify(local4));
console.log('Remote:', JSON.stringify(remote4));
console.log('Result:', result4.identical ? 'IDENTICAL' : 'DIFFERENT');
if (!result4.identical) {
  console.log('Differences:', result4.differences);
}
console.log('');

console.log('=== Test Complete ===');
