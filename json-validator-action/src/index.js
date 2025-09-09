const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require('@actions/exec');

async function run() {
  try {
    // Get inputs
    const strictMode = core.getInput('strict-mode') === 'true';
    const errorFormat = core.getInput('error-format');
    
    // Get GitHub context
    const context = github.context;
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    
    core.info('🔍 Starting JSON validation...');
    
    // Find JSON files in the PR
    const jsonFiles = await findJsonFiles();
    
    if (jsonFiles.length === 0) {
      core.info('ℹ️ No JSON files found in this PR');
      await createCheck(octokit, context, 'neutral', 'No JSON files to validate', 'No JSON files were modified in this pull request.');
      return;
    }
    
    core.info(`📁 Found ${jsonFiles.length} JSON file(s): ${jsonFiles.join(', ')}`);
    
    // Run validation
    core.info('🔍 Starting validation process...');
    const validationResult = await validateJsonFiles(jsonFiles);
    core.info(`📊 Validation completed. Has errors: ${validationResult.hasErrors}`);
    
    // Create GitHub check
    if (validationResult.hasErrors) {
      await createCheck(octokit, context, 'failure', 'JSON validation failed', validationResult.output);
      core.setFailed('JSON validation failed');
    } else {
      await createCheck(octokit, context, 'success', 'JSON validation passed', validationResult.output);
      core.info('✅ All JSON files are valid!');
    }
    
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

async function findJsonFiles() {
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
    // Find JSON files changed in the PR
    if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
      await exec('git', ['diff', '--name-only', `origin/${process.env.GITHUB_BASE_REF}...HEAD`], options);
    } else {
      await exec('git', ['diff', '--name-only', 'HEAD~1', 'HEAD'], options);
    }
    
    const allFiles = output.trim().split('\n').filter(file => file.trim());
    const jsonFiles = allFiles.filter(file => file.endsWith('.json'));
    
    return jsonFiles;
  } catch (err) {
    core.warning(`Failed to find JSON files: ${error}`);
    return [];
  }
}

async function validateJsonFiles(jsonFiles) {
  let output = '';
  let error = '';
  let exitCode = 0;
  
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
    const path = require('path');
    const validatorPath = path.join(__dirname, '..', 'validator.js');
    
    core.info(`🚀 Executing validation for files: ${jsonFiles.join(', ')}`);
    core.info(`📁 Using validator at: ${validatorPath}`);
    
    await exec('node', [validatorPath, ...jsonFiles], options);
    core.info('✅ Validation execution completed successfully');
  } catch (err) {
    core.error(`❌ Validation execution failed: ${err.message}`);
    exitCode = err.code || 1;
    output += error;
  }
  
  return {
    hasErrors: exitCode !== 0,
    output: output || error
  };
}


async function createCheck(octokit, context, conclusion, title, output) {
  try {
    await octokit.rest.checks.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      name: 'JSON Validation',
      head_sha: context.sha,
      status: 'completed',
      conclusion: conclusion,
      output: {
        title: title,
        summary: output,
        text: output
      }
    });
  } catch (error) {
    core.warning(`Failed to create GitHub check: ${error.message}`);
  }
}

// Run the action
run();
