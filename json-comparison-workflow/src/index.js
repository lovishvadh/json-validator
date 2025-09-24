const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require('@actions/exec');
const { WebClient } = require('@slack/web-api');
const diff = require('deep-diff');

async function run() {
  try {
    // Get inputs
    const targetBranch = core.getInput('target-branch', { required: true });
    const jsonFilePath = core.getInput('json-file-path', { required: true });
    const slackWebhookUrl = core.getInput('slack-webhook-url', { required: true });
    const slackChannel = core.getInput('slack-channel');
    const comparisonMode = core.getInput('comparison-mode') || 'strict';
    const ignoreKeys = core.getInput('ignore-keys') || '';
    
    // Get GitHub context
    const context = github.context;
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    
    core.info('🔍 Starting JSON comparison workflow...');
    core.info(`📁 Comparing file: ${jsonFilePath}`);
    core.info(`🌿 Target branch: ${targetBranch}`);
    
    // Get current branch
    const currentBranch = await getCurrentBranch();
    core.info(`🌿 Current branch: ${currentBranch}`);
    
    // Check if file exists in both branches
    const fileExistsInCurrent = await checkFileExists(jsonFilePath);
    const fileExistsInTarget = await checkFileExistsInBranch(jsonFilePath, targetBranch);
    
    if (!fileExistsInCurrent) {
      core.warning(`⚠️ File ${jsonFilePath} does not exist in current branch`);
      await sendSlackNotification(slackWebhookUrl, slackChannel, {
        type: 'warning',
        title: 'JSON Comparison Warning',
        message: `File ${jsonFilePath} does not exist in current branch (${currentBranch})`,
        file: jsonFilePath,
        currentBranch,
        targetBranch
      });
      return;
    }
    
    if (!fileExistsInTarget) {
      core.warning(`⚠️ File ${jsonFilePath} does not exist in target branch (${targetBranch})`);
      await sendSlackNotification(slackWebhookUrl, slackChannel, {
        type: 'warning',
        title: 'JSON Comparison Warning',
        message: `File ${jsonFilePath} does not exist in target branch (${targetBranch})`,
        file: jsonFilePath,
        currentBranch,
        targetBranch
      });
      return;
    }
    
    // Read and parse JSON files
    const currentJson = await readJsonFile(jsonFilePath);
    const targetJson = await readJsonFileFromBranch(jsonFilePath, targetBranch);
    
    if (!currentJson || !targetJson) {
      core.error('❌ Failed to read or parse JSON files');
      return;
    }
    
    // Compare JSON files
    const comparisonResult = compareJsonFiles(currentJson, targetJson, {
      mode: comparisonMode,
      ignoreKeys: ignoreKeys.split(',').map(key => key.trim()).filter(key => key)
    });
    
    if (comparisonResult.areEqual) {
      core.info('✅ JSON files are identical');
      await sendSlackNotification(slackWebhookUrl, slackChannel, {
        type: 'success',
        title: 'JSON Comparison Success',
        message: `Files are identical between ${currentBranch} and ${targetBranch}`,
        file: jsonFilePath,
        currentBranch,
        targetBranch
      });
    } else {
      core.warning('⚠️ JSON files differ');
      await sendSlackNotification(slackWebhookUrl, slackChannel, {
        type: 'difference',
        title: 'JSON Comparison Alert',
        message: `Files differ between ${currentBranch} and ${targetBranch}`,
        file: jsonFilePath,
        currentBranch,
        targetBranch,
        differences: comparisonResult.differences
      });
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
        file: core.getInput('json-file-path'),
        currentBranch: await getCurrentBranch().catch(() => 'unknown'),
        targetBranch: core.getInput('target-branch')
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
    const { type, title, message, file, currentBranch, targetBranch, differences } = data;
    
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
              title: 'File',
              value: `\`${file}\``,
              short: true
            },
            {
              title: 'Current Branch',
              value: `\`${currentBranch}\``,
              short: true
            },
            {
              title: 'Target Branch',
              value: `\`${targetBranch}\``,
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
    
    // Add differences if available
    if (differences && differences.length > 0) {
      const differencesText = differences
        .slice(0, 10) // Limit to first 10 differences
        .map(diff => `• ${diff.description}`)
        .join('\n');
      
      slackMessage.attachments[0].fields.push({
        title: 'Differences',
        value: differencesText + (differences.length > 10 ? '\n... and more' : ''),
        short: false
      });
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
