# Sample Slack Messages

This document shows examples of the Slack notifications that will be sent by the JSON Comparison Workflow.

## ✅ Success Notification with Differences

```
✅ JSON Comparison Summary
Comparison Status: COMPLETED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z

📁 Files with Differences (3):
• `config/app.json` - 4 change(s)
  ◦ Property 'version' was changed from '1.0.0' to '1.1.0'
  ◦ Property 'features.debug' was added
  ◦ Property 'features.legacy' was removed
  ◦ ... and 1 more changes

• `config/database.json` - 2 change(s)
  ◦ Property 'host' was changed from 'localhost' to 'prod-db.company.com'
  ◦ Property 'port' was changed from '5432' to '3306'

• `config/security.json` - 1 change(s)
  ◦ Property 'jwt.secret' was changed from 'old-secret' to 'new-secret'

✅ Identical Files (2):
• `config/cache.json`
• `config/logging.json`

Report: Click here to view the full report
Report Link: https://github.aexp.com/pages/amex-eng/json-validator/reports/
For Developers
Branch: json-comparison-report-123
Report PR: #456
If you have questions, reply in this channel or contact the JSON Comparison team.
```

## ✅ Success Notification - All Identical

```
✅ JSON Comparison Summary
Comparison Status: COMPLETED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z

✅ Identical Files (5):
• `config/app.json`
• `config/database.json`
• `config/cache.json`
• `config/logging.json`
• `config/security.json`

Report: Click here to view the full report
Report Link: https://github.aexp.com/pages/amex-eng/json-validator/reports/
For Developers
Branch: json-comparison-report-123
Report PR: #456
If you have questions, reply in this channel or contact the JSON Comparison team.
```

## ✅ Success Notification with Errors

```
✅ JSON Comparison Summary
Comparison Status: COMPLETED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z

📁 Files with Differences (2):
• `config/app.json` - 2 change(s)
  ◦ Property 'version' was changed from '1.0.0' to '1.1.0'
  ◦ Property 'features.debug' was added

✅ Identical Files (2):
• `config/cache.json`
• `config/logging.json`

⚠️ Files with Errors (1):
• `config/database.json` - Failed to fetch remote file

Report: Click here to view the full report
Report Link: https://github.aexp.com/pages/amex-eng/json-validator/reports/
For Developers
Branch: json-comparison-report-123
Report PR: #456
If you have questions, reply in this channel or contact the JSON Comparison team.
```

## ❌ Failure Notification

```
❌ JSON Comparison Summary
Comparison Status: FAILED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Job ID: 1234567890

📁 Files with Differences (1):
• `config/app.json` - 1 change(s)
  ◦ Property 'version' was changed from '1.0.0' to '1.1.0'

⚠️ Files with Errors (2):
• `config/database.json` - Failed to read local file
• `config/security.json` - Failed to fetch remote file

Report: Click here to view the full report
Report Link: https://github.aexp.com/pages/amex-eng/json-validator/reports/
Please check the report or contact the JSON Comparison team for details.
```

## 🔍 Detailed Difference Examples

### Property Changes
```
◦ Property 'version' was changed from '1.0.0' to '1.1.0'
◦ Property 'database.host' was changed from 'localhost' to 'prod-db.company.com'
◦ Property 'features.debug' was changed from 'false' to 'true'
```

### Property Additions
```
◦ Property 'features.debug' was added
◦ Property 'database.ssl' was added
◦ Property 'logging.level' was added
```

### Property Removals
```
◦ Property 'features.legacy' was removed
◦ Property 'database.old_config' was removed
◦ Property 'logging.verbose' was removed
```

### Array Changes
```
◦ Array item at index 2 in 'allowed_origins' was modified
◦ Array item at index 0 in 'features' was added
◦ Array item at index 1 in 'features' was removed
```

## 📊 Message Features

### Smart Truncation
- Shows first 3 differences per file
- Indicates additional changes with "... and X more changes"
- Prevents overly long messages

### Categorized Display
- **📁 Files with Differences**: Files that have actual changes
- **✅ Identical Files**: Files that are identical
- **⚠️ Files with Errors**: Files that couldn't be processed

### Rich Formatting
- **Bold headers** for easy scanning
- **Code formatting** for file names and property paths
- **Bullet points** for organized display
- **Emojis** for visual distinction

### Action Links
- **Report Link**: Direct link to GitHub Pages report
- **Pull Request**: Link to the report PR
- **Branch**: Link to the report branch

## 🎯 Benefits

1. **Quick Overview**: See all differences at a glance
2. **Actionable Information**: Know exactly what changed
3. **No Click-Through Required**: Get key info without opening reports
4. **Complete Context**: See both changed and identical files
5. **Error Visibility**: Clear indication of any processing issues
