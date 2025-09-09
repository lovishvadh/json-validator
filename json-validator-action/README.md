# JSON Validator GitHub Action

A powerful GitHub Action that automatically validates JSON files in pull requests with detailed error reporting, duplicate key detection, and comprehensive feedback.

## 🚀 Features

- ✅ **Automatic Detection**: Finds JSON files changed in pull requests
- 🔍 **Detailed Error Reporting**: Shows exact line numbers, positions, and helpful suggestions
- 🚫 **Duplicate Key Detection**: Identifies duplicate keys at the same level (ignores valid duplicates in arrays)
- 📍 **Context-Aware**: Provides specific context for each error type
- 🤖 **GitHub Integration**: Creates status checks and PR comments
- 🛡️ **Branch Protection**: Can be used as a required status check

## 📦 Installation

### Option 1: Use as GitHub Action (Recommended)

Create `.github/workflows/json-validation.yml` in your repository:

```yaml
name: JSON Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]
    paths:
      - '**/*.json'

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  validate-json:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: JSON Validation
        uses: your-username/json-validator-action@v1
        with:
          strict-mode: 'false'  # Optional: Enable strict validation
          error-format: 'detailed'  # Optional: detailed|simple
```

### Option 2: Use the Workflow File

Copy the workflow file from this repository and place it in your `.github/workflows/` directory.

## ⚙️ Configuration

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `strict-mode` | Enable strict validation mode | No | `false` |
| `error-format` | Error message format (detailed\|simple) | No | `detailed` |

### Permissions

The action requires the following permissions:

```yaml
permissions:
  contents: read      # Read repository files
  pull-requests: write # Comment on PRs
  checks: write       # Create status checks
```

## 🎯 Usage Examples

### Basic Usage

```yaml
- name: JSON Validation
  uses: your-username/json-validator-action@v1
```

### With Custom Configuration

```yaml
- name: JSON Validation
  uses: your-username/json-validator-action@v1
  with:
    strict-mode: 'true'
    error-format: 'simple'
```

### With Branch Protection

1. Go to **Repository Settings** → **Branches**
2. Add a branch protection rule
3. Check **"Require status checks to pass before merging"**
4. Select **"JSON Validation"** from the list

## 📊 Output Examples

### ✅ Success
```
✅ config.json is a valid JSON.
✅ data.json is a valid JSON.

✅ All JSON files are valid!
```

### ❌ Error with Duplicate Keys
```
❌ JSON Validation Error in config.json:
   Error Type: DuplicateKeyError
   Error Message: Duplicate key "debug" found at the same level
   🔍 Duplicate Key Analysis:
      Key "debug" appears 2 times at the same level
      First occurrence: Line 6
      Last occurrence: Line 8
      All occurrences: Lines 6, 8
      Parent context: inside "config"
   Context:
   >>> 6:     "debug": true,
   💡 Suggestion: Remove all duplicate keys except the first one. Each key in a JSON object must be unique at the same level.
```

### ❌ Syntax Error
```
❌ JSON Validation Error in data.json:
   Error Type: SyntaxError
   Error Message: Unexpected string in JSON at position 45
   Line: 4
   Position: 45
   Character: 2
   Error Line: 4:   "category": "Electronics"
   💡 Suggestion: Check for missing commas(,), extra commas(,), missing quotes("), extra quotes("), or incorrect syntax around the indicated position.
```

## 🔧 Error Types Detected

### 1. Syntax Errors
- Missing commas
- Extra commas
- Missing quotes
- Extra quotes
- Unclosed brackets/braces
- Invalid number formats

### 2. Duplicate Keys
- Duplicate keys at the same level (invalid)
- Allows duplicate keys in different array elements (valid)

### 3. File Access Issues
- Missing files
- Permission errors
- Network connectivity issues

## 🏗️ Development

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
json-validator-action/
├── action.yml              # Action metadata
├── package.json            # Dependencies and scripts
├── src/
│   └── index.js           # Main action code
├── dist/                  # Built action (generated)
├── README.md              # This file
└── .github/
    └── workflows/
        └── json-validation.yml  # Example workflow
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/json-validator-action/issues)
- **Documentation**: [Wiki](https://github.com/your-username/json-validator-action/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/json-validator-action/discussions)

---

*This action helps maintain JSON data quality across your project with automated validation and clear error reporting.*
