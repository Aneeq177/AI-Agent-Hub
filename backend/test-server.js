// Minimal test server
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// API endpoint
app.get('/api/tools', (req, res) => {
    res.json([
        { id: 1, name: 'Test Tool', description: 'This is a test' }
    ]);
});

app.listen(port, () => {
    console.log(`✅ Test server running at http://localhost:${port}`);
    console.log(`Try: http://localhost:${port}/test`);
    console.log(`Try: http://localhost:${port}/api/tools`);
});
