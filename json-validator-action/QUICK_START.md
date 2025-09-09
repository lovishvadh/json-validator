# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Create the Workflow File

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
```

### Step 2: Commit and Push

```bash
git add .github/workflows/json-validation.yml
git commit -m "Add JSON validation workflow"
git push
```

### Step 3: Test It

1. Create a new branch
2. Add or modify a JSON file with an error
3. Create a pull request
4. Watch the validation run automatically!

## 📋 What You'll See

### ✅ Valid JSON
- Green checkmark in PR status
- "JSON Validation - Passed" check
- Success message in PR comments

### ❌ Invalid JSON
- Red X in PR status
- "JSON Validation - Failed" check
- Detailed error messages with line numbers
- Helpful suggestions for fixing issues

## 🛡️ Optional: Branch Protection

To require JSON validation before merging:

1. Go to **Repository Settings** → **Branches**
2. Add a branch protection rule
3. Check **"Require status checks to pass before merging"**
4. Select **"JSON Validation"** from the list

## 🎯 That's It!

Your repository now automatically validates JSON files in every pull request. The action will:

- ✅ Find JSON files changed in the PR
- 🔍 Validate syntax and structure
- 🚫 Detect duplicate keys
- 📍 Show exact error locations
- 💬 Comment on the PR with results
- 🛡️ Block merging if validation fails (if branch protection is enabled)

## 🆘 Need Help?

- Check the [full documentation](README.md)
- Look at [example workflows](.github/workflows/)
- Open an [issue](https://github.com/your-username/json-validator-action/issues) for support
