# Packaging Instructions

## 📦 How to Package and Distribute

### Step 1: Build the Action

```bash
# Install dependencies
npm install

# Build the action (creates dist/index.js)
npm run build

# Test the build
npm test
```

### Step 2: Create a Release

1. **Tag the version:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create a GitHub Release:**
   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Choose the tag `v1.0.0`
   - Add release notes
   - Upload the `dist/` folder as a release asset

### Step 3: Use in Other Repositories

Other repositories can now use your action:

```yaml
- name: JSON Validation
  uses: your-username/json-validator-action@v1.0.0
```

## 🔄 Alternative: Use as Local Action

### Option 1: Copy the Workflow File

Simply copy the workflow file to any repository:

```bash
# Copy the workflow file
cp json-validator-action/.github/workflows/json-validation.yml your-repo/.github/workflows/
```

### Option 2: Use as Submodule

```bash
# Add as submodule
git submodule add https://github.com/your-username/json-validator-action.git .github/actions/json-validator

# Use in workflow
- name: JSON Validation
  uses: ./.github/actions/json-validator
```

### Option 3: Use the Standalone Workflow

The workflow file is self-contained and includes all the validation logic. You can:

1. Copy `.github/workflows/json-validation.yml` to your repository
2. Modify the paths or triggers as needed
3. No additional setup required!

## 🎯 Distribution Methods

### Method 1: GitHub Action (Recommended)
- ✅ Easy to use: `uses: username/action@version`
- ✅ Versioned releases
- ✅ Automatic updates
- ✅ No local files needed

### Method 2: Workflow File
- ✅ Self-contained
- ✅ No external dependencies
- ✅ Easy to customize
- ✅ Works offline

### Method 3: NPM Package
- ✅ Can be used in Node.js projects
- ✅ Version management
- ✅ Easy installation

## 📋 Checklist for Release

- [ ] Update version in `package.json`
- [ ] Update version in `action.yml`
- [ ] Run `npm run build`
- [ ] Test the built action
- [ ] Create git tag
- [ ] Create GitHub release
- [ ] Update documentation
- [ ] Test in a sample repository

## 🚀 Quick Deploy

For immediate use without packaging:

1. Copy the workflow file to your repository
2. Commit and push
3. Create a PR with JSON files to test

The workflow is completely self-contained and ready to use!
