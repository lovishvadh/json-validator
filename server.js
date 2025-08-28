import express from 'express';
import cors from 'cors';
import axios from 'axios';
import pkg from 'deep-diff';
import path from 'path';
import { fileURLToPath } from 'url';

const { diff: deepDiff } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '.')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'json-comparator-ui.html'));
});

// Proxy endpoint to fetch JSON from URLs
app.get('/api/fetch-json', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Validate URL
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Fetch JSON from the URL
        const response = await axios.get(url, {
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'JSON-Comparator/1.0',
                'Accept': 'application/json, text/plain, */*'
            }
        });

        // Validate that the response is JSON
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            return res.status(400).json({ 
                error: 'URL does not return valid JSON content',
                contentType: contentType 
            });
        }

        res.json({
            success: true,
            data: response.data,
            contentType: contentType,
            url: url
        });

    } catch (error) {
        console.error('Error fetching JSON:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            return res.status(404).json({ error: 'URL not found or unreachable' });
        }
        
        if (error.code === 'ECONNABORTED') {
            return res.status(408).json({ error: 'Request timeout - URL took too long to respond' });
        }
        
        if (error.response) {
            return res.status(error.response.status).json({ 
                error: `HTTP ${error.response.status}: ${error.response.statusText}`,
                details: error.response.data
            });
        }
        
        res.status(500).json({ error: 'Failed to fetch JSON from URL' });
    }
});

// JSON comparison endpoint
app.post('/api/compare-json', async (req, res) => {
    try {
        const { source1, source2 } = req.body;
        
        if (!source1 || !source2) {
            return res.status(400).json({ error: 'Both source1 and source2 are required' });
        }

        // Helper function to get JSON data
        async function getJSONData(source) {
            try {
                switch (source.type) {
                    case 'url':
                        const response = await axios.get(source.data, {
                            timeout: 10000,
                            headers: {
                                'User-Agent': 'JSON-Comparator/1.0',
                                'Accept': 'application/json, text/plain, */*'
                            }
                        });
                        return response.data;
                        
                    case 'json':
                        if (typeof source.data !== 'string') {
                            throw new Error('JSON data must be a string');
                        }
                        return JSON.parse(source.data);
                        
                    default:
                        throw new Error(`Invalid source type: ${source.type}`);
                }
            } catch (error) {
                if (error.name === 'SyntaxError') {
                    throw new Error(`Invalid JSON format: ${error.message}`);
                }
                throw error;
            }
        }

        // Get JSON from both sources
        const [json1, json2] = await Promise.all([
            getJSONData(source1),
            getJSONData(source2)
        ]);

        // Compare JSONs
        const differences = deepDiff(json1, json2);

        // Calculate statistics
        const stats = {
            added: differences ? differences.filter(d => d.kind === 'N').length : 0,
            removed: differences ? differences.filter(d => d.kind === 'D').length : 0,
            modified: differences ? differences.filter(d => d.kind === 'E').length : 0,
            total: differences ? differences.length : 0
        };

        res.json({
            success: true,
            differences: differences || [],
            stats: stats,
            json1: json1,
            json2: json2
        });

    } catch (error) {
        console.error('Error comparing JSON:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 JSON Comparator Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   GET  /api/health - Health check`);
    console.log(`   GET  /api/fetch-json?url=<url> - Fetch JSON from URL`);
    console.log(`   POST /api/compare-json - Compare two JSON sources`);
    console.log(`🌐 Web UI available at: http://localhost:${PORT}`);
});
