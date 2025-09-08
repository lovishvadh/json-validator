#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting JSON Validator with Proxy Server...\n');

// Start the proxy server
console.log('📡 Starting proxy server...');
const proxyServer = spawn('node', ['proxy-server.js'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe']
});

proxyServer.stdout.on('data', (data) => {
  console.log(`[PROXY] ${data.toString().trim()}`);
});

proxyServer.stderr.on('data', (data) => {
  console.error(`[PROXY ERROR] ${data.toString().trim()}`);
});

// Wait for proxy server to start
setTimeout(() => {
  console.log('\n✅ Proxy server started successfully');
  console.log('🔍 Running JSON validation...\n');
  
  // Set environment variables for the validator
  const validatorEnv = {
    ...process.env,
    USE_PROXY: 'true',
    PROXY_URL: 'http://localhost:3000'
  };
  
  // Start the validator
  const validator = spawn('node', ['validator.js'], {
    cwd: __dirname,
    env: validatorEnv,
    stdio: 'inherit'
  });
  
  validator.on('close', (code) => {
    console.log(`\n📊 Validation completed with exit code: ${code}`);
    
    // Clean up proxy server
    proxyServer.kill();
    console.log('🛑 Proxy server stopped');
    
    process.exit(code);
  });
  
  validator.on('error', (error) => {
    console.error('❌ Validator error:', error);
    proxyServer.kill();
    process.exit(1);
  });
  
}, 3000); // Wait 3 seconds for proxy server to start

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  proxyServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  proxyServer.kill();
  process.exit(0);
});
