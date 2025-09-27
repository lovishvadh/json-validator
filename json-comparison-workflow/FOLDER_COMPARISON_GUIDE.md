# Folder-based JSON Comparison Guide

This guide explains how to use the updated JSON Comparison Workflow that compares all JSON files in a folder with remote URLs.

## 🎯 What's New

The workflow has been updated to support:

- **📁 Folder-based scanning**: Scans a specified folder for all JSON files
- **🌐 Remote URL comparison**: Compares local files with files fetched from URLs
- **🔄 Batch processing**: Processes multiple files in a single workflow run
- **📊 Summary reporting**: Provides comprehensive results for all files

## 🚀 Quick Start

### 1. Basic Setup

```yaml
name: JSON Comparison

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC

jobs:
  compare:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: your-username/json-comparison-workflow@v1
        with:
          folder-path: 'config'  # Folder to scan
          base-url: 'https://api.example.com/config'  # Base URL for remote files
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 2. How It Works

1. **Scans the folder**: Finds all JSON files in the specified folder
2. **Fetches remote files**: For each local file, fetches the corresponding remote file
3. **Compares files**: Compares local and remote JSON content
4. **Sends notifications**: Sends Slack notifications with results

### 3. File Mapping

The workflow maps local files to remote URLs like this:

- Local: `config/app.json`
- Remote: `https://api.example.com/config/app.json`

- Local: `config/database/settings.json`
- Remote: `https://api.example.com/config/database/settings.json`

## 📁 Folder Structure Examples

### Example 1: Simple Config Folder

```
config/
├── app.json
├── database.json
└── settings.json
```

**Workflow Configuration:**
```yaml
folder-path: 'config'
base-url: 'https://api.example.com/config'
```

**Remote URLs:**
- `https://api.example.com/config/app.json`
- `https://api.example.com/config/database.json`
- `https://api.example.com/config/settings.json`

### Example 2: Nested Structure

```
config/
├── app.json
├── database/
│   ├── settings.json
│   └── schema.json
└── api/
    └── endpoints.json
```

**Workflow Configuration:**
```yaml
folder-path: 'config'
base-url: 'https://api.example.com/config'
recursive: 'true'
```

**Remote URLs:**
- `https://api.example.com/config/app.json`
- `https://api.example.com/config/database/settings.json`
- `https://api.example.com/config/database/schema.json`
- `https://api.example.com/config/api/endpoints.json`

## ⚙️ Configuration Options

### Required Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `folder-path` | Local folder to scan | `config`, `data/schemas` |
| `base-url` | Base URL for remote files | `https://api.example.com/config` |
| `slack-webhook-url` | Slack webhook URL | `${{ secrets.SLACK_WEBHOOK_URL }}` |

### Optional Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `slack-channel` | Override Slack channel | - | `#alerts` |
| `comparison-mode` | Comparison strictness | `strict` | `lenient` |
| `ignore-keys` | Keys to ignore | - | `timestamp,version` |
| `file-extensions` | File extensions to include | `json` | `json,jsonc` |
| `recursive` | Scan subfolders | `false` | `true` |

## 🎯 Use Cases

### 1. Configuration Management

Compare local configuration files with production settings:

```yaml
- uses: your-username/json-comparison-workflow@v1
  with:
    folder-path: 'config'
    base-url: 'https://api.production.com/config'
    ignore-keys: 'timestamp,lastModified'
```

### 2. API Schema Validation

Compare local API schemas with deployed versions:

```yaml
- uses: your-username/json-comparison-workflow@v1
  with:
    folder-path: 'schemas'
    base-url: 'https://api.example.com/schemas'
    recursive: 'true'
    file-extensions: 'json,jsonc'
```

### 3. Data Schema Monitoring

Monitor data schemas across environments:

```yaml
- uses: your-username/json-comparison-workflow@v1
  with:
    folder-path: 'data/schemas'
    base-url: 'https://staging-api.example.com/schemas'
    comparison-mode: 'lenient'
```

## 📊 Slack Notifications

### Success (No Notification)

When all files are identical, no Slack notification is sent. The workflow will log:
```
✅ All JSON files are identical - no Slack notification sent
```

### Difference Alert

```
🤖 JSON Comparison Bot
🔄 JSON Comparison Alert

Folder: config
Current Branch: feature-branch
Base URL: https://api.example.com/config
Message: Found differences in 2 file(s)

Summary:
✅ Identical: 1
🔄 Different: 2
❌ Errors: 0

Files with Differences:
• config/app.json (3 differences)
• config/database.json (1 differences)

📊 Detailed Report:
A detailed HTML report has been generated with all differences.
Report saved to: reports/json-comparison-report-1703123456789.html
```

## 📄 HTML Report Generation

When differences are found, the workflow automatically generates a clean HTML report that can be shared with team members.

### Report Features

- **📊 Summary Statistics**: Shows counts of identical, different, and error files
- **📁 File-by-File Analysis**: Detailed breakdown for each file
- **🔍 Difference Details**: Clear listing of all differences found
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🎨 Clean Styling**: Professional appearance for sharing

### Report Location

Reports are saved to the `reports/` directory with timestamped filenames:
```
reports/json-comparison-report-1703123456789.html
```

### Report Contents

Each report includes:
- **Header**: Report title and generation timestamp
- **Summary Cards**: Visual statistics overview
- **File Sections**: Individual analysis for each file
- **Metadata**: Folder, branch, and URL information
- **Differences List**: Detailed change descriptions

### Sharing Reports

The HTML reports are self-contained and can be:
- **📧 Emailed** to team members
- **💬 Shared** in Slack or other chat platforms
- **🌐 Hosted** on web servers for team access
- **📱 Viewed** on any device with a web browser

## 🔧 Advanced Configuration

### Multiple Folder Monitoring

```yaml
name: Multi-Folder Comparison

on:
  schedule:
    - cron: '0 9 * * *'

jobs:
  compare-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: your-username/json-comparison-workflow@v1
        with:
          folder-path: 'config'
          base-url: 'https://api.example.com/config'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          slack-channel: '#config-alerts'
  
  compare-schemas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: your-username/json-comparison-workflow@v1
        with:
          folder-path: 'schemas'
          base-url: 'https://api.example.com/schemas'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          slack-channel: '#schema-alerts'
          recursive: 'true'
```

### Custom File Extensions

```yaml
- uses: your-username/json-comparison-workflow@v1
  with:
    folder-path: 'config'
    base-url: 'https://api.example.com/config'
    file-extensions: 'json,jsonc,json5'
    slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Ignoring Specific Keys

```yaml
- uses: your-username/json-comparison-workflow@v1
  with:
    folder-path: 'config'
    base-url: 'https://api.example.com/config'
    ignore-keys: 'timestamp,lastModified,version,buildNumber'
    comparison-mode: 'lenient'
    slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 🚨 Troubleshooting

### Common Issues

#### "No JSON files found in folder"
- **Cause**: The specified folder doesn't contain JSON files
- **Solution**: Check the folder path and ensure JSON files exist

#### "Failed to fetch remote file"
- **Cause**: Remote URL is not accessible or returns non-JSON content
- **Solution**: Verify the base URL and ensure remote files return valid JSON

#### "HTTP 404 when fetching"
- **Cause**: Remote file doesn't exist at the expected URL
- **Solution**: Check the base URL and file path mapping

### Debug Mode

Enable debug logging:

```yaml
- uses: your-username/json-comparison-workflow@v1
  env:
    ACTIONS_STEP_DEBUG: true
```

### Manual Testing

Test the workflow manually:

1. Go to **Actions** tab in your repository
2. Select **JSON Comparison**
3. Click **Run workflow**
4. Fill in the parameters:
   - `folder_path`: `config`
   - `base_url`: `https://api.example.com/config`
5. Click **Run workflow**

## 📋 Best Practices

1. **Use descriptive folder names**: `config`, `schemas`, `data`
2. **Set up proper base URLs**: Ensure remote URLs are accessible
3. **Configure ignore keys**: Ignore timestamps and version numbers
4. **Use appropriate schedules**: Don't run too frequently
5. **Set up proper Slack channels**: Use dedicated channels for different types of alerts
6. **Test manually first**: Verify the setup before enabling automatic runs

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/json-comparison-workflow/issues)
- **Documentation**: [README.md](README.md)
- **Quick Start**: [QUICK_START.md](QUICK_START.md)

---

*This workflow helps maintain consistency between local and remote JSON files by automatically detecting and reporting differences.*

