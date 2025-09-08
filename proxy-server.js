import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'JSON Validator Proxy Server is running' });
});

// Proxy endpoint to fetch JSON files from URLs
app.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL parameter is required',
        usage: 'GET /proxy?url=https://example.com/data.json'
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        provided: url
      });
    }

    console.log(`Fetching JSON from: ${url}`);
    
    // Fetch the JSON file
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'JSON-Validator-Proxy/1.0',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    // Validate that the response is JSON
    try {
      JSON.parse(JSON.stringify(response.data));
    } catch (parseError) {
      return res.status(400).json({
        error: 'Response is not valid JSON',
        url: url,
        parseError: parseError.message
      });
    }

    // Return the JSON data
    res.json({
      success: true,
      url: url,
      data: response.data,
      headers: {
        'content-type': response.headers['content-type'],
        'content-length': response.headers['content-length']
      }
    });

  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({
        error: 'URL not found',
        url: req.query.url,
        message: 'The requested URL could not be resolved'
      });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Connection refused',
        url: req.query.url,
        message: 'The server refused the connection'
      });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'HTTP Error',
        url: req.query.url,
        status: error.response.status,
        statusText: error.response.statusText,
        message: `Server responded with ${error.response.status} ${error.response.statusText}`
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      url: req.query.url,
      message: error.message
    });
  }
});

// Serve static files (if needed)
app.use(express.static(join(__dirname, 'public')));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /health',
      'GET /proxy?url=<json-url>'
    ]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 JSON Validator Proxy Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Proxy endpoint: http://localhost:${PORT}/proxy?url=<your-json-url>`);
});

export default app;
