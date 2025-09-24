# JSON Comparison Workflow

A powerful GitHub Action that automatically compares JSON files between branches on a schedule and sends Slack notifications when differences are detected.

## 🚀 Features

- ⏰ **Scheduled Execution**: Runs automatically on a cron schedule (configurable)
- 🔄 **Branch Comparison**: Compares JSON files between any two branches
- 📱 **Slack Integration**: Sends rich notifications to Slack channels
- 🎯 **Flexible Configuration**: Supports different comparison modes and key filtering
- 🤖 **Manual Triggering**: Can be triggered manually with custom parameters
- 📊 **Detailed Reporting**: Shows exact differences between JSON files
- 🛡️ **Error Handling**: Graceful handling of missing files and parsing errors

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
      target_branch:
        description: 'Target branch to compare against'
        required: true
        default: 'main'
        type: string
      json_file_path:
        description: 'Path to JSON file to compare'
        required: true
        default: 'config.json'
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
          target-branch: ${{ github.event.inputs.target_branch || 'main' }}
          json-file-path: ${{ github.event.inputs.json_file_path || 'config.json' }}
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
| `target-branch` | Branch to compare against | Yes | `main` |
| `json-file-path` | Path to JSON file to compare | Yes | - |
| `slack-webhook-url` | Slack webhook URL | Yes | - |
| `slack-channel` | Slack channel override | No | - |
| `comparison-mode` | Comparison mode (strict\|lenient) | No | `strict` |
| `ignore-keys` | Comma-separated keys to ignore | No | - |

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
          target-branch: 'main'
          json-file-path: 'config/settings.json'
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Multiple File Comparison

```yaml
name: Multi-File JSON Comparison

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

### Ignoring Specific Keys

```yaml
- uses: your-username/json-comparison-workflow@v1
  with:
    target-branch: 'main'
    json-file-path: 'config/settings.json'
    slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    ignore-keys: 'timestamp,lastModified,version'
    comparison-mode: 'lenient'
```

## 📊 Slack Notification Examples

### ✅ Success Notification

```
🤖 JSON Comparison Bot
✅ JSON Comparison Success

File: config.json
Current Branch: feature-branch
Target Branch: main
Message: Files are identical between feature-branch and main
```

### ⚠️ Difference Alert

```
🤖 JSON Comparison Bot
🔄 JSON Comparison Alert

File: config.json
Current Branch: feature-branch
Target Branch: main
Message: Files differ between feature-branch and main

Differences:
• Changed: database.host from "localhost" to "prod-db.example.com"
• Added: features.newFeature = true
• Removed: debug.enabled = true
```

### ❌ Error Notification

```
🤖 JSON Comparison Bot
❌ JSON Comparison Error

File: config.json
Current Branch: feature-branch
Target Branch: main
Message: Workflow failed: File config.json does not exist in target branch (main)
```

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
