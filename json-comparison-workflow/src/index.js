const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require('@actions/exec');
const { WebClient } = require('@slack/web-api');
const diff = require('deep-diff');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { generateAndSaveReport } = require('./report-generator');

async function run() {
  try {
    // Get inputs
    const folderPath = core.getInput('folder-path', { required: true });
    const baseUrl = core.getInput('base-url', { required: true });
    const slackWebhookUrl = core.getInput('slack-webhook-url', { required: true });
    const slackChannel = core.getInput('slack-channel');
    const comparisonMode = core.getInput('comparison-mode') || 'strict';
    const ignoreKeys = core.getInput('ignore-keys') || '';
    const fileExtensions = core.getInput('file-extensions') || 'json';
    const recursive = core.getInput('recursive') === 'true';
    
    // Get GitHub context
    const context = github.context;
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    
    core.info('🔍 Starting JSON comparison workflow...');
    core.info(`📁 Scanning folder: ${folderPath}`);
    core.info(`🌐 Base URL: ${baseUrl}`);
    
    // Get current branch
    const currentBranch = await getCurrentBranch();
    core.info(`🌿 Current branch: ${currentBranch}`);
    
    // Find all JSON files in the folder
    const jsonFiles = await findJsonFilesInFolder(folderPath, fileExtensions.split(','), recursive);
    
    if (jsonFiles.length === 0) {
      core.warning(`⚠️ No JSON files found in folder: ${folderPath}`);
      await sendSlackNotification(slackWebhookUrl, slackChannel, {
        type: 'warning',
        title: 'JSON Comparison Warning',
        message: `No JSON files found in folder: ${folderPath}`,
        folder: folderPath,
        currentBranch
      });
      return;
    }
    
    core.info(`📄 Found ${jsonFiles.length} JSON file(s): ${jsonFiles.join(', ')}`);
    
    // Compare each JSON file
    const results = [];
    let hasDifferences = false;
    
    for (const jsonFile of jsonFiles) {
      core.info(`🔍 Comparing file: ${jsonFile}`);
      
      try {
        // Read local JSON file
        const localJson = await readJsonFile(jsonFile);
        if (!localJson) {
          core.warning(`⚠️ Failed to read local file: ${jsonFile}`);
          results.push({
            file: jsonFile,
            status: 'error',
            message: 'Failed to read local file'
          });
          continue;
        }
        
        // Fetch remote JSON file
        const remoteUrl = `${baseUrl}/${jsonFile}`;
        const remoteJson = await fetchJsonFromUrl(remoteUrl);
        
        if (!remoteJson) {
          core.warning(`⚠️ Failed to fetch remote file: ${remoteUrl}`);
          results.push({
            file: jsonFile,
            status: 'error',
            message: 'Failed to fetch remote file'
          });
          continue;
        }
        
        // Compare JSON files
        const comparisonResult = compareJsonFiles(localJson, remoteJson, {
          mode: comparisonMode,
          ignoreKeys: ignoreKeys.split(',').map(key => key.trim()).filter(key => key)
        });
        
        if (comparisonResult.areEqual) {
          core.info(`✅ ${jsonFile} - Files are identical`);
          results.push({
            file: jsonFile,
            status: 'identical',
            message: 'Files are identical'
          });
        } else {
          core.warning(`⚠️ ${jsonFile} - Files differ`);
          hasDifferences = true;
          results.push({
            file: jsonFile,
            status: 'different',
            message: 'Files differ',
            differences: comparisonResult.differences
          });
        }
        
      } catch (error) {
        core.error(`❌ Error comparing ${jsonFile}: ${error.message}`);
        results.push({
          file: jsonFile,
          status: 'error',
          message: `Error: ${error.message}`
        });
      }
    }
    
    // Generate HTML report for differences
    let reportPath = null;
    if (hasDifferences) {
      try {
        const reportData = {
          folder: folderPath,
          currentBranch,
          baseUrl,
          results,
          timestamp: new Date().toISOString()
        };
        
        const reportFileName = `json-comparison-report-${Date.now()}.html`;
        const reportDir = path.join(process.cwd(), 'reports');
        reportPath = path.join(reportDir, reportFileName);
        
        await generateAndSaveReport(reportData, reportPath);
        core.info(`📊 HTML report generated: ${reportPath}`);
      } catch (error) {
        core.warning(`⚠️ Failed to generate HTML report: ${error.message}`);
      }
    }
    
    // Send summary notification only for failures and differences
    if (hasDifferences) {
      await sendSlackNotification(slackWebhookUrl, slackChannel, {
        type: 'difference',
        title: 'JSON Comparison Alert',
        message: `Found differences in ${results.filter(r => r.status === 'different').length} file(s)`,
        folder: folderPath,
        currentBranch,
        baseUrl,
        results: results,
        reportPath: reportPath
      });
    } else {
      core.info('✅ All JSON files are identical - no Slack notification sent');
    }
    
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
    await sendSlackNotification(
      core.getInput('slack-webhook-url'),
      core.getInput('slack-channel'),
      {
        type: 'error',
        title: 'JSON Comparison Error',
        message: `Workflow failed: ${error.message}`,
        folder: core.getInput('folder-path'),
        currentBranch: await getCurrentBranch().catch(() => 'unknown'),
        baseUrl: core.getInput('base-url')
      }
    );
  }
}

async function getCurrentBranch() {
  let output = '';
  const options = {
    listeners: {
      stdout: (data) => {
        output += data.toString();
      }
    }
  };
  
  try {
    await exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], options);
    return output.trim();
  } catch (error) {
    // Fallback to GitHub context
    const context = github.context;
    return context.ref.replace('refs/heads/', '');
  }
}

async function findJsonFilesInFolder(folderPath, extensions, recursive = false) {
  const jsonFiles = [];
  
  function scanDirectory(dirPath, relativePath = '') {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativeItemPath = relativePath ? path.join(relativePath, item) : item;
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && recursive) {
          scanDirectory(fullPath, relativeItemPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (extensions.some(extension => ext === `.${extension}`)) {
            jsonFiles.push(relativeItemPath);
          }
        }
      }
    } catch (error) {
      core.warning(`Failed to scan directory ${dirPath}: ${error.message}`);
    }
  }
  
  scanDirectory(folderPath);
  return jsonFiles;
}

async function fetchJsonFromUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const request = client.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } else {
            core.warning(`HTTP ${response.statusCode} when fetching ${url}`);
            resolve(null);
          }
        } catch (error) {
          core.warning(`Failed to parse JSON from ${url}: ${error.message}`);
          resolve(null);
        }
      });
    });
    
    request.on('error', (error) => {
      core.warning(`Failed to fetch ${url}: ${error.message}`);
      resolve(null);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      core.warning(`Timeout fetching ${url}`);
      resolve(null);
    });
  });
}

async function checkFileExists(filePath) {
  try {
    const fs = require('fs');
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

async function checkFileExistsInBranch(filePath, branch) {
  let output = '';
  let error = '';
  
  const options = {
    listeners: {
      stdout: (data) => {
        output += data.toString();
      },
      stderr: (data) => {
        error += data.toString();
      }
    }
  };
  
  try {
    await exec('git', ['ls-tree', '-r', '--name-only', `origin/${branch}`], options);
    const files = output.trim().split('\n');
    return files.includes(filePath);
  } catch (err) {
    core.warning(`Failed to check file existence in branch ${branch}: ${error}`);
    return false;
  }
}

async function readJsonFile(filePath) {
  try {
    const fs = require('fs');
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    core.error(`Failed to read JSON file ${filePath}: ${error.message}`);
    return null;
  }
}

async function readJsonFileFromBranch(filePath, branch) {
  let output = '';
  let error = '';
  
  const options = {
    listeners: {
      stdout: (data) => {
        output += data.toString();
      },
      stderr: (data) => {
        error += data.toString();
      }
    }
  };
  
  try {
    await exec('git', ['show', `origin/${branch}:${filePath}`], options);
    return JSON.parse(output);
  } catch (err) {
    core.error(`Failed to read JSON file from branch ${branch}: ${error}`);
    return null;
  }
}

function compareJsonFiles(current, target, options = {}) {
  const { mode = 'strict', ignoreKeys = [] } = options;
  
  // Create filtered copies if ignore keys are specified
  let currentFiltered = current;
  let targetFiltered = target;
  
  if (ignoreKeys.length > 0) {
    currentFiltered = filterKeys(current, ignoreKeys);
    targetFiltered = filterKeys(target, ignoreKeys);
  }
  
  const differences = diff(currentFiltered, targetFiltered);
  
  if (!differences || differences.length === 0) {
    return { areEqual: true, differences: [] };
  }
  
  // Format differences for better readability
  const formattedDifferences = differences.map(diffItem => {
    return formatDifference(diffItem);
  });
  
  return {
    areEqual: false,
    differences: formattedDifferences
  };
}

function filterKeys(obj, keysToIgnore) {
  if (Array.isArray(obj)) {
    return obj.map(item => filterKeys(item, keysToIgnore));
  } else if (obj && typeof obj === 'object') {
    const filtered = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!keysToIgnore.includes(key)) {
        filtered[key] = filterKeys(value, keysToIgnore);
      }
    }
    return filtered;
  }
  return obj;
}

function formatDifference(diffItem) {
  const { kind, path, lhs, rhs } = diffItem;
  
  let description = '';
  const pathStr = path ? path.join('.') : 'root';
  
  switch (kind) {
    case 'N':
      description = `Added: ${pathStr} = ${JSON.stringify(rhs)}`;
      break;
    case 'D':
      description = `Removed: ${pathStr} = ${JSON.stringify(lhs)}`;
      break;
    case 'E':
      description = `Changed: ${pathStr} from ${JSON.stringify(lhs)} to ${JSON.stringify(rhs)}`;
      break;
    case 'A':
      description = `Array change at ${pathStr}`;
      break;
    default:
      description = `Unknown change at ${pathStr}`;
  }
  
  return {
    kind,
    path: pathStr,
    description,
    oldValue: lhs,
    newValue: rhs
  };
}

async function sendSlackNotification(webhookUrl, channel, data) {
  try {
    const { type, title, message, folder, currentBranch, baseUrl, results, reportPath } = data;
    
    let color = '#36a64f'; // Green for success
    let emoji = '✅';
    
    switch (type) {
      case 'success':
        color = '#36a64f';
        emoji = '✅';
        break;
      case 'warning':
        color = '#ff9500';
        emoji = '⚠️';
        break;
      case 'difference':
        color = '#ff6b6b';
        emoji = '🔄';
        break;
      case 'error':
        color = '#ff0000';
        emoji = '❌';
        break;
    }
    
    const slackMessage = {
      channel: channel || undefined,
      username: 'JSON Comparison Bot',
      icon_emoji: ':robot_face:',
      attachments: [
        {
          color: color,
          title: `${emoji} ${title}`,
          fields: [
            {
              title: 'Folder',
              value: `\`${folder}\``,
              short: true
            },
            {
              title: 'Current Branch',
              value: `\`${currentBranch}\``,
              short: true
            },
            {
              title: 'Base URL',
              value: `\`${baseUrl}\``,
              short: true
            },
            {
              title: 'Message',
              value: message,
              short: false
            }
          ],
          footer: 'JSON Comparison Workflow',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
    
    // Add results summary if available
    if (results && results.length > 0) {
      const identicalCount = results.filter(r => r.status === 'identical').length;
      const differentCount = results.filter(r => r.status === 'different').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      slackMessage.attachments[0].fields.push({
        title: 'Summary',
        value: `✅ Identical: ${identicalCount}\n🔄 Different: ${differentCount}\n❌ Errors: ${errorCount}`,
        short: true
      });
      
      // Add detailed results for different files
      const differentFiles = results.filter(r => r.status === 'different');
      if (differentFiles.length > 0) {
        const differencesText = differentFiles
          .slice(0, 5) // Limit to first 5 files
          .map(result => {
            const diffCount = result.differences ? result.differences.length : 0;
            return `• \`${result.file}\` (${diffCount} differences)`;
          })
          .join('\n');
        
        slackMessage.attachments[0].fields.push({
          title: 'Files with Differences',
          value: differencesText + (differentFiles.length > 5 ? '\n... and more' : ''),
          short: false
        });
      }
      
      // Add report information if available
      if (reportPath) {
        slackMessage.attachments[0].fields.push({
          title: '📊 Detailed Report',
          value: `A detailed HTML report has been generated with all differences.\nReport saved to: \`${reportPath}\``,
          short: false
        });
      }
    }
    
    // Send to Slack using webhook
    const https = require('https');
    const url = require('url');
    
    const parsedUrl = url.parse(webhookUrl);
    const postData = JSON.stringify(slackMessage);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            core.info('✅ Slack notification sent successfully');
            resolve();
          } else {
            core.warning(`⚠️ Slack notification failed with status ${res.statusCode}: ${data}`);
            resolve();
          }
        });
      });
      
      req.on('error', (error) => {
        core.warning(`⚠️ Failed to send Slack notification: ${error.message}`);
        resolve();
      });
      
      req.write(postData);
      req.end();
    });
    
  } catch (error) {
    core.warning(`⚠️ Failed to send Slack notification: ${error.message}`);
  }
}

// Run the action
run();
