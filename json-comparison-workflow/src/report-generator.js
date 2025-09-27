const fs = require('fs');
const path = require('path');

// Deep diff implementation (simplified version)
function deepDiff(obj1, obj2) {
    const differences = [];
    
    function compare(path, val1, val2) {
        if (val1 === val2) return;
        
        if (val1 === undefined) {
            differences.push({ kind: 'N', path, rhs: val2 });
            return;
        }
        
        if (val2 === undefined) {
            differences.push({ kind: 'D', path, lhs: val1 });
            return;
        }
        
        if (typeof val1 !== typeof val2 || Array.isArray(val1) !== Array.isArray(val2)) {
            differences.push({ kind: 'E', path, lhs: val1, rhs: val2 });
            return;
        }
        
        if (typeof val1 === 'object' && val1 !== null) {
            const keys1 = Object.keys(val1);
            const keys2 = Object.keys(val2);
            const allKeys = new Set([...keys1, ...keys2]);
            
            for (const key of allKeys) {
                const newPath = path ? [...path, key] : [key];
                compare(newPath, val1[key], val2[key]);
            }
        } else if (val1 !== val2) {
            differences.push({ kind: 'E', path, lhs: val1, rhs: val2 });
        }
    }
    
    compare([], obj1, obj2);
    return differences;
}

// Render JSON with syntax highlighting and diff indicators
function renderJsonWithHighlights(obj, diffMap, isOld = false) {
    const jsonString = JSON.stringify(obj, null, 2);
    const lines = jsonString.split('\n');
    
    // Create a map of line ranges that should be highlighted
    const lineRanges = new Map(); // lineIndex -> { start, end, type }
    
    // Helper function to find object boundaries
    function findObjectBoundaries(lines, startLine) {
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let endLine = startLine;
        
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                
                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }
                
                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }
                
                if (char === '"' && !escapeNext) {
                    inString = !inString;
                    continue;
                }
                
                if (!inString) {
                    if (char === '{' || char === '[') {
                        braceCount++;
                    } else if (char === '}' || char === ']') {
                        braceCount--;
                        if (braceCount === 0) {
                            endLine = i;
                            return { start: startLine, end: endLine };
                        }
                    }
                }
            }
        }
        
        return { start: startLine, end: startLine };
    }
    
    // Process differences to find line ranges
    for (const [path, diff] of diffMap.entries()) {
        const pathParts = path.split('.');
        const lastPart = pathParts[pathParts.length - 1];
        
        // Find the line that contains this key
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const keyMatch = line.match(/"([^"]+)":/);
            
            if (keyMatch && keyMatch[1] === lastPart) {
                let diffType = '';
                if (isOld && (diff.kind === 'D' || diff.kind === 'E')) {
                    diffType = diff.kind === 'D' ? 'diff-removed' : 'diff-modified';
                } else if (!isOld && (diff.kind === 'N' || diff.kind === 'E')) {
                    diffType = diff.kind === 'N' ? 'diff-added' : 'diff-modified';
                }
                
                if (diffType) {
                    // For added/removed objects, highlight the entire object
                    if (diff.kind === 'N' || diff.kind === 'D') {
                        const boundaries = findObjectBoundaries(lines, lineIndex);
                        for (let i = boundaries.start; i <= boundaries.end; i++) {
                            lineRanges.set(i, { 
                                type: diffType, 
                                kind: diff.kind,
                                isObject: true 
                            });
                        }
                    } else {
                        // For modified values, just highlight the line
                        lineRanges.set(lineIndex, { 
                            type: diffType, 
                            kind: diff.kind,
                            isObject: false 
                        });
                    }
                }
                break;
            }
        }
    }
    
    return lines.map((line, lineIndex) => {
        const rangeInfo = lineRanges.get(lineIndex);
        let diffClass = rangeInfo ? rangeInfo.type : '';
        let diffIndicator = '';
        
        if (rangeInfo) {
            const indicatorType = rangeInfo.kind === 'N' ? 'added' : 
                                rangeInfo.kind === 'D' ? 'removed' : 'modified';
            diffIndicator = `<div class="diff-indicator ${indicatorType}"></div>`;
        }
        
        let highlightedLine = line
            .replace(/"([^"]*)"/g, '<span class="json-value string">"$1"</span>')
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="json-value number">$1</span>')
            .replace(/\b(true|false)\b/g, '<span class="json-value boolean">$1</span>')
            .replace(/\bnull\b/g, '<span class="json-value null">null</span>')
            .replace(/([{}[\],])/g, '<span class="json-bracket">$1</span>');
        
        return `
            <div class="json-line ${diffClass}" data-line="${lineIndex + 1}">
                <div class="line-number">${lineIndex + 1}</div>
                ${diffIndicator}
                <div class="line-content">${highlightedLine}</div>
            </div>
        `;
    }).join('');
}

// Create tree view for differences only
function createTreeView(differences) {
    return differences.map((diff, index) => {
        const path = diff.path ? diff.path.join('.') : 'N/A';
        const type = diff.kind === 'N' ? 'added' : diff.kind === 'D' ? 'removed' : 'modified';
        
        let value = '';
        if (diff.kind === 'N') {
            value = JSON.stringify(diff.rhs);
        } else if (diff.kind === 'D') {
            value = JSON.stringify(diff.lhs);
        } else if (diff.kind === 'E') {
            value = `${JSON.stringify(diff.lhs)} → ${JSON.stringify(diff.rhs)}`;
        }

        return `
            <div class="tree-line diff-${type}" data-index="${index}">
                <div class="diff-indicator ${type}"></div>
                <div class="tree-content">
                    <span class="tree-key">${path}:</span>
                    <span class="tree-value">${value}</span>
                </div>
            </div>
        `;
    }).join('');
}

function generateHtmlReport(reportData) {
    const { folder, currentBranch, baseUrl, results, timestamp } = reportData;

    const identicalCount = results.filter(r => r.status === 'identical').length;
    const differentCount = results.filter(r => r.status === 'different').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    // Generate comparison sections for each file
    let comparisonSectionsHtml = '';
    let allDifferences = [];

    results.forEach((result, index) => {
        if (result.status === 'different' && result.differences) {
            allDifferences = allDifferences.concat(result.differences.map(diff => ({
                ...diff,
                file: result.file,
                localPath: result.file,
                remoteUrl: `${baseUrl}/${result.file}`
            })));
        }

        let statusIcon = '';
        let statusClass = '';
        let comparisonHtml = '';

        if (result.status === 'identical') {
            statusIcon = '✅';
            statusClass = 'status-identical';
            comparisonHtml = `
                <div class="no-differences">
                    <h3>✅ Files are identical</h3>
                    <p>No differences found between local and remote files.</p>
                </div>
            `;
        } else if (result.status === 'different') {
            statusIcon = '🔄';
            statusClass = 'status-different';
            
            // Create diff map for this file
            const diffMap = new Map();
            result.differences.forEach(diff => {
                const path = diff.path ? diff.path.join('.') : '';
                diffMap.set(path, diff);
            });

            // Render side-by-side comparison
            const leftJson = renderJsonWithHighlights(result.localJson || {}, diffMap, true);
            const rightJson = renderJsonWithHighlights(result.remoteJson || {}, diffMap, false);
            
            const removedContent = createTreeView(result.differences.filter(d => d.kind === 'D' || d.kind === 'E'));
            const addedContent = createTreeView(result.differences.filter(d => d.kind === 'N' || d.kind === 'E'));

            comparisonHtml = `
                <div class="comparison-tabs">
                    <button class="comparison-tab active" data-tab="full-${index}">Full JSON Comparison</button>
                    <button class="comparison-tab" data-tab="diff-${index}">Differences Only</button>
                </div>
                
                <div class="comparison-content">
                    <div class="comparison-view active" id="full-${index}">
                        <div class="diff-container">
                            <div class="diff-panel">
                                <div class="panel-header old">
                                    <div class="diff-indicator removed"></div>
                                    Local JSON (${result.file})
                                </div>
                                <div class="json-tree">${leftJson}</div>
                            </div>
                            <div class="diff-panel">
                                <div class="panel-header new">
                                    <div class="diff-indicator added"></div>
                                    Remote JSON (${baseUrl}/${result.file})
                                </div>
                                <div class="json-tree">${rightJson}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="comparison-view" id="diff-${index}">
                        <div class="diff-container">
                            <div class="diff-panel">
                                <div class="panel-header old">
                                    <div class="diff-indicator removed"></div>
                                    Removed/Modified
                                </div>
                                <div class="json-tree">${removedContent}</div>
                            </div>
                            <div class="diff-panel">
                                <div class="panel-header new">
                                    <div class="diff-indicator added"></div>
                                    Added/Modified
                                </div>
                                <div class="json-tree">${addedContent}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (result.status === 'error') {
            statusIcon = '❌';
            statusClass = 'status-error';
            comparisonHtml = `
                <div class="error-message">
                    <strong>❌ Error:</strong> ${result.message}
                </div>
            `;
        }

        comparisonSectionsHtml += `
            <div class="file-section ${statusClass}">
                <div class="file-header">
                    <div class="file-title">
                        <span class="file-icon">${statusIcon}</span>
                        ${result.file}
                    </div>
                    <div class="file-metadata">
                        <p><strong>Local Path:</strong> <code>${result.file}</code></p>
                        <p><strong>Remote URL:</strong> <code>${baseUrl}/${result.file}</code></p>
                        <p><strong>Branch:</strong> <code>${currentBranch}</code></p>
                    </div>
                </div>
                <div class="file-comparison">
                    ${comparisonHtml}
                </div>
            </div>
        `;
    });

    // Calculate overall stats
    const totalAdded = allDifferences.filter(d => d.kind === 'N').length;
    const totalRemoved = allDifferences.filter(d => d.kind === 'D').length;
    const totalModified = allDifferences.filter(d => d.kind === 'E').length;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Comparison Report - ${folder}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fafafa;
            font-size: 14px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: #fff;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header .subtitle {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 20px;
        }

        .header .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .metadata-item {
            text-align: left;
        }

        .metadata-label {
            font-weight: 600;
            color: #24292e;
            font-size: 0.9rem;
        }

        .metadata-value {
            color: #586069;
            font-size: 0.9rem;
            margin-top: 2px;
        }

        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }

        .card:hover {
            transform: translateY(-2px);
        }

        .card.success {
            border-left: 4px solid #28a745;
        }

        .card.warning {
            border-left: 4px solid #ffc107;
        }

        .card.error {
            border-left: 4px solid #dc3545;
        }

        .card h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #24292e;
        }

        .card .count {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .success .count { color: #28a745; }
        .warning .count { color: #ffc107; }
        .error .count { color: #dc3545; }

        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            justify-content: center;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.875rem;
            padding: 8px 16px;
            background: #f6f8fa;
            border-radius: 20px;
        }

        .stat-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .stat-dot.added { background: #0969da; }
        .stat-dot.removed { background: #cf222e; }
        .stat-dot.modified { background: #9a6700; }

        .file-section {
            background: #fff;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .file-header {
            background: #f6f8fa;
            padding: 20px;
            border-bottom: 1px solid #e1e4e8;
        }

        .file-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #24292e;
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }

        .file-icon {
            font-size: 1.5rem;
            margin-right: 10px;
        }

        .file-metadata {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
            font-size: 0.9rem;
            color: #586069;
        }

        .file-metadata p {
            margin-bottom: 5px;
        }

        .file-metadata p:last-child {
            margin-bottom: 0;
        }

        .file-comparison {
            padding: 20px;
        }

        .comparison-tabs {
            display: flex;
            gap: 0;
            border-bottom: 1px solid #e1e4e8;
            margin-bottom: 20px;
        }

        .comparison-tab {
            padding: 12px 20px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 0.875rem;
            color: #586069;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }

        .comparison-tab:hover {
            color: #24292e;
        }

        .comparison-tab.active {
            color: #0969da;
            border-bottom-color: #0969da;
        }

        .comparison-content {
            position: relative;
        }

        .comparison-view {
            display: none;
        }

        .comparison-view.active {
            display: block;
        }

        .diff-container {
            display: flex;
            height: 600px;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            overflow: hidden;
        }

        .diff-panel {
            flex: 1;
            background: #fff;
            border-right: 1px solid #e1e4e8;
            overflow: auto;
        }

        .diff-panel:last-child {
            border-right: none;
        }

        .panel-header {
            background: #f6f8fa;
            padding: 12px 16px;
            border-bottom: 1px solid #e1e4e8;
            font-weight: 600;
            font-size: 0.875rem;
            color: #24292e;
            display: flex;
            align-items: center;
            gap: 8px;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        .panel-header.old {
            background: #ffeef0;
            color: #cf222e;
        }

        .panel-header.new {
            background: #f0f9ff;
            color: #0969da;
        }

        .json-tree {
            padding: 16px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
        }

        .json-line {
            display: flex;
            align-items: flex-start;
            min-height: 20px;
            position: relative;
            white-space: pre;
        }

        .json-line:hover {
            background: #f6f8fa;
        }

        .json-line.diff-added {
            background: #f0f9ff;
        }

        .json-line.diff-removed {
            background: #ffeef0;
        }

        .json-line.diff-modified {
            background: #fff8dc;
        }

        .line-number {
            flex-shrink: 0;
            width: 50px;
            padding: 2px 8px;
            color: #6e7781;
            font-size: 12px;
            text-align: right;
            border-right: 1px solid #e1e4e8;
            background: #f6f8fa;
            user-select: none;
        }

        .line-content {
            flex: 1;
            padding: 2px 8px;
            word-break: break-word;
        }

        .json-value {
            color: #0550ae;
        }

        .json-value.string {
            color: #0a3069;
        }

        .json-value.number {
            color: #953800;
        }

        .json-value.boolean {
            color: #953800;
        }

        .json-value.null {
            color: #6e7781;
            font-style: italic;
        }

        .json-bracket {
            color: #6e7781;
        }

        .diff-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
            flex-shrink: 0;
        }

        .diff-indicator.added {
            background: #0969da;
        }

        .diff-indicator.removed {
            background: #cf222e;
        }

        .diff-indicator.modified {
            background: #9a6700;
        }

        .tree-line {
            display: flex;
            align-items: flex-start;
            min-height: 20px;
            position: relative;
            padding: 8px 0;
        }

        .tree-line:hover {
            background: #f6f8fa;
        }

        .tree-line.diff-added {
            background: #f0f9ff;
        }

        .tree-line.diff-removed {
            background: #ffeef0;
        }

        .tree-line.diff-modified {
            background: #fff8dc;
        }

        .tree-content {
            flex: 1;
            padding: 2px 0;
            word-break: break-word;
        }

        .tree-key {
            color: #24292e;
            font-weight: 500;
        }

        .tree-value {
            color: #0550ae;
        }

        .no-differences {
            text-align: center;
            padding: 60px 20px;
            color: #28a745;
        }

        .no-differences h3 {
            font-size: 1.5rem;
            margin-bottom: 10px;
        }

        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 15px 20px;
            border-radius: 8px;
            margin-top: 10px;
            border-left: 4px solid #dc3545;
        }

        .status-identical {
            border-left: 4px solid #28a745;
        }

        .status-different {
            border-left: 4px solid #ffc107;
        }

        .status-error {
            border-left: 4px solid #dc3545;
        }

        .footer {
            text-align: center;
            padding: 30px;
            color: #6c757d;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .summary-cards {
                grid-template-columns: 1fr;
            }
            
            .header .metadata {
                grid-template-columns: 1fr;
            }
            
            .diff-container {
                flex-direction: column;
                height: auto;
            }
            
            .diff-panel {
                border-right: none;
                border-bottom: 1px solid #e1e4e8;
            }
            
            .stats {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 JSON Comparison Report</h1>
            <div class="subtitle">Generated for folder: <code>${folder}</code> on branch: <code>${currentBranch}</code></div>
            <div class="subtitle">Base URL: <code>${baseUrl}</code></div>
            <div class="timestamp">Generated: ${new Date(timestamp).toLocaleString()}</div>
            
            <div class="metadata">
                <div class="metadata-item">
                    <div class="metadata-label">📁 Folder</div>
                    <div class="metadata-value">${folder}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">🌿 Branch</div>
                    <div class="metadata-value">${currentBranch}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">🌐 Base URL</div>
                    <div class="metadata-value">${baseUrl}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">⏰ Timestamp</div>
                    <div class="metadata-value">${new Date(timestamp).toLocaleString()}</div>
                </div>
            </div>
        </div>

        <div class="summary-cards">
            <div class="card success">
                <h3>Identical Files</h3>
                <p class="count">${identicalCount}</p>
            </div>
            <div class="card warning">
                <h3>Files with Differences</h3>
                <p class="count">${differentCount}</p>
            </div>
            <div class="card error">
                <h3>Files with Errors</h3>
                <p class="count">${errorCount}</p>
            </div>
        </div>

        ${differentCount > 0 ? `
        <div class="stats">
            <div class="stat-item">
                <div class="stat-dot added"></div>
                <span>${totalAdded} added</span>
            </div>
            <div class="stat-item">
                <div class="stat-dot removed"></div>
                <span>${totalRemoved} removed</span>
            </div>
            <div class="stat-item">
                <div class="stat-dot modified"></div>
                <span>${totalModified} modified</span>
            </div>
        </div>
        ` : ''}

        <div class="results-section">
            <h2>File-by-File Analysis</h2>
            ${comparisonSectionsHtml}
        </div>

        <div class="footer">
            <p>📊 <strong>JSON Comparison Workflow</strong> - Generated automatically by GitHub Actions</p>
            <p>This report shows differences between local JSON files and their remote counterparts.</p>
        </div>
    </div>

    <script>
        // Tab switching functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Handle comparison tab switching
            document.querySelectorAll('.comparison-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.dataset.tab;
                    const fileSection = this.closest('.file-section');
                    
                    // Remove active class from all tabs in this file section
                    fileSection.querySelectorAll('.comparison-tab').forEach(t => t.classList.remove('active'));
                    fileSection.querySelectorAll('.comparison-view').forEach(v => v.classList.remove('active'));
                    
                    // Add active class to clicked tab and corresponding view
                    this.classList.add('active');
                    fileSection.querySelector('#' + tabId).classList.add('active');
                });
            });

            // Synchronize scrolling between panels
            function syncScroll() {
                document.querySelectorAll('.diff-container').forEach(container => {
                    const panels = container.querySelectorAll('.diff-panel');
                    if (panels.length === 2) {
                        const [leftPanel, rightPanel] = panels;
                        
                        leftPanel.addEventListener('scroll', () => {
                            rightPanel.scrollTop = leftPanel.scrollTop;
                            rightPanel.scrollLeft = leftPanel.scrollLeft;
                        });
                        
                        rightPanel.addEventListener('scroll', () => {
                            leftPanel.scrollTop = rightPanel.scrollTop;
                            leftPanel.scrollLeft = rightPanel.scrollLeft;
                        });
                    }
                });
            }

            // Initialize scroll sync
            syncScroll();
        });
    </script>
</body>
</html>
    `;
}

/**
 * Save the HTML report to a file
 */
function saveReport(html, outputPath) {
  try {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, html, 'utf8');
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to save report: ${error.message}`);
  }
}

/**
 * Generate a report and save it to a file
 */
function generateAndSaveReport(comparisonData, outputPath) {
  const html = generateHtmlReport(comparisonData);
  return saveReport(html, outputPath);
}

module.exports = {
  generateHtmlReport,
  saveReport,
  generateAndSaveReport
};
