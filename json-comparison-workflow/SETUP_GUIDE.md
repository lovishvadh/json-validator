# JSON Comparison Workflow Setup Guide

This guide will help you set up the JSON Comparison Workflow in your repository.

## 📋 Prerequisites

1. **GitHub Repository** with JSON files to compare
2. **Slack Workspace** with bot permissions
3. **GitHub Pages** enabled (for report hosting)

## 🚀 Quick Setup

### Step 1: Add the Workflow File

1. Copy `final-json-comparison-workflow.yml` to your repository
2. Place it in `.github/workflows/` directory
3. Rename it to `json-comparison.yml` (or any name you prefer)

### Step 2: Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions, and add:

```yaml
SLACK_BOT_USER_OAUTH_ACCESS_TOKEN: "xoxb-your-slack-bot-token"
```

**To get the Slack token:**
1. Go to https://api.slack.com/apps
2. Create a new app or use existing one
3. Go to "OAuth & Permissions"
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### Step 3: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. This will host your comparison reports

### Step 4: Configure Workflow (Optional)

Edit the workflow file to change default values:

```yaml
# Default values in workflow_dispatch inputs
folder_path: 'config'  # Change to your JSON folder
base_url: 'https://api.example.com/config'  # Change to your API base URL
slack_channel: '#json-comparison'  # Change to your Slack channel
```

## 🎯 Usage

### Manual Trigger

1. Go to your repository → Actions
2. Select "JSON Comparison Workflow"
3. Click "Run workflow"
4. Fill in the inputs:
   - **Folder Path**: Path to your JSON files (e.g., `config/`, `data/`)
   - **Base URL**: Your API base URL (e.g., `https://api.example.com/config`)
   - **Slack Channel**: Channel for notifications (e.g., `#alerts`)
   - **Comparison Mode**: `strict` or `lenient`
   - **Ignore Keys**: Comma-separated keys to ignore
   - **File Extensions**: File types to include (default: `json`)
   - **Recursive**: Scan subfolders (true/false)

### Scheduled Runs

The workflow runs daily at 9 AM UTC. To change the schedule:

```yaml
schedule:
  - cron: '0 9 * * *'  # Change this cron expression
```

## 📊 What Happens

1. **Scans** your specified folder for JSON files
2. **Fetches** corresponding files from your API
3. **Compares** local vs remote JSON files
4. **Generates** HTML report with differences
5. **Deploys** report to GitHub Pages
6. **Creates** pull request with report
7. **Sends** Slack notification with results

## 🔗 Report Access

- **GitHub Pages**: `https://your-username.github.io/your-repo/reports/`
- **Pull Request**: Automatically created for each run
- **Slack**: Direct links in notifications

## 🛠️ Customization

### Change Report URL

Update the report URLs in the workflow:

```yaml
# Find and replace these URLs
https://github.aexp.com/pages/amex-eng/json-validator/reports/
```

With your repository's GitHub Pages URL.

### Add More File Types

```yaml
file_extensions: 'json,jsonc,yaml,yml'
```

### Ignore Specific Keys

```yaml
ignore_keys: 'timestamp,version,lastModified'
```

## 🚨 Troubleshooting

### Common Issues

1. **"No JSON files found"**
   - Check folder path is correct
   - Ensure JSON files exist in the folder
   - Verify file extensions match

2. **"Slack notification failed"**
   - Check `SLACK_BOT_USER_OAUTH_ACCESS_TOKEN` secret
   - Verify Slack app has proper permissions
   - Ensure channel exists and bot is added

3. **"GitHub Pages deployment failed"**
   - Enable GitHub Pages in repository settings
   - Check repository permissions
   - Verify `GITHUB_TOKEN` is available

4. **"Remote file not found"**
   - Check base URL is correct
   - Verify API endpoints are accessible
   - Files not found are gracefully ignored

### Debug Mode

Add debug logging to the workflow:

```yaml
- name: Debug
  run: |
    echo "Folder: ${{ github.event.inputs.folder_path }}"
    echo "Base URL: ${{ github.event.inputs.base_url }}"
    ls -la ${{ github.event.inputs.folder_path }}
```

## 📝 Example Configuration

```yaml
# Example for a config management system
folder_path: 'config/environments'
base_url: 'https://config-api.company.com/environments'
slack_channel: '#config-alerts'
comparison_mode: 'strict'
ignore_keys: 'lastUpdated,timestamp'
file_extensions: 'json,jsonc'
recursive: 'true'
```

## 🎉 Success!

Once set up, you'll receive Slack notifications like:

```
✅ JSON Comparison Summary
Comparison Status: COMPLETED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Report: Click here to view the full report
Report Link: https://your-username.github.io/your-repo/reports/
For Developers
Branch: json-comparison-report-123
Report PR: #456
```

## 📞 Support

If you encounter issues:
1. Check the workflow logs in GitHub Actions
2. Verify all secrets are configured correctly
3. Test with a simple JSON file first
4. Contact your team's DevOps or automation team
