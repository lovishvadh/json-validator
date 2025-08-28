# JSON Validator Tool

A comprehensive JSON validation tool with detailed error reporting and GitHub Actions integration for automated validation on pull requests.

## Features

- ✅ **Detailed Error Reporting**: Shows exact line numbers, positions, and helpful suggestions
- 🔍 **Duplicate Key Detection**: Identifies duplicate keys at the same level (ignores valid duplicates in arrays)
- 📍 **Context-Aware**: Provides specific context for each error type
- 🤖 **GitHub Actions Integration**: Automatically validates JSON files on pull requests
- 💬 **PR Comments**: Adds detailed comments to PRs with validation results

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd json-validator
```

2. Install dependencies:
```bash
npm install
```

3. Configure the validator by editing `config.js`:
```javascript
export const REPO_PATH = './path/to/your/json/files/';
export const ORIGIN_URL = 'https://your-api-base-url.com/';
export const MARKET = 'your-market-identifier';
```

## Usage

### Local Validation

Run the validator locally:
```bash
node validator.js
```

### GitHub Actions Integration

The tool automatically runs on pull requests when:
- JSON files are modified
- The validator script is updated
- The workflow file is modified

## Error Types Detected

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

## Sample Output

### Error Example:
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

### Success Example:
```
✅ config.json is a valid JSON.
✅ data.json is a valid JSON.
```

## GitHub Actions Workflow

The workflow automatically:

1. **Triggers** on pull requests with JSON file changes
2. **Runs** the validation on all JSON files
3. **Comments** on the PR with results:
   - ❌ **Error Comments**: Detailed error information with suggestions
   - ✅ **Success Comments**: Confirmation that all files are valid
4. **Updates** existing comments when PR is updated

### Workflow Features

- **Smart Commenting**: Updates existing comments instead of creating duplicates
- **Detailed Error Reporting**: Shows all validation errors in PR comments
- **Helpful Guidance**: Provides step-by-step instructions for fixing issues
- **Automatic Re-validation**: Re-runs when PR is updated

## Configuration

### Local Configuration (`config.js`)

```javascript
// Path to local JSON files
export const REPO_PATH = './data/';

// Base URL for remote files (optional)
export const ORIGIN_URL = 'https://api.example.com/';

// Market identifier (optional)
export const MARKET = 'us';
```

### GitHub Actions Configuration

The workflow is configured in `.github/workflows/json-validation.yml` and includes:

- Node.js 18 setup
- Dependency installation
- Validation execution
- PR commenting with results

## File Structure

```
json-validator/
├── validator.js              # Main validation script
├── config.js                 # Configuration file
├── package.json              # Dependencies and scripts
├── .github/
│   └── workflows/
│       └── json-validation.yml  # GitHub Actions workflow
├── README.md                 # This file
└── test-files/              # Test JSON files
    ├── valid-example.json
    ├── invalid-example.json
    └── array-test.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with various JSON files
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Module Import Errors**: Ensure `"type": "module"` is in `package.json`
2. **Permission Errors**: Check file permissions and paths in `config.js`
3. **Network Errors**: Verify URLs and connectivity for remote files
4. **GitHub Actions Failures**: Check workflow file syntax and permissions

### Debug Mode

Add debug logging by modifying the validator script or check the GitHub Actions logs for detailed error information.

## License

MIT License - see LICENSE file for details.

---

*This tool helps maintain JSON data quality across your project with automated validation and clear error reporting.*
