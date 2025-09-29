// Debug script to test the exact comparison logic from the workflow
const fs = require('fs');

// Exact copy of the functions from the workflow
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

// Test with your exact example
console.log('=== Debugging Your Specific Case ===\n');

const local = { a: 1, b: 2, c: 3 };
const remote = { b: 2, a: 1, c: 3 };

console.log('Local JSON:', JSON.stringify(local, null, 2));
console.log('Remote JSON:', JSON.stringify(remote, null, 2));
console.log('Are they the same object?', local === remote);
console.log('JSON.stringify comparison:', JSON.stringify(local) === JSON.stringify(remote));

const result = compareJsonFiles(local, remote);
console.log('\nComparison Result:');
console.log('Identical:', result.identical);
console.log('Differences count:', result.differences.length);

if (!result.identical) {
  console.log('\nDifferences found:');
  result.differences.forEach((diff, index) => {
    console.log(`${index + 1}. ${diff.description}`);
  });
} else {
  console.log('✅ Objects are identical despite different key order!');
}

// Test with more complex case
console.log('\n=== Testing Complex Case ===\n');

const localComplex = {
  name: "John",
  age: 30,
  address: {
    street: "123 Main St",
    city: "New York",
    zip: "10001"
  },
  hobbies: ["reading", "swimming"]
};

const remoteComplex = {
  address: {
    zip: "10001",
    street: "123 Main St", 
    city: "New York"
  },
  hobbies: ["reading", "swimming"],
  age: 30,
  name: "John"
};

console.log('Local Complex:', JSON.stringify(localComplex, null, 2));
console.log('Remote Complex:', JSON.stringify(remoteComplex, null, 2));

const resultComplex = compareJsonFiles(localComplex, remoteComplex);
console.log('\nComplex Comparison Result:');
console.log('Identical:', resultComplex.identical);
console.log('Differences count:', resultComplex.differences.length);

if (!resultComplex.identical) {
  console.log('\nDifferences found:');
  resultComplex.differences.forEach((diff, index) => {
    console.log(`${index + 1}. ${diff.description}`);
  });
} else {
  console.log('✅ Complex objects are identical despite different key order!');
}
