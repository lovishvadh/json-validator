# JSON Comparison Tool - Feature Documentation

## Overview

The JSON Comparison Tool is a powerful utility that enables developers and QA teams to compare JSON files from different sources and generate comprehensive HTML reports. This tool provides both detailed difference analysis and full side-by-side JSON comparison views, making it easy to identify changes between JSON configurations, API responses, or any JSON-based data structures.

## 🎯 Key Features

### 1. **Dual View Modes**
- **Full JSON Comparison**: Complete side-by-side view of original JSON files with inline highlighting
- **Differences Only**: Compact view showing only the changed elements

### 2. **Smart Difference Detection**
- **Added Elements**: New properties or values (highlighted in blue)
- **Removed Elements**: Deleted properties or values (highlighted in red)
- **Modified Elements**: Changed values (highlighted in yellow)
- **Array Changes**: Support for array element modifications

### 3. **Professional UI/UX**
- **GitHub-inspired interface** with clean, modern design
- **Responsive layout** that works on desktop and mobile
- **Interactive controls** with hover effects and smooth transitions
- **Synchronized scrolling** between comparison panels

### 4. **Comprehensive Reporting**
- **Statistics dashboard** showing counts of changes
- **Filter controls** to focus on specific change types
- **Line-by-line comparison** with syntax highlighting
- **Exportable HTML reports** for sharing and documentation

## 🚀 How to Use

### Prerequisites
- Node.js installed on your system
- Required dependencies: `axios`, `deep-diff`, `fs`, `path`

### Configuration Setup

1. **Edit `config.js`** to set up your comparison sources:

```javascript
export const MARKET = "your-market-name";
export const ORIGIN_URL = "https://your-base-url.com/api/";
export const ORIGIN_URL_COMPARE = "https://your-compare-url.com/api/";
export const REPO_PATH = "/path/to/local/json/files/";
export const COMMIT_ID = "your-commit-hash";
```

2. **Configure your sources**:
   - `ORIGIN_URL`: Primary JSON source (e.g., production API)
   - `ORIGIN_URL_COMPARE`: Secondary JSON source (e.g., staging API)
   - `REPO_PATH`: Local JSON files directory (optional)
   - `MARKET`: Specific market/environment identifier

### Running the Comparison

#### Method 1: URL-to-URL Comparison
```bash
node comparator.js
```
This compares JSON files from two different URLs for the specified market.

#### Method 2: Local-to-URL Comparison
Uncomment the local comparison section in `comparator.js`:
```javascript
if(repoPath) {
    console.log("\n🖥 Comparing JSON Files from Local Folder...");
    await compareLocalJsons(secondaryBaseURL + market, repoPath + market, allFiles);
}
```

### Understanding the Output

#### 1. **Console Output**
The tool provides real-time feedback:
```
📂 Getting all JSON files from subfolders...
🌍 Comparing JSON Files from URL...
Comparing from local to: https://api.example.com/api/ market1.json
HTML report generated: market1.json
```

#### 2. **HTML Report Generation**
For each JSON file with differences, the tool generates an HTML report with:
- **Statistics summary** (added, removed, modified counts)
- **Full JSON comparison** with syntax highlighting
- **Differences-only view** for focused analysis
- **Interactive controls** for filtering and navigation

## 📊 Report Features Explained

### Full JSON Comparison View

**Purpose**: View complete JSON files side-by-side with inline difference highlighting.

**Features**:
- **Line numbers** for easy reference
- **Syntax highlighting** for different data types:
  - 🔵 Strings (blue)
  - 🟠 Numbers (orange)
  - 🟡 Booleans (yellow)
  - ⚪ Null values (gray)
- **Diff indicators** showing change types:
  - 🔵 Blue dot: Added elements
  - 🔴 Red dot: Removed elements
  - 🟡 Yellow dot: Modified elements
- **Synchronized scrolling** between panels

### Differences Only View

**Purpose**: Focus on only the changed elements for quick analysis.

**Features**:
- **Compact format** showing only differences
- **Path-based navigation** to locate changes in JSON structure
- **Value comparison** showing old vs new values
- **Filter controls** to view specific change types

### Interactive Controls

1. **View Tabs**:
   - "Full JSON Comparison": Complete side-by-side view
   - "Differences Only": Focused difference view

2. **Filter Buttons**:
   - "All Changes": Show all differences
   - "Added": Show only new elements
   - "Removed": Show only deleted elements
   - "Modified": Show only changed elements

3. **Hover Effects**:
   - Highlight differences on mouse hover
   - Visual feedback for better focus

## 💡 Use Cases and Benefits

### 1. **API Testing and Validation**
**Use Case**: Compare API responses between environments
**Benefits**:
- Identify unexpected changes in API contracts
- Validate configuration updates
- Ensure backward compatibility
- Debug environment-specific issues

### 2. **Configuration Management**
**Use Case**: Compare configuration files across deployments
**Benefits**:
- Track configuration changes over time
- Validate deployment configurations
- Identify configuration drift
- Ensure consistency across environments

### 3. **Data Migration Validation**
**Use Case**: Verify data integrity during migrations
**Benefits**:
- Ensure no data loss during transfers
- Validate transformation logic
- Identify data quality issues
- Document migration changes

### 4. **Feature Development**
**Use Case**: Compare feature branch changes with main branch
**Benefits**:
- Review JSON schema changes
- Validate feature implementations
- Ensure no breaking changes
- Document feature modifications

### 5. **Quality Assurance**
**Use Case**: Automated testing of JSON outputs
**Benefits**:
- Automated regression testing
- Visual difference identification
- Comprehensive change documentation
- Easy sharing of test results

## 🔧 Advanced Features

### Custom Market Support
The tool supports multiple markets/environments:
```javascript
export const MARKET = "market1"; // or "market2", "market3", etc.
```

### Batch Processing
Process multiple JSON files automatically:
- Scans subdirectories recursively
- Compares all `.json` files found
- Generates individual reports for each file

### Flexible Source Configuration
Support for various comparison scenarios:
- **URL vs URL**: Compare two remote APIs
- **Local vs URL**: Compare local files with remote APIs
- **Multiple environments**: Compare across different deployment stages

## 📈 Performance and Scalability

### Efficient Processing
- **Streaming comparison**: Processes files without loading entire JSON into memory
- **Parallel processing**: Handles multiple files efficiently
- **Optimized rendering**: Fast HTML generation for large JSON files

### Scalability Features
- **Large file support**: Handles JSON files of various sizes
- **Memory efficient**: Minimal memory footprint during processing
- **Batch operations**: Process multiple files in single execution

## 🛠 Troubleshooting

### Common Issues

1. **"Failed to retrieve one or both JSON sources"**
   - Check URL accessibility
   - Verify network connectivity
   - Ensure correct URL format

2. **"Could not fetch filename"**
   - Verify file exists at specified URL
   - Check authentication requirements
   - Ensure correct file path

3. **Empty or missing reports**
   - Verify JSON files have differences
   - Check file permissions
   - Ensure output directory is writable

### Debug Mode
Enable detailed logging by adding console.log statements:
```javascript
console.log("Comparing:", filename);
console.log("URL1:", url1);
console.log("URL2:", url2);
```

## 📋 Best Practices

### 1. **Regular Comparisons**
- Schedule regular comparisons between environments
- Compare before and after deployments
- Validate configuration changes

### 2. **Documentation**
- Save HTML reports for future reference
- Document significant changes
- Share reports with team members

### 3. **Automation**
- Integrate into CI/CD pipelines
- Set up automated comparison jobs
- Configure alerts for unexpected changes

### 4. **Version Control**
- Track configuration changes over time
- Maintain history of JSON modifications
- Use for rollback validation

## 🔮 Future Enhancements

### Planned Features
- **JSON Schema validation** integration
- **Custom diff algorithms** for specific use cases
- **API integration** for automated comparisons
- **Real-time monitoring** capabilities
- **Advanced filtering** options
- **Export to multiple formats** (PDF, CSV, etc.)

### Community Contributions
- **Plugin architecture** for custom comparison logic
- **Template system** for custom report formats
- **API endpoints** for programmatic access
- **Web interface** for easier configuration

## 📞 Support and Resources

### Getting Help
- **Documentation**: This page and inline code comments
- **Examples**: Sample JSON files and configurations
- **Community**: Team knowledge sharing and best practices

### Contributing
- **Code reviews**: Submit improvements for review
- **Feature requests**: Suggest new capabilities
- **Bug reports**: Report issues with detailed information

---

*This documentation is maintained by the development team. For questions or suggestions, please contact the team or create a ticket in the project management system.* 