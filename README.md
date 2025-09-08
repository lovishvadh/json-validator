# JSON Comparison Tool

A powerful JSON validation and comparison tool with a modern web interface and backend proxy to handle CORS issues.

## 🚀 Features

### **JSON Validation**
- Detailed error reporting with line numbers and context
- Support for local files and remote URLs
- Batch processing of multiple JSON files
- User-friendly error messages

### **JSON Comparison**
- **Multiple Input Sources**: URL, Local File, Paste JSON
- **Dual View Modes**: Full JSON comparison and Differences only
- **Visual Diff Highlighting**: Color-coded changes with syntax highlighting
- **CORS-Free**: Backend proxy handles cross-origin requests
- **Real-time Statistics**: Count of added, removed, and modified elements

### **Web Interface**
- Modern, responsive design
- Interactive controls and filters
- Synchronized scrolling between panels
- Mobile-friendly layout

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd json-validator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## 🛠 Usage

### **Web Interface (Recommended)**

1. **Open the web interface** at `http://localhost:3000`
2. **Choose input sources** for both JSONs:
   - **URL**: Enter a web URL containing JSON
   - **Local File**: Upload a JSON file from your computer
   - **Paste JSON**: Copy and paste JSON content directly
3. **Click "Compare JSONs"** to see the differences
4. **Switch between views**:
   - **Full JSON Comparison**: Side-by-side view with highlighting
   - **Differences Only**: Focused view of changes only

### **Command Line Tools**

#### **JSON Validator**
```bash
npm run validator
```
Validates JSON files and reports detailed errors.

#### **JSON Comparator**
```bash
npm run comparator
```
Compares JSON files from configured URLs and generates HTML reports.

## 🔧 Configuration

### **Environment Variables**
- `PORT`: Server port (default: 3000)

### **API Endpoints**

#### **Health Check**
```bash
GET /api/health
```
Returns server status and version information.

#### **Fetch JSON from URL**
```bash
GET /api/fetch-json?url=<encoded-url>
```
Fetches JSON from a URL, handling CORS issues.

#### **Compare JSON Sources**
```bash
POST /api/compare-json
Content-Type: application/json

{
  "source1": {
    "type": "url|json",
    "data": "url-or-json-content"
  },
  "source2": {
    "type": "url|json", 
    "data": "url-or-json-content"
  }
}
```

## 🌐 CORS Solution

The backend proxy solves CORS issues by:

1. **Server-side fetching**: URLs are fetched from the server, not the browser
2. **Proper headers**: Sets appropriate User-Agent and Accept headers
3. **Error handling**: Provides detailed error messages for various failure scenarios
4. **Timeout protection**: 10-second timeout to prevent hanging requests

## 📊 Comparison Features

### **Visual Indicators**
- 🔵 **Blue**: Added elements
- 🔴 **Red**: Removed elements  
- 🟡 **Yellow**: Modified elements

### **Syntax Highlighting**
- **Strings**: Blue color
- **Numbers**: Orange color
- **Booleans**: Orange color
- **Null values**: Gray italic
- **Brackets/Punctuation**: Gray color

### **Interactive Controls**
- **Filter buttons**: Show only specific change types
- **Tab switching**: Switch between view modes
- **Hover effects**: Highlight differences on mouse over
- **Synchronized scrolling**: Both panels scroll together

## 🔍 Use Cases

### **API Testing**
- Compare API responses between environments
- Validate configuration changes
- Debug environment-specific issues

### **Configuration Management**
- Track configuration changes over time
- Validate deployment configurations
- Identify configuration drift

### **Data Migration**
- Verify data integrity during transfers
- Validate transformation logic
- Document migration changes

### **Quality Assurance**
- Automated regression testing
- Visual difference identification
- Comprehensive change documentation

## 🛠 Development

### **Project Structure**
```
json-validator/
├── server.js              # Express server with proxy
├── validator.js           # JSON validation tool
├── comparator.js          # JSON comparison tool
├── json-comparator-ui.html # Web interface
├── config.js              # Configuration file
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

### **Available Scripts**
- `npm start`: Start the web server
- `npm run dev`: Start in development mode
- `npm run validator`: Run JSON validation
- `npm run comparator`: Run JSON comparison
- `npm test`: Run tests

### **Dependencies**
- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **axios**: HTTP client for fetching URLs
- **deep-diff**: JSON difference detection

## 🚀 Deployment

### **Local Development**
```bash
npm install
npm start
```

### **Production Deployment**
```bash
# Set environment variables
export PORT=3000

# Install dependencies
npm install --production

# Start server
npm start
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### **Common Issues**

#### **CORS Errors**
- ✅ **Solution**: Use the web interface with backend proxy
- ✅ **Alternative**: Use the command-line tools

#### **URL Not Found**
- Check if the URL is accessible
- Verify the URL returns JSON content
- Check network connectivity

#### **Invalid JSON Format**
- Validate JSON syntax using the validator tool
- Check for missing commas, brackets, or quotes
- Ensure proper JSON structure

#### **Server Won't Start**
- Check if port 3000 is available
- Verify all dependencies are installed
- Check Node.js version (requires 14+)

### **Debug Mode**
Enable detailed logging by setting environment variables:
```bash
export DEBUG=json-comparator:*
npm start
```

## 📈 Performance

### **Optimizations**
- **Streaming comparison**: Processes large files efficiently
- **Parallel processing**: Handles multiple requests simultaneously
- **Caching**: Reduces redundant URL fetches
- **Timeout protection**: Prevents hanging requests

### **Limitations**
- **File size**: Maximum 10MB for JSON content
- **URL timeout**: 10-second timeout for URL requests
- **Memory usage**: Large JSON files may impact performance

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions, issues, or feature requests:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy JSON comparing! 🎉**
