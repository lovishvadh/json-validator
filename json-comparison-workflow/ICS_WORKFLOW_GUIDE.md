# ICS JSON Comparison Workflow Guide

This guide explains how to use the ICS JSON Comparison Workflow, which follows the same structure as the ICS PZN test workflow for consistency and familiarity.

## 🚀 Workflow Overview

The **ICS JSON Comparison Workflow** is a GitHub Actions workflow that:
- Compares JSON files from a local folder with remote URLs
- Generates detailed HTML reports with side-by-side comparison
- Sends Slack notifications for success/failure
- Deploys reports to GitHub Pages
- Creates pull requests for report updates

## 📋 Workflow Inputs

### Required Inputs

| Input | Description | Default | Type |
|-------|-------------|---------|------|
| `folder_path` | Folder path to scan for JSON files | `config` | string |
| `base_url` | Base URL for remote JSON files | `https://api.example.com/config` | string |
| `slack_channel` | Slack channel for notifications | `C03SA9S4A4X` | string |

### Optional Inputs

| Input | Description | Default | Type | Options |
|-------|-------------|---------|------|---------|
| `comparison_mode` | Comparison mode | `strict` | choice | strict, lenient |
| `ignore_keys` | Keys to ignore during comparison | `` | string | comma-separated |
| `file_extensions` | File extensions to include | `json` | string | comma-separated |
| `recursive` | Scan subfolders recursively | `false` | boolean | true/false |
| `runs` | Number of parallel comparison runs | `1` | number | 1+ |

## 🔧 Setup Requirements

### GitHub Secrets

The workflow requires the following secrets to be configured:

```yaml
secrets:
  SLACK_BOT_USER_OAUTH_ACCESS_TOKEN: "xoxb-..."
  GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}" # Auto-provided
```

**Note**: The workflow uses the existing `amex-eng/github-actions-slack@v1.1.0` action for Slack notifications, so no webhook URL is needed.

### Repository Structure

```
your-repo/
├── json-comparison-workflow/
│   ├── src/
│   │   ├── index.js
│   │   └── report-generator.js
│   ├── package.json
│   └── action.yml
├── config/                    # Example folder to compare
│   ├── app.json
│   ├── database.json
│   └── settings.json
└── .github/workflows/
    └── ics-json-comparison-workflow.yml
```

## 🎯 Usage Examples

### Basic Usage

```yaml
# Compare config folder with remote API
folder_path: "config"
base_url: "https://api.example.com/config"
slack_channel: "C03SA9S4A4X"
```

### Advanced Usage

```yaml
# Compare with specific settings
folder_path: "config"
base_url: "https://api.example.com/config"
comparison_mode: "lenient"
ignore_keys: "timestamp,version"
file_extensions: "json,jsonc"
recursive: true
slack_channel: "C03SA9S4A4X"
```

### Multiple Runs

```yaml
# Run comparison 3 times in parallel
folder_path: "config"
base_url: "https://api.example.com/config"
runs: 3
slack_channel: "C03SA9S4A4X"
```

## 📊 Workflow Jobs

### 1. Input Logger Job
- **Purpose**: Logs workflow inputs and sets up matrix for parallel runs
- **Runner**: `aexp-ubuntu-latest-small`
- **Outputs**: Matrix for parallel execution

### 2. JSON Comparison Job
- **Purpose**: Main comparison logic and report generation
- **Runner**: `aexp-ubuntu-latest-medium`
- **Dependencies**: Input Logger
- **Steps**:
  - Checkout code
  - Setup Node.js
  - Install dependencies
  - Build JSON Comparison Action
  - Run JSON Comparison
  - Generate HTML Report
  - Deploy to GitHub Pages
  - Create Pull Request
  - Send Slack Notifications

## 🔔 Slack Notifications

### Success Notification
```
✅ JSON Comparison Summary
Comparison Status: COMPLETED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Report: Click here to view the full report
Report Link: https://github.aexp.com/pages/amex-eng/json-validator/reports/
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
```

### Failure Notification
```
❌ JSON Comparison Summary
Comparison Status: FAILED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Job ID: 1234567890
Report: Click here to view the full report
Report Link: https://github.aexp.com/pages/amex-eng/json-validator/reports/
```

## 📄 Generated Reports

### HTML Report Features
- **Side-by-Side Comparison**: Local vs Remote JSON
- **Tab Switching**: Full JSON vs Differences Only
- **Syntax Highlighting**: Color-coded JSON values
- **Line Numbers**: Easy reference for specific lines
- **Diff Indicators**: Visual markers for changes
- **Synchronized Scrolling**: Panels scroll together
- **Responsive Design**: Works on all devices

### Report Location
- **GitHub Pages**: `https://github.aexp.com/pages/amex-eng/json-validator/reports/`
- **Pull Request**: Automatically created for report updates
- **Branch**: `json-comparison-report-{run_number}`

### Missing File Handling
- **404 Errors**: Files not found on remote URL are gracefully ignored
- **No Errors**: Missing files don't cause workflow failures
- **Logging**: Missing files are logged as informational messages
- **Comparison**: Only existing files are compared

## 🛠️ Troubleshooting

### Common Issues

1. **Missing Secrets**
   - Ensure `SLACK_BOT_USER_OAUTH_ACCESS_TOKEN` is configured
   - Check Slack app permissions

2. **File Not Found**
   - Verify `folder_path` exists in repository
   - Check file permissions and structure

3. **Remote URL Issues**
   - Ensure `base_url` is accessible
   - Check network connectivity and authentication

4. **Report Generation Failed**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for errors

### Debug Steps

1. **Check Workflow Logs**
   - Review job execution logs
   - Look for error messages in steps

2. **Verify Inputs**
   - Ensure all required inputs are provided
   - Check input format and values

3. **Test Locally**
   - Run comparison action locally
   - Verify report generation works

4. **Check Permissions**
   - Ensure GitHub token has required permissions
   - Verify Slack app has channel access

## 📈 Best Practices

### Input Configuration
- Use descriptive folder paths
- Set appropriate comparison modes
- Configure ignore keys for noise reduction
- Use recursive scanning for nested structures

### Slack Integration
- Use dedicated channels for notifications
- Configure appropriate notification levels
- Set up proper error handling

### Report Management
- Review generated reports regularly
- Use pull requests for report updates
- Archive old reports as needed

### Performance Optimization
- Use parallel runs for large comparisons
- Configure appropriate runners
- Monitor resource usage

## 🔗 Related Documentation

- [JSON Comparison Workflow README](README.md)
- [Folder Comparison Guide](FOLDER_COMPARISON_GUIDE.md)
- [Sample Reports](SAMPLE_REPORTS.md)
- [Quick Start Guide](QUICK_START.md)

## 📞 Support

For questions or issues with the ICS JSON Comparison Workflow:
- Reply in the configured Slack channel
- Contact the JSON Comparison team
- Review the workflow logs for detailed error information
- Check the generated reports for comparison results
