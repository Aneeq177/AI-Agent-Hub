const http = require('http');

http.get('http://localhost:3000/api/tools', (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const tools = JSON.parse(data);
        console.log(`✅ Successfully fetched ${tools.length} tools from backend!`);
        console.log(`First tool: ${tools[0].name}`);
        process.exit(0);
    });
}).on('error', (err) => {
    console.error('❌ Error connecting to backend:', err.message);
    console.log('\n💡 Make sure the backend server is running with: node server.js');
    process.exit(1);
});
