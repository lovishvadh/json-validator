import fs from 'fs';
import axios from 'axios';
import path from 'path';
import pkg from 'deep-diff';
import { execSync } from 'child_process';
import { COMMIT_ID, MARKET, ORIGIN_URL, ORIGIN_URL_COMPARE, REPO_PATH } from './config.js';

const { diff: deepDiff } = pkg;

const compareJson = async (json1, json2, filename) => {
    if (!json1 || !json2) {
        console.error('Failed to retrieve one or both JSON sources.');
        return;
    }

    const parsedJson1 = JSON.parse(json1);
    const parsedJson2 = JSON.parse(json2);
    const differences = deepDiff(parsedJson1, parsedJson2);

    if (!differences) {
        console.log('No differences found. The JSON files are identical.');
    } else {
        console.log('Differences found:', differences, filename);

        const htmlReport = generateHtmlReport(differences, filename, parsedJson1, parsedJson2);

        writeDifferencesToFile(htmlReport, filename)
        console.log(`HTML report generated: ${filename}`);
    }
};

const generateHtmlReport = (differences, filename, json1, json2) => {
    // Create a map of differences for quick lookup
    const diffMap = new Map();
    const diffLinesMap = new Map(); // Map to track which lines contain differences
    
    differences.forEach(diff => {
        const path = diff.path ? diff.path.join('.') : '';
        diffMap.set(path, diff);
        
        // Create a more sophisticated mapping for line-based highlighting
        const pathParts = diff.path || [];
        let jsonPath = '';
        
        // Build the JSON path to find the exact location
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (jsonPath) jsonPath += '.';
            jsonPath += part;
        }
        
        // Store the diff info for this path
        if (!diffLinesMap.has(jsonPath)) {
            diffLinesMap.set(jsonPath, []);
        }
        diffLinesMap.get(jsonPath).push(diff);
    });

    const htmlHeader = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename} - JSON Diff</title>
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
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
        }

        .header {
            background: #fff;
            border-bottom: 1px solid #e1e4e8;
            padding: 16px 24px;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #24292e;
            margin-bottom: 4px;
        }

        .header .subtitle {
            font-size: 0.875rem;
            color: #586069;
        }

        .view-tabs {
            background: #fff;
            border-bottom: 1px solid #e1e4e8;
            padding: 0 24px;
            display: flex;
            gap: 0;
        }

        .view-tab {
            padding: 12px 16px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 0.875rem;
            color: #586069;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }

        .view-tab:hover {
            color: #24292e;
        }

        .view-tab.active {
            color: #0969da;
            border-bottom-color: #0969da;
        }

        .view-content {
            display: none;
        }

        .view-content.active {
            display: block;
        }

        .diff-container {
            display: flex;
            height: calc(100vh - 140px);
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

        .json-line.highlighted {
            background: #fff8dc !important;
            border-left: 3px solid #9a6700;
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

        .json-comma {
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

        .diff-summary {
            background: #fff;
            border-bottom: 1px solid #e1e4e8;
            padding: 16px 24px;
        }

        .diff-stats {
            display: flex;
            gap: 24px;
            align-items: center;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.875rem;
        }

        .stat-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .stat-dot.added { background: #0969da; }
        .stat-dot.removed { background: #cf222e; }
        .stat-dot.modified { background: #9a6700; }

        .controls {
            display: flex;
            gap: 12px;
            margin-top: 12px;
        }

        .control-btn {
            padding: 6px 12px;
            border: 1px solid #d0d7de;
            background: #f6f8fa;
            border-radius: 6px;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .control-btn:hover {
            background: #f3f4f6;
        }

        .control-btn.active {
            background: #0969da;
            color: white;
            border-color: #0969da;
        }

        .no-differences {
            text-align: center;
            padding: 60px 20px;
            color: #586069;
        }

        .no-differences h2 {
            font-size: 1.5rem;
            margin-bottom: 8px;
            color: #24292e;
        }

        .no-differences p {
            font-size: 0.875rem;
        }

        .tree-line {
            display: flex;
            align-items: flex-start;
            min-height: 20px;
            position: relative;
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

        .tree-indent {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #586069;
            font-size: 12px;
        }

        .tree-indent:hover {
            color: #24292e;
        }

        .tree-indent.expanded::before {
            content: '▼';
        }

        .tree-indent.collapsed::before {
            content: '▶';
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

        .tree-value.string {
            color: #0a3069;
        }

        .tree-value.number {
            color: #953800;
        }

        .tree-value.boolean {
            color: #953800;
        }

        .tree-value.null {
            color: #6e7781;
            font-style: italic;
        }

        .tree-bracket {
            color: #6e7781;
        }

        .tree-comma {
            color: #6e7781;
        }

        @media (max-width: 768px) {
            .diff-container {
                flex-direction: column;
                height: auto;
            }
            
            .diff-panel {
                border-right: none;
                border-bottom: 1px solid #e1e4e8;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>JSON Diff</h1>
            <div class="subtitle">${filename}</div>
        </div>
`;

    const htmlFooter = `
    </div>

    <script>
        // Tab switching functionality
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update tab states
                document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update content visibility
                const viewType = tab.dataset.view;
                document.querySelectorAll('.view-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(viewType + '-view').classList.add('active');
            });
        });

        // Tree expansion/collapse functionality
        document.querySelectorAll('.tree-indent').forEach(indent => {
            indent.addEventListener('click', (e) => {
                e.stopPropagation();
                const line = indent.closest('.tree-line');
                const children = line.querySelectorAll('.tree-line');
                
                if (indent.classList.contains('expanded')) {
                    indent.classList.remove('expanded');
                    indent.classList.add('collapsed');
                    children.forEach(child => {
                        if (child !== line) {
                            child.style.display = 'none';
                        }
                    });
                } else {
                    indent.classList.remove('collapsed');
                    indent.classList.add('expanded');
                    children.forEach(child => {
                        child.style.display = 'flex';
                    });
                }
            });
        });

        // Filter functionality
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                document.querySelectorAll('.tree-line').forEach(line => {
                    if (filter === 'all' || line.classList.contains('diff-' + filter)) {
                        line.style.display = 'flex';
                    } else {
                        line.style.display = 'none';
                    }
                });
            });
        });

        // Highlight differences on hover
        document.querySelectorAll('.tree-line, .json-line').forEach(line => {
            if (line.classList.contains('diff-added') || 
                line.classList.contains('diff-removed') || 
                line.classList.contains('diff-modified')) {
                
                line.addEventListener('mouseenter', () => {
                    line.classList.add('highlighted');
                });
                
                line.addEventListener('mouseleave', () => {
                    line.classList.remove('highlighted');
                });
            }
        });

        // Auto-expand first level for tree view
        document.querySelectorAll('.tree-line').forEach(line => {
            const depth = (line.querySelector('.tree-indent') || {}).style?.marginLeft || '0px';
            if (parseInt(depth) < 40) {
                const indent = line.querySelector('.tree-indent');
                if (indent) {
                    indent.classList.add('expanded');
                }
            }
        });

        // Synchronize scrolling between panels in full JSON view
        const fullViewPanels = document.querySelectorAll('#full-view .diff-panel');
        if (fullViewPanels.length === 2) {
            const [leftPanel, rightPanel] = fullViewPanels;
            
            leftPanel.addEventListener('scroll', () => {
                rightPanel.scrollTop = leftPanel.scrollTop;
                rightPanel.scrollLeft = leftPanel.scrollLeft;
            });
            
            rightPanel.addEventListener('scroll', () => {
                leftPanel.scrollTop = rightPanel.scrollTop;
                leftPanel.scrollLeft = rightPanel.scrollLeft;
            });
        }
    </script>
</body>
</html>
`;

    // Calculate statistics
    const stats = {
        added: differences.filter(d => d.kind === 'N').length,
        removed: differences.filter(d => d.kind === 'D').length,
        modified: differences.filter(d => d.kind === 'E' || d.kind === 'A').length
    };

    const diffSummary = `
        <div class="diff-summary">
            <div class="diff-stats">
                <div class="stat-item">
                    <div class="stat-dot added"></div>
                    <span>${stats.added} added</span>
                </div>
                <div class="stat-item">
                    <div class="stat-dot removed"></div>
                    <span>${stats.removed} removed</span>
                </div>
                <div class="stat-item">
                    <div class="stat-dot modified"></div>
                    <span>${stats.modified} modified</span>
                </div>
            </div>
            <div class="controls">
                <button class="control-btn active" data-filter="all">All Changes</button>
                <button class="control-btn" data-filter="added">Added</button>
                <button class="control-btn" data-filter="removed">Removed</button>
                <button class="control-btn" data-filter="modified">Modified</button>
            </div>
        </div>
    `;

    // Function to render JSON with syntax highlighting and diff indicators
    const renderJsonWithHighlights = (obj, diffMap, isOld = false) => {
        const jsonString = JSON.stringify(obj, null, 2);
        const lines = jsonString.split('\n');
        
        return lines.map((line, lineIndex) => {
            // Check if this line contains any differences
            let diffClass = '';
            let diffIndicator = '';
            
            // More accurate diff detection based on the actual JSON structure
            const trimmedLine = line.trim();
            if (trimmedLine.includes('"')) {
                const keyMatch = trimmedLine.match(/"([^"]+)":/);
                if (keyMatch) {
                    const key = keyMatch[1];
                    // Check if this key has any differences
                    for (const [path, diff] of diffMap.entries()) {
                        const pathParts = path.split('.');
                        const lastPart = pathParts[pathParts.length - 1];
                        
                        if (lastPart === key || path.includes(key)) {
                            if (isOld && (diff.kind === 'D' || diff.kind === 'E')) {
                                diffClass = diff.kind === 'D' ? 'diff-removed' : 'diff-modified';
                                diffIndicator = `<div class="diff-indicator ${diff.kind === 'D' ? 'removed' : 'modified'}"></div>`;
                            } else if (!isOld && (diff.kind === 'N' || diff.kind === 'E')) {
                                diffClass = diff.kind === 'N' ? 'diff-added' : 'diff-modified';
                                diffIndicator = `<div class="diff-indicator ${diff.kind === 'N' ? 'added' : 'modified'}"></div>`;
                            }
                            break;
                        }
                    }
                }
            }
            
            // Apply syntax highlighting - show keys normally without special styling
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
    };

    // Create tree view representation for differences only
    const createTreeView = (differences) => {
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
    };

    const viewTabs = `
        <div class="view-tabs">
            <button class="view-tab active" data-view="full">Full JSON Comparison</button>
            <button class="view-tab" data-view="diff">Differences Only</button>
        </div>
    `;

    const fullJsonView = `
        <div class="view-content active" id="full-view">
            <div class="diff-container">
                <div class="diff-panel">
                    <div class="panel-header old">
                        <div class="diff-indicator removed"></div>
                        Previous Version
                    </div>
                    <div class="json-tree">
                        ${renderJsonWithHighlights(json1, diffMap, true)}
                    </div>
                </div>
                <div class="diff-panel">
                    <div class="panel-header new">
                        <div class="diff-indicator added"></div>
                        New Version
                    </div>
                    <div class="json-tree">
                        ${renderJsonWithHighlights(json2, diffMap, false)}
                    </div>
                </div>
            </div>
        </div>
    `;

    const diffOnlyView = `
        <div class="view-content" id="diff-view">
            <div class="diff-container">
                <div class="diff-panel">
                    <div class="panel-header old">
                        <div class="diff-indicator removed"></div>
                        Removed/Modified
                    </div>
                    <div class="json-tree">
                        ${createTreeView(differences.filter(d => d.kind === 'D' || d.kind === 'E'))}
                    </div>
                </div>
                <div class="diff-panel">
                    <div class="panel-header new">
                        <div class="diff-indicator added"></div>
                        Added/Modified
                    </div>
                    <div class="json-tree">
                        ${createTreeView(differences.filter(d => d.kind === 'N' || d.kind === 'E'))}
                    </div>
                </div>
            </div>
        </div>
    `;

    return htmlHeader + diffSummary + viewTabs + fullJsonView + diffOnlyView + htmlFooter;
};

function getAllJSONFiles(repoPath) {
    let jsonFiles = [];
    function readFolder(dir, relativePath = "") {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const fileRelativePath = path.join(relativePath, file)
            if (fs.statSync(fullPath).isDirectory()) {
                readFolder(fullPath, fileRelativePath);
            } else if (file.endsWith('.json')) {
                jsonFiles.push(fileRelativePath);
            }
        });
    }
    readFolder(repoPath);
    return jsonFiles;
}

const getFilesFromLocalFolder = (folderPath) => {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    let jsonFiles = [];
    files.forEach(file => {
        if (file.isDirectory()) {
            jsonFiles = [...jsonFiles, ...getFilesFromLocalFolder(`${folderPath}/${file.name}`)];
        } else if (file.name.endsWith('.json')) {
            jsonFiles.push(`${folderPath}/${file.name}`);
        }
    });
    return jsonFiles;
};

const compareLocalJsons = async (baseURL, repoPath, filenames) => {
    for (const filename of filenames) {
        const filePath = path.join(repoPath, filename);
        const url1 = `${baseURL}/${filename}`;
        try {
            const localContent = await fs.readFileSync(filePath, 'utf-8');
            const urlContent = await axios.get(url1);
            console.log("Comparing from local to:", baseURL, filename)

            compareJson(localContent, JSON.stringify(urlContent.data), filename);
        } catch (err) {
            console.error(`❌ Could not read ${filename}: ${err.message}`);
        }
    }

}

const compareUrlJsons = async (baseURL, secondaryBaseURL, filenames) => {
    for (const filename of filenames) {
        const url1 = `${baseURL}/${filename}`;
        const url2 = `${secondaryBaseURL}/${filename}`;
        try {
            const response1 = await axios.get(url1);
            const response2 = await axios.get(url2);
            compareJson(JSON.stringify(response1.data), JSON.stringify(response2.data), filename);

        } catch (err) {
            console.error(`❌ Could not fetch ${filename}: ${err.message}`);
        }
    }
}


async function main() {
    const repoPath = REPO_PATH; // Link to local JSONs repo
    const market = MARKET;
    const baseURL = ORIGIN_URL; // Base URL for e1/e2/e3
    const secondaryBaseURL = ORIGIN_URL_COMPARE; // Secondary compare URL for e1/e2/e3
    console.log("\n📂 Getting all JSON files from subfolders...");

    const allFiles = getAllJSONFiles(repoPath + market);

    if (!market) {
        console.log("\n❌ set MARKET in config.js");
        return;
    }

    // if(repoPath) {
    // // Comment if you dont want to validate Local JSON files
    // console.log("\n🖥 Comparing JSON Files from Local Folder...");
    // await compareLocalJsons(secondaryBaseURL + market, repoPath + market, allFiles);
    // } else {
    // console.log("\n❌ set repo path in config.js");
    // }

    if (baseURL) {
        // // Comment if you dont want to validate URL files
        console.log("\n🌍 Comparing JSON Files from URL...");
        await compareUrlJsons(baseURL + market, secondaryBaseURL + market, allFiles);
    } else {
        console.log("\n❌ set origin url in config.js");
    }

}

main().catch(err => console.error("Unexpected error:", err));