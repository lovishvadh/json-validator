# Sample Slack Notifications for ICS JSON Comparison Workflow

This document shows examples of Slack notifications that will be sent by the ICS JSON Comparison Workflow.

## ✅ Success Notification

### Basic Success
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

### Success with Differences Found
```
✅ JSON Comparison Summary
Comparison Status: COMPLETED WITH DIFFERENCES
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Differences Found: 3 files with differences
Report: Click here to view the full report
Report Link: https://github.aexp.com/pages/amex-eng/json-validator/reports/
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
```

### Success with All Files Identical
```
✅ JSON Comparison Summary
Comparison Status: COMPLETED - ALL IDENTICAL
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Result: All 5 files are identical
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
```

## ❌ Failure Notification

### Basic Failure
```
❌ JSON Comparison Summary
Comparison Status: FAILED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Job ID: 1234567890
Please check the report or contact the JSON Comparison team for details.
```

### Failure with Specific Error
```
❌ JSON Comparison Summary
Comparison Status: FAILED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Error: Failed to fetch remote file: 404 Not Found
Job ID: 1234567890
Please check the report or contact the JSON Comparison team for details.
```

### Failure with Network Error
```
❌ JSON Comparison Summary
Comparison Status: FAILED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Error: Network timeout after 30 seconds
Job ID: 1234567890
Please check the report or contact the JSON Comparison team for details.
```

## 🔄 Partial Success Notification

### Some Files Failed
```
⚠️ JSON Comparison Summary
Comparison Status: PARTIAL SUCCESS
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Results: 3 files compared, 1 file failed
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
```

## 📊 Detailed Success Notification

### With Statistics
```
✅ JSON Comparison Summary
Comparison Status: COMPLETED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Results:
• Identical Files: 2
• Files with Differences: 3
• Files with Errors: 1
• Total Differences: 8
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
```

### With Difference Breakdown
```
✅ JSON Comparison Summary
Comparison Status: COMPLETED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Differences:
• Added: 3 properties
• Removed: 1 property
• Modified: 4 properties
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
```

## 🚨 Alert Notifications

### High Priority Alert
```
🚨 JSON Comparison Alert
Comparison Status: CRITICAL DIFFERENCES FOUND
Folder Path: production-config
Base URL: https://prod-api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Alert: 5 critical configuration differences detected
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
@channel Please review immediately
```

### Security Alert
```
🔒 JSON Comparison Security Alert
Comparison Status: SECURITY DIFFERENCES FOUND
Folder Path: security-config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Alert: Security configuration differences detected
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
@security-team Please review immediately
```

## 📈 Performance Notification

### Slow Comparison
```
⏱️ JSON Comparison Performance Alert
Comparison Status: COMPLETED (SLOW)
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Duration: 5 minutes 23 seconds
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
Note: Consider optimizing comparison settings
```

### Fast Comparison
```
⚡ JSON Comparison Summary
Comparison Status: COMPLETED (FAST)
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Duration: 12 seconds
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
```

## 🔧 Configuration Notifications

### Configuration Change
```
🔧 JSON Comparison Configuration Updated
Comparison Status: CONFIGURATION CHANGED
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict → lenient
Date & Time: 2024-12-21T14:30:45Z
Changes: Comparison mode updated to lenient
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
```

### New Files Added
```
📁 JSON Comparison New Files Detected
Comparison Status: NEW FILES FOUND
Folder Path: config
Base URL: https://api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
New Files: 2 new JSON files detected
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
```

## 📝 Custom Notification Templates

### Development Team Notification
```
👨‍💻 JSON Comparison - Development Team
Comparison Status: COMPLETED
Folder Path: dev-config
Base URL: https://dev-api.example.com/config
Comparison Mode: lenient
Date & Time: 2024-12-21T14:30:45Z
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
@dev-team Please review the differences
```

### QA Team Notification
```
🧪 JSON Comparison - QA Team
Comparison Status: COMPLETED
Folder Path: test-config
Base URL: https://test-api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
@qa-team Please verify the test configuration
```

### Operations Team Notification
```
⚙️ JSON Comparison - Operations Team
Comparison Status: COMPLETED
Folder Path: ops-config
Base URL: https://ops-api.example.com/config
Comparison Mode: strict
Date & Time: 2024-12-21T14:30:45Z
Report: Click here to view the full report
For Developers
Branch: json-comparison-report-0000001
Report PR: #123
@ops-team Please review the operational configuration
```

## 🎨 Notification Formatting

### Emoji Usage
- ✅ Success
- ❌ Failure
- ⚠️ Warning
- 🚨 Alert
- 🔒 Security
- ⏱️ Performance
- 🔧 Configuration
- 📁 Files
- 👨‍💻 Development
- 🧪 QA
- ⚙️ Operations

### Text Formatting
- **Bold**: Important information
- `Code`: Technical details
- _Italic_: Additional context
- @mentions: Team notifications
- Links: Report and PR references

### Channel Recommendations
- `#json-comparison`: General notifications
- `#json-comparison-alerts`: Critical alerts
- `#json-comparison-dev`: Development team
- `#json-comparison-qa`: QA team
- `#json-comparison-ops`: Operations team
