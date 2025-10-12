const fs = require('fs');
const path = require('path');

function validateJSON(content, filename) {
    // Check for duplicate keys at the same level
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
        
        const lines = content.split('\n');
        console.error(`   Context:`);
        console.error(`   >>> ${duplicateKeyInfo.firstLine}: ${lines[duplicateKeyInfo.firstLine - 1]}`);
        
        console.error(`   💡 Suggestion: Remove all duplicate keys except the first one. Each key in a JSON object must be unique at the same level.`);
        console.error('');
        return true;
    }
    
    try {
        const parsedData = JSON.parse(content);
        
        // Check for invalid HTML in string values
        const htmlErrors = validateHTMLInJSON(parsedData, content, filename);
        if (htmlErrors.length > 0) {
            htmlErrors.forEach(error => {
                console.error(`\n❌ JSON Validation Error in ${filename}:`);
                console.error(`   Error Type: InvalidHTMLError`);
                console.error(`   Error Message: ${error.message}`);
                console.error(`   🔍 HTML Validation Details:`);
                console.error(`      Key Path: ${error.path}`);
                console.error(`      Line: ${error.line}`);
                console.error(`      Unclosed Tags: ${error.unclosedTags.join(', ')}`);
                console.error(`      HTML Content Preview: ${error.preview}`);
                console.error(`   💡 Suggestion: ${error.suggestion}`);
                console.error('');
            });
            return true;
        }
        
        console.log(`✅ ${filename} is a valid JSON.`);
        return false;
    } catch (error) {
        console.error(`\n❌ JSON Validation Error in ${filename}:`);
        console.error(`   Error Type: ${error.name}`);
        console.error(`   Error Message: ${error.message}`);
        
        const errorDetails = extractJSONErrorDetails(content, error);
        if (errorDetails) {
            console.error(`   Line: ${errorDetails.line}`);
            console.error(`   Position: ${errorDetails.position}`);
            console.error(`   Character: ${errorDetails.character}`);
            
            const lines = content.split('\n');
            if (lines[errorDetails.line - 1]) {
                console.error(`   Error Line: ${errorDetails.line}: ${lines[errorDetails.line - 1]}`);
            }
            
            const suggestion = getErrorSuggestion(error.message);
            if (suggestion) {
                console.error(`   💡 Suggestion: ${suggestion}`);
            }
        }
        console.error('');
        return true;
    }
}

function findDuplicateKeysAtSameLevel(content) {
    try {
        const lines = content.split('\n');
        const keyPattern = /^(\s*)"([^"]+)"\s*:/;
        const bracketStack = [];
        const currentLevelKeys = new Map();
        const duplicateInfo = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '{' || char === '[') {
                    bracketStack.push({ 
                        type: char, 
                        line: i + 1,
                        isArray: char === '[',
                        isObject: char === '{'
                    });
                    if (char === '{') {
                        currentLevelKeys.clear();
                    }
                } else if (char === '}' || char === ']') {
                    if (bracketStack.length > 0) {
                        bracketStack.pop();
                    }
                }
            }
            
            const match = line.match(keyPattern);
            if (match) {
                const indent = match[1].length;
                const key = match[2];
                const lineNum = i + 1;
                
                const levelId = getLevelIdentifier(bracketStack, i, lines);
                
                if (currentLevelKeys.has(key)) {
                    const existingEntry = currentLevelKeys.get(key);
                    
                    if (existingEntry.levelId === levelId) {
                        duplicateInfo.push({
                            key,
                            count: 2,
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
        
        return duplicateInfo.length > 0 ? duplicateInfo[0] : null;
        
    } catch (err) {
        return null;
    }
}

function getLevelIdentifier(bracketStack, currentLineIndex, lines) {
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
    
    if (arrayDepth > 0) {
        const elementPosition = findArrayElementPosition(lines, currentLineIndex, bracketStack);
        levelId += `E${elementPosition}`;
    }
    
    return levelId;
}

function findArrayElementPosition(lines, currentLineIndex, bracketStack) {
    let elementCount = 0;
    let inArray = false;
    
    for (let i = 0; i <= currentLineIndex; i++) {
        const line = lines[i];
        
        if (line.includes('[') && !line.includes(']')) {
            inArray = true;
            elementCount = 0;
        }
        
        if (inArray && line.trim().startsWith('{')) {
            elementCount++;
        }
        
        if (line.includes(']') && !line.includes('[')) {
            inArray = false;
        }
    }
    
    return elementCount;
}

function getParentContext(lines, currentLineIndex, bracketStack) {
    if (bracketStack.length === 0) {
        return "root level";
    }
    
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

function extractJSONErrorDetails(content, error) {
    try {
        JSON.parse(content);
    } catch (parseError) {
        const message = parseError.message;
        const positionMatch = message.match(/position (\d+)/);
        const position = positionMatch ? parseInt(positionMatch[1]) : null;
        
        if (position !== null) {
            const lines = content.split('\n');
            let currentPos = 0;
            let line = 1;
            let charInLine = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const lineLength = lines[i].length + 1;
                if (currentPos + lineLength > position) {
                    line = i + 1;
                    charInLine = position - currentPos;
                    break;
                }
                currentPos += lineLength;
            }
            
            return {
                line,
                position,
                character: charInLine
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

function validateHTMLInJSON(data, content, filename, path = '', errors = []) {
    if (typeof data === 'string') {
        // Check if the string contains HTML tags
        if (containsHTML(data)) {
            const htmlValidation = validateHTML(data);
            if (!htmlValidation.isValid) {
                const lineNumber = findLineNumberForPath(content, path, data);
                errors.push({
                    path: path || 'root',
                    line: lineNumber,
                    message: htmlValidation.message,
                    unclosedTags: htmlValidation.unclosedTags,
                    preview: data.length > 100 ? data.substring(0, 100) + '...' : data,
                    suggestion: htmlValidation.suggestion
                });
            }
        }
    } else if (Array.isArray(data)) {
        data.forEach((item, index) => {
            validateHTMLInJSON(item, content, filename, `${path}[${index}]`, errors);
        });
    } else if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach(key => {
            const newPath = path ? `${path}.${key}` : key;
            validateHTMLInJSON(data[key], content, filename, newPath, errors);
        });
    }
    
    return errors;
}

function containsHTML(str) {
    // Check if string contains HTML tags
    const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
    return htmlTagPattern.test(str);
}

function validateHTML(htmlString) {
    // Self-closing tags that don't need closing tags
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
                             'link', 'meta', 'param', 'source', 'track', 'wbr'];
    
    // Extract all tags from the HTML string
    const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    const tags = [];
    let match;
    
    while ((match = tagPattern.exec(htmlString)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();
        const isClosing = fullTag.startsWith('</');
        const isSelfClosing = fullTag.endsWith('/>') || selfClosingTags.includes(tagName);
        
        tags.push({
            name: tagName,
            isClosing: isClosing,
            isSelfClosing: isSelfClosing,
            fullTag: fullTag
        });
    }
    
    // Stack to track opening tags
    const stack = [];
    const unclosedTags = [];
    
    for (const tag of tags) {
        if (tag.isSelfClosing && !tag.isClosing) {
            // Self-closing tags don't need to be tracked
            continue;
        }
        
        if (tag.isClosing) {
            // Closing tag
            if (stack.length === 0) {
                unclosedTags.push(tag.name);
            } else if (stack[stack.length - 1].name === tag.name) {
                stack.pop();
            } else {
                // Mismatched closing tag
                unclosedTags.push(tag.name);
            }
        } else {
            // Opening tag
            stack.push(tag);
        }
    }
    
    // Any remaining tags in the stack are unclosed
    stack.forEach(tag => {
        unclosedTags.push(tag.name);
    });
    
    if (unclosedTags.length > 0) {
        return {
            isValid: false,
            message: `HTML string contains unclosed or mismatched tags: ${unclosedTags.join(', ')}`,
            unclosedTags: [...new Set(unclosedTags)],
            suggestion: `Ensure all HTML tags are properly closed. Unclosed tags: ${[...new Set(unclosedTags)].map(t => `<${t}>...</${t}>`).join(', ')}`
        };
    }
    
    return {
        isValid: true,
        message: 'HTML is valid',
        unclosedTags: [],
        suggestion: ''
    };
}

function findLineNumberForPath(content, path, value) {
    // Try to find the line number where this value appears
    const lines = content.split('\n');
    const searchValue = JSON.stringify(value);
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchValue) || lines[i].includes(value)) {
            return i + 1;
        }
    }
    
    // If not found, try to find by path
    const pathParts = path.split('.');
    const lastKey = pathParts[pathParts.length - 1];
    
    if (lastKey) {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(`"${lastKey}"`)) {
                return i + 1;
            }
        }
    }
    
    return 0;
}

// Main validation logic
const args = process.argv.slice(2);
let hasErrors = false;

console.log("🔍 Validating JSON files from commit...\n");

for (const file of args) {
    if (fs.existsSync(file)) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            const fileHasErrors = validateJSON(content, file);
            if (fileHasErrors) {
                hasErrors = true;
            }
        } catch (err) {
            console.error(`\n❌ File Reading Error for ${file}:`);
            console.error(`   Error Type: ${err.name}`);
            console.error(`   Error Message: ${err.message}`);
            console.error(`   File Path: ${file}`);
            console.error('');
            hasErrors = true;
        }
    } else {
        console.error(`❌ File not found: ${file}`);
        hasErrors = true;
    }
}

if (hasErrors) {
    console.log("\n❌ Validation completed with errors. Please fix the issues above.");
    process.exit(1);
} else {
    console.log("\n✅ All JSON files are valid!");
    process.exit(0);
}
