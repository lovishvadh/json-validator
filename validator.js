import fs from 'fs';

import path from 'path';

 

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

 


 

function validateLocalJSON(repoPath, filenames) {
    if (!filenames || filenames.length === 0) {
        console.log("❌ No files provided for validation.");
        return;
    }
    
    filenames.forEach(file => {
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


 

async function main() {
    // Get JSON files from command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("❌ No JSON files provided for validation.");
        console.log("Usage: node validator.js <file1.json> <file2.json> ...");
        process.exit(1);
    }
    
    // Validate the specified JSON files
    console.log("\n🔍 Validating JSON files from commit...");
    await validateLocalJSON('.', args);
}

 

main().catch(err => console.error("Unexpected error:", err));