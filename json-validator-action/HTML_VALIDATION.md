# HTML Validation Feature

## 🏷️ Overview

The JSON Validator now includes **automatic HTML validation** for any string values in your JSON files that contain HTML markup. This ensures that all HTML tags are properly closed and matched.

## ✨ Features

### ✅ What Gets Validated

- **Unclosed tags**: Detects opening tags without corresponding closing tags
  - ❌ `<div><p>Content` (missing `</p>` and `</div>`)
  - ✅ `<div><p>Content</p></div>`

- **Mismatched tags**: Identifies tags that are closed in the wrong order
  - ❌ `<div><span>Content</div></span>`
  - ✅ `<div><span>Content</span></div>`

- **Self-closing tags**: Properly handles HTML5 self-closing tags
  - ✅ `<br>`, `<br/>`, `<img src="..." />`, `<hr>`, `<input />`
  - ✅ `<meta>`, `<link>`, `<area>`, `<base>`, `<col>`, `<embed>`, `<param>`, `<source>`, `<track>`, `<wbr>`

### 🔍 Smart Detection

- **Nested structures**: Validates HTML in nested objects and arrays
- **Path tracking**: Shows the exact JSON path where invalid HTML is found
- **Line numbers**: Identifies the line number in your JSON file
- **Preview**: Shows a preview of the invalid HTML content

## 📋 Examples

### ✅ Valid HTML in JSON

```json
{
  "content": "<div class='container'><p>Hello World</p></div>",
  "footer": "<footer><span>Copyright 2024</span></footer>",
  "banner": "<img src='logo.png' alt='Logo' />",
  "items": [
    {
      "html": "<ul><li>Item 1</li><li>Item 2</li></ul>"
    }
  ]
}
```

### ❌ Invalid HTML in JSON

```json
{
  "content": "<div><p>Unclosed paragraph",
  "footer": "<div><span>Mismatched</div></span>",
  "nested": {
    "deep": {
      "html": "<h1>Missing closing tag"
    }
  }
}
```

### 📊 Error Output

When invalid HTML is detected, you'll see:

```
❌ JSON Validation Error in content.json:
   Error Type: InvalidHTMLError
   Error Message: HTML string contains unclosed or mismatched tags: div, p
   🔍 HTML Validation Details:
      Key Path: page.content
      Line: 12
      Unclosed Tags: div, p
      HTML Content Preview: <div><p>Welcome to our site<div><span>More content</span>
   💡 Suggestion: Ensure all HTML tags are properly closed. Unclosed tags: <div>...</div>, <p>...</p>
```

## 🎯 Use Cases

### Common Scenarios

1. **CMS Content**: Validating HTML content stored in configuration files
2. **Email Templates**: Ensuring email HTML is properly formatted
3. **Widget Configurations**: Checking HTML snippets in widget configs
4. **Internationalization (i18n)**: Validating translated content with HTML
5. **Documentation**: Ensuring documentation snippets are valid

### Example: i18n File

```json
{
  "en": {
    "welcome": "<h1>Welcome!</h1><p>Please <a href='/login'>log in</a></p>",
    "footer": "<div class='footer'><span>All rights reserved</span></div>"
  },
  "es": {
    "welcome": "<h1>¡Bienvenido!</h1><p>Por favor <a href='/login'>inicie sesión</a></p>",
    "footer": "<div class='footer'><span>Todos los derechos reservados</span></div>"
  }
}
```

## 🔧 Technical Details

### Supported HTML Tags

The validator recognizes all standard HTML tags including:
- Block elements: `div`, `p`, `h1-h6`, `section`, `article`, etc.
- Inline elements: `span`, `a`, `strong`, `em`, etc.
- Self-closing: `br`, `hr`, `img`, `input`, `meta`, `link`, etc.

### Validation Algorithm

1. **Detection**: Scans all string values for HTML tag patterns
2. **Parsing**: Extracts all opening, closing, and self-closing tags
3. **Stack-based validation**: Uses a stack to track tag nesting
4. **Mismatch detection**: Identifies tags closed in wrong order
5. **Reporting**: Provides detailed error information with line numbers

### Performance

- **Fast scanning**: Only validates strings containing HTML tags
- **Efficient parsing**: Single-pass regex-based extraction
- **Minimal overhead**: Negligible impact on validation time

## 🚫 What's NOT Validated

The HTML validator focuses on **tag structure only** and does not validate:

- ❌ HTML attribute syntax
- ❌ CSS validity
- ❌ JavaScript code within HTML
- ❌ HTML semantic correctness
- ❌ ARIA attributes
- ❌ Character encoding issues

### Why?

The focus is on preventing **broken HTML rendering** caused by unclosed or mismatched tags, which is the most common and impactful error in HTML-in-JSON scenarios.

## 🎨 GitHub PR Comments

HTML validation errors appear in PR comments with:

- 🏷️ **Icon**: Distinct icon for HTML errors
- **Error count**: Separate count in summary statistics
- **Detailed output**: Full error details in collapsible section
- **Action items**: Clear steps to fix the issues

Example summary:
```
### 📊 Summary
- **Status**: ❌ **FAILED**
- **Files Checked**: 3
- **Total Errors**: 5
- **Duplicate Keys**: 1
- **Syntax Errors**: 2
- **Invalid HTML**: 2

### 🚨 Issues Found
- 🔑 **config.json** (Line 5) - DuplicateKeyError
- ⚠️ **data.json** (Line 12) - SyntaxError
- 🏷️ **content.json** (Line 8) - InvalidHTMLError
- 🏷️ **content.json** (Line 15) - InvalidHTMLError
```

## 🧪 Testing

### Test Your HTML Validation

Create a test file:

```json
{
  "valid": "<div><p>This is valid</p></div>",
  "invalid": "<div><p>This is invalid</div>",
  "selfClosing": "<img src='test.jpg' /><br />Valid"
}
```

Run validation:
```bash
node validator.js test.json
```

### Automated Testing

The package includes comprehensive tests:

```bash
npm test  # Runs all validation tests including HTML
```

## 💡 Tips

### Best Practices

1. **Use proper HTML**: Always close your tags properly
2. **Test locally**: Run validation locally before pushing
3. **Fix incrementally**: Address HTML errors file by file
4. **Use tools**: Consider HTML formatters/linters for complex HTML

### Common Fixes

**Unclosed div:**
```json
// ❌ Before
{"content": "<div><p>Text</div>"}

// ✅ After
{"content": "<div><p>Text</p></div>"}
```

**Mismatched tags:**
```json
// ❌ Before
{"content": "<span><div>Text</span></div>"}

// ✅ After
{"content": "<span><div>Text</div></span>"}
```

**Missing closing tags:**
```json
// ❌ Before
{"content": "<ul><li>Item 1<li>Item 2"}

// ✅ After
{"content": "<ul><li>Item 1</li><li>Item 2</li></ul>"}
```

## 🎯 Configuration

HTML validation is **always enabled** and runs automatically on all string values containing HTML tags. No configuration needed!

---

<div align="center">
<sub>🏷️ HTML Validation is part of the <a href="README.md">JSON Validator Action</a></sub>
</div>
