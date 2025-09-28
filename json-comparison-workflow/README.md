# JSON Comparison Workflow

A powerful GitHub Action that automatically compares JSON files from a local folder with remote URLs on a schedule and sends Slack notifications when differences are detected.

## 🚀 Features

- ⏰ **Scheduled Execution**: Runs automatically on a cron schedule (configurable)
- 📁 **Folder-based Comparison**: Scans a folder and compares all JSON files with remote URLs
- 🌐 **Remote URL Integration**: Fetches JSON files from any HTTP/HTTPS URL
- 📱 **Slack Integration**: Sends rich notifications to Slack channels
- 🎯 **Flexible Configuration**: Supports different comparison modes and key filtering
- 🤖 **Manual Triggering**: Can be triggered manually with custom parameters
- 📊 **Detailed Reporting**: Shows exact differences between JSON files
- 📄 **HTML Report Generation**: Creates clean HTML reports for sharing differences
- 🛡️ **Error Handling**: Graceful handling of missing files and parsing errors
- 🔍 **Recursive Scanning**: Option to scan subfolders recursively

## 📦 Installation

### Option 1: Use as GitHub Action (Recommended)

Create `.github/workflows/json-comparison.yml` in your repository:

```yaml
name: JSON Comparison Scheduler

on:
  # Run daily at 9 AM UTC
  schedule:
    - cron: '0 9 * * *'
  
  # Allow manual triggering
  workflow_dispatch:
    inputs:
      folder_path:
        description: 'Folder path to scan for JSON files'
        required: true
        default: 'config'
        type: string
      base_url:
        description: 'Base URL for remote JSON files'
        required: true
        default: 'https://api.example.com/config'
        type: string

permissions:
  contents: read
  actions: read

jobs:
  compare-json:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: JSON Comparison
        uses: your-username/json-comparison-workflow@v1
        with:
          folder-path: ${{ github.event.inputs.folder_path || 'config' }}
          base-url: ${{ github.event.inputs.base_url || 'https://api.example.com/config' }}
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          slack-channel: ${{ secrets.SLACK_CHANNEL }}
          comparison-mode: 'strict'
          ignore-keys: 'timestamp,lastModified'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Option 2: Use Standalone Workflow

Copy the `standalone-workflow.yml` file to your `.github/workflows/` directory and customize as needed.

## ⚙️ Configuration

### Required Secrets

Add these secrets to your repository settings:

| Secret | Description | Required |
|--------|-------------|----------|
| `SLACK_WEBHOOK_URL` | Slack webhook URL for notifications | Yes |
| `GITHUB_TOKEN` | GitHub token (usually provided automatically) | Yes |

### Optional Secrets

| Secret | Description | Required |
|--------|-------------|----------|
| `SLACK_CHANNEL` | Override default Slack channel | No |

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `folder-path` | Folder path to scan for JSON files | Yes | `config` |
| `base-url` | Base URL for remote JSON files | Yes | - |
| `slack-webhook-url` | Slack webhook URL (optional - workflow can handle notifications) | No | - |
| `slack-channel` | Slack channel override | No | - |
| `comparison-mode` | Comparison mode (strict\|lenient) | No | `strict` |
| `ignore-keys` | Comma-separated keys to ignore | No | - |
| `file-extensions` | Comma-separated file extensions | No | `json` |
| `recursive` | Scan subfolders recursively | No | `false` |

## 🎯 Usage Examples

### Basic Daily Comparison

```yaml
name: Daily JSON Comparison

on:
  schedule:
    - cron: '0 9 * * *'  # Every day at 9 AM UTC

jobs:
  compare:
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
```

### Multiple Folder Comparison

```yaml
name: Multi-Folder JSON Comparison

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

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
  
  compare-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: your-username/json-comparison-workflow@v1
        with:
          folder-path: 'data'
          base-url: 'https://api.example.com/data'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          slack-channel: '#data-alerts'
```

### Ignoring Specific Keys

```yaml
- uses: your-username/json-comparison-workflow@v1
  with:
    folder-path: 'config'
    base-url: 'https://api.example.com/config'
    slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    ignore-keys: 'timestamp,lastModified,version'
    comparison-mode: 'lenient'
```

### Recursive Folder Scanning

```yaml
- uses: your-username/json-comparison-workflow@v1
  with:
    folder-path: 'config'
    base-url: 'https://api.example.com/config'
    slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    recursive: 'true'
    file-extensions: 'json,jsonc'
```

## 📊 Slack Notification Examples

### ✅ Success (No Notification)

When all files are identical, no Slack notification is sent. The workflow will log:
```
✅ All JSON files are identical - no Slack notification sent
```

### ⚠️ Difference Alert

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

### ❌ Error Notification

```
🤖 JSON Comparison Bot
❌ JSON Comparison Error

Folder: config
Current Branch: feature-branch
Base URL: https://api.example.com/config
Message: Workflow failed: Failed to fetch remote file: https://api.example.com/config/app.json
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

## 🔧 Comparison Modes

### Strict Mode (Default)
- Compares all keys and values exactly
- Detects additions, removals, and changes
- Most sensitive to differences

### Lenient Mode
- More forgiving of minor differences
- Useful for configuration files with timestamps
- Can be combined with `ignore-keys` for fine control

## 🛠️ Development

### Building the Action

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Run tests
npm test

# Package for distribution
npm run package
```

### Project Structure

```
json-comparison-workflow/
├── action.yml              # Action metadata
├── package.json            # Dependencies and scripts
├── src/
│   └── index.js           # Main action code
├── dist/                  # Built action (generated)
├── scheduled-comparison.yml  # Example scheduled workflow
├── standalone-workflow.yml   # Standalone workflow
└── README.md              # This file
```

## 🕐 Schedule Configuration

### Cron Schedule Examples

```yaml
# Every day at 9 AM UTC
- cron: '0 9 * * *'

# Every 6 hours
- cron: '0 */6 * * *'

# Every Monday at 8 AM UTC
- cron: '0 8 * * 1'

# Every weekday at 9 AM UTC
- cron: '0 9 * * 1-5'

# Every 15 minutes
- cron: '*/15 * * * *'
```

### Timezone Considerations

GitHub Actions run in UTC. Adjust your cron schedule accordingly:

- **UTC 9 AM** = **EST 4 AM** (winter) / **EDT 5 AM** (summer)
- **UTC 9 AM** = **PST 1 AM** (winter) / **PDT 2 AM** (summer)

## 🚨 Troubleshooting

### Common Issues

#### "File does not exist in target branch"
- **Cause**: The JSON file doesn't exist in the target branch
- **Solution**: Ensure the file exists in both branches or handle this case in your workflow

#### "Slack notification failed"
- **Cause**: Invalid webhook URL or network issues
- **Solution**: Verify your Slack webhook URL and check network connectivity

#### "Failed to read JSON file"
- **Cause**: Invalid JSON syntax or file access issues
- **Solution**: Validate your JSON files and check file permissions

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
2. Select **JSON Comparison Scheduler**
3. Click **Run workflow**
4. Fill in the parameters
5. Click **Run workflow**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/json-comparison-workflow/issues)
- **Documentation**: [Wiki](https://github.com/your-username/json-comparison-workflow/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/json-comparison-workflow/discussions)

---

*This workflow helps maintain consistency across branches by automatically detecting and reporting JSON file differences.*
