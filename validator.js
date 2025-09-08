import fs from 'fs';

import path from 'path';

import axios from 'axios';

import { REPO_PATH, ORIGIN_URL, MARKET } from './config.js';

 

function validateJSON(content, filename) {
    // First check for duplicate keys at the same level
    const duplicateKeyInfo = findDuplicateKeysAtSameLevel(content);
    if (duplicateKeyInfo) {
        console.error(`\n❌ JSON Validation Error in ${filename}:`);
        console.error(`   Error Type: DuplicateKeyError`);
        console.error(`   Error Message: Duplicate key "${duplicateKeyInfo.key}" found at the same level`);
        console.error(`   🔍 Duplicate Key Analysis:`);
        console.error(`      Key "${duplicateKeyInfo.key}" appears ${duplicateKeyInfo.count} times at the same level`);
        console.error(`      First occurrence: Line ${duplicateKeyInfo.firstLine}`);
        console.error(`      Last occurrence: Line ${duplicateKeyInfo.lastLine}`);
        console.error(`      All occurrences: Lines ${duplicateKeyInfo.allLines.join(', ')}`);
        console.error(`      Parent context: ${duplicateKeyInfo.parentContext}`);
        
        // Show only the duplicate line
        const lines = content.split('\n');
        console.error(`   Context:`);
        console.error(`   >>> ${duplicateKeyInfo.firstLine}: ${lines[duplicateKeyInfo.firstLine - 1]}`);
        
        console.error(`   💡 Suggestion: Remove all duplicate keys except the first one. Each key in a JSON object must be unique at the same level.`);
        console.error(''); // Add spacing for readability
        return;
    }
    
    try {
        JSON.parse(content);
        console.log(`✅ ${filename} is a valid JSON.`);
    } catch (error) {
        console.error(`\n❌ JSON Validation Error in ${filename}:`);
        console.error(`   Error Type: ${error.name}`);
        console.error(`   Error Message: ${error.message}`);
        
        // Extract line and position information from the error
        const errorDetails = extractJSONErrorDetails(content, error);
        
        if (errorDetails) {
            console.error(`   Line: ${errorDetails.line}`);
            console.error(`   Position: ${errorDetails.position}`);
            console.error(`   Character: ${errorDetails.character}`);
            
            // Show only the error line, not multiple context lines
            const lines = content.split('\n');
            if (lines[errorDetails.line - 1]) {
                console.error(`   Error Line: ${errorDetails.line}: ${lines[errorDetails.line - 1]}`);
            }
            
            // Provide helpful suggestions based on error type
            const suggestion = getErrorSuggestion(error.message);
            if (suggestion) {
                console.error(`   💡 Suggestion: ${suggestion}`);
            }
        }
        console.error(''); // Add spacing for readability
    }
}

function extractJSONErrorDetails(content, error) {
    try {
        // Try to parse the JSON to get detailed error information
        JSON.parse(content);
    } catch (parseError) {
        const message = parseError.message;
        
        // Extract position information from error message
        const positionMatch = message.match(/position (\d+)/);
        const position = positionMatch ? parseInt(positionMatch[1]) : null;
        
        if (position !== null) {
            // Calculate line and character position
            const lines = content.split('\n');
            let currentPos = 0;
            let line = 1;
            let charInLine = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const lineLength = lines[i].length + 1; // +1 for newline
                if (currentPos + lineLength > position) {
                    line = i + 1;
                    charInLine = position - currentPos;
                    break;
                }
                currentPos += lineLength;
            }
            
            // Get context around the error (3 lines before and after)
            const context = [];
            const startLine = Math.max(0, line - 3);
            const endLine = Math.min(lines.length, line + 2);
            
            for (let i = startLine; i < endLine; i++) {
                context.push(lines[i]);
            }
            
            return {
                line,
                position,
                character: charInLine,
                context
            };
        }
    }
    
    return null;
}

function getErrorSuggestion(errorMessage) {
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('unexpected token')) {
        return 'Check for missing commas(,), extra commas(,), missing quotes("), extra quotes("), or incorrect syntax around the indicated position.';
    }
    
    if (lowerMessage.includes('unexpected end of json input')) {
        return 'The JSON file appears to be incomplete. Check for missing closing brackets, braces, or quotes.';
    }
    
    if (lowerMessage.includes('duplicate key')) {
        return 'Remove the duplicate key. Each key in a JSON object must be unique.';
    }
    
    if (lowerMessage.includes('unexpected number')) {
        return 'Check for invalid number format or missing quotes around string values.';
    }
    
    if (lowerMessage.includes('unexpected string')) {
        return 'Check for missing quotes around string values or incorrect string formatting.';
    }
    
    if (lowerMessage.includes('unexpected identifier')) {
        return 'Check for missing quotes around property names or invalid characters in identifiers.';
    }
    
    return 'Review the JSON syntax around the indicated position. Common issues include missing commas, extra commas, or unclosed brackets/braces.';
}

function findDuplicateKeysAtSameLevel(content) {
    try {
        const lines = content.split('\n');
        const keyPattern = /^(\s*)"([^"]+)"\s*:/;
        const bracketStack = [];
        const currentLevelKeys = new Map(); // Map to track keys at current level
        const duplicateInfo = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Track opening and closing brackets to determine nesting level
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '{' || char === '[') {
                    bracketStack.push({ 
                        type: char, 
                        line: i + 1,
                        isArray: char === '[',
                        isObject: char === '{'
                    });
                    // When entering a new object, reset the current level keys
                    if (char === '{') {
                        currentLevelKeys.clear();
                    }
                } else if (char === '}' || char === ']') {
                    if (bracketStack.length > 0) {
                        const lastBracket = bracketStack.pop();
                        // If we're closing an object, we might need to track this for context
                    }
                }
            }
            
            // Check for key patterns
            const match = line.match(keyPattern);
            if (match) {
                const indent = match[1].length;
                const key = match[2];
                const lineNum = i + 1;
                
                // Calculate the current nesting level based on indentation
                const nestingLevel = Math.floor(indent / 2); // Assuming 2-space indentation
                
                // Create a level identifier that includes array context
                const levelId = getLevelIdentifier(bracketStack, i, lines);
                
                // Check if this key already exists at the same level
                if (currentLevelKeys.has(key)) {
                    const existingEntry = currentLevelKeys.get(key);
                    
                    // Only flag as duplicate if they're at the same level AND not in different array elements
                    if (existingEntry.levelId === levelId) {
                        duplicateInfo.push({
                            key,
                            count: 2, // We found a duplicate
                            firstLine: existingEntry.line,
                            lastLine: lineNum,
                            allLines: [existingEntry.line, lineNum],
                            level: levelId,
                            parentContext: getParentContext(lines, i, bracketStack)
                        });
                    }
                } else {
                    currentLevelKeys.set(key, { line: lineNum, levelId: levelId });
                }
            }
        }
        
        // Return the first duplicate found
        return duplicateInfo.length > 0 ? duplicateInfo[0] : null;
        
    } catch (err) {
        return null;
    }
}

function getLevelIdentifier(bracketStack, currentLineIndex, lines) {
    // Create a unique identifier for the current level that includes array context
    let levelId = '';
    let arrayDepth = 0;
    let objectDepth = 0;
    
    for (const bracket of bracketStack) {
        if (bracket.isArray) {
            arrayDepth++;
            levelId += `A${arrayDepth}`;
        } else if (bracket.isObject) {
            objectDepth++;
            levelId += `O${objectDepth}`;
        }
    }
    
    // Add array element position if we're inside an array
    if (arrayDepth > 0) {
        // Find the current array element position
        const elementPosition = findArrayElementPosition(lines, currentLineIndex, bracketStack);
        levelId += `E${elementPosition}`;
    }
    
    return levelId;
}

function findArrayElementPosition(lines, currentLineIndex, bracketStack) {
    // Find which array element we're currently in
    let elementCount = 0;
    let inArray = false;
    
    for (let i = 0; i <= currentLineIndex; i++) {
        const line = lines[i];
        
        // Check for array opening
        if (line.includes('[') && !line.includes(']')) {
            inArray = true;
            elementCount = 0;
        }
        
        // Check for object opening within array (new element)
        if (inArray && line.trim().startsWith('{')) {
            elementCount++;
        }
        
        // Check for array closing
        if (line.includes(']') && !line.includes('[')) {
            inArray = false;
        }
    }
    
    return elementCount;
}

function getParentContext(lines, currentLineIndex, bracketStack) {
    // Find the parent object/array context
    if (bracketStack.length === 0) {
        return "root level";
    }
    
    // Look for the most recent opening bracket to determine parent context
    for (let i = currentLineIndex; i >= 0; i--) {
        const line = lines[i];
        if (line.includes('{') || line.includes('[')) {
            const match = line.match(/^(\s*)([^:]+):\s*[{\[]/);
            if (match) {
                return `inside "${match[2].trim().replace(/"/g, '')}"`;
            }
        }
    }
    
    return "object level";
}

 

function getAllJSONFiles(repoPath) {

    let jsonFiles = [];

    function readFolder(dir, relativePath="") {

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

 

function validateLocalJSON(repoPath, filenames = []) {
    const files = filenames.length ? filenames : fs.readdirSync(repoPath).filter(f => f.endsWith('.json'));
    files.forEach(file => {
        const filePath = path.join(repoPath, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            validateJSON(content, file);
        } catch (err) {
            console.error(`\n❌ File Reading Error for ${file}:`);
            console.error(`   Error Type: ${err.name}`);
            console.error(`   Error Message: ${err.message}`);
            console.error(`   File Path: ${filePath}`);
            
            if (err.code === 'ENOENT') {
                console.error(`   💡 Suggestion: The file does not exist. Check if the file path is correct.`);
            } else if (err.code === 'EACCES') {
                console.error(`   💡 Suggestion: Permission denied. Check file permissions.`);
            } else if (err.code === 'EISDIR') {
                console.error(`   💡 Suggestion: The path is a directory, not a file.`);
            } else {
                console.error(`   💡 Suggestion: Check if the file exists and is readable.`);
            }
            console.error(''); // Add spacing for readability
        }
    });
}

async function validateJSONFromBaseURL(baseURL, filenames) {
    // Check if we should use proxy server
    const useProxy = process.env.USE_PROXY === 'true' || process.env.PROXY_URL;
    const proxyUrl = process.env.PROXY_URL || 'http://localhost:3000';
    
    for (const filename of filenames) {
        const url = `${baseURL}/${filename}`;
        try {
            let response;
            
            if (useProxy) {
                // Use proxy server to avoid CORS issues
                const proxyEndpoint = `${proxyUrl}/proxy?url=${encodeURIComponent(url)}`;
                response = await axios.get(proxyEndpoint);
                
                // Extract the actual JSON data from proxy response
                if (response.data.success && response.data.data) {
                    validateJSON(JSON.stringify(response.data.data), filename);
                } else {
                    throw new Error(response.data.error || 'Proxy server error');
                }
            } else {
                // Direct request (may fail due to CORS)
                response = await axios.get(url);
                validateJSON(JSON.stringify(response.data), filename);
            }
        } catch (err) {
            console.error(`\n❌ Network Error for ${filename}:`);
            console.error(`   URL: ${url}`);
            console.error(`   Error Type: ${err.name}`);
            
            if (err.response) {
                // Server responded with error status
                console.error(`   HTTP Status: ${err.response.status} ${err.response.statusText}`);
                console.error(`   Error Message: ${err.message}`);
                
                if (err.response.status === 404) {
                    console.error(`   💡 Suggestion: The file was not found at the specified URL.`);
                } else if (err.response.status === 403) {
                    console.error(`   💡 Suggestion: Access forbidden. Check if authentication is required.`);
                } else if (err.response.status >= 500) {
                    console.error(`   💡 Suggestion: Server error. Try again later.`);
                }
            } else if (err.request) {
                // Request was made but no response received
                console.error(`   Error Message: No response received from server`);
                console.error(`   💡 Suggestion: Check your internet connection and try again.`);
            } else {
                // Something else happened
                console.error(`   Error Message: ${err.message}`);
                console.error(`   💡 Suggestion: Check the URL format and network connectivity.`);
            }
            
            // Suggest using proxy if CORS error
            if (err.message.includes('CORS') || err.message.includes('cors')) {
                console.error(`   💡 CORS Issue: Consider using the proxy server by setting USE_PROXY=true`);
            }
            
            console.error(''); // Add spacing for readability
        }
    }
}

 

async function main() {

    const repoPath = REPO_PATH; // Link to local JSONs repo

    const market = MARKET;

    const baseURL = ORIGIN_URL; // Base URL for e1/e2/e3

    console.log("\n📂 Getting all JSON files from subfolders...");

 

    const allFiles = getAllJSONFiles(repoPath + market);

 

    if(!market) {

        console.log("\n❌ set MARKET in config.js");

        return;

    }

 

    if(repoPath) {

        // Comment if you dont want to validate Local JSON files

        console.log("\n🖥 Validating JSON Files from Local Folder...");

        await validateLocalJSON(repoPath + market, allFiles);

    } else {

        console.log("\n❌ set repo path in config.js");

    }

 

    if(baseURL) {

        // // Comment if you dont want to validate URL files

        console.log("\n🌍 Validating JSON Files from Base URL...");

        await validateJSONFromBaseURL(baseURL + market, allFiles);

    } else {

        console.log("\n❌ set origin url in config.js");

    }

 

}

 

main().catch(err => console.error("Unexpected error:", err));