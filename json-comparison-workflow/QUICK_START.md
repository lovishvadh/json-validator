# Quick Start Guide

Get up and running with JSON Comparison Workflow in 5 minutes!

## 🚀 Quick Setup

### 1. Create Slack Webhook

1. Go to your Slack workspace
2. Navigate to **Apps** → **Incoming Webhooks**
3. Click **Add to Slack**
4. Choose a channel (you can change this later)
5. Copy the webhook URL

### 2. Add Repository Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Name | Value |
|------|-------|
| `SLACK_WEBHOOK_URL` | Your Slack webhook URL |
| `SLACK_CHANNEL` | (Optional) Channel override like `#alerts` |

### 3. Create Workflow File

Create `.github/workflows/json-comparison.yml`:

```yaml
name: JSON Comparison

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  
  workflow_dispatch:  # Manual trigger
    inputs:
      target_branch:
        description: 'Target branch'
        required: true
        default: 'main'
      json_file_path:
        description: 'JSON file path'
        required: true
        default: 'config.json'

permissions:
  contents: read

jobs:
  compare:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: JSON Comparison
        uses: your-username/json-comparison-workflow@v1
        with:
          target-branch: ${{ github.event.inputs.target_branch || 'main' }}
          json-file-path: ${{ github.event.inputs.json_file_path || 'config.json' }}
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          slack-channel: ${{ secrets.SLACK_CHANNEL }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 4. Test It!

1. **Manual Test**: Go to Actions → JSON Comparison → Run workflow
2. **Schedule Test**: Wait for the scheduled time or modify the cron to run sooner
3. **Check Slack**: Look for notifications in your configured channel (only sent for differences/errors)

## 🎯 Common Use Cases

### Compare Configuration Files

```yaml
- name: Compare Config
  uses: your-username/json-comparison-workflow@v1
  with:
    target-branch: 'main'
    json-file-path: 'config/app.json'
    slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Compare Data Schemas

```yaml
- name: Compare Schema
  uses: your-username/json-comparison-workflow@v1
  with:
    target-branch: 'main'
    json-file-path: 'schemas/user.json'
    slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    ignore-keys: 'version,timestamp'
```

### Multiple Files

```yaml
jobs:
  compare-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: your-username/json-comparison-workflow@v1
        with:
          target-branch: 'main'
          json-file-path: 'config/app.json'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          slack-channel: '#config-alerts'
  
  compare-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: your-username/json-comparison-workflow@v1
        with:
          target-branch: 'main'
          json-file-path: 'data/schema.json'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          slack-channel: '#data-alerts'
```

## ⚡ Schedule Examples

```yaml
# Every day at 9 AM UTC
- cron: '0 9 * * *'

# Every 6 hours
- cron: '0 */6 * * *'

# Every weekday at 8 AM UTC
- cron: '0 8 * * 1-5'

# Every 15 minutes (for testing)
- cron: '*/15 * * * *'
```

## 🔧 Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `target-branch` | Branch to compare against | `main`, `develop` |
| `json-file-path` | Path to JSON file | `config.json`, `data/schema.json` |
| `comparison-mode` | Comparison strictness | `strict`, `lenient` |
| `ignore-keys` | Keys to ignore | `timestamp,version` |

## 🚨 Troubleshooting

### No notifications in Slack?
- ✅ Check webhook URL is correct
- ✅ Verify channel permissions
- ✅ Check GitHub Actions logs
- ✅ **Note**: Notifications are only sent for differences/errors, not for successful comparisons

### Workflow not running?
- ✅ Check cron schedule syntax
- ✅ Verify repository has the workflow file
- ✅ Check GitHub Actions permissions

### File not found errors?
- ✅ Ensure JSON file exists in both branches
- ✅ Check file path is correct
- ✅ Verify file permissions

## 📞 Need Help?

- 📖 **Full Documentation**: [README.md](README.md)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/your-username/json-comparison-workflow/issues)
- 💬 **Ask Questions**: [GitHub Discussions](https://github.com/your-username/json-comparison-workflow/discussions)

---

*You're all set! Your JSON files will now be automatically compared and you'll get Slack notifications when differences are detected.*
