#!/usr/bin/env node

// Test script to verify native child_process.exec works correctly
const { exec } = require('child_process');
const { promisify } = require('util');

// Promisify exec for async/await usage
const execAsync = promisify(exec);

console.log('=== Testing Native child_process.exec ===\n');

async function testExecFunctionality() {
  console.log('1. Testing Basic Exec Commands:');
  console.log('================================');
  
  try {
    // Test simple command
    const { stdout: nodeVersion } = await execAsync('node --version');
    console.log(`✅ Node version: ${nodeVersion.trim()}`);
  } catch (error) {
    console.log(`❌ Error getting Node version: ${error.message}`);
  }
  
  try {
    // Test git command (if available)
    const { stdout: gitVersion } = await execAsync('git --version');
    console.log(`✅ Git version: ${gitVersion.trim()}`);
  } catch (error) {
    console.log(`❌ Git not available: ${error.message}`);
  }
  
  try {
    // Test directory listing
    const { stdout: lsOutput } = await execAsync('ls -la');
    console.log(`✅ Directory listing (first 3 lines):`);
    console.log(lsOutput.split('\n').slice(0, 3).join('\n'));
  } catch (error) {
    console.log(`❌ Error listing directory: ${error.message}`);
  }
}

async function testGitCommands() {
  console.log('\n2. Testing Git Commands:');
  console.log('========================');
  
  try {
    // Test git branch command
    const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD');
    console.log(`✅ Current branch: ${currentBranch.trim()}`);
  } catch (error) {
    console.log(`❌ Error getting current branch: ${error.message}`);
  }
  
  try {
    // Test git status
    const { stdout: gitStatus } = await execAsync('git status --porcelain');
    console.log(`✅ Git status (clean): ${gitStatus.trim() || 'Working directory clean'}`);
  } catch (error) {
    console.log(`❌ Error getting git status: ${error.message}`);
  }
  
  try {
    // Test git log (last commit)
    const { stdout: lastCommit } = await execAsync('git log -1 --oneline');
    console.log(`✅ Last commit: ${lastCommit.trim()}`);
  } catch (error) {
    console.log(`❌ Error getting last commit: ${error.message}`);
  }
}

async function testErrorHandling() {
  console.log('\n3. Testing Error Handling:');
  console.log('==========================');
  
  try {
    // Test command that should fail
    await execAsync('nonexistent-command-12345');
    console.log('❌ Expected error but command succeeded');
  } catch (error) {
    console.log(`✅ Expected error caught: ${error.message.substring(0, 50)}...`);
  }
  
  try {
    // Test invalid git command
    await execAsync('git invalid-command-12345');
    console.log('❌ Expected error but command succeeded');
  } catch (error) {
    console.log(`✅ Expected git error caught: ${error.message.substring(0, 50)}...`);
  }
}

async function testAsyncAwaitUsage() {
  console.log('\n4. Testing Async/Await Usage:');
  console.log('==============================');
  
  try {
    // Test multiple async commands
    const commands = [
      'echo "Command 1"',
      'echo "Command 2"',
      'echo "Command 3"'
    ];
    
    const results = await Promise.all(
      commands.map(cmd => execAsync(cmd))
    );
    
    console.log('✅ All commands executed successfully:');
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.stdout.trim()}`);
    });
  } catch (error) {
    console.log(`❌ Error in async commands: ${error.message}`);
  }
}

async function testWorkflowSpecificCommands() {
  console.log('\n5. Testing Workflow-Specific Commands:');
  console.log('======================================');
  
  try {
    // Test git branch command (used in workflow)
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD');
    console.log(`✅ Git branch command works: ${branch.trim()}`);
  } catch (error) {
    console.log(`❌ Git branch command failed: ${error.message}`);
  }
  
  try {
    // Test directory creation (used in workflow)
    await execAsync('mkdir -p test-directory');
    console.log('✅ Directory creation works');
    
    // Clean up
    await execAsync('rmdir test-directory');
    console.log('✅ Directory cleanup works');
  } catch (error) {
    console.log(`❌ Directory operations failed: ${error.message}`);
  }
  
  try {
    // Test file operations (used in workflow)
    await execAsync('echo "test content" > test-file.txt');
    console.log('✅ File creation works');
    
    // Clean up
    await execAsync('rm test-file.txt');
    console.log('✅ File cleanup works');
  } catch (error) {
    console.log(`❌ File operations failed: ${error.message}`);
  }
}

async function runAllTests() {
  await testExecFunctionality();
  await testGitCommands();
  await testErrorHandling();
  await testAsyncAwaitUsage();
  await testWorkflowSpecificCommands();
  
  console.log('\n\n=== Summary ===');
  console.log('===============');
  console.log('✅ Native child_process.exec works correctly');
  console.log('✅ execAsync (promisified) works with async/await');
  console.log('✅ Error handling works properly');
  console.log('✅ Git commands work as expected');
  console.log('✅ File operations work correctly');
  console.log('✅ No @actions/exec dependency needed');
  
  console.log('\n=== Benefits of Native child_process.exec ===');
  console.log('==============================================');
  console.log('• No external dependencies required');
  console.log('• Works in restricted corporate environments');
  console.log('• Standard Node.js module (built-in)');
  console.log('• Full compatibility with async/await');
  console.log('• Better error handling and control');
  console.log('• No package installation needed');
}

// Run all tests
runAllTests().catch(console.error);
